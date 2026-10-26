import React, { useState } from 'react';
import InputForm from './components/InputForm';
import RouteCard from './components/RouteCard';
import MapView from './components/MapView';
import ForecastSlider from './components/ForecastSlider';
import { analyzeRoute } from './services/api';
import { Truck } from 'lucide-react';

export default function App() {
  const [routes, setRoutes] = useState([]);
  const [selectedRouteId, setSelectedRouteId] = useState(null);
  const [forecastHourOffset, setForecastHourOffset] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleFormSubmit = async (formData) => {
    setLoading(true);
    setError(null);
    try {
      const data = await analyzeRoute(formData);
      setRoutes(data.routes);
      if (data.routes.length > 0) {
        setSelectedRouteId(data.routes[0].route_id);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to calculate route analysis.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Navigation Bar */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
        <div className="flex items-center gap-3 min-w-0">
          <div className="p-2 bg-blue-600 rounded-lg text-white shrink-0">
            <Truck className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div className="min-w-0">
            <h1 className="text-base sm:text-lg font-bold truncate">Weather-Aware Truck Routing</h1>
            <p className="text-[11px] sm:text-xs text-slate-400">Load & Forecast Risk Decision Engine</p>
          </div>
        </div>
      </header>

      {/* Main Grid Content */}
      <main className="flex-1 p-3 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 lg:h-[calc(100vh-73px)]">
        {/* Left Column: Inputs and Route Summaries */}
        <div className="lg:col-span-4 flex flex-col gap-4 lg:overflow-y-auto lg:pr-1 min-w-0">
          <InputForm onSubmit={handleFormSubmit} loading={loading} />

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-3 rounded-xl text-xs">
              {error}
            </div>
          )}

          {routes.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 px-1">
                {routes.length === 1 ? 'Legitimate Route & Risk Ranking' : 'Route Options & Risk Ranking'}
              </h3>
              {routes.map((route) => (
                <RouteCard
                  key={route.route_id}
                  route={route}
                  isSelected={route.route_id === selectedRouteId}
                  onSelect={setSelectedRouteId}
                />
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Map Visualization & Forecast Slider */}
        <div className="lg:col-span-8 flex flex-col gap-4 relative h-[510px] sm:h-[620px] lg:h-full min-w-0">
          <div className="flex-1 min-h-0">
            <MapView
              routes={routes}
              selectedRouteId={selectedRouteId}
              forecastHourOffset={forecastHourOffset}
            />
          </div>

          <div className="absolute bottom-2 sm:bottom-4 left-2 right-2 sm:left-4 sm:right-4 z-[1000]">
            <ForecastSlider
              hourOffset={forecastHourOffset}
              onChange={setForecastHourOffset}
            />
          </div>
        </div>
      </main>
    </div>
  );
}