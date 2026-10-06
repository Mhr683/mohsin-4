import React, { useState } from 'react';
import {
  MapPin,
  Plus,
  Check,
  Trash2,
  Edit2,
  Home,
  Building,
  ShieldCheck,
  AlertTriangle
} from 'lucide-react';
import { CustomerAddress } from '../types/location';
import { customerAddressService } from '../services/customerAddressService';
import { CustomerAddressForm } from './CustomerAddressForm';

interface CustomerAddressListProps {
  selectedAddressId?: string;
  onSelectAddress: (address: CustomerAddress) => void;
}

export const CustomerAddressList: React.FC<CustomerAddressListProps> = ({
  selectedAddressId,
  onSelectAddress
}) => {
  const [addresses, setAddresses] = useState<CustomerAddress[]>(() => customerAddressService.getAddresses());
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [editingAddress, setEditingAddress] = useState<CustomerAddress | null>(null);

  const handleSaved = (newAddr: CustomerAddress) => {
    customerAddressService.saveAddress(newAddr);
    setAddresses(customerAddressService.getAddresses());
    setIsAddingNew(false);
    setEditingAddress(null);
    onSelectAddress(newAddr);
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    customerAddressService.deleteAddress(id);
    setAddresses(customerAddressService.getAddresses());
  };

  if (isAddingNew || editingAddress) {
    return (
      <CustomerAddressForm
        initialAddress={editingAddress || undefined}
        onSave={handleSaved}
        onCancel={() => {
          setIsAddingNew(false);
          setEditingAddress(null);
        }}
      />
    );
  }

  return (
    <div className="space-y-3 text-xs">
      <div className="flex items-center justify-between">
        <span className="font-semibold text-slate-300">Saved Delivery Addresses</span>
        <button
          type="button"
          onClick={() => setIsAddingNew(true)}
          className="text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-bold transition"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add New Address</span>
        </button>
      </div>

      <div className="grid grid-cols-1 gap-2">
        {addresses.map((addr) => {
          const isSelected = selectedAddressId === addr.id;
          return (
            <div
              key={addr.id}
              onClick={() => onSelectAddress(addr)}
              className={`p-3 rounded-2xl border cursor-pointer transition-all flex items-start justify-between ${
                isSelected
                  ? 'border-emerald-500 bg-emerald-950/20 ring-1 ring-emerald-500'
                  : 'border-slate-800 bg-slate-900/60 hover:border-slate-700'
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white text-xs">{addr.fullName}</span>
                  <span className="font-mono text-[11px] text-slate-400">{addr.phone}</span>
                  <span className="bg-slate-800 text-[10px] text-slate-300 px-1.5 py-0.2 rounded font-semibold uppercase">
                    {addr.addressType}
                  </span>
                  {addr.isDefault && (
                    <span className="bg-emerald-500/20 text-emerald-400 text-[10px] px-1.5 py-0.2 rounded font-semibold">
                      Default
                    </span>
                  )}
                </div>

                <p className="text-slate-300 text-[11px] leading-relaxed">
                  {addr.streetAddress}, {addr.area ? `${addr.area}, ` : ''}{addr.city}, {addr.province}
                </p>

                {addr.nearestLandmark && (
                  <p className="text-emerald-400/90 text-[10px]">
                    📍 Landmark: {addr.nearestLandmark}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-1.5 pl-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditingAddress(addr);
                  }}
                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                  title="Edit Address"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={(e) => handleDelete(addr.id, e)}
                  className="p-1 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800"
                  title="Delete Address"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
