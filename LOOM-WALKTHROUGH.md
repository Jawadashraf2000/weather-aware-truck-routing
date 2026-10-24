# Loom Walkthrough Guide

Target length: 5–7 minutes.

## Recording setup

1. Open the deployed app: https://project-dljk0.vercel.app/
2. Open the GitHub repository in a second tab.
3. Use a 1366×768 browser window and keep notifications hidden.
4. Start with the app, not the code, and speak in concise sections.

## 5-minute script

### 0:00–0:35 — Problem and solution

"This is Weather-Aware Truck Routing, a full-stack application that helps a truck driver choose the safest route from multiple options. It combines routing, checkpoint-level weather, load weight, arrival time, and weather risk."

### 0:35–1:10 — Enter and submit a trip

Set these values:

- Origin: Chicago, IL
- Destination: Denver, CO
- Departure: tomorrow at 12:00 PM
- Load weight: 35000
- Checkpoint interval: 25 miles

Then click **Calculate Safe Routes**.

Say: "The request includes the trip parameters and the selected checkpoint interval. The backend geocodes both locations and asks OSRM for route alternatives."

### 1:10–2:05 — Explain route results

Point out:

- Three route options
- Selected route and best-route badge
- Distance and duration
- Severe/high miles
- Overall route risk

Say: "The recommendation prioritizes severe or No Travel miles, then high-risk miles, average risk, and shortest travel time."

### 2:05–3:05 — Inspect map and checkpoints

Select a non-recommended route and a checkpoint popup.

Point out:

- Route geometry
- Colored checkpoint markers
- ETA
- Distance
- Wind, rain, snow, and risk level

Say: "Weather is fetched for each checkpoint using the truck's estimated arrival time. This is not the same hourly weather applied to the whole route."

### 3:05–4:00 — Demonstrate 0–48 hour forecast

Move the forecast slider through 0, 24, and 48 hours. Explain that the checkpoint heatmap changes because each checkpoint has a 49-hour forecast series.

Say: "The slider covers the required 0–48 hour window and changes the corridor forecast shown on the map."

### 4:00–4:50 — Show backend logic and repository

Briefly open:

- `backend/api/services.py` — routing, checkpoint sampling, weather, load overrides, and ranking
- `backend/api/views.py` — REST request handling
- `frontend/src/components/MapView.jsx` — map, heatmap, and checkpoints
- `frontend/src/components/InputForm.jsx` — user inputs

Say: "The backend is Django REST Framework. React and Leaflet provide the interface and map. GitHub and Vercel provide source control and hosting."

### 4:50–5:25 — Validation and close

Mention:

- Three routes for the demonstration
- 49-hour weather forecast per checkpoint
- Mobile-responsive layout
- Live API and frontend validation
- GitHub repository and public deployment

Close with: "The deployed application is available at the URL shown, and all source code is available in the linked GitHub repository."

## Recommended final 60-second mention

If the full route analysis feels slow or stalls, do not hide it. Say: "Route calculation depends on several third-party APIs, so this is intentionally weather-accurate rather than a hardcoded demo. The current request is cached and batched to reduce repeated checkpoint calls."

## Screenshot and tab order

1. Deployed app
2. Loaded route result
3. Map checkpoint popup
4. Forecast slider at 24 or 48 hours
5. GitHub repository
6. `backend/api/services.py`
7. `frontend/src/components/MapView.jsx`
