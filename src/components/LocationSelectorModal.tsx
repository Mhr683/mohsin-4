import React, { useState } from 'react';
import {
  X,
  MapPin,
  Search,
  CheckCircle2,
  AlertTriangle,
  Truck,
  ShieldCheck,
  Building2,
  Compass
} from 'lucide-react';
import { PakistanCity, PakistanProvince, ServiceabilityResult } from '../types/location';
import { PAKISTAN_CITIES, PAKISTAN_PROVINCES, getCitiesByProvince } from '../utils/pakistanLocations';
import { checkPakistanServiceability } from '../utils/serviceability';

interface LocationSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCity: (city: PakistanCity, serviceability: ServiceabilityResult) => void;
  selectedCityName?: string;
}

export const LocationSelectorModal: React.FC<LocationSelectorModalProps> = ({
  isOpen,
  onClose,
  onSelectCity,
  selectedCityName
}) => {
  if (!isOpen) return null;

  const [selectedProvince, setSelectedProvince] = useState<PakistanProvince | 'ALL'>('ALL');
  const [search, setSearch] = useState('');
  const [selectedCity, setSelectedCity] = useState<PakistanCity | null>(() => {
    return PAKISTAN_CITIES.find((c) => c.name.toLowerCase() === selectedCityName?.toLowerCase()) || PAKISTAN_CITIES[0];
  });

  const filteredCities = PAKISTAN_CITIES.filter((city) => {
    const matchesProv = selectedProvince === 'ALL' || city.province === selectedProvince;
    const matchesSearch =
      city.name.toLowerCase().includes(search.toLowerCase()) ||
      city.urduName.includes(search) ||
      city.areas.some((a) => a.toLowerCase().includes(search.toLowerCase()));
    return matchesProv && matchesSearch;
  });

  const activeServiceability = selectedCity
    ? checkPakistanServiceability({ cityName: selectedCity.name })
    : null;

  const handleConfirm = () => {
    if (selectedCity && activeServiceability) {
      onSelectCity(selectedCity, activeServiceability);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl flex flex-col text-slate-100 max-h-[90vh]">
        {/* Top Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-white">Pakistan-Wide Location & Serviceability Desk</h3>
              <p className="text-xs text-slate-400">
                Check courier coverage, delivery transit days, and COD availability across all 7 provinces.
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Toolbar */}
        <div className="p-4 border-b border-slate-800 bg-slate-950/30 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search city, urdu name, or area (e.g. Clifton, Johar Town)..."
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <select
            value={selectedProvince}
            onChange={(e) => setSelectedProvince(e.target.value as any)}
            className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
          >
            <option value="ALL">All Provinces</option>
            {PAKISTAN_PROVINCES.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>

        {/* Dual Pane Body: City Grid + Serviceability Inspector */}
        <div className="flex-1 overflow-hidden grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-800 text-xs">
          {/* Left: City List */}
          <div className="overflow-y-auto max-h-96 p-4 space-y-2">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-2">
              Select City ({filteredCities.length} Found)
            </span>
            {filteredCities.map((c) => {
              const isSelected = selectedCity?.id === c.id;
              return (
                <div
                  key={c.id}
                  onClick={() => setSelectedCity(c)}
                  className={`p-3 rounded-xl border cursor-pointer transition flex items-center justify-between ${
                    isSelected
                      ? 'border-emerald-500 bg-emerald-950/20 text-white font-bold'
                      : 'border-slate-800/80 bg-slate-950/40 hover:border-slate-700 text-slate-300'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span>{c.name}</span>
                      <span className="text-slate-500 font-normal font-sans">({c.urduName})</span>
                      {c.isHub && (
                        <span className="bg-emerald-500/20 text-emerald-400 text-[9px] px-1.5 py-0.2 rounded font-semibold">
                          Main Hub
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-500 block mt-0.5">{c.province}</span>
                  </div>

                  <div className="text-right">
                    <span className="text-[11px] font-mono text-emerald-400">{c.deliveryEstDays}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right: Serviceability Details */}
          <div className="p-5 space-y-4 overflow-y-auto max-h-96 bg-slate-950/40">
            {selectedCity && activeServiceability ? (
              <>
                <div className="flex items-start justify-between border-b border-slate-800 pb-3">
                  <div>
                    <h4 className="text-base font-extrabold text-white flex items-center gap-1.5">
                      <span>{selectedCity.name}</span>
                      <span className="text-emerald-400 font-sans font-normal text-sm">({selectedCity.urduName})</span>
                    </h4>
                    <p className="text-slate-400 text-xs mt-0.5">
                      {selectedCity.division ? `Division: ${selectedCity.division} • ` : ''}{selectedCity.province}
                    </p>
                  </div>
                  <span className="font-mono text-xs bg-slate-800 text-slate-300 px-2 py-1 rounded-lg">
                    Postal: {selectedCity.postalCode}
                  </span>
                </div>

                {/* Serviceability Badges */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider">COD Status</span>
                    <p className="font-bold text-white flex items-center gap-1">
                      {activeServiceability.codSupported ? (
                        <span className="text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> COD Active
                        </span>
                      ) : (
                        <span className="text-amber-400 flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5" /> Advance Pay Only
                        </span>
                      )}
                    </p>
                  </div>

                  <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider">Transit SLA</span>
                    <p className="font-bold text-white flex items-center gap-1">
                      <Truck className="w-3.5 h-3.5 text-indigo-400" />
                      <span>{selectedCity.deliveryEstDays}</span>
                    </p>
                  </div>
                </div>

                {/* Supported Couriers */}
                <div>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1.5">
                    Couriers with Direct Booking
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedCity.supportedCouriers.map((courier) => (
                      <span
                        key={courier}
                        className="bg-slate-900 border border-slate-800 text-slate-200 px-2 py-1 rounded-lg text-xs font-mono"
                      >
                        {courier}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Prominent Areas */}
                <div>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1.5">
                    Covered Areas / Sectors ({selectedCity.areas.length})
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {selectedCity.areas.map((area, idx) => (
                      <span key={idx} className="bg-slate-900/60 text-slate-300 text-[10px] px-2 py-0.5 rounded-md border border-slate-800/80">
                        {area}
                      </span>
                    ))}
                  </div>
                </div>

                {activeServiceability.warnings.length > 0 && (
                  <div className="p-2.5 rounded-xl bg-amber-950/30 border border-amber-500/30 text-amber-300 text-[11px] space-y-0.5">
                    {activeServiceability.warnings.map((w, idx) => (
                      <p key={idx}>• {w}</p>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <p className="text-slate-500">Select a city to inspect courier serviceability.</p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <span className="text-xs text-slate-400">
            Selected: <strong className="text-white">{selectedCity?.name}</strong>
          </span>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition shadow-md shadow-emerald-900/30"
            >
              Confirm Location
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
