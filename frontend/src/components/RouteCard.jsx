import React from 'react';
import { ShieldAlert, Clock, Route, CheckCircle } from 'lucide-react';

const RISK_COLOR_MAP = {
  Low: 'bg-green-500/10 text-green-400 border-green-500/30',
  Moderate: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30',
  High: 'bg-orange-500/10 text-orange-400 border-orange-500/30',
  Severe: 'bg-red-500/10 text-red-400 border-red-500/30',
  'No Travel': 'bg-purple-500/10 text-purple-400 border-purple-500/30'
};

export default function RouteCard({ route, isSelected, onSelect }) {
  const getOverallRiskLabel = () => {
    if (route.metrics.severe_miles > 0) return 'Severe';
    if (route.metrics.high_miles > 0) return 'High';
    if (route.metrics.avg_risk > 1) return 'Moderate';
    return 'Low';
  };

  const riskLabel = getOverallRiskLabel();

  return (
    <div
      onClick={() => onSelect(route.route_id)}
      className={`cursor-pointer p-4 rounded-xl border transition-all ${
        isSelected
          ? 'bg-slate-800 border-blue-500 shadow-lg shadow-blue-500/10'
          : 'bg-slate-900 border-slate-800 hover:border-slate-700'
      }`}
    >
      <div className="flex flex-col sm:flex-row gap-2 sm:justify-between sm:items-start mb-2">
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-100">{route.name}</span>
          {route.is_recommended && (
            <span className="bg-emerald-500/20 text-emerald-400 text-xs px-2 py-0.5 rounded-full font-semibold border border-emerald-500/30 flex items-center gap-1">
              <CheckCircle className="w-3 h-3" /> Best Route
            </span>
          )}
        </div>
        <span
          className={`text-xs px-2 py-0.5 rounded border font-semibold ${
            RISK_COLOR_MAP[riskLabel] || 'bg-slate-700 text-slate-300'
          }`}
        >
          {riskLabel} Risk
        </span>
      </div>

      <div className="grid grid-cols-1 min-[420px]:grid-cols-3 gap-2 mt-3 text-xs text-slate-400">
        <div className="flex items-center gap-1">
          <Route className="w-3.5 h-3.5 text-slate-500" />
          <span>{route.total_distance_miles} miles</span>
        </div>
        <div className="flex items-center gap-1">
          <Clock className="w-3.5 h-3.5 text-slate-500" />
          <span>{route.total_duration_hours} hrs</span>
        </div>
        <div className="flex items-center gap-1">
          <ShieldAlert className="w-3.5 h-3.5 text-slate-500" />
          <span>{route.metrics.severe_miles} severe mi</span>
        </div>
      </div>
    </div>
  );
}