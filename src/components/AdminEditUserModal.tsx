import React, { useState } from 'react';
import {
  X,
  Save,
  User as UserIcon,
  Mail,
  Phone,
  Building2,
  MapPin,
  Shield,
  DollarSign,
  CheckCircle2,
} from 'lucide-react';
import { User, UserRole } from '../types';

interface AdminEditUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  onSaveUser: (updatedUser: User) => void;
}

const ROLES: { value: UserRole; label: string; desc: string }[] = [
  { value: 'RESELLER', label: 'Reseller Merchant', desc: 'Sells wholesale products on Shopify/Daraz/TikTok' },
  { value: 'SUPPLIER', label: 'Factory Manufacturer', desc: 'Lists bulk wholesale inventory and fulfills parcels' },
  { value: 'ADMIN', label: 'Master Administrator', desc: 'Full central authority over platform and finances' },
  { value: 'CUSTOMER', label: 'Direct Retail Customer', desc: 'Browses and purchases directly via store links' },
];

export const AdminEditUserModal: React.FC<AdminEditUserModalProps> = ({
  isOpen,
  onClose,
  user,
  onSaveUser,
}) => {
  if (!isOpen || !user) return null;

  const [formData, setFormData] = useState<User>({ ...user });
  const [isSaved, setIsSaved] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveUser(formData);
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      onClose();
    }, 700);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-3 sm:p-4 backdrop-blur-md overflow-y-auto">
      <div className="w-full max-w-lg rounded-2xl border border-blue-500/40 bg-slate-900 p-5 sm:p-6 shadow-2xl space-y-4 my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30">
              <UserIcon className="h-5 w-5" />
            </div>
            <div>
              <span className="rounded bg-blue-500/20 px-2 py-0.5 text-[10px] font-bold text-blue-300 border border-blue-500/30">
                USER PROFILE EDITOR
              </span>
              <h2 className="text-base font-bold text-white tracking-tight mt-0.5">
                Edit User: {user.name}
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-3">
            {/* Full Name */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Full Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2 text-xs text-white focus:border-blue-500 focus:outline-none"
              />
            </div>

            {/* Email */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Email Address</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2 text-xs text-white font-mono focus:border-blue-500 focus:outline-none"
              />
            </div>

            {/* Phone & City */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Phone Number</label>
                <input
                  type="text"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2 text-xs text-white font-mono focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">City</label>
                <input
                  type="text"
                  required
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2 text-xs text-white focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Company Name */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Company / Brand / Store Name</label>
              <input
                type="text"
                required
                value={formData.companyName}
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2 text-xs text-white focus:border-blue-500 focus:outline-none"
              />
            </div>

            {/* Role Selector */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Platform Role & Clearance</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2 text-xs text-white focus:border-blue-500 focus:outline-none"
              >
                {ROLES.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label} ({r.value})
                  </option>
                ))}
              </select>
            </div>

            {/* Direct Wallet Balance Set */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                <span>Wallet Balance (PKR)</span>
                <span className="text-[10px] text-emerald-400">Direct Admin Override</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-mono font-bold text-slate-400">
                  PKR
                </span>
                <input
                  type="number"
                  min="0"
                  step="50"
                  required
                  value={formData.walletBalancePKR}
                  onChange={(e) => setFormData({ ...formData, walletBalancePKR: Number(e.target.value) })}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 pl-12 pr-3.5 py-2 text-xs font-mono font-bold text-emerald-400 focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Submit Actions */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-800">
            <div>
              {isSaved && (
                <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="h-4 w-4" /> User profile updated!
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl bg-slate-800 hover:bg-slate-700 px-4 py-2 text-xs font-semibold text-slate-300 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-500 px-5 py-2 text-xs font-bold text-white shadow-lg transition"
              >
                <Save className="h-4 w-4" />
                <span>Save User Profile</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
