import React from 'react';
import { MapContainer, TileLayer, Polyline, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const RISK_COLOR_HEX = {
  Low: '#22c55e',
  Moderate: '#eab308',
  High: '#f97316',
  Severe: '#ef4444',
  'No Travel': '#a855f7'
};

const FORECAST_RISK_LABELS = ['Low', 'Moderate', 'High', 'Severe', 'No Travel'];

export default function MapView({ routes, selectedRouteId, forecastHourOffset }) {
  const selectedRoute = routes.find((r) => r.route_id === selectedRouteId) || routes[0];

  if (!selectedRoute) {
    return (
      <div className="h-full bg-slate-900 rounded-xl flex items-center justify-center text-slate-500">
        Enter route parameters to load map.
      </div>
    );
  }

  // Convert GeoJSON [lon, lat] coordinates to Leaflet [lat, lon]
  const polylineCoords = selectedRoute.geometry.map(([lon, lat]) => [lat, lon]);
  const center = polylineCoords[0] || [39.8283, -98.5795];

  return (
    <div className="h-full w-full rounded-xl overflow-hidden border border-slate-800 shadow-xl relative">
      <MapContainer center={center} zoom={6} className="h-full w-full" scrollWheelZoom={true}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />

        {/* Selected Route Polyline */}
        <Polyline
          positions={polylineCoords}
          pathOptions={{ color: '#3b82f6', weight: 5, opacity: 0.8 }}
        />

        {/* Corridor forecast heatmap for the selected hour */}
        {selectedRoute.checkpoints.map((cp, idx) => {
          const forecast = cp.weather.forecast?.[forecastHourOffset];
          if (!forecast) return null;

          return (
            <CircleMarker
              key={`forecast-${idx}`}
              center={[cp.lat, cp.lon]}
              radius={14}
              interactive={false}
              pathOptions={{
                color: RISK_COLOR_HEX[forecast.risk_label],
                weight: 1,
                fillColor: RISK_COLOR_HEX[forecast.risk_label],
                fillOpacity: 0.32
              }}
            />
          );
        })}

        {/* Route Checkpoints */}
        {selectedRoute.checkpoints.map((cp, idx) => (
          <CircleMarker
            key={idx}
            center={[cp.lat, cp.lon]}
            radius={6}
            pathOptions={{
              color: '#ffffff',
              weight: 1,
              fillColor: RISK_COLOR_HEX[cp.risk_label] || '#3b82f6',
              fillOpacity: 0.9
            }}
          >
            <Popup className="custom-popup">
              <div className="p-1 text-slate-900">
                <p className="font-bold text-sm">Checkpoint #{idx + 1}</p>
                <p className="text-xs">Distance: {cp.distance_miles} mi</p>
                <p className="text-xs">ETA: {new Date(cp.eta).toLocaleString()}</p>
                <hr className="my-1" />
                <p className="text-xs font-semibold">
                  Risk Level:{' '}
                  <span style={{ color: RISK_COLOR_HEX[cp.risk_label] }}>{cp.risk_label}</span>
                </p>
                <p className="text-xs">Wind: {cp.weather.wind_mph} mph</p>
                <p className="text-xs">Rain: {cp.weather.rain_in_hr} in/hr</p>
                <p className="text-xs">Snow: {cp.weather.snow_in_hr} in/hr</p>
                {cp.weather.forecast?.[forecastHourOffset] && (
                  <>
                    <hr className="my-1" />
                    <p className="text-xs font-semibold">
                      +{forecastHourOffset}h Risk: {' '}
                      {FORECAST_RISK_LABELS[cp.weather.forecast[forecastHourOffset].risk_score]}
                    </p>
                  </>
                )}
              </div>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  );
}