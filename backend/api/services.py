import math
import json
from datetime import datetime, timedelta
import requests
from geopy.geocoders import Nominatim
from shapely.geometry import LineString

class RouteAnalysisService:
    @staticmethod
    def geocode_address(address_str):
        geolocator = Nominatim(user_agent="weather_truck_router")
        location = geolocator.geocode(address_str)
        if not location:
            raise ValueError(f"Could not geocode address: {address_str}")
        return location.latitude, location.longitude

    @staticmethod
    def get_osrm_routes(origin_coords, dest_coords):
        # OSRM public API format: lon,lat;lon,lat
        def request_route(waypoints):
            coordinate_list = ";".join(
                f"{lon},{lat}" for lat, lon in waypoints
            )
            url = (
                f"http://router.project-osrm.org/route/v1/driving/{coordinate_list}"
                "?overview=full&geometries=geojson"
            )
            response = requests.get(url, timeout=10)
            data = response.json()
            if data.get("code") == "Ok" and data.get("routes"):
                return data["routes"][0]
            return None

        url = (
            f"http://router.project-osrm.org/route/v1/driving/"
            f"{origin_coords[1]},{origin_coords[0]};{dest_coords[1]},{dest_coords[0]}"
            f"?overview=full&geometries=geojson&alternatives=true"
        )
        response = requests.get(url, timeout=10)
        data = response.json()
        if data.get("code") != "Ok" or not data.get("routes"):
            raise ValueError("Failed to retrieve route directions.")

        routes = data["routes"][:3]
        if len(routes) >= 3:
            return routes

        primary = routes[0]
        primary_coords = primary["geometry"]["coordinates"]
        midpoint_index = len(primary_coords) // 2
        midpoint_lon, midpoint_lat = primary_coords[midpoint_index]

        candidate_routes = []
        for lon_offset, lat_offset in ((-0.8, 0.35), (0.8, -0.35)):
            detour = request_route([
                origin_coords,
                (midpoint_lat + lat_offset, midpoint_lon + lon_offset),
                dest_coords,
            ])
            if detour:
                candidate_routes.append(detour)

        seen_geometries = {json.dumps(route["geometry"]) for route in routes}
        for candidate in candidate_routes:
            signature = json.dumps(candidate["geometry"])
            if signature not in seen_geometries:
                routes.append(candidate)
                seen_geometries.add(signature)
            if len(routes) == 3:
                break

        return routes

    @staticmethod
    def sample_checkpoints(coordinates, total_duration_sec, interval_miles=25):
        # LineString works in (lon, lat)
        line = LineString(coordinates)
        interval_meters = interval_miles * 1609.34
        total_length_meters = line.length * 111000  # Approx conversion degree to meters

        # Number of samples
        num_samples = max(2, int(total_length_meters // interval_meters) + 1)
        checkpoints = []

        for i in range(num_samples):
            fraction = i / (num_samples - 1)
            point = line.interpolate(fraction, normalized=True)
            elapsed_seconds = total_duration_sec * fraction

            checkpoints.append({
                "lat": round(point.y, 5),
                "lon": round(point.x, 5),
                "distance_miles": round((fraction * total_length_meters) / 1609.34, 1),
                "elapsed_seconds": elapsed_seconds
            })

        return checkpoints

    @classmethod
    def fetch_weather_for_checkpoint(cls, lat, lon, arrival_dt, load_weight_lbs):
        url = (
            f"https://api.open-meteo.com/v1/forecast?"
            f"latitude={lat}&longitude={lon}"
            f"&hourly=temperature_2m,rain,snowfall,wind_speed_10m"
            f"&wind_speed_unit=mph&forecast_days=3&timezone=UTC"
        )
        response = requests.get(url, timeout=10)
        data = response.json()

        hourly = data.get("hourly", {})
        times = hourly.get("time", [])
        if not times:
            raise ValueError("Failed to retrieve weather forecast.")

        def weather_at(index):
            wind_mph = hourly.get("wind_speed_10m", [0])[index] or 0
            rain_in_hr = (hourly.get("rain", [0])[index] or 0) / 25.4
            snow_in_hr = (hourly.get("snowfall", [0])[index] or 0) / 2.54
            weather = {
                "wind_mph": round(wind_mph, 1),
                "rain_in_hr": round(rain_in_hr, 2),
                "snow_in_hr": round(snow_in_hr, 2),
                "temperature_f": round((hourly.get("temperature_2m", [0])[index] or 0) * 9/5 + 32, 1),
            }
            risk_score, risk_label = cls.evaluate_risk(weather, load_weight_lbs)
            weather["risk_score"] = risk_score
            weather["risk_label"] = risk_label
            return weather

        def index_for(target_dt):
            target_iso = target_dt.strftime("%Y-%m-%dT%H:00")
            try:
                return times.index(target_iso)
            except ValueError:
                return 0

        arrival_index = index_for(arrival_dt)
        forecast = []
        for offset in range(49):
            target_index = index_for(arrival_dt + timedelta(hours=offset))
            forecast.append({
                "hour_offset": offset,
                "time": times[target_index],
                **weather_at(target_index),
            })

        return {
            **weather_at(arrival_index),
            "forecast": forecast,
        }

    @classmethod
    def evaluate_risk(cls, weather, load_weight_lbs):
        wind = weather["wind_mph"]
        rain = weather["rain_in_hr"]
        snow = weather["snow_in_hr"]

        # Base Wind Risk
        if wind >= 55: wind_risk = 4  # No Travel
        elif wind >= 45: wind_risk = 3  # Severe
        elif wind >= 35: wind_risk = 2  # High
        elif wind >= 25: wind_risk = 1  # Moderate
        else: wind_risk = 0  # Low

        # Base Rain Risk
        if rain > 1.00: rain_risk = 4
        elif rain >= 0.50: rain_risk = 3
        elif rain >= 0.25: rain_risk = 2
        elif rain >= 0.10: rain_risk = 1
        else: rain_risk = 0

        # Base Snow Risk
        if snow > 3.0: snow_risk = 4
        elif snow >= 2.0: snow_risk = 3
        elif snow >= 1.0: snow_risk = 2
        elif snow >= 0.5: snow_risk = 1
        else: snow_risk = 0

        risk_score = max(wind_risk, rain_risk, snow_risk)

        # Load Weight Overrides
        if wind >= 55:
            risk_score = 4  # No Travel for any load
        elif 45 <= wind <= 54 and load_weight_lbs > 30000:
            risk_score = 4  # No Travel
        elif 35 <= wind <= 44 and load_weight_lbs > 40000:
            risk_score = max(risk_score, 3)  # Severe

        risk_labels = {0: "Low", 1: "Moderate", 2: "High", 3: "Severe", 4: "No Travel"}
        return risk_score, risk_labels[risk_score]

    @classmethod
    def analyze_routes(cls, origin, destination, departure_dt, load_weight_lbs, sample_interval_miles=25):
        orig_lat, orig_lon = cls.geocode_address(origin)
        dest_lat, dest_lon = cls.geocode_address(destination)

        osrm_routes = cls.get_osrm_routes((orig_lat, orig_lon), (dest_lat, dest_lon))
        processed_routes = []

        for idx, route in enumerate(osrm_routes):
            coords = route["geometry"]["coordinates"]  # [[lon, lat], ...]
            duration_sec = route["duration"]
            distance_meters = route["distance"]

            sampled_cps = cls.sample_checkpoints(coords, duration_sec, sample_interval_miles)
            checkpoints_data = []

            severe_no_travel_count = 0
            high_count = 0
            total_risk_score = 0

            for cp in sampled_cps:
                eta = departure_dt + timedelta(seconds=cp["elapsed_seconds"])
                weather = cls.fetch_weather_for_checkpoint(
                    cp["lat"], cp["lon"], eta, load_weight_lbs
                )
                risk_score = weather["risk_score"]
                risk_label = weather["risk_label"]

                if risk_score >= 3:
                    severe_no_travel_count += 1
                elif risk_score == 2:
                    high_count += 1

                total_risk_score += risk_score

                checkpoints_data.append({
                    "lat": cp["lat"],
                    "lon": cp["lon"],
                    "distance_miles": cp["distance_miles"],
                    "eta": eta.isoformat(),
                    "weather": weather,
                    "risk_score": risk_score,
                    "risk_label": risk_label
                })

            avg_risk = total_risk_score / len(checkpoints_data) if checkpoints_data else 0

            processed_routes.append({
                "route_id": f"route_{idx + 1}",
                "name": f"Route {idx + 1}",
                "total_distance_miles": round(distance_meters / 1609.34, 1),
                "total_duration_hours": round(duration_sec / 3600, 2),
                "geometry": coords,
                "checkpoints": checkpoints_data,
                "metrics": {
                    "severe_miles": severe_no_travel_count * sample_interval_miles,
                    "high_miles": high_count * sample_interval_miles,
                    "avg_risk": round(avg_risk, 2)
                }
            })

        # Recommendation Sorting:
        # 1. Fewest Severe/No Travel miles
        # 2. Fewest High miles
        # 3. Lowest average risk
        # 4. Shortest duration
        processed_routes.sort(
            key=lambda r: (
                r["metrics"]["severe_miles"],
                r["metrics"]["high_miles"],
                r["metrics"]["avg_risk"],
                r["total_duration_hours"]
            )
        )

        # Mark recommended route
        for i, r in enumerate(processed_routes):
            r["is_recommended"] = (i == 0)

        return processed_routes
