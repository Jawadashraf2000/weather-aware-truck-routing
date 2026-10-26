import React, { useState } from 'react';
import { MapPin, Calendar, Weight, Sliders, Navigation } from 'lucide-react';

const toDateTimeLocal = (date) => {
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
};

const departureBounds = (() => {
  const now = new Date();
  const latest = new Date(now);
  latest.setDate(latest.getDate() + 14);
  return { min: toDateTimeLocal(now), max: toDateTimeLocal(latest) };
})();

export default function InputForm({ onSubmit, loading }) {
  const [formData, setFormData] = useState({
    origin: 'Chicago, IL',
    destination: 'Denver, CO',
    departureTime: departureBounds.min,
    loadWeight: 35000,
    sampleInterval: 25
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="bg-slate-900 text-white p-4 sm:p-6 rounded-xl shadow-xl border border-slate-800 min-w-0">
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-blue-400">
        <Navigation className="w-5 h-5" /> Weather Routing Parameters
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-xs text-slate-400 font-semibold uppercase tracking-wider block mb-1">
            Origin
          </label>
          <div className="relative">
            <MapPin className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
            <input
              type="text"
              name="origin"
              value={formData.origin}
              onChange={handleChange}
              required
              className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
              placeholder="e.g. Chicago, IL"
            />
          </div>
        </div>

        <div>
          <label className="text-xs text-slate-400 font-semibold uppercase tracking-wider block mb-1">
            Destination
          </label>
          <div className="relative">
            <MapPin className="w-4 h-4 absolute left-3 top-3 text-red-500" />
            <input
              type="text"
              name="destination"
              value={formData.destination}
              onChange={handleChange}
              required
              className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
              placeholder="e.g. Denver, CO"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-slate-400 font-semibold uppercase tracking-wider block mb-1">
              Departure
            </label>
            <div className="relative">
              <Calendar className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
              <input
                type="datetime-local"
                name="departureTime"
                value={formData.departureTime}
                min={departureBounds.min}
                max={departureBounds.max}
                onChange={handleChange}
                required
                className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-2 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-slate-400 font-semibold uppercase tracking-wider block mb-1">
              Load Weight (lbs)
            </label>
            <div className="relative">
              <Weight className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
              <input
                type="number"
                name="loadWeight"
                value={formData.loadWeight}
                onChange={handleChange}
                required
                min="0"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="text-xs text-slate-400 font-semibold uppercase tracking-wider block mb-1">
            Checkpoints Sample Interval
          </label>
          <div className="relative">
            <Sliders className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
            <select
              name="sampleInterval"
              value={formData.sampleInterval}
              onChange={handleChange}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
            >
              <option value="10">Every 10 Miles</option>
              <option value="25">Every 25 Miles</option>
              <option value="50">Every 50 Miles</option>
            </select>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full mt-2 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 text-white font-semibold py-2.5 rounded-lg transition-all shadow-md flex justify-center items-center gap-2"
        >
          {loading ? 'Analyzing Routes & Weather...' : 'Calculate Safe Routes'}
        </button>
      </form>
    </div>
  );
}