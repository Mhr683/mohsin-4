import React, { useState } from 'react';
import {
  ShieldCheck,
  Search,
  Filter,
  Clock,
  UserCheck,
  AlertTriangle,
  ArrowRight,
  Database
} from 'lucide-react';
import { adminAuditService, AdminAuditActionType, ComprehensiveAuditLog } from '../services/adminAuditService';

export const AdminAuditLogView: React.FC = () => {
  const [filterAction, setFilterAction] = useState<AdminAuditActionType | 'ALL'>('ALL');
  const [search, setSearch] = useState('');

  const logs = adminAuditService.getLogs(filterAction === 'ALL' ? undefined : filterAction);

  const filtered = logs.filter(
    (l) =>
      l.targetDescription.toLowerCase().includes(search.toLowerCase()) ||
      l.adminEmail.toLowerCase().includes(search.toLowerCase()) ||
      l.targetId.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 text-slate-100 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-800 pb-5">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-400 flex items-center justify-center border border-rose-500/20">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-extrabold text-base text-white">Immutable Platform Audit Ledger</h3>
            <p className="text-xs text-slate-400">
              Records sensitive admin actions: payouts, wallet modifications, business rules, and user role overrides.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono bg-slate-800 px-3 py-1.5 rounded-xl text-slate-300">
            {logs.length} Total Audit Records
          </span>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search target, admin, or action description..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={filterAction}
            onChange={(e) => setFilterAction(e.target.value as any)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500"
          >
            <option value="ALL">All Event Types</option>
            <option value="PAYOUT_DECISION">Payout Decisions</option>
            <option value="WALLET_ADJUSTMENT">Wallet Adjustments</option>
            <option value="BUSINESS_RULE_CHANGE">Business Rules</option>
            <option value="PRODUCT_CHANGE">Product Changes</option>
            <option value="USER_CHANGE">User Account Changes</option>
            <option value="ORDER_CHANGE">Order Status Overrides</option>
          </select>
        </div>
      </div>

      {/* Logs Table */}
      <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950/50">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
            <tr>
              <th className="py-3 px-4">Timestamp</th>
              <th className="py-3 px-4">Action Type</th>
              <th className="py-3 px-4">Actor</th>
              <th className="py-3 px-4">Target Description</th>
              <th className="py-3 px-4 text-center">Value Shift</th>
              <th className="py-3 px-4 text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-sans">
            {filtered.map((log) => (
              <tr key={log.id} className="hover:bg-slate-900/60 transition">
                <td className="py-3 px-4 font-mono text-[11px] text-slate-400 whitespace-nowrap">
                  {new Date(log.timestamp).toLocaleString('en-PK', {
                    day: 'numeric',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </td>
                <td className="py-3 px-4">
                  <span className="font-mono text-[10px] bg-slate-800 text-slate-200 px-2 py-0.5 rounded font-bold">
                    {log.action}
                  </span>
                </td>
                <td className="py-3 px-4 text-white">
                  <p className="font-bold">{log.adminName}</p>
                  <p className="text-[10px] text-slate-500 font-mono">{log.adminEmail}</p>
                </td>
                <td className="py-3 px-4">
                  <p className="text-slate-200">{log.targetDescription}</p>
                  {log.notes && <p className="text-[10px] text-slate-400 mt-0.5">Note: {log.notes}</p>}
                </td>
                <td className="py-3 px-4 text-center">
                  {log.oldValue && log.newValue ? (
                    <div className="flex items-center justify-center gap-1.5 text-[11px] font-mono">
                      <span className="text-slate-500 line-through">{log.oldValue}</span>
                      <ArrowRight className="w-3 h-3 text-emerald-400" />
                      <span className="text-emerald-400 font-bold">{log.newValue}</span>
                    </div>
                  ) : (
                    <span className="text-slate-600">—</span>
                  )}
                </td>
                <td className="py-3 px-4 text-center">
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    {log.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
