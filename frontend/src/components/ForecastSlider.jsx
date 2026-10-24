import React from 'react';
import { Play, Pause, RotateCcw } from 'lucide-react';

export default function ForecastSlider({ hourOffset, onChange }) {
  return (
    <div className="bg-slate-900/90 backdrop-blur-md p-4 rounded-xl border border-slate-800 text-white shadow-xl">
      <div className="flex justify-between items-center mb-2">
        <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
          Corridor Forecast Radar (+{hourOffset} Hours)
        </div>
        <button
          onClick={() => onChange(0)}
          className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
        >
          <RotateCcw className="w-3 h-3" /> Reset to Now
        </button>
      </div>

      <div className="flex items-center gap-3 sm:gap-4">
        <input
          type="range"
          min="0"
          max="48"
          value={hourOffset}
          onChange={(e) => onChange(parseInt(e.target.value, 10))}
          className="w-full accent-blue-500 bg-slate-800 h-2 rounded-lg cursor-pointer"
        />
        <span className="font-mono text-sm font-bold w-12 text-right text-blue-400">
          +{hourOffset}h
        </span>
      </div>
    </div>
  );
}