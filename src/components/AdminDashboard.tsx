import React, { useState } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  TrendingUp,
  DollarSign,
  Users,
  Package,
  Sliders,
  AlertOctagon,
  CheckCircle,
  ArrowUpRight,
  Lock,
  Unlock,
  RefreshCw,
  Building2,
  CreditCard,
  Phone,
  User as UserIcon,
  FileText,
  Save,
  Check,
  Eye,
  AlertCircle,
  KeyRound,
  History,
  LogOut,
  AlertTriangle,
  Search,
  Filter,
  ArrowDownRight,
  Shield,
  Zap,
  Clock,
  CheckCircle2,
  UserCheck,
  UserX,
  PlusCircle,
  MinusCircle,
  Mail,
  Headphones,
  MessageSquare,
  ShoppingBag,
  Briefcase,
  Factory,
  ExternalLink,
  Copy,
  RotateCcw,
  Pencil,
  Trash2,
  Edit,
} from 'lucide-react';
import {
  ProfitGuardConfig,
  Order,
  Product,
  User,
  WalletTransaction,
  BankTransferDetails,
  PlatformHelplinesConfig,
  AdminSecurityConfig,
  AdminAuditLog,
} from '../types';
import { AdminProductsManager } from './AdminProductsManager';
import { AdminOrdersManager } from './AdminOrdersManager';
import { AdminEditOrderModal } from './AdminEditOrderModal';
import { AdminEditUserModal } from './AdminEditUserModal';
import { AdminBusinessSettingsView } from './AdminBusinessSettingsView';
import { AdminAuditLogView } from './AdminAuditLogView';

interface AdminDashboardProps {
  profitGuardConfig: ProfitGuardConfig;
  onUpdateConfig: (newConfig: ProfitGuardConfig) => void;
  orders: Order[];
  onUpdateOrder?: (updatedOrder: Order) => void;
  products: Product[];
  onUpdateProduct?: (updatedProduct: Product) => void;
  onAddProduct?: (newProduct: Omit<Product, 'id'>) => void;
  onDeleteProduct?: (productId: string) => void;
  users: User[];
  onUpdateUser?: (updatedUser: User) => void;
  transactions: WalletTransaction[];
  onOpenProfitGuardModal: () => void;
  bankTransferDetails: BankTransferDetails;
  onUpdateBankDetails: (details: BankTransferDetails) => void;
  helplinesConfig: PlatformHelplinesConfig;
  onUpdateHelplinesConfig: (config: PlatformHelplinesConfig) => void;
  securityConfig: AdminSecurityConfig;
  onUpdateSecurityConfig: (newSec: AdminSecurityConfig) => void;
  auditLogs: AdminAuditLog[];
  onLogAudit: (action: string, details: string, status: 'SUCCESS' | 'WARNING' | 'FAILED') => void;
  onLockAdmin: () => void;
  onAdjustUserBalance: (userId: string, amountChange: number, reason: string) => void;
}

const PRESET_BANKS = [
  'EasyPaisa',
  'JazzCash',
  'Meezan Bank',
  'HBL',
  'Bank Alfalah',
  'SadaPay',
  'NayaPay',
  'Faysal Bank',
  'MCB',
  'UBL',
];

