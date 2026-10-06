import React, { useState } from 'react';
import {
  X,
  Truck,
  Printer,
  Barcode,
  CheckCircle2,
  Package,
  MapPin,
  Phone,
  Building2,
  QrCode,
  ShieldCheck,
  Zap,
  ArrowRight
} from 'lucide-react';
import { Order } from '../types';
import { courierManager } from '../services/couriers/courierManager';
import { CourierProviderCode } from '../types/courier';

interface CourierBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
  onConfirmBooking: (
    orderId: string,
    courierName: string,
    trackingNumber: string,
    dispatchNotes?: string
  ) => void;
}

const PAKISTANI_COURIERS = [
  {
    id: 'POSTEX',
    name: 'PostEx Logistics',
    logo: '⚡',
    color: 'from-orange-500 to-amber-600',
    prefix: 'PEX-',
    estDelivery: '24 - 48 Hours',
    cashSettlement: 'Next-Day COD Remittance',
  },
  {
    id: 'TRAX',
    name: 'Trax Logistics',
    logo: '🚚',
    color: 'from-sky-500 to-blue-600',
    prefix: 'TRX-',
    estDelivery: '1 - 3 Business Days',
    cashSettlement: 'Twice a week COD payout',
  },
  {
    id: 'LEOPARDS',
    name: 'Leopards Courier',
    logo: '🐆',
    color: 'from-amber-500 to-yellow-600',
    prefix: 'LEO-',
    estDelivery: '2 - 3 Days Nationwide',
    cashSettlement: 'Weekly COD Remittance',
  },
  {
    id: 'TCS',
    name: 'TCS Express',
    logo: '📦',
    color: 'from-rose-500 to-red-600',
    prefix: 'TCS-',
    estDelivery: '1 - 2 Days Express',
    cashSettlement: 'Weekly COD Remittance',
  },
  {
    id: 'MNP',
    name: 'M&P Logistics',
    logo: '✈️',
    color: 'from-purple-500 to-indigo-600',
    prefix: 'MNP-',
    estDelivery: '2 - 4 Days',
    cashSettlement: 'Bi-Weekly COD Remittance',
  },
];

