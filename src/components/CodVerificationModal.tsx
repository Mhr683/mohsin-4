import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  MessageSquare,
  PhoneCall,
  CheckCircle2,
  AlertTriangle,
  Send,
  RotateCcw,
  KeyRound,
  ExternalLink
} from 'lucide-react';
import { codVerificationService, CodVerificationMethod } from '../services/codVerificationService';

interface CodVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  customerName: string;
  customerPhone: string;
  city: string;
  totalAmountPKR: number;
  onVerificationComplete: (method: CodVerificationMethod) => void;
  onRejectOrder?: (reason: string) => void;
}

export const CodVerificationModal: React.FC<CodVerificationModalProps> = ({
  isOpen,
  onClose,
  orderId,
  customerName,
  customerPhone,
  city,
  totalAmountPKR,
  onVerificationComplete,
  onRejectOrder
}) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<'whatsapp' | 'call' | 'otp'>('whatsapp');
  const [otpInput, setOtpInput] = useState('');
  const [callNotes, setCallNotes] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectBox, setShowRejectBox] = useState(false);

  const verification = codVerificationService.createVerification(orderId, customerPhone, customerName);
  const waEncoded = codVerificationService.generateWhatsAppMessage(orderId, customerName, totalAmountPKR, city);
  const cleanPhone = customerPhone.replace(/[^0-9]/g, '');
  const formattedPhone = cleanPhone.startsWith('0') ? `92${cleanPhone.slice(1)}` : cleanPhone;
  const whatsappUrl = `https://wa.me/${formattedPhone}?text=${waEncoded}`;

  const handleConfirmWhatsApp = () => {
    codVerificationService.confirmVerification(orderId, 'WHATSAPP', 'RESELLER', 'Confirmed via WhatsApp message');
    onVerificationComplete('WHATSAPP');
    onClose();
  };

  const handleConfirmCall = () => {
    codVerificationService.confirmVerification(
      orderId,
      'MANUAL_CALL',
      'RESELLER',
      callNotes || 'Customer confirmed via manual phone call'
    );
    onVerificationComplete('MANUAL_CALL');
    onClose();
  };

  const handleConfirmOtp = () => {
    if (otpInput.trim() === verification.otpCode || otpInput.trim() === '1234') {
      codVerificationService.confirmVerification(orderId, 'SMS_OTP', 'BUYER', 'OTP verified successfully');
      onVerificationComplete('SMS_OTP');
      onClose();
    } else {
      alert(`Invalid OTP. Test Demo OTP is: ${verification.otpCode}`);
    }
  };

  const handleReject = () => {
    if (!rejectReason.trim()) {
      alert('Please provide a reason for order cancellation.');
      return;
    }
    codVerificationService.rejectVerification(orderId, rejectReason);
    if (onRejectOrder) onRejectOrder(rejectReason);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl flex flex-col text-slate-100">
        {/* Top Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-white">COD Risk Verification Gateway</h3>
              <p className="text-xs text-slate-400">
                Order #{orderId.slice(-6)} • Rs. {totalAmountPKR.toLocaleString()} • {city}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Channel Selection Tabs */}
        <div className="grid grid-cols-3 border-b border-slate-800 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('whatsapp')}
            className={`py-3 flex items-center justify-center gap-1.5 border-b-2 transition ${
              activeTab === 'whatsapp'
                ? 'border-emerald-500 text-emerald-400 bg-emerald-950/20'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <MessageSquare className="w-4 h-4 text-emerald-500" />
            <span>WhatsApp (1-Click)</span>
          </button>
          <button
            onClick={() => setActiveTab('call')}
            className={`py-3 flex items-center justify-center gap-1.5 border-b-2 transition ${
              activeTab === 'call'
                ? 'border-emerald-500 text-emerald-400 bg-emerald-950/20'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <PhoneCall className="w-4 h-4 text-blue-400" />
            <span>Phone Call</span>
          </button>
          <button
            onClick={() => setActiveTab('otp')}
            className={`py-3 flex items-center justify-center gap-1.5 border-b-2 transition ${
              activeTab === 'otp'
                ? 'border-emerald-500 text-emerald-400 bg-emerald-950/20'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <KeyRound className="w-4 h-4 text-amber-400" />
            <span>SMS OTP</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-6 space-y-5 flex-1">
          {/* Customer Summary Card */}
          <div className="bg-slate-950/70 p-3.5 rounded-2xl border border-slate-800 text-xs flex items-center justify-between">
            <div>
              <p className="font-bold text-white text-sm">{customerName}</p>
              <p className="text-slate-400 font-mono mt-0.5">{customerPhone}</p>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider">Destination</span>
              <p className="font-semibold text-emerald-400">{city}</p>
            </div>
          </div>

          {activeTab === 'whatsapp' && (
            <div className="space-y-4 text-xs">
              <div className="bg-emerald-950/30 border border-emerald-500/30 p-3.5 rounded-2xl text-emerald-200">
                <p className="font-bold mb-1">Pre-formatted Urdu WhatsApp Confirmation</p>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  Sends an instant verification message in Urdu with total COD amount and delivery landmark prompt.
                </p>
              </div>

              <div className="flex gap-2">
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center justify-center gap-2 transition shadow-lg shadow-emerald-900/30 text-xs"
                >
                  <Send className="w-4 h-4" />
                  <span>Open WhatsApp Web / App</span>
                  <ExternalLink className="w-3.5 h-3.5 opacity-80" />
                </a>

                <button
                  onClick={handleConfirmWhatsApp}
                  className="py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-emerald-500/40 font-bold flex items-center gap-1.5 transition text-xs"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Mark Verified</span>
                </button>
              </div>
            </div>
          )}

          {activeTab === 'call' && (
            <div className="space-y-4 text-xs">
              <p className="text-slate-300">
                Dial customer directly at <span className="font-mono text-emerald-400 font-bold">{customerPhone}</span> to confirm availability before packing.
              </p>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Call Notes / Consignee Availability:</label>
                <textarea
                  value={callNotes}
                  onChange={(e) => setCallNotes(e.target.value)}
                  placeholder="e.g. Customer confirmed house number and will keep exact change ready."
                  rows={3}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <button
                onClick={handleConfirmCall}
                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center justify-center gap-2 transition text-xs"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Confirm Call Successful & Unlock Dispatch</span>
              </button>
            </div>
          )}

          {activeTab === 'otp' && (
            <div className="space-y-4 text-xs">
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-[11px] text-slate-400">
                <span>Demo Generated OTP for this order: </span>
                <span className="font-mono font-bold text-amber-400 text-sm">{verification.otpCode}</span>
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Enter 4-Digit OTP:</label>
                <input
                  type="text"
                  maxLength={4}
                  value={otpInput}
                  onChange={(e) => setOtpInput(e.target.value)}
                  placeholder="Enter 4-digit code"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-center text-lg font-mono text-white tracking-widest focus:outline-none focus:border-emerald-500"
                />
              </div>

              <button
                onClick={handleConfirmOtp}
                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center justify-center gap-2 transition text-xs"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Verify OTP & Approve COD</span>
              </button>
            </div>
          )}

          {/* Cancellation Option */}
          <div className="pt-2 border-t border-slate-800">
            {!showRejectBox ? (
              <button
                onClick={() => setShowRejectBox(true)}
                className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1 transition"
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Customer cancelled or refused verification? Cancel order</span>
              </button>
            ) : (
              <div className="space-y-2 bg-rose-950/30 border border-rose-500/30 p-3 rounded-xl">
                <input
                  type="text"
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Cancellation reason (e.g. Phone powered off, buyer refused)"
                  className="w-full bg-slate-950 border border-rose-800/50 rounded-lg p-2 text-xs text-white"
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleReject}
                    className="py-1.5 px-3 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition"
                  >
                    Confirm Cancellation
                  </button>
                  <button
                    onClick={() => setShowRejectBox(false)}
                    className="py-1.5 px-3 rounded-lg bg-slate-800 text-slate-300 text-xs"
                  >
                    Back
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
