# Weather-Aware Truck Routing

A React and Django application that compares three truck routes using arrival-time weather forecasts, load-weight risk overrides, and route-distance ranking.

## Features

- Origin, destination, departure date/time, load weight, and checkpoint interval inputs
- Three OSRM route alternatives, with provider-backed detours when OSRM returns fewer alternatives
- Arrival-time checkpoint weather from Open-Meteo
- 0–48 hour forecast heatmap for the selected route
- Low, Moderate, High, Severe, and No Travel risk levels
- Route ranking by severe miles, high miles, average risk, and travel time

## Stack

- Frontend: React, Vite, Leaflet, React Leaflet, Axios, Tailwind CSS
- Backend: Django, Django REST Framework, Requests, GeoPy, Shapely
- External services: OSRM routing, Nominatim geocoding, Open-Meteo forecasts

## Local setup

### Backend

```powershell
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

The API runs at `http://127.0.0.1:8000`.

### Frontend

```powershell
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`. The frontend expects the Django API at `http://127.0.0.1:8000/api`.

## API

`POST /api/analyze-route/`

```json
{
  "origin": "Chicago, IL",
  "destination": "Denver, CO",
  "departure_time": "2026-10-25T12:00:00Z",
  "load_weight_lbs": 35000,
  "sample_interval_miles": 25
}

```

The response contains route geometry, total distance and duration, checkpoints, weather forecasts from the route start through 48 hours, checkpoint risk, route metrics, and a recommended route.

## Risk rules

| Condition | Low | Moderate | High | Severe | No Travel |
|---|---|---|---|---|---|
| Wind | <25 mph | 25–34 mph | 35–44 mph | 45–54 mph | >=55 mph |
| Rain | <0.10 in/hr | 0.10–0.25 in/hr | 0.25–0.50 in/hr | 0.50–1.00 in/hr | >1.00 in/hr |
| Snow | <0.5 in/hr | 0.5–1.0 in/hr | 1.0–2.0 in/hr | 2.0–3.0 in/hr | >3.0 in/hr |

Load overrides:

- Any load: wind of at least 55 mph is No Travel.
- Load above 30,000 lb: wind of 45–54 mph is No Travel.
- Load above 40,000 lb: wind of 35–44 mph is Severe.

## Build

```powershell
cd frontend
npm run build
```

The production frontend bundle is written to `frontend/dist`.

## Deployment

Deploy `backend` as a Django web service and `frontend` as a Vite static app.

Backend environment variables:

```text
DJANGO_SECRET_KEY=<generated secret>
DJANGO_DEBUG=False
DJANGO_ALLOWED_HOSTS=<backend host without protocol>
CORS_ALLOWED_ORIGINS=<frontend URL>
```

Backend build and start commands:

```text
pip install -r requirements.txt && python manage.py collectstatic --noinput
gunicorn routing_project.wsgi:application
```

Set the frontend `VITE_API_BASE_URL` environment variable to the public backend origin, without `/api`, then build with `npm run build`. Vercel should use `frontend` as the root directory.

## Live deployment

- Application: https://project-dljk0.vercel.app
- Source: https://github.com/Jawadashraf2000/weather-aware-truck-routing

## Loom walkthrough

Use [LOOM-WALKTHROUGH.md](LOOM-WALKTHROUGH.md) for the 5–7 minute demo script. Add the final Loom URL here after recording.
