import React, { useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  Truck,
  RotateCcw,
  Calendar,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  Download,
  Filter
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const AnalyticsReportsView: React.FC = () => {
  const { orders, products, returns } = useApp();
  const [timeRange, setTimeRange] = useState<'30' | '90' | '365'>('30');

  const delivered = orders.filter(o => o.status === 'DELIVERED');
  const totalSales = orders.reduce((sum, o) => sum + o.sellingPricePKR, 0);
  const totalProfit = orders.reduce((sum, o) => sum + o.resellerMarginPKR, 0);
  const totalReturns = returns.length;

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold mb-2">
            <BarChart3 className="w-3.5 h-3.5" /> Performance & Unit Economics
          </div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">Analytics & Financial Reporting</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Deep dive into gross merchandise volume (GMV), courier delivery success curves, and product velocity.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs font-bold">
            {['30', '90', '365'].map((r) => (
              <button
                key={r}
                onClick={() => setTimeRange(r as any)}
                className={`px-3 py-1.5 rounded-lg transition ${
                  timeRange === r ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                {r} Days
              </button>
            ))}
          </div>

          <button
            onClick={() => alert('Exporting full financial PDF/CSV report...')}
            className="bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 text-xs font-bold px-3.5 py-2.5 rounded-xl transition flex items-center gap-1.5"
          >
            <Download className="w-4 h-4 text-emerald-400" /> Export Statement
          </button>
        </div>
      </div>

      {/* Analytics KPI Matrix */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
          <span className="text-[11px] font-bold text-slate-400 uppercase">Gross Merchandise Volume</span>
          <p className="text-2xl font-black text-white mt-1">PKR {totalSales.toLocaleString()}</p>
          <p className="text-[10px] text-emerald-400 font-bold mt-1">+24.5% vs previous quarter</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
          <span className="text-[11px] font-bold text-slate-400 uppercase">Realized Reseller Margin</span>
          <p className="text-2xl font-black text-emerald-400 mt-1">PKR {totalProfit.toLocaleString()}</p>
          <p className="text-[10px] text-emerald-300 mt-1">32.8% average gross margin</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
          <span className="text-[11px] font-bold text-slate-400 uppercase">Delivery Completion Rate</span>
          <p className="text-2xl font-black text-sky-400 mt-1">94.2%</p>
          <p className="text-[10px] text-slate-400 mt-1">Via automated WhatsApp verify</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
          <span className="text-[11px] font-bold text-slate-400 uppercase">Return Rate (RMA)</span>
          <p className="text-2xl font-black text-amber-400 mt-1">4.8%</p>
          <p className="text-[10px] text-slate-400 mt-1">Safeguarded by wholesale reserve</p>
        </div>
      </div>

      {/* Visual Revenue & Margin Breakdown Chart Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
          <div>
            <h3 className="font-extrabold text-white text-base">Weekly Fulfillment Velocity</h3>
            <p className="text-xs text-slate-400">Order dispatch volumes vs delivery conversions</p>
          </div>
          <span className="text-xs font-bold text-emerald-400">Karachi & Lahore Express Routes</span>
        </div>

        {/* CSS Chart Simulation */}
        <div className="h-48 flex items-end justify-between gap-3 pt-4 px-2">
          {[
            { day: 'Mon', height: '65%', orders: 18, profit: 'PKR 14,400' },
            { day: 'Tue', height: '80%', orders: 24, profit: 'PKR 19,200' },
            { day: 'Wed', height: '95%', orders: 31, profit: 'PKR 24,800' },
            { day: 'Thu', height: '70%', orders: 21, profit: 'PKR 16,800' },
            { day: 'Fri', height: '85%', orders: 28, profit: 'PKR 22,400' },
            { day: 'Sat', height: '100%', orders: 36, profit: 'PKR 28,800' },
            { day: 'Sun', height: '60%', orders: 15, profit: 'PKR 12,000' }
          ].map((bar, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-2 group cursor-pointer">
              <div className="text-[10px] text-slate-400 opacity-0 group-hover:opacity-100 transition font-mono">
                {bar.orders} orders
              </div>
              <div className="w-full bg-slate-950 rounded-2xl h-36 flex items-end p-1 border border-slate-800 overflow-hidden">
                <div
                  className="w-full bg-gradient-to-t from-emerald-600 to-teal-400 rounded-xl transition-all duration-500 group-hover:from-emerald-500 group-hover:to-teal-300"
                  style={{ height: bar.height }}
                />
              </div>
              <span className="text-xs font-bold text-slate-400 group-hover:text-white">{bar.day}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