type AdminSubTab =
  | 'overview'
  | 'products'
  | 'orders'
  | 'users'
  | 'bank-settings'
  | 'helplines'
  | 'security'
  | 'audit-logs'
  | 'business-rules'
  | 'audit-ledger';

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  profitGuardConfig,
  onUpdateConfig,
  orders,
  onUpdateOrder,
  products,
  onUpdateProduct,
  onAddProduct,
  onDeleteProduct,
  users,
  onUpdateUser,
  transactions,
  onOpenProfitGuardModal,
  bankTransferDetails,
  onUpdateBankDetails,
  helplinesConfig,
  onUpdateHelplinesConfig,
  securityConfig,
  onUpdateSecurityConfig,
  auditLogs,
  onLogAudit,
  onLockAdmin,
  onAdjustUserBalance,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<AdminSubTab>('overview');

  // Modal Editing States
  const [selectedOrderForEdit, setSelectedOrderForEdit] = useState<Order | null>(null);
  const [selectedUserForEdit, setSelectedUserForEdit] = useState<User | null>(null);

  // Profit Guard Form State
  const [configForm, setConfigForm] = useState<ProfitGuardConfig>({ ...profitGuardConfig });
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Bank Form State
  const [bankForm, setBankForm] = useState<BankTransferDetails>({ ...bankTransferDetails });
  const [bankSaveSuccess, setBankSaveSuccess] = useState(false);

  // Helplines Form State
  const [helplineForm, setHelplineForm] = useState<PlatformHelplinesConfig>({ ...helplinesConfig });
  const [helplineSaveSuccess, setHelplineSaveSuccess] = useState(false);
  const [helplineActiveCategory, setHelplineActiveCategory] = useState<'all' | 'buyers' | 'resellers' | 'manufacturers'>('all');
  const [copiedHelplineKey, setCopiedHelplineKey] = useState<string | null>(null);

  // Security Credentials Form State
  const [secForm, setSecForm] = useState<AdminSecurityConfig>({ ...securityConfig });
  const [secSaveSuccess, setSecSaveSuccess] = useState(false);
  const [newKey, setNewKey] = useState(securityConfig.adminKey);
  const [newPin, setNewPin] = useState(securityConfig.pin);

  // User Management Filters & Balance Adjustment Modal
  const [userSearch, setUserSearch] = useState('');
  const [selectedUserForBalance, setSelectedUserForBalance] = useState<User | null>(null);
  const [adjAmount, setAdjAmount] = useState<number>(1000);
  const [adjType, setAdjType] = useState<'CREDIT' | 'DEBIT'>('CREDIT');
  const [adjReason, setAdjReason] = useState('Manual Administrative Balance Adjustment');
  const [adjSuccess, setAdjSuccess] = useState(false);

  // Financial statistics
  const totalGMV = orders.reduce((sum, o) => sum + o.sellingPricePKR, 0);
  const totalPlatformFees = orders.reduce(
    (sum, o) => sum + (o.platformFeePKR > 0 ? o.platformFeePKR : 0),
    0
  );
  const totalSupplierEscrow = orders
    .filter((o) => o.status !== 'CANCELLED' && o.status !== 'RETURNED')
    .reduce((sum, o) => sum + o.supplierCostPKR, 0);
  const totalResellerCommissions = orders
    .filter((o) => o.status !== 'CANCELLED' && o.status !== 'RETURNED')
    .reduce((sum, o) => sum + o.resellerCommissionPKR, 0);

  const blockedOrders = orders.filter((o) => !o.profitGuardApproved);
  const approvedOrders = orders.filter((o) => o.profitGuardApproved);

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateConfig(configForm);
    setSaveSuccess(true);
    onLogAudit(
      'CONFIG_UPDATED',
      `Profit Guard parameters updated: Fee ${configForm.processingFeePKR} Rs, Commission ${configForm.platformFeePct}%`,
      'SUCCESS'
    );
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleSaveBankDetails = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateBankDetails(bankForm);
    setBankSaveSuccess(true);
    onLogAudit(
      'BANK_DETAILS_UPDATED',
      `Updated manual bank gateway to ${bankForm.bankName} (${bankForm.accountNumber})`,
      'SUCCESS'
    );
    setTimeout(() => setBankSaveSuccess(false), 3000);
  };

  const handleSaveSecurityConfig = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedSec: AdminSecurityConfig = {
      ...secForm,
      adminKey: newKey,
      pin: newPin,
    };
    onUpdateSecurityConfig(updatedSec);
    setSecSaveSuccess(true);
    onLogAudit(
      'SECURITY_CREDENTIALS_CHANGED',
      'Master Admin Key / Security PIN successfully modified',
      'SUCCESS'
    );
    setTimeout(() => setSecSaveSuccess(false), 3000);
  };

  const handleSaveHelplines = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateHelplinesConfig(helplineForm);
    setHelplineSaveSuccess(true);
    onLogAudit(
      'HELPLINES_CONFIG_UPDATED',
      `Helpline numbers and emails updated: Buyers (${helplineForm.buyersHelpline.phone} / ${helplineForm.buyersHelpline.email}), Resellers (${helplineForm.resellersHelpline.phone} / ${helplineForm.resellersHelpline.email}), Manufacturers (${helplineForm.manufacturersHelpline.phone} / ${helplineForm.manufacturersHelpline.email})`,
      'SUCCESS'
    );
    setTimeout(() => setHelplineSaveSuccess(false), 3500);
  };

  const handleResetHelplinesDefault = () => {
    const defaultHelplines: PlatformHelplinesConfig = {
      buyersHelpline: {
        phone: '+92-300-1122334',
        whatsapp: '+92-300-1122334',
        email: 'buyers@yourmart.pk',
        timings: '9:00 AM - 10:00 PM (Mon - Sun)',
        description: 'Assistance for retail customer orders, COD delivery verification, tracking & parcel exchange support.',
      },
      resellersHelpline: {
        phone: '+92-321-4455667',
        whatsapp: '+92-321-4455667',
        email: 'resellers@yourmart.pk',
        timings: '24/7 Priority Reseller Desk',
        description: 'Dedicated support for profit margins, Profit Guard clearance, instant wallet payouts & Daraz multi-store sync.',
      },
      manufacturersHelpline: {
        phone: '+92-345-7788990',
        whatsapp: '+92-345-7788990',
        email: 'suppliers@yourmart.pk',
        timings: '9:00 AM - 7:00 PM (Mon - Sat)',
        description: 'Factory supplier onboarding, bulk stock listings, wholesale catalog approval & warehouse escrow releases.',
      },
    };
    setHelplineForm(defaultHelplines);
  };

  const handleApplyBalanceAdjustment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserForBalance) return;
    const finalAmount = adjType === 'CREDIT' ? Math.abs(adjAmount) : -Math.abs(adjAmount);
    onAdjustUserBalance(selectedUserForBalance.id, finalAmount, adjReason);
    setAdjSuccess(true);
    onLogAudit(
      'WALLET_ADJUSTED',
      `${adjType} of PKR ${Math.abs(adjAmount)} to ${selectedUserForBalance.name} (${adjReason})`,
      'SUCCESS'
    );
    setTimeout(() => {
      setAdjSuccess(false);
      setSelectedUserForBalance(null);
    }, 1500);
  };

  const filteredUsers = (users || []).filter(
    (u) =>
      u &&
      ((u.name || '').toLowerCase().includes(userSearch.toLowerCase()) ||
        (u.email || '').toLowerCase().includes(userSearch.toLowerCase()) ||
        (u.companyName || '').toLowerCase().includes(userSearch.toLowerCase()) ||
        (u.role || '').toLowerCase().includes(userSearch.toLowerCase()))
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* =========================================================================
          HIGH SECURITY TOP SESSION RIBBON
      ========================================================================= */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-2xl border border-purple-500/50 bg-gradient-to-r from-purple-950/80 via-slate-900 to-indigo-950/80 p-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30 shadow-inner">
            <Shield className="h-6 w-6 stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded bg-purple-500/20 px-2 py-0.5 text-[10px] font-mono font-bold text-purple-300 border border-purple-500/40">
                MASTER ADMIN CLEARANCE: LEVEL 4
              </span>
              <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                Live Session Active
              </span>
            </div>
            <h1 className="text-lg font-bold text-white tracking-tight mt-0.5">
              YourMart Central Administration Console
            </h1>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Emergency Freeze Status Toggle */}
          <button
            onClick={() => {
              const toggled = !secForm.emergencyFreezeMode;
              setSecForm({ ...secForm, emergencyFreezeMode: toggled });
              onUpdateSecurityConfig({ ...secForm, emergencyFreezeMode: toggled });
              onLogAudit(
                'EMERGENCY_FREEZE_TOGGLE',
                `Emergency platform freeze state changed to: ${toggled ? 'FROZEN' : 'NORMAL'}`,
                toggled ? 'WARNING' : 'SUCCESS'
              );
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition border ${
              secForm.emergencyFreezeMode
                ? 'bg-rose-950 text-rose-300 border-rose-700 animate-pulse'
                : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300 border-slate-700'
            }`}
          >
            <AlertTriangle className={`h-3.5 w-3.5 ${secForm.emergencyFreezeMode ? 'text-rose-400' : 'text-amber-400'}`} />
            <span>{secForm.emergencyFreezeMode ? 'EMERGENCY FREEZE ACTIVE' : 'Normal Operations'}</span>
          </button>

          {/* Profit Guard Simulator Button */}
          <button
            onClick={onOpenProfitGuardModal}
            className="flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs px-3 py-1.5 transition shadow"
          >
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Margin Simulator</span>
          </button>

          {/* Lock & Exit Button */}
          <button
            onClick={onLockAdmin}
            className="flex items-center gap-1.5 rounded-xl bg-rose-600/90 hover:bg-rose-500 text-white font-bold text-xs px-3.5 py-1.5 transition shadow"
            title="Immediately lock the admin console and revoke session"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Lock Admin Console</span>
          </button>
        </div>
      </div>

      {/* =========================================================================
          ADMIN SUB-NAVIGATION TABS
      ========================================================================= */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveSubTab('overview')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            activeSubTab === 'overview'
              ? 'bg-purple-600 text-white shadow-lg'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Sliders className="h-4 w-4" />
          <span>Financial HQ & Profit Guard</span>
        </button>

        <button
          onClick={() => setActiveSubTab('products')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            activeSubTab === 'products'
              ? 'bg-purple-600 text-white shadow-lg'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Package className="h-4 w-4" />
          <span>Products & Catalog ({products.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('orders')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            activeSubTab === 'orders'
              ? 'bg-blue-600 text-white shadow-lg'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <ShoppingBag className="h-4 w-4" />
          <span>Orders & Dispatch ({orders.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('users')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            activeSubTab === 'users'
              ? 'bg-blue-600 text-white shadow-lg'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Users className="h-4 w-4" />
          <span>User & Reseller Accounts ({users.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('bank-settings')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            activeSubTab === 'bank-settings'
              ? 'bg-amber-600 text-white shadow-lg'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Building2 className="h-4 w-4" />
          <span>Manual Bank & Advance Gateway</span>
        </button>

        <button
          onClick={() => setActiveSubTab('helplines')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            activeSubTab === 'helplines'
              ? 'bg-emerald-600 text-white shadow-lg'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Headphones className="h-4 w-4" />
          <span>Helplines & Contact Desk (3)</span>
        </button>

        <button
          onClick={() => setActiveSubTab('security')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            activeSubTab === 'security'
              ? 'bg-indigo-600 text-white shadow-lg'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <KeyRound className="h-4 w-4" />
          <span>Security & Master Keys</span>
        </button>

        <button
          onClick={() => setActiveSubTab('audit-logs')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            activeSubTab === 'audit-logs'
              ? 'bg-slate-700 text-white shadow-lg'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <History className="h-4 w-4" />
          <span>Audit Trails ({auditLogs.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('business-rules')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            activeSubTab === 'business-rules'
              ? 'bg-emerald-600 text-white shadow-lg'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Sliders className="h-4 w-4" />
          <span>Platform Business Rules</span>
        </button>

        <button
          onClick={() => setActiveSubTab('audit-ledger')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            activeSubTab === 'audit-ledger'
              ? 'bg-rose-600 text-white shadow-lg'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Shield className="h-4 w-4" />
          <span>System Audit Ledger</span>
        </button>
      </div>

      {/* =========================================================================
          TAB 1: OVERVIEW & PROFIT GUARD LOSS CONTROL
      ========================================================================= */}
      {activeSubTab === 'overview' && (
        <div className="space-y-6">
          {/* Metric Cards Grid */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* Total GMV */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-400">Total Wholesale GMV</span>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400">
                  <DollarSign className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-3 text-2xl font-bold font-mono text-white">
                PKR {totalGMV.toLocaleString()}
              </div>
              <div className="mt-1 flex items-center gap-1 text-xs text-emerald-400">
                <TrendingUp className="h-3.5 w-3.5" />
                <span>{orders.length} Wholesale Orders Recorded</span>
              </div>
            </div>

            {/* Platform Net Clearance */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-400">Platform Revenue (2% Take-Rate)</span>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/10 text-purple-400">
                  <TrendingUp className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-3 text-2xl font-bold font-mono text-purple-300">
                PKR {totalPlatformFees.toLocaleString()}
              </div>
              <div className="mt-1 text-xs text-slate-400">
                Automated liquidation & escrow clearance
              </div>
            </div>

            {/* Supplier Escrow & Sourcing */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-400">Supplier Escrow Guaranteed</span>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400">
                  <Package className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-3 text-2xl font-bold font-mono text-amber-300">
                PKR {totalSupplierEscrow.toLocaleString()}
              </div>
              <div className="mt-1 text-xs text-slate-400">Protected against dropship losses</div>
            </div>

            {/* Profit Guard Protection Status */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-400">Profit Guard Guardrails</span>
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                    blockedOrders.length > 0
                      ? 'bg-rose-500/10 text-rose-400'
                      : 'bg-emerald-500/10 text-emerald-400'
                  }`}
                >
                  <ShieldAlert className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-2xl font-bold font-mono text-white">
                  {approvedOrders.length}/{orders.length}
                </span>
                <span className="text-xs text-emerald-400 font-semibold">Solvent Orders</span>
              </div>
              <div className="mt-1 text-xs text-rose-400">
                {blockedOrders.length} negative margin order(s) blocked
              </div>
            </div>
          </div>

          {/* Main Form & Interventions */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Left 2 Cols: Profit Guard Parameters */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 lg:col-span-2 shadow-lg">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400">
                    <Sliders className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-white">Profit Guard Engine Parameters</h2>
                    <p className="text-xs text-slate-400">
                      Automated loss prevention rules to protect suppliers and resellers from zero-margin orders.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold border ${
                      configForm.enforceLock
                        ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                        : 'bg-amber-950 text-amber-300 border-amber-800'
                    }`}
                  >
                    {configForm.enforceLock ? <Lock className="h-3 w-3" /> : <Unlock className="h-3 w-3" />}
                    {configForm.enforceLock ? 'Strict Auto-Lock' : 'Warning Only'}
                  </span>
                </div>
              </div>

              <form onSubmit={handleSaveConfig} className="mt-6 space-y-5">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {/* Flat Processing Fee (PKR) */}
                  <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
                    <label className="text-xs font-semibold text-slate-300">
                      Flat Order Processing Fee (PKR)
                    </label>
                    <p className="mt-0.5 text-[11px] text-slate-500">
                      Deducted per order across Pakistan warehouse network (Default: Rs. 30).
                    </p>
                    <div className="mt-3 flex items-center gap-3">
                      <span className="text-sm font-bold text-slate-400 font-mono">PKR</span>
                      <input
                        type="number"
                        min="0"
                        max="500"
                        step="5"
                        value={configForm.processingFeePKR ?? 30}
                        onChange={(e) =>
                          setConfigForm({
                            ...configForm,
                            processingFeePKR: Number(e.target.value),
                          })
                        }
                        className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm font-bold font-mono text-amber-400 focus:border-amber-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Platform Percentage Fee (%) */}
                  <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
                    <label className="text-xs font-semibold text-slate-300">
                      Platform Take-Rate Fee (%)
                    </label>
                    <p className="mt-0.5 text-[11px] text-slate-500">
                      System take-rate percentage from customer selling price (Default: 2%).
                    </p>
                    <div className="mt-3 flex items-center gap-3">
                      <input
                        type="range"
                        min="0"
                        max="10"
                        step="0.5"
                        value={configForm.platformFeePct ?? 2.0}
                        onChange={(e) =>
                          setConfigForm({
                            ...configForm,
                            platformFeePct: Number(e.target.value),
                          })
                        }
                        className="w-full accent-purple-500"
                      />
                      <span className="w-16 rounded-lg border border-slate-700 bg-slate-900 px-2 py-1.5 text-center text-sm font-bold font-mono text-purple-300">
                        {configForm.platformFeePct ?? 2.0}%
                      </span>
                    </div>
                  </div>

                  {/* Min Profit Amount (PKR) */}
                  <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
                    <label className="text-xs font-semibold text-slate-300">
                      Minimum Safe Profit Per Order (PKR)
                    </label>
                    <p className="mt-0.5 text-[11px] text-slate-500">
                      Orders yielding net reseller profit below this number trigger an instant auto-lock.
                    </p>
                    <div className="mt-3 flex items-center gap-3">
                      <span className="text-sm font-bold text-slate-400 font-mono">PKR</span>
                      <input
                        type="number"
                        min="50"
                        max="5000"
                        step="50"
                        value={configForm.minProfitAmountPKR}
                        onChange={(e) =>
                          setConfigForm({
                            ...configForm,
                            minProfitAmountPKR: Number(e.target.value),
                          })
                        }
                        className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm font-bold font-mono text-emerald-400 focus:border-emerald-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Default Courier Shipping Cost */}
                  <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
                    <label className="text-xs font-semibold text-slate-300">
                      Standard Domestic Courier Fee (PKR)
                    </label>
                    <p className="mt-0.5 text-[11px] text-slate-500">
                      Standard nationwide courier rate (TCS / Leopards / Trax / Call Courier).
                    </p>
                    <div className="mt-3 flex items-center gap-3">
                      <span className="text-sm font-bold text-slate-400 font-mono">PKR</span>
                      <input
                        type="number"
                        min="100"
                        max="1000"
                        step="10"
                        value={configForm.defaultShippingCostPKR}
                        onChange={(e) =>
                          setConfigForm({
                            ...configForm,
                            defaultShippingCostPKR: Number(e.target.value),
                          })
                        }
                        className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm font-bold font-mono text-slate-200 focus:border-emerald-500 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Enforce Lock Toggle */}
                <div className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950/40 p-4">
                  <div>
                    <div className="text-xs font-semibold text-white">Strict Auto-Lock on Unsafe Margin</div>
                    <div className="text-[11px] text-slate-400">
                      When enabled, zero-profit orders are strictly blocked from warehouse dispatch until revised.
                    </div>
                  </div>
                  <label className="relative inline-flex cursor-pointer items-center">
                    <input
                      type="checkbox"
                      checked={configForm.enforceLock}
                      onChange={(e) =>
                        setConfigForm({ ...configForm, enforceLock: e.target.checked })
                      }
                      className="peer sr-only"
                    />
                    <div className="peer h-6 w-11 rounded-full bg-slate-700 after:absolute after:top-[2px] after:left-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-slate-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-emerald-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-2">
                    {saveSuccess && (
                      <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400">
                        <CheckCircle className="h-4 w-4" /> Parameters Updated & Enforced!
                      </span>
                    )}
                  </div>
                  <button
                    type="submit"
                    className="rounded-xl bg-purple-600 hover:bg-purple-500 px-5 py-2.5 text-xs font-bold text-white shadow-lg transition"
                  >
                    Save & Enforce Parameters
                  </button>
                </div>
              </form>
            </div>

            {/* Right 1 Col: Interventions & Blocked Orders */}
            <div className="space-y-4">
              <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow">
                <h3 className="flex items-center gap-2 text-sm font-bold text-white">
                  <AlertOctagon className="h-4 w-4 text-rose-400" />
                  <span>Active Profit Guard Interventions</span>
                </h3>
                <p className="mt-0.5 text-xs text-slate-400">
                  Transactions arrested due to deficit calculation.
                </p>

                <div className="mt-4 space-y-3">
                  {blockedOrders.length === 0 ? (
                    <div className="rounded-xl border border-emerald-900/50 bg-emerald-950/20 p-4 text-center">
                      <CheckCircle className="mx-auto h-6 w-6 text-emerald-400" />
                      <div className="mt-1 text-xs font-semibold text-emerald-300">All Orders Solvent</div>
                      <p className="text-[11px] text-emerald-500/80">No negative margin transactions detected.</p>
                    </div>
                  ) : (
                    blockedOrders.map((ord) => (
                      <div
                        key={ord.id}
                        className="rounded-xl border border-rose-900/50 bg-rose-950/20 p-3.5 text-xs"
                      >
                        <div className="flex items-center justify-between font-mono">
                          <span className="font-bold text-rose-300">{ord.orderNumber}</span>
                          <span className="rounded bg-rose-950 px-1.5 py-0.2 text-[10px] font-bold text-rose-400 border border-rose-800">
                            BLOCKED
                          </span>
                        </div>
                        <div className="mt-1.5 text-slate-300 font-medium">
                          {ord.customerName} ({ord.customerCity})
                        </div>
                        <div className="mt-1 text-[11px] text-rose-400/90 bg-rose-950/40 p-2 rounded border border-rose-900/30">
                          {ord.profitGuardReason}
                        </div>
                        <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400 border-t border-rose-900/40 pt-1.5 font-mono">
                          <span>Retail: PKR {ord.sellingPricePKR}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-rose-300 font-bold">
                              Net Profit: PKR {ord.netProfitPKR}
                            </span>
                            <button
                              type="button"
                              onClick={() => setSelectedOrderForEdit(ord)}
                              className="rounded bg-rose-600/30 hover:bg-rose-600 text-white px-2 py-0.5 text-[10px] font-bold transition flex items-center gap-1"
                            >
                              <Pencil className="h-2.5 w-2.5" />
                              <span>Edit Order</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB: PRODUCTS & CATALOG MANAGEMENT (EDIT / ADD / DELETE)
      ========================================================================= */}
      {activeSubTab === 'products' && (
        <div className="rounded-2xl border border-purple-500/30 bg-slate-900/90 p-6 shadow-xl">
          <AdminProductsManager
            products={products}
            onUpdateProduct={(prod) => {
              if (onUpdateProduct) onUpdateProduct(prod);
              onLogAudit(
                'PRODUCT_UPDATED',
                `Product modified: ${prod.name} (SKU: ${prod.sku}) - Cost PKR ${prod.supplierCostPKR}, Price PKR ${prod.recSellingPricePKR}, Stock ${prod.stock}`,
                'SUCCESS'
              );
            }}
            onAddProduct={(newProd) => {
              if (onAddProduct) onAddProduct(newProd);
              onLogAudit(
                'PRODUCT_CREATED',
                `New product onboarded to catalog: ${newProd.name} (SKU: ${newProd.sku}) - Cost PKR ${newProd.supplierCostPKR}`,
                'SUCCESS'
              );
            }}
            onDeleteProduct={(prodId) => {
              if (onDeleteProduct) onDeleteProduct(prodId);
              onLogAudit('PRODUCT_DELETED', `Product ID ${prodId} removed from catalog`, 'WARNING');
            }}
            profitGuardConfig={profitGuardConfig}
          />
        </div>
      )}

      {/* =========================================================================
          TAB: ORDERS & DISPATCH DESK (LIVE EDIT & SETTLEMENT)
      ========================================================================= */}
      {activeSubTab === 'orders' && (
        <div className="rounded-2xl border border-blue-500/30 bg-slate-900/90 p-6 shadow-xl">
          <AdminOrdersManager
            orders={orders}
            onUpdateOrder={(ord) => {
              if (onUpdateOrder) onUpdateOrder(ord);
              onLogAudit(
                'ORDER_MODIFIED',
                `Order ${ord.orderNumber} updated: Status [${ord.status}], Selling Price [PKR ${ord.sellingPricePKR}], Courier [${ord.courierName || 'N/A'}]`,
                'SUCCESS'
              );
            }}
            profitGuardConfig={profitGuardConfig}
          />
        </div>
      )}

      {/* =========================================================================
          TAB 2: BANK TRANSFER DETAILS & MANUAL GATEWAY CONFIG
      ========================================================================= */}
      {activeSubTab === 'bank-settings' && (
        <div className="rounded-2xl border border-amber-500/30 bg-slate-900 p-6 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shadow-inner">
                <Building2 className="h-5 w-5 stroke-[2.2]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="rounded bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold text-amber-300 border border-amber-500/30">
                    MANUAL PAYOUT GATEWAY
                  </span>
                  <span className="text-xs text-slate-400">Real-Time Buy Now & Advance Checkout</span>
                </div>
                <h2 className="text-lg font-bold text-white tracking-tight mt-0.5">
                  Bank Transfer Details (EasyPaisa / JazzCash / Bank Accounts)
                </h2>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {bankSaveSuccess && (
                <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400 bg-emerald-950/40 px-3 py-1.5 rounded-lg border border-emerald-800">
                  <Check className="h-4 w-4" /> Bank Details Synchronized in Real Time!
                </span>
              )}
            </div>
          </div>

          <form onSubmit={handleSaveBankDetails} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Form (7 Cols) */}
            <div className="lg:col-span-7 space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  Quick Select Bank / Mobile Wallet:
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {PRESET_BANKS.map((b) => (
                    <button
                      key={b}
                      type="button"
                      onClick={() => setBankForm({ ...bankForm, bankName: b })}
                      className={`text-xs px-2.5 py-1 rounded-lg border transition ${
                        bankForm.bankName.toLowerCase() === b.toLowerCase()
                          ? 'bg-amber-500 text-slate-950 font-bold border-amber-400 shadow-sm'
                          : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-800 hover:text-white'
                      }`}
                    >
                      {b}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                    <CreditCard className="h-3.5 w-3.5 text-amber-400" />
                    <span>Bank / Provider Name</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. EasyPaisa, JazzCash, Meezan Bank"
                    value={bankForm.bankName}
                    onChange={(e) => setBankForm({ ...bankForm, bankName: e.target.value })}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950/70 px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 transition"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                    <UserIcon className="h-3.5 w-3.5 text-emerald-400" />
                    <span>Account Title / Name</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sufyan ahmed"
                    value={bankForm.accountTitle}
                    onChange={(e) => setBankForm({ ...bankForm, accountTitle: e.target.value })}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950/70 px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                    <Phone className="h-3.5 w-3.5 text-blue-400" />
                    <span>Account Number / Mobile Number</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. +92-3422245222"
                    value={bankForm.accountNumber}
                    onChange={(e) => setBankForm({ ...bankForm, accountNumber: e.target.value })}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950/70 px-3.5 py-2.5 text-xs text-white font-mono placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                    <FileText className="h-3.5 w-3.5 text-purple-400" />
                    <span>IBAN / Branch Code (Optional)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. PK64MEZN0001234567890123"
                    value={bankForm.iban || ''}
                    onChange={(e) => setBankForm({ ...bankForm, iban: e.target.value })}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950/70 px-3.5 py-2.5 text-xs text-white font-mono placeholder-slate-500 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 transition"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <AlertCircle className="h-3.5 w-3.5 text-amber-400" />
                  <span>Security Notice / Reseller Instruction Text</span>
                </label>
                <textarea
                  rows={2}
                  value={bankForm.instructions}
                  onChange={(e) => setBankForm({ ...bankForm, instructions: e.target.value })}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950/70 px-3.5 py-2 text-xs text-slate-200 placeholder-slate-500 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 transition resize-none"
                />
              </div>

              <div className="pt-2 flex items-center gap-3">
                <button
                  type="submit"
                  className="flex items-center gap-2 rounded-xl bg-amber-500 hover:bg-amber-400 active:scale-[0.99] text-slate-950 font-bold px-5 py-2.5 text-xs shadow-lg transition cursor-pointer"
                >
                  <Save className="h-4 w-4" />
                  <span>Save & Update Bank Details</span>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setBankForm({
                      bankName: 'EasyPaisa',
                      accountTitle: 'Sufyan ahmed',
                      accountNumber: '+92-3422245222',
                      iban: '',
                      instructions:
                        'Important: Please ensure all payments are genuine and transferred to our account. Attempting fake payments may result in restrictions or a negative impact on your account.',
                      isActive: true,
                    })
                  }
                  className="text-xs text-slate-400 hover:text-slate-200 underline transition"
                >
                  Reset to Default
                </button>
              </div>
            </div>

            {/* Right Column: Live Checkout Preview (5 Cols) */}
            <div className="lg:col-span-5 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
                <Eye className="h-4 w-4 text-emerald-400" />
                <span>Live Reseller Checkout Preview:</span>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-md space-y-3 text-left text-slate-900">
                <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-3 text-[11px] text-amber-900 flex items-start gap-2">
                  <AlertCircle className="h-3.5 w-3.5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div className="leading-snug">
                    <span className="font-bold">Important: </span>
                    {bankForm.instructions ||
                      'Please ensure all payments are genuine and transferred to our account.'}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <h4 className="text-xs font-bold text-slate-800">Bank Transfer Details</h4>
                  <div className="rounded-xl border border-slate-200 bg-white p-3.5 text-xs space-y-2.5 shadow-sm">
                    <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                      <span className="text-slate-400 font-medium">Bank:</span>
                      <span className="font-bold text-slate-800">{bankForm.bankName || 'EasyPaisa'}</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                      <span className="text-slate-400 font-medium">Account:</span>
                      <span className="font-bold text-slate-800">
                        {bankForm.accountTitle || 'Sufyan ahmed'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400 font-medium">Number:</span>
                      <span className="font-mono font-bold text-slate-900 bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded border border-emerald-200">
                        {bankForm.accountNumber || '+92-3422245222'}
                      </span>
                    </div>
                    {bankForm.iban && (
                      <div className="flex justify-between items-center border-t border-slate-100 pt-2 text-[11px]">
                        <span className="text-slate-400 font-medium">IBAN:</span>
                        <span className="font-mono text-slate-700">{bankForm.iban}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* =========================================================================
          TAB: HELPLINES & DEDICATED SUPPORT GATEWAYS
      ========================================================================= */}
      {activeSubTab === 'helplines' && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl space-y-6">
          {/* Header Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  <Headphones className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                    <span>Central Helplines & Contact Desk</span>
                    <span className="rounded bg-emerald-500/20 px-2 py-0.5 text-[10px] font-mono font-bold text-emerald-300 border border-emerald-500/40">
                      Live Administered
                    </span>
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Update real-time Phone numbers, WhatsApp lines, and Support Emails for Buyers, Resellers, and Manufacturers.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleResetHelplinesDefault}
                className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800/80 hover:bg-slate-700 px-3 py-1.5 text-xs text-slate-300 transition"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Reset Defaults</span>
              </button>
            </div>
          </div>

          {/* Save Success Alert */}
          {helplineSaveSuccess && (
            <div className="flex items-center gap-3 rounded-xl border border-emerald-500/40 bg-emerald-950/40 p-3.5 text-xs text-emerald-300 shadow-md animate-in fade-in">
              <CheckCircle2 className="h-5 w-5 text-emerald-400 flex-shrink-0" />
              <div>
                <span className="font-bold">Helpline Update Successful: </span>
                All 3 support helplines (Buyers, Resellers, Manufacturers) updated and immediately live across the entire platform.
              </div>
            </div>
          )}

          {/* Helpline Category Filter */}
          <div className="flex items-center gap-2 border-b border-slate-800/80 pb-2 overflow-x-auto scrollbar-none">
            <button
              type="button"
              onClick={() => setHelplineActiveCategory('all')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                helplineActiveCategory === 'all'
                  ? 'bg-slate-800 text-white border border-slate-700'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>All 3 Channels</span>
            </button>
            <button
              type="button"
              onClick={() => setHelplineActiveCategory('buyers')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                helplineActiveCategory === 'buyers'
                  ? 'bg-blue-600/30 text-blue-300 border border-blue-500/50'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <ShoppingBag className="h-3.5 w-3.5 text-blue-400" />
              <span>1. Buyers Helpline</span>
            </button>
            <button
              type="button"
              onClick={() => setHelplineActiveCategory('resellers')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                helplineActiveCategory === 'resellers'
                  ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/50'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Briefcase className="h-3.5 w-3.5 text-emerald-400" />
              <span>2. Resellers Helpline</span>
            </button>
            <button
              type="button"
              onClick={() => setHelplineActiveCategory('manufacturers')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                helplineActiveCategory === 'manufacturers'
                  ? 'bg-amber-600/30 text-amber-300 border border-amber-500/50'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Factory className="h-3.5 w-3.5 text-amber-400" />
              <span>3. Manufacturers Helpline</span>
            </button>
          </div>

          <form onSubmit={handleSaveHelplines} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Side: Forms (7 cols) */}
              <div className="lg:col-span-7 space-y-6">
                {/* 1. BUYERS HELPLINE SECTION */}
                {(helplineActiveCategory === 'all' || helplineActiveCategory === 'buyers') && (
                  <div className="rounded-xl border border-blue-500/30 bg-gradient-to-b from-blue-950/20 to-slate-950/60 p-5 space-y-4 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/20 text-blue-400 border border-blue-500/30">
                          <ShoppingBag className="h-4 w-4" />
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-white flex items-center gap-2">
                            <span>Buyers & Retail Customers Helpline</span>
                            <span className="text-[10px] bg-blue-500/20 text-blue-300 px-1.5 py-0.2 rounded border border-blue-500/30">
                              B2C Storefront
                            </span>
                          </h3>
                          <p className="text-[11px] text-slate-400">
                            Visible to end buyers on Storefront checkout, order confirmation, & COD verification.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      {/* Phone Number */}
                      <div>
                        <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                          Helpline Phone Number
                        </label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                          <input
                            type="text"
                            value={helplineForm.buyersHelpline.phone}
                            onChange={(e) =>
                              setHelplineForm({
                                ...helplineForm,
                                buyersHelpline: {
                                  ...helplineForm.buyersHelpline,
                                  phone: e.target.value,
                                },
                              })
                            }
                            placeholder="+92-300-1122334"
                            className="w-full rounded-lg border border-slate-700 bg-slate-900/90 pl-9 pr-3 py-2 text-xs font-mono font-bold text-white focus:border-blue-500 focus:outline-none"
                            required
                          />
                        </div>
                      </div>

                      {/* WhatsApp Number */}
                      <div>
                        <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                          WhatsApp Support Line
                        </label>
                        <div className="relative">
                          <MessageSquare className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-emerald-400" />
                          <input
                            type="text"
                            value={helplineForm.buyersHelpline.whatsapp || ''}
                            onChange={(e) =>
                              setHelplineForm({
                                ...helplineForm,
                                buyersHelpline: {
                                  ...helplineForm.buyersHelpline,
                                  whatsapp: e.target.value,
                                },
                              })
                            }
                            placeholder="+92-300-1122334"
                            className="w-full rounded-lg border border-slate-700 bg-slate-900/90 pl-9 pr-3 py-2 text-xs font-mono text-emerald-300 focus:border-emerald-500 focus:outline-none"
                          />
                        </div>
                      </div>

                      {/* Email Address */}
                      <div>
                        <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                          Support Email Address
                        </label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-cyan-400" />
                          <input
                            type="email"
                            value={helplineForm.buyersHelpline.email}
                            onChange={(e) =>
                              setHelplineForm({
                                ...helplineForm,
                                buyersHelpline: {
                                  ...helplineForm.buyersHelpline,
                                  email: e.target.value,
                                },
                              })
                            }
                            placeholder="buyers@yourmart.pk"
                            className="w-full rounded-lg border border-slate-700 bg-slate-900/90 pl-9 pr-3 py-2 text-xs font-mono text-cyan-300 focus:border-cyan-500 focus:outline-none"
                            required
                          />
                        </div>
                      </div>

                      {/* Operating Hours / Timings */}
                      <div>
                        <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                          Operational Timings
                        </label>
                        <div className="relative">
                          <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                          <input
                            type="text"
                            value={helplineForm.buyersHelpline.timings || ''}
                            onChange={(e) =>
                              setHelplineForm({
                                ...helplineForm,
                                buyersHelpline: {
                                  ...helplineForm.buyersHelpline,
                                  timings: e.target.value,
                                },
                              })
                            }
                            placeholder="9:00 AM - 10:00 PM (Mon - Sun)"
                            className="w-full rounded-lg border border-slate-700 bg-slate-900/90 pl-9 pr-3 py-2 text-xs text-slate-200 focus:border-blue-500 focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Scope / Instructions */}
                    <div>
                      <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                        Buyer Guidance Note / Help Scope
                      </label>
                      <textarea
                        rows={2}
                        value={helplineForm.buyersHelpline.description || ''}
                        onChange={(e) =>
                          setHelplineForm({
                            ...helplineForm,
                            buyersHelpline: {
                              ...helplineForm.buyersHelpline,
                              description: e.target.value,
                            },
                          })
                        }
                        placeholder="Assistance for retail customer orders, COD delivery verification, tracking & parcel exchange support."
                        className="w-full rounded-lg border border-slate-700 bg-slate-900/90 px-3 py-2 text-xs text-slate-300 placeholder-slate-500 focus:border-blue-500 focus:outline-none resize-none"
                      />
                    </div>
                  </div>
                )}

                {/* 2. RESELLERS HELPLINE SECTION */}
                {(helplineActiveCategory === 'all' || helplineActiveCategory === 'resellers') && (
                  <div className="rounded-xl border border-emerald-500/30 bg-gradient-to-b from-emerald-950/20 to-slate-950/60 p-5 space-y-4 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                          <Briefcase className="h-4 w-4" />
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-white flex items-center gap-2">
                            <span>Resellers Dedicated Helpline</span>
                            <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.2 rounded border border-emerald-500/30">
                              Priority Partner Desk
                            </span>
                          </h3>
                          <p className="text-[11px] text-slate-400">
                            Direct line for profit margins, Profit Guard locks, instant wallet withdrawals, & Daraz push.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      {/* Phone Number */}
                      <div>
                        <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                          Reseller Helpline Phone
                        </label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                          <input
                            type="text"
                            value={helplineForm.resellersHelpline.phone}
                            onChange={(e) =>
                              setHelplineForm({
                                ...helplineForm,
                                resellersHelpline: {
                                  ...helplineForm.resellersHelpline,
                                  phone: e.target.value,
                                },
                              })
                            }
                            placeholder="+92-321-4455667"
                            className="w-full rounded-lg border border-slate-700 bg-slate-900/90 pl-9 pr-3 py-2 text-xs font-mono font-bold text-white focus:border-emerald-500 focus:outline-none"
                            required
                          />
                        </div>
                      </div>

                      {/* WhatsApp Number */}
                      <div>
                        <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                          Reseller WhatsApp Line
                        </label>
                        <div className="relative">
                          <MessageSquare className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-emerald-400" />
                          <input
                            type="text"
                            value={helplineForm.resellersHelpline.whatsapp || ''}
                            onChange={(e) =>
                              setHelplineForm({
                                ...helplineForm,
                                resellersHelpline: {
                                  ...helplineForm.resellersHelpline,
                                  whatsapp: e.target.value,
                                },
                              })
                            }
                            placeholder="+92-321-4455667"
                            className="w-full rounded-lg border border-slate-700 bg-slate-900/90 pl-9 pr-3 py-2 text-xs font-mono text-emerald-300 focus:border-emerald-500 focus:outline-none"
                          />
                        </div>
                      </div>

                      {/* Email Address */}
                      <div>
                        <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                          Reseller Support Email
                        </label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-cyan-400" />
                          <input
                            type="email"
                            value={helplineForm.resellersHelpline.email}
                            onChange={(e) =>
                              setHelplineForm({
                                ...helplineForm,
                                resellersHelpline: {
                                  ...helplineForm.resellersHelpline,
                                  email: e.target.value,
                                },
                              })
                            }
                            placeholder="resellers@yourmart.pk"
                            className="w-full rounded-lg border border-slate-700 bg-slate-900/90 pl-9 pr-3 py-2 text-xs font-mono text-cyan-300 focus:border-cyan-500 focus:outline-none"
                            required
                          />
                        </div>
                      </div>

                      {/* Operating Hours / Timings */}
                      <div>
                        <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                          Operational Timings
                        </label>
                        <div className="relative">
                          <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                          <input
                            type="text"
                            value={helplineForm.resellersHelpline.timings || ''}
                            onChange={(e) =>
                              setHelplineForm({
                                ...helplineForm,
                                resellersHelpline: {
                                  ...helplineForm.resellersHelpline,
                                  timings: e.target.value,
                                },
                              })
                            }
                            placeholder="24/7 Priority Reseller Desk"
                            className="w-full rounded-lg border border-slate-700 bg-slate-900/90 pl-9 pr-3 py-2 text-xs text-slate-200 focus:border-emerald-500 focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Scope / Instructions */}
                    <div>
                      <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                        Reseller Guidance Note
                      </label>
                      <textarea
                        rows={2}
                        value={helplineForm.resellersHelpline.description || ''}
                        onChange={(e) =>
                          setHelplineForm({
                            ...helplineForm,
                            resellersHelpline: {
                              ...helplineForm.resellersHelpline,
                              description: e.target.value,
                            },
                          })
                        }
                        placeholder="Dedicated support for profit margins, Profit Guard clearance, instant wallet payouts & Daraz multi-store sync."
                        className="w-full rounded-lg border border-slate-700 bg-slate-900/90 px-3 py-2 text-xs text-slate-300 placeholder-slate-500 focus:border-emerald-500 focus:outline-none resize-none"
                      />
                    </div>
                  </div>
                )}

                {/* 3. MANUFACTURERS / SUPPLIERS HELPLINE SECTION */}
                {(helplineActiveCategory === 'all' || helplineActiveCategory === 'manufacturers') && (
                  <div className="rounded-xl border border-amber-500/30 bg-gradient-to-b from-amber-950/20 to-slate-950/60 p-5 space-y-4 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30">
                          <Factory className="h-4 w-4" />
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-white flex items-center gap-2">
                            <span>Manufacturer & Supplier Helpline</span>
                            <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.2 rounded border border-amber-500/30">
                              Factory Onboarding
                            </span>
                          </h3>
                          <p className="text-[11px] text-slate-400">
                            For factory owners, wholesale bulk catalog listings, SKU stock sync, and warehouse escrow payouts.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      {/* Phone Number */}
                      <div>
                        <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                          Supplier Helpline Phone
                        </label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                          <input
                            type="text"
                            value={helplineForm.manufacturersHelpline.phone}
                            onChange={(e) =>
                              setHelplineForm({
                                ...helplineForm,
                                manufacturersHelpline: {
                                  ...helplineForm.manufacturersHelpline,
                                  phone: e.target.value,
                                },
                              })
                            }
                            placeholder="+92-345-7788990"
                            className="w-full rounded-lg border border-slate-700 bg-slate-900/90 pl-9 pr-3 py-2 text-xs font-mono font-bold text-white focus:border-amber-500 focus:outline-none"
                            required
                          />
                        </div>
                      </div>

                      {/* WhatsApp Number */}
                      <div>
                        <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                          Supplier WhatsApp Line
                        </label>
                        <div className="relative">
                          <MessageSquare className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-emerald-400" />
                          <input
                            type="text"
                            value={helplineForm.manufacturersHelpline.whatsapp || ''}
                            onChange={(e) =>
                              setHelplineForm({
                                ...helplineForm,
                                manufacturersHelpline: {
                                  ...helplineForm.manufacturersHelpline,
                                  whatsapp: e.target.value,
                                },
                              })
                            }
                            placeholder="+92-345-7788990"
                            className="w-full rounded-lg border border-slate-700 bg-slate-900/90 pl-9 pr-3 py-2 text-xs font-mono text-emerald-300 focus:border-emerald-500 focus:outline-none"
                          />
                        </div>
                      </div>

                      {/* Email Address */}
                      <div>
                        <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                          Supplier Support Email
                        </label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-cyan-400" />
                          <input
                            type="email"
                            value={helplineForm.manufacturersHelpline.email}
                            onChange={(e) =>
                              setHelplineForm({
                                ...helplineForm,
                                manufacturersHelpline: {
                                  ...helplineForm.manufacturersHelpline,
                                  email: e.target.value,
                                },
                              })
                            }
                            placeholder="suppliers@yourmart.pk"
                            className="w-full rounded-lg border border-slate-700 bg-slate-900/90 pl-9 pr-3 py-2 text-xs font-mono text-cyan-300 focus:border-cyan-500 focus:outline-none"
                            required
                          />
                        </div>
                      </div>

                      {/* Operating Hours / Timings */}
                      <div>
                        <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                          Operational Timings
                        </label>
                        <div className="relative">
                          <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                          <input
                            type="text"
                            value={helplineForm.manufacturersHelpline.timings || ''}
                            onChange={(e) =>
                              setHelplineForm({
                                ...helplineForm,
                                manufacturersHelpline: {
                                  ...helplineForm.manufacturersHelpline,
                                  timings: e.target.value,
                                },
                              })
                            }
                            placeholder="9:00 AM - 7:00 PM (Mon - Sat)"
                            className="w-full rounded-lg border border-slate-700 bg-slate-900/90 pl-9 pr-3 py-2 text-xs text-slate-200 focus:border-amber-500 focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Scope / Instructions */}
                    <div>
                      <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                        Manufacturer Guidance Note
                      </label>
                      <textarea
                        rows={2}
                        value={helplineForm.manufacturersHelpline.description || ''}
                        onChange={(e) =>
                          setHelplineForm({
                            ...helplineForm,
                            manufacturersHelpline: {
                              ...helplineForm.manufacturersHelpline,
                              description: e.target.value,
                            },
                          })
                        }
                        placeholder="Factory supplier onboarding, bulk stock listings, wholesale catalog approval & warehouse escrow releases."
                        className="w-full rounded-lg border border-slate-700 bg-slate-900/90 px-3 py-2 text-xs text-slate-300 placeholder-slate-500 focus:border-amber-500 focus:outline-none resize-none"
                      />
                    </div>
                  </div>
                )}

                {/* Submit / Save Bar */}
                <div className="pt-2 flex items-center gap-3">
                  <button
                    type="submit"
                    className="flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-[0.99] text-white font-bold px-6 py-2.5 text-xs shadow-lg shadow-emerald-950/50 transition cursor-pointer"
                  >
                    <Save className="h-4 w-4" />
                    <span>Save & Update All Helplines</span>
                  </button>
                  <span className="text-[11px] text-slate-400">
                    Changes take effect immediately across all client portals.
                  </span>
                </div>
              </div>

              {/* Right Side: Live Interactive Previews (5 cols) */}
              <div className="lg:col-span-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
                    <Eye className="h-4 w-4 text-emerald-400" />
                    <span>Real-Time Public Portals Preview:</span>
                  </div>
                  <span className="text-[10px] text-emerald-400 font-mono bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/60">
                    Live Synced
                  </span>
                </div>

                {/* 1. Buyer Preview Card */}
                <div className="rounded-xl border border-blue-500/40 bg-gradient-to-b from-blue-950/30 to-slate-950 p-4 space-y-3 shadow-md">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <div className="flex items-center gap-2">
                      <ShoppingBag className="h-4 w-4 text-blue-400" />
                      <span className="text-xs font-bold text-white">Buyers Helpline Preview</span>
                    </div>
                    <span className="text-[9px] uppercase font-bold text-blue-300 bg-blue-500/20 px-1.5 py-0.2 rounded border border-blue-500/30">
                      Customer View
                    </span>
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between items-center bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                      <span className="text-slate-400 text-[11px]">Phone:</span>
                      <span className="font-mono font-bold text-white">
                        {helplineForm.buyersHelpline.phone}
                      </span>
                    </div>
                    <div className="flex justify-between items-center bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                      <span className="text-slate-400 text-[11px]">Email:</span>
                      <span className="font-mono text-cyan-300 text-[11px]">
                        {helplineForm.buyersHelpline.email}
                      </span>
                    </div>
                    <div className="flex justify-between items-center bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                      <span className="text-slate-400 text-[11px]">Hours:</span>
                      <span className="text-slate-300 text-[11px]">
                        {helplineForm.buyersHelpline.timings}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 2. Reseller Preview Card */}
                <div className="rounded-xl border border-emerald-500/40 bg-gradient-to-b from-emerald-950/30 to-slate-950 p-4 space-y-3 shadow-md">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <div className="flex items-center gap-2">
                      <Briefcase className="h-4 w-4 text-emerald-400" />
                      <span className="text-xs font-bold text-white">Resellers Helpline Preview</span>
                    </div>
                    <span className="text-[9px] uppercase font-bold text-emerald-300 bg-emerald-500/20 px-1.5 py-0.2 rounded border border-emerald-500/30">
                      Reseller View
                    </span>
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between items-center bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                      <span className="text-slate-400 text-[11px]">Phone:</span>
                      <span className="font-mono font-bold text-white">
                        {helplineForm.resellersHelpline.phone}
                      </span>
                    </div>
                    <div className="flex justify-between items-center bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                      <span className="text-slate-400 text-[11px]">Email:</span>
                      <span className="font-mono text-cyan-300 text-[11px]">
                        {helplineForm.resellersHelpline.email}
                      </span>
                    </div>
                    <div className="flex justify-between items-center bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                      <span className="text-slate-400 text-[11px]">Hours:</span>
                      <span className="text-slate-300 text-[11px]">
                        {helplineForm.resellersHelpline.timings}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 3. Manufacturer Preview Card */}
                <div className="rounded-xl border border-amber-500/40 bg-gradient-to-b from-amber-950/30 to-slate-950 p-4 space-y-3 shadow-md">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <div className="flex items-center gap-2">
                      <Factory className="h-4 w-4 text-amber-400" />
                      <span className="text-xs font-bold text-white">Manufacturer Helpline Preview</span>
                    </div>
                    <span className="text-[9px] uppercase font-bold text-amber-300 bg-amber-500/20 px-1.5 py-0.2 rounded border border-amber-500/30">
                      Supplier View
                    </span>
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between items-center bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                      <span className="text-slate-400 text-[11px]">Phone:</span>
                      <span className="font-mono font-bold text-white">
                        {helplineForm.manufacturersHelpline.phone}
                      </span>
                    </div>
                    <div className="flex justify-between items-center bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                      <span className="text-slate-400 text-[11px]">Email:</span>
                      <span className="font-mono text-cyan-300 text-[11px]">
                        {helplineForm.manufacturersHelpline.email}
                      </span>
                    </div>
                    <div className="flex justify-between items-center bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                      <span className="text-slate-400 text-[11px]">Hours:</span>
                      <span className="text-slate-300 text-[11px]">
                        {helplineForm.manufacturersHelpline.timings}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* =========================================================================
          TAB 3: USER & RESELLER ACCOUNTS MANAGEMENT
      ========================================================================= */}
      {activeSubTab === 'users' && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-400" />
                <span>Ecosystem Accounts & Wallet Controls</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Manage registered resellers, wholesale suppliers, credit balances, and account authorizations.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search user, company, role..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="rounded-xl border border-slate-700 bg-slate-950 pl-9 pr-3.5 py-2 text-xs text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Users Table */}
          <div className="overflow-x-auto rounded-xl border border-slate-800">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
                <tr>
                  <th className="px-4 py-3">User & Company</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Phone / City</th>
                  <th className="px-4 py-3 text-right">Wallet Balance</th>
                  <th className="px-4 py-3 text-center">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 bg-slate-900/40">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-800/40 transition">
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <img
                          src={u.avatar}
                          alt={u.name}
                          className="h-8 w-8 rounded-full object-cover ring-1 ring-slate-700"
                        />
                        <div>
                          <div className="font-bold text-white">{u.name}</div>
                          <div className="text-[11px] text-slate-400">{u.companyName} • {u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span
                        className={`inline-block rounded px-2 py-0.5 text-[10px] font-bold uppercase border ${
                          u?.role === 'ADMIN'
                            ? 'bg-purple-950 text-purple-300 border-purple-800'
                            : u?.role === 'SUPPLIER'
                            ? 'bg-amber-950 text-amber-300 border-amber-800'
                            : u?.role === 'RESELLER'
                            ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                            : 'bg-blue-950 text-blue-300 border-blue-800'
                        }`}
                      >
                        {u?.role || 'USER'}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-slate-300 font-mono">
                      <div>{u.phone}</div>
                      <div className="text-[10px] text-slate-500">{u.city}</div>
                    </td>
                    <td className="px-4 py-3.5 text-right font-mono font-bold text-emerald-400">
                      PKR {u.walletBalancePKR.toLocaleString()}
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-950/60 px-2 py-0.5 text-[10px] font-semibold text-emerald-400 border border-emerald-800/60">
                        <UserCheck className="h-3 w-3" />
                        Active
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedUserForEdit(u)}
                          className="flex items-center gap-1 rounded-lg bg-blue-600/20 hover:bg-blue-600 text-blue-300 hover:text-white border border-blue-500/40 px-2.5 py-1.5 text-xs font-bold transition shadow-sm"
                          title="Edit user profile, company, contact & role"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => setSelectedUserForBalance(u)}
                          className="rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 px-2.5 py-1.5 text-xs font-bold transition"
                        >
                          Adjust Wallet
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Direct Wallet Adjuster Modal */}
          {selectedUserForBalance && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
              <div className="w-full max-w-md rounded-2xl border border-blue-500/40 bg-slate-900 p-6 shadow-2xl space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-blue-400" />
                    <span>Adjust Wallet: {selectedUserForBalance.name}</span>
                  </h3>
                  <button
                    onClick={() => setSelectedUserForBalance(null)}
                    className="text-slate-400 hover:text-white text-xs"
                  >
                    ✕
                  </button>
                </div>

                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs flex justify-between">
                  <span className="text-slate-400">Current Balance:</span>
                  <span className="font-mono font-bold text-emerald-400">
                    PKR {selectedUserForBalance.walletBalancePKR.toLocaleString()}
                  </span>
                </div>

                <form onSubmit={handleApplyBalanceAdjustment} className="space-y-4">
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setAdjType('CREDIT')}
                      className={`py-2 text-xs font-bold rounded-xl border transition ${
                        adjType === 'CREDIT'
                          ? 'bg-emerald-600 text-white border-emerald-500'
                          : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                      }`}
                    >
                      + Credit Funds
                    </button>
                    <button
                      type="button"
                      onClick={() => setAdjType('DEBIT')}
                      className={`py-2 text-xs font-bold rounded-xl border transition ${
                        adjType === 'DEBIT'
                          ? 'bg-rose-600 text-white border-rose-500'
                          : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                      }`}
                    >
                      - Debit Funds
                    </button>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">
                      Adjustment Amount (PKR)
                    </label>
                    <input
                      type="number"
                      min="50"
                      step="50"
                      required
                      value={adjAmount}
                      onChange={(e) => setAdjAmount(Number(e.target.value))}
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm font-bold font-mono text-white focus:border-blue-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">
                      Audit Reason
                    </label>
                    <input
                      type="text"
                      required
                      value={adjReason}
                      onChange={(e) => setAdjReason(e.target.value)}
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white focus:border-blue-500 focus:outline-none"
                    />
                  </div>

                  {adjSuccess && (
                    <div className="text-xs font-bold text-emerald-400 bg-emerald-950/60 p-2.5 rounded-xl border border-emerald-800 text-center">
                      ✓ Balance successfully updated!
                    </div>
                  )}

                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setSelectedUserForBalance(null)}
                      className="flex-1 rounded-xl bg-slate-800 text-slate-300 py-2.5 text-xs font-semibold hover:bg-slate-700 transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 rounded-xl bg-blue-600 text-white py-2.5 text-xs font-bold hover:bg-blue-500 transition"
                    >
                      Apply Adjustment
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          TAB 4: SECURITY & MASTER KEY CONFIGURATION
      ========================================================================= */}
      {activeSubTab === 'security' && (
        <div className="rounded-2xl border border-indigo-500/30 bg-slate-900/90 p-6 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center shadow-inner">
                <KeyRound className="h-5 w-5 stroke-[2.2]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="rounded bg-indigo-500/20 px-2 py-0.5 text-[10px] font-bold text-indigo-300 border border-indigo-500/30">
                    MASTER SECURITY VAULT
                  </span>
                  <span className="text-xs text-slate-400">Admin Passkeys & Session Parameters</span>
                </div>
                <h2 className="text-lg font-bold text-white tracking-tight mt-0.5">
                  Administrator Access & PIN Configuration
                </h2>
              </div>
            </div>

            {secSaveSuccess && (
              <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400 bg-emerald-950/40 px-3 py-1.5 rounded-lg border border-emerald-800">
                <Check className="h-4 w-4" /> Security Settings Saved!
              </span>
            )}
          </div>

          <form onSubmit={handleSaveSecurityConfig} className="max-w-2xl space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4 space-y-2">
                <label className="text-xs font-bold text-white flex items-center gap-1.5">
                  <KeyRound className="h-3.5 w-3.5 text-purple-400" />
                  <span>Master Admin Passkey</span>
                </label>
                <p className="text-[11px] text-slate-400">
                  Password used to unlock the Administrator HQ from the portal gateway.
                </p>
                <input
                  type="text"
                  required
                  value={newKey}
                  onChange={(e) => setNewKey(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-2 text-xs text-white font-mono font-bold focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4 space-y-2">
                <label className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Lock className="h-3.5 w-3.5 text-emerald-400" />
                  <span>6-Digit Security PIN</span>
                </label>
                <p className="text-[11px] text-slate-400">
                  Quick numeric PIN code for fast authentication on verified terminals.
                </p>
                <input
                  type="text"
                  maxLength={6}
                  required
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ''))}
                  className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-2 text-xs text-emerald-400 font-mono font-bold text-center tracking-widest focus:border-indigo-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4 space-y-2">
              <label className="text-xs font-bold text-white flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-blue-400" />
                <span>Auto-Lock Inactivity Timeout</span>
              </label>
              <p className="text-[11px] text-slate-400">
                Automatically lock the admin console if no actions are taken.
              </p>
              <select
                value={secForm.autoLockMinutes}
                onChange={(e) => setSecForm({ ...secForm, autoLockMinutes: Number(e.target.value) })}
                className="w-full sm:w-64 rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-2 text-xs text-white focus:border-indigo-500 focus:outline-none"
              >
                <option value={5}>5 Minutes (Maximum Security)</option>
                <option value={15}>15 Minutes (Recommended)</option>
                <option value={30}>30 Minutes</option>
                <option value={60}>1 Hour</option>
              </select>
            </div>

            <button
              type="submit"
              className="flex items-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-6 py-2.5 shadow-lg transition"
            >
              <Save className="h-4 w-4" />
              <span>Update Security Credentials</span>
            </button>
          </form>
        </div>
      )}

      {/* =========================================================================
          TAB 5: SYSTEM AUDIT LOGS & ACCESS HISTORY
      ========================================================================= */}
      {activeSubTab === 'audit-logs' && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                <History className="h-5 w-5 text-purple-400" />
                <span>Administrator Security Audit Trails</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Immutable chronological log of all administrative actions, logins, and threshold adjustments.
              </p>
            </div>

            <span className="text-xs text-slate-400 font-mono">
              Total Recorded Logs: <b className="text-white">{auditLogs.length}</b>
            </span>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-800">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
                <tr>
                  <th className="px-4 py-3">Timestamp</th>
                  <th className="px-4 py-3">Action Event</th>
                  <th className="px-4 py-3">Details</th>
                  <th className="px-4 py-3">Admin User / Origin IP</th>
                  <th className="px-4 py-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 bg-slate-900/40">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-800/40 transition font-mono">
                    <td className="px-4 py-3 text-slate-400 whitespace-nowrap text-[11px]">
                      {log.timestamp}
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-bold text-white text-[11px] bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                        {log.action}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-300 font-sans text-xs max-w-xs truncate">
                      {log.details}
                    </td>
                    <td className="px-4 py-3 text-slate-400 text-[11px]">
                      <div>{log.adminUser}</div>
                      <div className="text-slate-600 text-[10px]">{log.ip}</div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`inline-block rounded px-2 py-0.5 text-[10px] font-bold ${
                          log.status === 'SUCCESS'
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                            : log.status === 'WARNING'
                            ? 'bg-amber-950 text-amber-300 border border-amber-800'
                            : 'bg-rose-950 text-rose-300 border border-rose-800'
                        }`}
                      >
                        {log.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =========================================================================
          GLOBAL ADMIN EDIT MODALS
      ========================================================================= */}
      {selectedOrderForEdit && (
        <AdminEditOrderModal
          isOpen={!!selectedOrderForEdit}
          onClose={() => setSelectedOrderForEdit(null)}
          order={selectedOrderForEdit}
          onSaveOrder={(updated) => {
            if (onUpdateOrder) onUpdateOrder(updated);
            onLogAudit(
              'ORDER_MODIFIED',
              `Order ${updated.orderNumber} updated: Status [${updated.status}], Selling Price [PKR ${updated.sellingPricePKR}]`,
              'SUCCESS'
            );
            setSelectedOrderForEdit(null);
          }}
          profitGuardConfig={profitGuardConfig}
        />
      )}

      {selectedUserForEdit && (
        <AdminEditUserModal
          isOpen={!!selectedUserForEdit}
          onClose={() => setSelectedUserForEdit(null)}
          user={selectedUserForEdit}
          onSaveUser={(updated) => {
            if (onUpdateUser) onUpdateUser(updated);
            onLogAudit(
              'USER_PROFILE_UPDATED',
              `User account modified: ${updated.name} (${updated.email}) - Role [${updated.role}], Balance [PKR ${updated.walletBalancePKR}]`,
              'SUCCESS'
            );
            setSelectedUserForEdit(null);
          }}
        />
      )}
    </div>
  );
};
