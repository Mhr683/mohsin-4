import React, { useState } from 'react';
import {
  X,
  Camera,
  Barcode,
  QrCode,
  CheckCircle2,
  AlertTriangle,
  Volume2,
  Package,
  Truck,
  RotateCcw,
  Zap,
  Search
} from 'lucide-react';
import { Order } from '../types';

interface BarcodeScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  orders: Order[];
  onUpdateOrderStatus: (orderId: string, status: string, notes?: string) => void;
}

export const BarcodeScannerModal: React.FC<BarcodeScannerModalProps> = ({
  isOpen,
  onClose,
  orders,
  onUpdateOrderStatus,
}) => {
  const [scannedCode, setScannedCode] = useState('');
  const [matchedOrder, setMatchedOrder] = useState<Order | null>(null);
  const [scanStatusMessage, setScanStatusMessage] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(true);

  if (!isOpen) return null;

  // Sound generator using Web Audio API
  const playBeep = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, audioCtx.currentTime); // 880Hz beep
      gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.15);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.15);
    } catch (e) {}
  };

  const handleExecuteScan = (codeToScan: string) => {
    const code = codeToScan.trim().toLowerCase();
    if (!code) return;

    playBeep();
    setScannedCode(codeToScan);

    const found = orders.find(
      (o) =>
        (o.trackingNumber && o.trackingNumber.toLowerCase() === code) ||
        (o.orderNumber && o.orderNumber.toLowerCase() === code) ||
        (o.id && o.id.toLowerCase() === code)
    );

    if (found) {
      setMatchedOrder(found);
      setScanStatusMessage(`Order #${found.orderNumber} successfully identified!`);
    } else {
      setMatchedOrder(null);
      setScanStatusMessage(`Barcode "${codeToScan}" not found in system.`);
    }
  };

  const handleApplyStatus = (newStatus: string) => {
    if (!matchedOrder) return;
    const orderId = matchedOrder.id || matchedOrder.orderNumber || 'ORD-1';
    onUpdateOrderStatus(orderId, newStatus, `Updated via Mobile Barcode Scanner (${newStatus})`);
    setScanStatusMessage(`Order #${matchedOrder.orderNumber} marked as ${newStatus}!`);
    setTimeout(() => {
      setMatchedOrder(null);
      setScannedCode('');
    }, 1500);
  };

  // Sample barcodes from active orders for 1-click test
  const sampleBarcodes = orders
    .filter((o) => o.trackingNumber || o.orderNumber)
    .slice(0, 4)
    .map((o) => o.trackingNumber || o.orderNumber || '');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
              <Camera className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-white">Warehouse Barcode & QR Scanner</h3>
                <span className="rounded-full bg-cyan-500/20 px-2 py-0.5 text-[10px] font-black text-cyan-300 border border-cyan-500/30">
                  Live Scanner
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Parcel label ka barcode scan karein aur 1-click me dispatch ya receive status lagayein.
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

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1 text-xs">
          {/* Simulated Camera Viewfinder */}
          <div className="relative rounded-2xl border-2 border-dashed border-cyan-500/60 bg-slate-950 h-56 flex flex-col items-center justify-center overflow-hidden shadow-inner">
            {/* Animated Laser Scanning Beam */}
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_15px_#22d3ee] animate-bounce" />

            <div className="h-32 w-48 border-2 border-cyan-400/40 rounded-xl flex items-center justify-center relative bg-cyan-950/10">
              <div className="text-center space-y-1">
                <Barcode className="h-12 w-12 text-cyan-400 mx-auto opacity-70" />
                <span className="text-[10px] font-bold text-cyan-300 tracking-wider uppercase block">
                  Align Barcode / QR Inside Box
                </span>
              </div>

              {/* Viewfinder corner brackets */}
              <div className="absolute -top-1 -left-1 h-3 w-3 border-t-2 border-l-2 border-cyan-400" />
              <div className="absolute -top-1 -right-1 h-3 w-3 border-t-2 border-r-2 border-cyan-400" />
              <div className="absolute -bottom-1 -left-1 h-3 w-3 border-b-2 border-l-2 border-cyan-400" />
              <div className="absolute -bottom-1 -right-1 h-3 w-3 border-b-2 border-r-2 border-cyan-400" />
            </div>

            <div className="absolute bottom-2 flex items-center gap-1.5 text-[10px] text-slate-400 bg-slate-900/90 px-3 py-1 rounded-full border border-slate-800">
              <Volume2 className="h-3 w-3 text-cyan-400" />
              <span>Audio Beep Enabled</span>
            </div>
          </div>

          {/* Quick Barcode Simulator / Manual Entry */}
          <div className="space-y-2">
            <label className="text-slate-300 font-bold block">
              Scan Barcode / CN Tracking Number:
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="e.g. TRX-84920194 or YM-9481..."
                value={scannedCode}
                onChange={(e) => setScannedCode(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleExecuteScan(scannedCode);
                }}
                className="flex-1 rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-white font-mono font-bold focus:border-cyan-500 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => handleExecuteScan(scannedCode)}
                className="px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold transition cursor-pointer flex items-center gap-1"
              >
                <Search className="h-4 w-4" />
                <span>Lookup</span>
              </button>
            </div>

            {/* Quick Click Sample Barcodes from actual orders */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[10px] text-slate-400 font-semibold">Test Click:</span>
              {sampleBarcodes.map((cn, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleExecuteScan(cn)}
                  className="rounded-lg bg-slate-800 hover:bg-slate-700 px-2 py-0.5 text-[10px] font-mono text-cyan-300 border border-slate-700 transition cursor-pointer"
                >
                  {cn}
                </button>
              ))}
            </div>
          </div>

          {/* Matched Order Card */}
          {matchedOrder && (
            <div className="rounded-2xl border border-cyan-500/40 bg-slate-950 p-4 space-y-3 animate-fadeIn">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <div>
                  <div className="text-sm font-black text-white flex items-center gap-2">
                    <span>{matchedOrder.orderNumber}</span>
                    <span className="rounded-full bg-cyan-500/20 px-2 py-0.5 text-[10px] text-cyan-300 font-bold">
                      {matchedOrder.status}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400">
                    CN: <strong className="font-mono text-cyan-300">{matchedOrder.trackingNumber || 'Pending'}</strong> • Courier: {matchedOrder.courierName || 'TCS'}
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-slate-500 block uppercase font-bold">COD to Collect:</span>
                  <span className="text-sm font-black font-mono text-emerald-400">
                    PKR {matchedOrder.sellingPricePKR.toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="text-[11px] text-slate-300">
                <span>Deliver to: <strong>{matchedOrder.customerName}</strong> ({matchedOrder.customerPhone})</span>
                <p className="text-slate-400 truncate">{matchedOrder.customerAddress}, {matchedOrder.customerCity}</p>
              </div>

              {/* 1-Click Warehouse Action Buttons */}
              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800">
                <button
                  onClick={() => handleApplyStatus('PACKED')}
                  className="py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-[11px] shadow transition cursor-pointer flex items-center justify-center gap-1"
                >
                  <Package className="h-3.5 w-3.5" />
                  <span>Mark Packed</span>
                </button>

                <button
                  onClick={() => handleApplyStatus('DISPATCHED')}
                  className="py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-[11px] shadow transition cursor-pointer flex items-center justify-center gap-1"
                >
                  <Truck className="h-3.5 w-3.5" />
                  <span>Dispatch Van</span>
                </button>

                <button
                  onClick={() => handleApplyStatus('RETURNED')}
                  className="py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-[11px] shadow transition cursor-pointer flex items-center justify-center gap-1"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>Receive RTO</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <span className="text-[11px] text-slate-500">
            Compatible with Bluetooth Laser Scanners & Camera View
          </span>
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
