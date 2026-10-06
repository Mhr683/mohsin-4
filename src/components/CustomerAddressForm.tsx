import React, { useState, useEffect } from 'react';
import {
  MapPin,
  Phone,
  User,
  Home,
  Building,
  AlertTriangle,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { CustomerAddress, PakistanProvince } from '../types/location';
import { PAKISTAN_PROVINCES, getCitiesByProvince, findCityByName } from '../utils/pakistanLocations';
import { getSuggestedLandmarksForCity, checkPakistanServiceability } from '../utils/serviceability';
import { validateCustomerAddress, validatePakistanPhone } from '../services/customerAddressService';

interface CustomerAddressFormProps {
  initialAddress?: Partial<CustomerAddress>;
  onSave: (address: CustomerAddress) => void;
  onCancel?: () => void;
}

export const CustomerAddressForm: React.FC<CustomerAddressFormProps> = ({
  initialAddress,
  onSave,
  onCancel
}) => {
  const [fullName, setFullName] = useState(initialAddress?.fullName || '');
  const [phone, setPhone] = useState(initialAddress?.phone || '');
  const [secondaryPhone, setSecondaryPhone] = useState(initialAddress?.secondaryPhone || '');
  const [province, setProvince] = useState<PakistanProvince>(initialAddress?.province || 'Punjab');
  const [city, setCity] = useState(initialAddress?.city || 'Lahore');
  const [area, setArea] = useState(initialAddress?.area || '');
  const [streetAddress, setStreetAddress] = useState(initialAddress?.streetAddress || '');
  const [nearestLandmark, setNearestLandmark] = useState(initialAddress?.nearestLandmark || '');
  const [postalCode, setPostalCode] = useState(initialAddress?.postalCode || '');
  const [addressType, setAddressType] = useState<'HOME' | 'OFFICE' | 'SHOP'>(initialAddress?.addressType || 'HOME');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [warnings, setWarnings] = useState<string[]>([]);

  const availableCities = getCitiesByProvince(province);
  const cityData = findCityByName(city);
  const suggestedLandmarks = getSuggestedLandmarksForCity(city);
  const serviceability = checkPakistanServiceability({ cityName: city });

  useEffect(() => {
    if (cityData?.postalCode && !postalCode) {
      setPostalCode(cityData.postalCode);
    }
  }, [city, cityData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const payload: CustomerAddress = {
      id: initialAddress?.id || `addr-${Date.now()}`,
      fullName,
      phone,
      secondaryPhone: secondaryPhone || undefined,
      province,
      city,
      area,
      streetAddress,
      nearestLandmark: nearestLandmark || undefined,
      postalCode: postalCode || undefined,
      addressType,
      isDefault: initialAddress?.isDefault ?? false,
      verifiedServiceable: serviceability.isServiceable
    };

    const validation = validateCustomerAddress(payload);
    if (!validation.isValid) {
      setErrors(validation.errors);
      setWarnings(validation.serviceabilityWarnings);
      return;
    }

    onSave(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 text-xs text-slate-200 space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <h4 className="font-bold text-white text-sm flex items-center gap-2">
          <MapPin className="w-4 h-4 text-emerald-400" />
          <span>Consignee Delivery Address (Pakistan Standard)</span>
        </h4>
        <span className="text-[11px] text-slate-400">TCS / Trax / PostEx Ready</span>
      </div>

      {warnings.length > 0 && (
        <div className="bg-amber-950/40 border border-amber-500/30 rounded-xl p-3 text-amber-300 space-y-1">
          {warnings.map((w, idx) => (
            <p key={idx} className="flex items-start gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-amber-400" />
              <span>{w}</span>
            </p>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Full Name */}
        <div>
          <label className="block text-slate-400 mb-1">Customer Full Name *</label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="e.g. Muhammad Usman"
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-emerald-500"
          />
          {errors.fullName && <p className="text-rose-400 text-[10px] mt-0.5">{errors.fullName}</p>}
        </div>

        {/* Primary Phone */}
        <div>
          <label className="block text-slate-400 mb-1">Mobile Phone (WhatsApp Active) *</label>
          <input
            type="text"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="03001234567"
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-mono focus:outline-none focus:border-emerald-500"
          />
          {errors.phone && <p className="text-rose-400 text-[10px] mt-0.5">{errors.phone}</p>}
        </div>

        {/* Province */}
        <div>
          <label className="block text-slate-400 mb-1">Province *</label>
          <select
            value={province}
            onChange={(e) => {
              const prov = e.target.value as PakistanProvince;
              setProvince(prov);
              const citiesInProv = getCitiesByProvince(prov);
              if (citiesInProv.length > 0) setCity(citiesInProv[0].name);
            }}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-emerald-500"
          >
            {PAKISTAN_PROVINCES.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>

        {/* City */}
        <div>
          <label className="block text-slate-400 mb-1">City / Hub *</label>
          <select
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-emerald-500"
          >
            {availableCities.map((c) => (
              <option key={c.id} value={c.name}>{c.name} ({c.urduName})</option>
            ))}
          </select>
        </div>
      </div>

      {/* Area & Postal Code */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-slate-400 mb-1">Area / Sector / Colony</label>
          {cityData?.areas && cityData.areas.length > 0 ? (
            <select
              value={area}
              onChange={(e) => setArea(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-emerald-500"
            >
              <option value="">Select or type area...</option>
              {cityData.areas.map((a) => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>
          ) : (
            <input
              type="text"
              value={area}
              onChange={(e) => setArea(e.target.value)}
              placeholder="e.g. Model Town"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
            />
          )}
        </div>

        <div>
          <label className="block text-slate-400 mb-1">Postal Code</label>
          <input
            type="text"
            value={postalCode}
            onChange={(e) => setPostalCode(e.target.value)}
            placeholder="54000"
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-mono"
          />
        </div>
      </div>

      {/* Street Address */}
      <div>
        <label className="block text-slate-400 mb-1">Street Address / House / Mohallah *</label>
        <textarea
          rows={2}
          value={streetAddress}
          onChange={(e) => setStreetAddress(e.target.value)}
          placeholder="House # 12, Street 4, Sector G-9/1, near Bilal Masjid"
          className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-emerald-500"
        />
        {errors.streetAddress && <p className="text-rose-400 text-[10px] mt-0.5">{errors.streetAddress}</p>}
      </div>

      {/* Landmark (Pakistan Essential) */}
      <div>
        <label className="block text-slate-400 mb-1">Nearest Landmark (Masjid, Chowk, School) - Highly Recommended</label>
        <input
          type="text"
          value={nearestLandmark}
          onChange={(e) => setNearestLandmark(e.target.value)}
          placeholder="e.g. Near Kalma Chowk Metro Station"
          className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-emerald-500"
        />
        <div className="flex flex-wrap gap-1.5 mt-1.5">
          {suggestedLandmarks.map((lm, idx) => (
            <button
              type="button"
              key={idx}
              onClick={() => setNearestLandmark(lm)}
              className="text-[10px] bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-emerald-400 border border-slate-800 rounded-lg px-2 py-0.5 transition"
            >
              + {lm}
            </button>
          ))}
        </div>
      </div>

      {/* Address Type */}
      <div>
        <label className="block text-slate-400 mb-1">Delivery Destination Type:</label>
        <div className="flex gap-2">
          {[
            { id: 'HOME', label: 'Residence / Home', icon: Home },
            { id: 'OFFICE', label: 'Office / Corporate', icon: Building },
            { id: 'SHOP', label: 'Retail Shop / Market', icon: MapPin }
          ].map((t) => {
            const Icon = t.icon;
            return (
              <button
                type="button"
                key={t.id}
                onClick={() => setAddressType(t.id as any)}
                className={`flex-1 p-2 rounded-xl border flex items-center justify-center gap-1.5 transition ${
                  addressType === t.id
                    ? 'border-emerald-500 bg-emerald-950/20 text-emerald-400 font-bold'
                    : 'border-slate-800 bg-slate-950/40 text-slate-400 hover:border-slate-700'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition shadow-md shadow-emerald-900/30 flex items-center gap-1.5"
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>Save & Use Address</span>
        </button>
      </div>
    </form>
  );
};
