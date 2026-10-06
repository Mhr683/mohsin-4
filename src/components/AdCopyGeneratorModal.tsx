import React, { useState } from 'react';
import {
  Sparkles,
  Copy,
  Check,
  Video,
  Download,
  Share2,
  X,
  Target,
  DollarSign,
  Languages
} from 'lucide-react';
import { Product } from '../types';

interface AdCopyGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
}

export const AdCopyGeneratorModal: React.FC<AdCopyGeneratorModalProps> = ({
  isOpen,
  onClose,
  product,
}) => {
  const [language, setLanguage] = useState<'URDU_ROMAN' | 'ENGLISH'>('URDU_ROMAN');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!isOpen || !product) return null;

  const targetRetail = product.recSellingPricePKR || 2999;
  const deliveryDays = product.estDeliveryDays || 2;

  const romanUrduAd = `🔥 DHOOM MACHA DENE WALI DEAL! 🔥\n\nAbhi order karein ${product.name} wholesale factory rate par!\n\n✨ Top Features:\n• 100% Original High-Grade Quality\n• Cash On Delivery (COD) Poore Pakistan Mein Dastyab 🇵🇰\n• Sirf ${deliveryDays}-3 Din Mein Ghar Tak Delivery\n• 7 Days Replacement & Check Warranty Guaranteed!\n\n💰 Dhamaka Price: Sirf Rs. ${targetRetail.toLocaleString()} /- (Limited Stock!)\n\n👉 Abhi 'Send Message' ya 'Order Now' par click karein aur apna naam, pata aur number send karein! 🚚📦`;

  const englishAd = `🚀 MEGA SALE IS LIVE! 🚀\n\nUpgrade your daily lifestyle with the all-new ${product.name}!\n\n✨ Why Thousands of Pakistanis Love This:\n• Factory-Direct Certified Build & Durability\n• Cash On Delivery (COD) All Over Pakistan 🇵🇰\n• Lightning Fast Dispatch (${deliveryDays}-3 Days Doorstep Delivery)\n• 7-Day Hassle-Free Return / Replacement Guarantee\n\n💰 Special Limited-Time Price: Rs. ${targetRetail.toLocaleString()} Only!\n\n🛒 Click 'Shop Now' to book your parcel before stock runs out!`;

  const tiktokHooks = [
    `1. "Bhai ye cheez Pakistan mein itni sasti kahan se mil rahi hai?!" 🤯`,
    `2. "Stop buying expensive products when you can get ${product.name} at direct factory price!" ⚡`,
    `3. "Parcel aane par pehle check karein, phir payment karein — Best COD deal in Pakistan! 📦"`,
  ];

  const handleCopy = (key: string, content: string) => {
    navigator.clipboard.writeText(content);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="bg-slate-900 border border-violet-500/40 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-violet-900/60 via-slate-900 to-slate-900 p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-violet-500/20 text-violet-400 border border-violet-500/30 rounded-xl">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">AI Ad Copy & Creative Generator</h3>
              <p className="text-xs text-slate-400">
                High-converting Facebook, Instagram & TikTok ad copy for {product.name}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto">
          {/* Language Selector */}
          <div className="flex items-center justify-between bg-slate-950/70 p-1.5 rounded-xl border border-slate-800">
            <span className="text-xs font-semibold text-slate-400 pl-3 flex items-center gap-1.5">
              <Languages className="w-4 h-4 text-violet-400" />
              Target Ad Language:
            </span>
            <div className="flex gap-1">
              <button
                onClick={() => setLanguage('URDU_ROMAN')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
                  language === 'URDU_ROMAN'
                    ? 'bg-violet-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                🇵🇰 Roman Urdu (Highest ROAS)
              </button>
              <button
                onClick={() => setLanguage('ENGLISH')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
                  language === 'ENGLISH'
                    ? 'bg-violet-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                🇬🇧 English
              </button>
            </div>
          </div>

          {/* Primary Ad Copy Box */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Facebook / Instagram Ad Primary Text
              </label>
              <button
                onClick={() =>
                  handleCopy('primary', language === 'URDU_ROMAN' ? romanUrduAd : englishAd)
                }
                className="flex items-center gap-1.5 text-xs text-violet-400 hover:text-violet-300 font-medium transition"
              >
                {copiedKey === 'primary' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Ad Copy</span>
                  </>
                )}
              </button>
            </div>
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono text-xs text-slate-200 whitespace-pre-wrap leading-relaxed">
              {language === 'URDU_ROMAN' ? romanUrduAd : englishAd}
            </div>
          </div>

          {/* TikTok & Reels Viral Hooks */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <Video className="w-4 h-4" />
                TikTok / Reels 3-Second Viral Hook Lines
              </label>
              <button
                onClick={() => handleCopy('hooks', tiktokHooks.join('\n'))}
                className="text-xs text-slate-400 hover:text-white flex items-center gap-1"
              >
                {copiedKey === 'hooks' ? 'Copied Hooks!' : 'Copy All Hooks'}
              </button>
            </div>
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 space-y-2">
              {tiktokHooks.map((hook, idx) => (
                <div key={idx} className="text-xs text-slate-300 bg-slate-900/80 p-2.5 rounded-lg border border-slate-800/80">
                  {hook}
                </div>
              ))}
            </div>
          </div>

          {/* Ad Creative Download Pack */}
          <div className="bg-gradient-to-r from-slate-900 to-slate-800/80 border border-slate-700/60 rounded-xl p-4 flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="text-sm font-bold text-white">Download High-Res Media Pack</div>
              <div className="text-xs text-slate-400">
                Includes clean HD product photos, transparent PNGs & vertical video clip.
              </div>
            </div>
            <a
              href={product.image || '#'}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition shadow"
            >
              <Download className="w-4 h-4" />
              <span>Download Media Assets</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