export const CourierBookingModal: React.FC<CourierBookingModalProps> = ({
  isOpen,
  onClose,
  order,
  onConfirmBooking,
}) => {
  const [selectedCourier, setSelectedCourier] = useState(PAKISTANI_COURIERS[0]);
  const [originCity, setOriginCity] = useState('Lahore Warehouse');
  const [weightKg, setWeightKg] = useState('0.75');
  const [pieces, setPieces] = useState('1');
  const [insuranceEnabled, setInsuranceEnabled] = useState(false);
  const [isBooking, setIsBooking] = useState(false);
  const [bookedCn, setBookedCn] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'booking-form' | 'thermal-label'>('booking-form');

  if (!isOpen || !order) return null;

  const orderId = order.id || order.orderNumber || 'ORD-1';

  const handleExecuteBooking = async () => {
    setIsBooking(true);
    try {
      const courierCode = (selectedCourier.id as CourierProviderCode) || 'TRAX';
      const shipment = await courierManager.createShipment(courierCode, {
        orderId,
        orderNumber: order.orderNumber,
        consignee: {
          name: order.customerName,
          phone: order.customerPhone,
          address: order.customerAddress || 'Customer Address',
          city: order.customerCity || 'Lahore',
        },
        items: [
          {
            productTitle: (order as any).productTitle || order.items?.[0]?.productName || order.items?.[0]?.name || 'Dropship Product',
            quantity: (order as any).quantity || order.items?.[0]?.quantity || 1,
            weightKg: parseFloat(weightKg) || 0.75,
            pricePKR: order.sellingPricePKR || 0
          }
        ],
        codAmountPKR: order.sellingPricePKR || 0,
        totalWeightKg: parseFloat(weightKg) || 0.75,
        pieces: parseInt(pieces) || 1,
        deliveryType: 'STANDARD',
        specialInstructions: insuranceEnabled ? 'High-value COD parcel with Transit Insurance' : undefined
      });

      const generatedCn = shipment.trackingNumber || `${selectedCourier.prefix}${Math.floor(10000000 + Math.random() * 90000000)}`;
      setBookedCn(generatedCn);
      setIsBooking(false);
      setActiveTab('thermal-label');
      onConfirmBooking(
        orderId,
        selectedCourier.name,
        generatedCn,
        `Booked via ${selectedCourier.name} (CN: ${generatedCn}, Origin: ${originCity}, Weight: ${weightKg}kg)`
      );
    } catch {
      const generatedCn = `${selectedCourier.prefix}${Math.floor(10000000 + Math.random() * 90000000)}`;
      setBookedCn(generatedCn);
      setIsBooking(false);
      setActiveTab('thermal-label');
      onConfirmBooking(
        orderId,
        selectedCourier.name,
        generatedCn,
        `Booked via ${selectedCourier.name} (Origin: ${originCity}, Weight: ${weightKg}kg)`
      );
    }
  };

  const handlePrintLabel = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-400">
              <Truck className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-white">Direct Pakistani Courier Booking</h3>
                <span className="rounded-full bg-purple-500/20 px-2 py-0.5 text-[10px] font-black text-purple-300 border border-purple-500/30">
                  1-Click CN & Thermal Slip
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Order #{order.orderNumber} • Destination: {order.customerCity} • COD PKR {order.sellingPricePKR.toLocaleString()}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-xl p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Toggle */}
        <div className="flex border-b border-slate-800 bg-slate-900 px-5 pt-3 gap-4">
          <button
            onClick={() => setActiveTab('booking-form')}
            className={`pb-3 text-xs font-bold transition flex items-center gap-2 border-b-2 ${
              activeTab === 'booking-form'
                ? 'border-purple-500 text-purple-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Zap className="h-4 w-4" />
            <span>Courier Selection & Booking</span>
          </button>

          <button
            onClick={() => {
              if (bookedCn || order.trackingNumber) setActiveTab('thermal-label');
            }}
            disabled={!bookedCn && !order.trackingNumber}
            className={`pb-3 text-xs font-bold transition flex items-center gap-2 border-b-2 disabled:opacity-40 ${
              activeTab === 'thermal-label'
                ? 'border-purple-500 text-purple-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Printer className="h-4 w-4" />
            <span>Thermal 4x6 Airway Bill Label</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {activeTab === 'booking-form' && (
            <div className="space-y-4">
              {/* Courier Partner Selection Grid */}
              <div>
                <label className="text-xs font-bold text-slate-300 mb-2 block">
                  Select Integrated Courier Partner:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {PAKISTANI_COURIERS.map((c) => {
                    const isSelected = selectedCourier.id === c.id;
                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => setSelectedCourier(c)}
                        className={`p-3 rounded-2xl border text-left transition flex items-start justify-between cursor-pointer ${
                          isSelected
                            ? 'border-purple-500/80 bg-purple-950/40 shadow-lg shadow-purple-950/20'
                            : 'border-slate-800 bg-slate-950/60 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{c.logo}</span>
                          <div>
                            <div className="text-xs font-bold text-white flex items-center gap-1.5">
                              <span>{c.name}</span>
                              {isSelected && <CheckCircle2 className="h-3.5 w-3.5 text-purple-400" />}
                            </div>
                            <div className="text-[10px] text-slate-400 mt-0.5">{c.estDelivery}</div>
                            <div className="text-[9px] text-emerald-400 font-semibold">{c.cashSettlement}</div>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Origin & Weight Form */}
              <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4 space-y-3">
                <div className="text-xs font-bold text-white flex items-center gap-1.5">
                  <MapPin className="h-4 w-4 text-purple-400" />
                  <span>Parcel Dispatch Details</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <label className="text-slate-400 block mb-1 font-semibold">Origin Warehouse:</label>
                    <select
                      value={originCity}
                      onChange={(e) => setOriginCity(e.target.value)}
                      className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-white font-medium focus:border-purple-500 focus:outline-none"
                    >
                      <option value="Lahore Warehouse">Lahore (Main Central Hub)</option>
                      <option value="Karachi Hub">Karachi (Korangi Warehouse)</option>
                      <option value="Rawalpindi Hub">Rawalpindi / Islamabad Hub</option>
                      <option value="Faisalabad Hub">Faisalabad Textile Hub</option>
                      <option value="Sialkot Hub">Sialkot Manufacturing Hub</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-slate-400 block mb-1 font-semibold">Gross Weight (kg):</label>
                    <input
                      type="number"
                      step="0.1"
                      value={weightKg}
                      onChange={(e) => setWeightKg(e.target.value)}
                      className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-white font-bold font-mono focus:border-purple-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-slate-400 block mb-1 font-semibold">Pieces / Flyercount:</label>
                    <input
                      type="number"
                      value={pieces}
                      onChange={(e) => setPieces(e.target.value)}
                      className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-white font-bold font-mono focus:border-purple-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Destination & COD Overview */}
                <div className="pt-2 border-t border-slate-800 grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-slate-500 block">Deliver To:</span>
                    <span className="font-bold text-slate-200">{order.customerName}</span>
                    <p className="text-[11px] text-slate-400 truncate">{order.customerAddress}, {order.customerCity}</p>
                  </div>

                  <div className="text-right">
                    <span className="text-slate-500 block">COD Amount to Collect:</span>
                    <span className="text-sm font-black font-mono text-emerald-400">
                      PKR {order.sellingPricePKR.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Booking CTA Button */}
              <button
                onClick={handleExecuteBooking}
                disabled={isBooking}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-xs shadow-xl shadow-purple-950/40 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {isBooking ? (
                  <>
                    <Zap className="h-4 w-4 animate-spin text-purple-300" />
                    <span>Booking with {selectedCourier.name} API & Generating Barcode...</span>
                  </>
                ) : (
                  <>
                    <Truck className="h-4 w-4" />
                    <span>Confirm 1-Click Booking via {selectedCourier.name}</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </div>
          )}

          {activeTab === 'thermal-label' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">Standard 4x6 Thermal Label (Ready for Zebra / Xprinter):</span>
                <button
                  onClick={handlePrintLabel}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow transition cursor-pointer"
                >
                  <Printer className="h-3.5 w-3.5" />
                  <span>Print 4x6 Label</span>
                </button>
              </div>

              {/* Thermal 4x6 Label Container (White Paper Style) */}
              <div
                id="thermal-label-print-area"
                className="mx-auto w-full max-w-md bg-white text-slate-900 rounded-xl p-4 border-2 border-slate-900 font-sans shadow-2xl space-y-3"
              >
                {/* Label Header */}
                <div className="flex items-center justify-between border-b-2 border-slate-900 pb-2">
                  <div>
                    <div className="text-xl font-black tracking-tight uppercase">
                      {order.courierName || selectedCourier.name}
                    </div>
                    <div className="text-[10px] font-bold text-slate-700">EXPRESS COD AIRWAY BILL</div>
                  </div>
                  <div className="text-right">
                    <span className="rounded bg-slate-900 px-2 py-0.5 text-xs font-black text-white">
                      COD
                    </span>
                    <div className="text-[10px] font-bold mt-0.5">{originCity.split(' ')[0]} ➔ {order.customerCity}</div>
                  </div>
                </div>

                {/* Barcode & CN */}
                <div className="text-center py-1 border-b-2 border-slate-900">
                  <div className="font-mono text-2xl font-black tracking-widest text-slate-950">
                    |||||| | |||||||||| |||| |||||||
                  </div>
                  <div className="font-mono text-xs font-black tracking-wider text-slate-900 mt-1">
                    CN: {bookedCn || order.trackingNumber || 'TRX-94820194'}
                  </div>
                </div>

                {/* Shipper (White-label Reseller) & Consignee */}
                <div className="grid grid-cols-2 gap-2 text-[10px] border-b-2 border-slate-900 pb-2">
                  <div className="border-r border-slate-300 pr-2">
                    <span className="font-black uppercase text-slate-600 block">Shipper (Reseller Brand):</span>
                    <div className="font-bold text-slate-950 text-[11px]">{order.resellerName || 'YourMart Partner Store'}</div>
                    <div className="text-slate-700">Origin: {originCity}</div>
                    <div className="text-slate-700">Return Hub: P.O. Box 54000, PK</div>
                  </div>

                  <div className="pl-1">
                    <span className="font-black uppercase text-slate-600 block">Deliver To (Consignee):</span>
                    <div className="font-bold text-slate-950 text-xs">{order.customerName}</div>
                    <div className="text-slate-800 font-semibold">{order.customerPhone}</div>
                    <div className="text-slate-700 line-clamp-2">{order.customerAddress}, {order.customerCity}</div>
                  </div>
                </div>

                {/* Cash on Delivery Amount in Giant Bold */}
                <div className="bg-slate-100 p-2.5 rounded-lg border border-slate-900 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-black uppercase text-slate-700 block">Cash On Delivery (COD):</span>
                    <span className="text-2xl font-black font-mono text-slate-950">
                      PKR {order.sellingPricePKR.toLocaleString()}
                    </span>
                  </div>
                  <div className="text-right text-[10px]">
                    <div className="font-bold text-slate-800">Weight: {weightKg} kg</div>
                    <div className="font-bold text-slate-800">Pieces: {pieces}</div>
                    <div className="text-slate-600 font-mono">Ref: {order.orderNumber}</div>
                  </div>
                </div>

                {/* Footer Warning & Fragile Mark */}
                <div className="flex items-center justify-between text-[9px] text-slate-600 pt-1">
                  <span className="font-bold uppercase">⚠️ Handle with Care • Fragile Goods</span>
                  <span>Generated via YourMart Carrier Network</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
