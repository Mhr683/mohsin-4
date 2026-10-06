import React, { useState } from 'react';
import {
  LayoutGrid,
  ShoppingBag,
  Truck,
  ShieldAlert,
  Store as StoreIcon,
  Wallet,
  Building2,
  BarChart3,
  Search,
  User as UserIcon,
  FileSpreadsheet,
  SlidersHorizontal,
  Banknote,
  Headphones,
  ShoppingCart,
  Printer,
  Bot,
  Menu,
  X,
  Plus,
  BookOpen,
  RotateCcw,
  MessageSquare,
  QrCode,
  Sparkles,
  Calculator,
  FileCheck,
  Lock,
  Unlock,
  Globe,
  Compass,
  Boxes,
  Sliders,
  Database,
} from 'lucide-react';
import { User, StoreIntegration } from '../types';
import { AppLanguage } from '../context/LanguageContext';

export type NavTab =
  | 'dashboard'
  | 'front-dashboard'
  | 'catalog'
  | 'winning-products'
  | 'orders'
  | 'supplier-hub'
  | 'supplier-inventory'
  | 'business-rules'
  | 'audit-log'
  | 'payouts'
  | 'public-tracking'
  | 'reverse-logistics'
  | 'fraud-blacklist'
  | 'courier-reconciliation'
  | 'daraz-calculator'
  | 'stores-directory'
  | 'store-front'
  | 'bulk-import'
  | 'abandoned-carts'
  | 'support-tickets'
  | 'knowledge-center'
  | 'admin-hq';

interface NavbarProps {
  activeTab: string;
  onSelectTab: (tab: string) => void;
  pendingOrdersCount: number;
  cartCount: number;
  currentUser: User;
  isAdminAuthenticated?: boolean;
  language?: AppLanguage;
  onToggleLanguage?: (lang: AppLanguage) => void;
  onOpenBatchPrinter?: () => void;
  onOpenUpgradeModal?: () => void;
  onOpenStoreSyncModal?: () => void;
  onOpenWalletModal?: () => void;
  onOpenCart?: () => void;
  onOpenHelplinesModal?: () => void;
  onOpenAdminAuth?: () => void;
  onLockAdmin?: () => void;
  onOpenProfitGuardModal?: () => void;
  onOpenProductListing?: () => void;
  onOpenBulkImport?: () => void;
  onOpenPoliciesModal?: () => void;
  onOpenWhiteLabelModal?: () => void;
  onOpenShopifySyncModal?: () => void;
  onOpenBarcodeScanner?: () => void;
  onOpenAiAssetStudio?: () => void;
  onOpenProfile?: () => void;
  onOpenAIDispatchModal?: () => void;
  onOpenLocationSelector?: () => void;
  stores?: StoreIntegration[];
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onSelectTab,
  pendingOrdersCount,
  cartCount,
  currentUser,
  isAdminAuthenticated = false,
  language = 'en',
  onToggleLanguage,
  onOpenBatchPrinter,
  onOpenUpgradeModal,
  onOpenStoreSyncModal,
  onOpenWalletModal,
  onOpenCart,
  onOpenHelplinesModal,
  onOpenAdminAuth,
  onLockAdmin,
  onOpenProfitGuardModal,
  onOpenProductListing,
  onOpenBulkImport,
  onOpenPoliciesModal,
  onOpenWhiteLabelModal,
  onOpenShopifySyncModal,
  onOpenBarcodeScanner,
  onOpenAiAssetStudio,
  onOpenProfile,
  onOpenAIDispatchModal,
  onOpenLocationSelector,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isProductsActive =
    activeTab === 'catalog' || activeTab === 'winning-products' || activeTab === 'orders';

  const navItems: {
    id: string;
    label: string;
    subLabel: string;
    icon: React.FC<{ className?: string }>;
    badge?: number;
  }[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      subLabel: 'Overview & Sales',
      icon: LayoutGrid,
    },
    {
      id: 'catalog',
      label: 'Products',
      subLabel: 'Catalog • Winning • Orders & Dispatch',
      icon: ShoppingBag,
      badge: pendingOrdersCount > 0 ? pendingOrdersCount : undefined,
    },
    {
      id: 'stores-directory',
      label: 'Wholesale Stores',
      subLabel: 'Verified Suppliers Directory',
      icon: StoreIcon,
    },
    {
      id: 'supplier-hub',
      label: 'Supplier Hub',
      subLabel: 'Factory Stock & Dispatch',
      icon: Building2,
    },
    {
      id: 'supplier-inventory',
      label: 'Inventory Sync',
      subLabel: 'Factory Stock & Feeds',
      icon: Boxes,
    },
    {
      id: 'business-rules',
      label: 'Business Rules',
      subLabel: 'Tariffs & COD Gates',
      icon: Sliders,
    },
    {
      id: 'audit-log',
      label: 'Audit Ledger',
      subLabel: 'Platform Action Trail',
      icon: Database,
    },
    {
      id: 'payouts',
      label: 'Payouts & Ledger',
      subLabel: 'JazzCash • EasyPaisa • IBAN',
      icon: Banknote,
    },
    {
      id: 'fraud-blacklist',
      label: 'Fraud Shield',
      subLabel: 'COD Risk & Blacklist',
      icon: ShieldAlert,
    },
    {
      id: 'reverse-logistics',
      label: 'Returns (RTO)',
      subLabel: 'Reverse Logistics & Claims',
      icon: RotateCcw,
    },
    {
      id: 'public-tracking',
      label: 'Parcel Tracking',
      subLabel: 'Trax • PostEx • TCS • Leopards',
      icon: Truck,
    },
    {
      id: 'courier-reconciliation',
      label: 'COD Reconciliation',
      subLabel: 'Courier Settlement Audit',
      icon: FileCheck,
    },
    {
      id: 'daraz-calculator',
      label: 'Profit Calculator',
      subLabel: 'Margin & Commission Engine',
      icon: Calculator,
    },
    {
      id: 'support-tickets',
      label: 'Support & Disputes',
      subLabel: 'Claims & Help Desk',
      icon: MessageSquare,
    },
    {
      id: 'knowledge-center',
      label: 'Knowledge Center',
      subLabel: 'Seller Academy (اردو/En)',
      icon: BookOpen,
    },
  ];

  const handleSelect = (tabId: string) => {
    onSelectTab(tabId);
    setMobileMenuOpen(false);
  };

  const walletBalance = currentUser.walletBalancePKR ?? (currentUser as any).walletBalance ?? 0;

  return (
    <header className="sticky top-0 z-40 border-b border-slate-800 bg-slate-950 text-white shadow-lg">
      {/* Top Primary Bar */}
      <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-3 px-4 py-3 sm:px-6">
        {/* Left: Mobile Drawer Toggle + Brand Logo */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex lg:hidden h-9 w-9 items-center justify-center rounded-xl border border-slate-800 bg-slate-900 text-slate-300 hover:text-white"
            title="Open Navigation Menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>

          <div
            onClick={() => handleSelect('dashboard')}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 text-slate-950 shadow-md group-hover:scale-105 transition">
              <ShoppingBag className="h-5 w-5 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base sm:text-lg font-black tracking-tight text-white">
                  YourMart <span className="text-emerald-400">PK</span>
                </span>
                <span className="hidden sm:inline-block rounded-md bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-300 border border-emerald-500/30">
                  Pakistan Dropshipping
                </span>
              </div>
              <p className="hidden md:block text-[11px] text-slate-400">
                Wholesale Sourcing • Profit Guard • Automated COD Dispatch
              </p>
            </div>
          </div>
        </div>

        {/* Right Action Tools */}
        <div className="flex items-center gap-2 flex-wrap justify-end">
          {/* Add / List Product */}
          {onOpenProductListing && (
            <button
              type="button"
              onClick={onOpenProductListing}
              className="hidden sm:flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 px-3 py-2 text-xs font-bold text-white shadow transition cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
              <span>List Product</span>
            </button>
          )}

          {/* Bulk CSV Import */}
          {onOpenBulkImport && (
            <button
              type="button"
              onClick={onOpenBulkImport}
              className="hidden xl:flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-900 hover:bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-200 transition cursor-pointer"
            >
              <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-400" />
              <span>Bulk CSV</span>
            </button>
          )}

          {/* Pakistan Location & Serviceability */}
          {onOpenLocationSelector && (
            <button
              type="button"
              onClick={onOpenLocationSelector}
              className="hidden lg:flex items-center gap-1.5 rounded-xl border border-teal-500/40 bg-teal-500/10 hover:bg-teal-500/20 px-3 py-2 text-xs font-bold text-teal-300 transition cursor-pointer"
              title="Pakistan Location & Courier Serviceability Desk"
            >
              <Compass className="h-3.5 w-3.5 text-teal-400" />
              <span>Locations</span>
            </button>
          )}

          {/* AI Dispatch Engine */}
          {onOpenAIDispatchModal && (
            <button
              type="button"
              onClick={onOpenAIDispatchModal}
              className="hidden md:flex items-center gap-1.5 rounded-xl border border-indigo-500/40 bg-indigo-500/15 hover:bg-indigo-500/25 px-3 py-2 text-xs font-bold text-indigo-300 transition cursor-pointer"
              title="AI Dispatch & Auto-Reply Engine"
            >
              <Bot className="h-3.5 w-3.5 text-indigo-400" />
              <span>AI Dispatch</span>
            </button>
          )}

          {/* Profit Guard */}
          {onOpenProfitGuardModal && (
            <button
              type="button"
              onClick={onOpenProfitGuardModal}
              className="hidden lg:flex items-center gap-1.5 rounded-xl border border-emerald-500/30 bg-slate-900 hover:bg-slate-800 px-3 py-2 text-xs font-semibold text-emerald-300 transition cursor-pointer"
            >
              <SlidersHorizontal className="h-3.5 w-3.5 text-emerald-400" />
              <span>Profit Guard</span>
            </button>
          )}

          {/* Store Sync */}
          {onOpenStoreSyncModal && (
            <button
              type="button"
              onClick={onOpenStoreSyncModal}
              className="hidden lg:flex items-center gap-1.5 rounded-xl border border-purple-500/30 bg-purple-500/10 hover:bg-purple-500/20 px-3 py-2 text-xs font-bold text-purple-300 transition cursor-pointer"
            >
              <StoreIcon className="h-3.5 w-3.5 text-purple-400" />
              <span>Store Sync</span>
            </button>
          )}

          {/* Multi-Product Cart */}
          {onOpenCart && (
            <button
              type="button"
              onClick={onOpenCart}
              className="relative flex items-center gap-1.5 rounded-xl border border-emerald-500/40 bg-emerald-500/10 hover:bg-emerald-500/20 px-3 py-2 text-xs font-bold text-emerald-300 transition cursor-pointer"
              title="Open Multi-Product Order Cart"
            >
              <ShoppingCart className="h-3.5 w-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Cart</span>
              {cartCount > 0 && (
                <span className="rounded-full bg-emerald-500 px-1.5 py-0.2 text-[10px] font-black text-slate-950">
                  {cartCount}
                </span>
              )}
            </button>
          )}

          {/* Wallet */}
          {onOpenWalletModal && (
            <button
              type="button"
              onClick={onOpenWalletModal}
              className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900 hover:border-emerald-500/50 px-3 py-1.5 text-left transition cursor-pointer"
            >
              <Wallet className="h-4 w-4 text-emerald-400" />
              <div className="hidden sm:block">
                <p className="text-[9px] font-semibold uppercase tracking-wider text-slate-400">
                  Wallet
                </p>
                <p className="text-xs font-extrabold text-emerald-400 font-mono">
                  PKR {walletBalance.toLocaleString()}
                </p>
              </div>
            </button>
          )}

          {/* Helplines */}
          {onOpenHelplinesModal && (
            <button
              type="button"
              onClick={onOpenHelplinesModal}
              className="flex items-center gap-1 rounded-xl border border-slate-700 bg-slate-900 hover:bg-slate-800 px-2.5 py-2 text-xs font-bold text-slate-200 transition cursor-pointer"
              title="Official Helplines"
            >
              <Headphones className="h-4 w-4 text-emerald-400" />
              <span className="hidden 2xl:inline">Helpline</span>
            </button>
          )}

          {/* Language Switcher */}
          {onToggleLanguage && (
            <button
              type="button"
              onClick={() =>
                onToggleLanguage(
                  language === 'en' ? 'ur' : language === 'ur' ? 'roman-urdu' : 'en'
                )
              }
              className="hidden md:flex items-center gap-1 rounded-xl border border-slate-800 bg-slate-900 hover:bg-slate-800 px-2.5 py-2 text-[11px] font-bold text-slate-300 transition cursor-pointer"
              title="Switch Language (English / اردو / Roman Urdu)"
            >
              <Globe className="h-3.5 w-3.5 text-emerald-400" />
              <span className="uppercase">{language === 'ur' ? 'اردو' : language}</span>
            </button>
          )}

          {/* Profile / Verified Registration */}
          {onOpenProfile && (
            <button
              type="button"
              onClick={onOpenProfile}
              className="flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-900 hover:bg-slate-800 px-2.5 py-2 text-xs font-bold text-slate-200 transition cursor-pointer"
              title="Profile & Payout Bank Settings"
            >
              <UserIcon className="h-3.5 w-3.5 text-emerald-400" />
              <span className="hidden md:inline max-w-[100px] truncate">{currentUser.name}</span>
            </button>
          )}

          {/* Admin HQ Lock/Unlock */}
          {isAdminAuthenticated ? (
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => handleSelect('admin-hq')}
                className={`flex items-center gap-1 rounded-xl px-2.5 py-2 text-xs font-bold transition cursor-pointer ${
                  activeTab === 'admin-hq'
                    ? 'bg-amber-500 text-slate-950'
                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                }`}
              >
                <Unlock className="h-3.5 w-3.5" />
                <span className="hidden xl:inline">Admin HQ</span>
              </button>
              {onLockAdmin && (
                <button
                  type="button"
                  onClick={onLockAdmin}
                  className="rounded-xl bg-rose-500/15 border border-rose-500/30 p-2 text-rose-300 hover:bg-rose-500/25 transition cursor-pointer"
                  title="Lock Admin Session"
                >
                  <Lock className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          ) : (
            onOpenAdminAuth && (
              <button
                type="button"
                onClick={onOpenAdminAuth}
                className="rounded-xl border border-slate-800 bg-slate-900 p-2 text-slate-400 hover:text-white transition cursor-pointer"
                title="Admin HQ Access"
              >
                <Lock className="h-3.5 w-3.5" />
              </button>
            )
          )}
        </div>
      </div>

      {/* Horizontal Navigation Tab Strip */}
      <div className="border-t border-slate-800/80 bg-slate-900/90">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-2 overflow-x-auto px-4 py-1.5 sm:px-6 no-scrollbar">
          <div className="flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active =
                item.id === 'catalog'
                  ? isProductsActive
                  : item.id === 'dashboard'
                  ? activeTab === 'dashboard' || activeTab === 'front-dashboard'
                  : activeTab === item.id;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleSelect(item.id)}
                  className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                    active
                      ? 'bg-emerald-500 text-slate-950 shadow-sm'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5 shrink-0" />
                  <span>{item.label}</span>
                  {item.badge !== undefined && (
                    <span
                      className={`rounded-full px-1.5 py-0.2 text-[10px] font-black ${
                        active
                          ? 'bg-slate-950 text-emerald-400'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Right Quick Actions in Tab Bar */}
          <div className="hidden 2xl:flex items-center gap-1.5 pl-2 border-l border-slate-800 shrink-0">
            {onOpenBatchPrinter && (
              <button
                type="button"
                onClick={onOpenBatchPrinter}
                className="flex items-center gap-1 rounded-lg bg-slate-800 hover:bg-slate-700 px-2.5 py-1.5 text-[11px] font-semibold text-slate-200 transition cursor-pointer"
              >
                <Printer className="h-3 w-3 text-cyan-400" />
                <span>Batch Labels</span>
              </button>
            )}
            {onOpenWhiteLabelModal && (
              <button
                type="button"
                onClick={onOpenWhiteLabelModal}
                className="flex items-center gap-1 rounded-lg bg-slate-800 hover:bg-slate-700 px-2.5 py-1.5 text-[11px] font-semibold text-slate-200 transition cursor-pointer"
              >
                <Sparkles className="h-3 w-3 text-amber-400" />
                <span>Flyer Branding</span>
              </button>
            )}
            {onOpenBarcodeScanner && (
              <button
                type="button"
                onClick={onOpenBarcodeScanner}
                className="flex items-center gap-1 rounded-lg bg-slate-800 hover:bg-slate-700 px-2.5 py-1.5 text-[11px] font-semibold text-slate-200 transition cursor-pointer"
              >
                <QrCode className="h-3 w-3 text-emerald-400" />
                <span>Scan Slip</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative z-10 flex w-72 flex-col bg-slate-900 border-r border-slate-800 p-4 overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
              <span className="text-sm font-black text-white">YourMart PK Navigation</span>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-1 flex-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active =
                  item.id === 'catalog'
                    ? isProductsActive
                    : item.id === 'dashboard'
                    ? activeTab === 'dashboard' || activeTab === 'front-dashboard'
                    : activeTab === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => handleSelect(item.id)}
                    className={`w-full flex items-center justify-between rounded-xl px-3 py-2.5 text-xs font-bold transition ${
                      active
                        ? 'bg-emerald-500 text-slate-950'
                        : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className="h-4 w-4 shrink-0" />
                      <div className="text-left">
                        <div>{item.label}</div>
                        <div
                          className={`text-[10px] ${
                            active ? 'text-slate-900' : 'text-slate-400'
                          }`}
                        >
                          {item.subLabel}
                        </div>
                      </div>
                    </div>
                    {item.badge !== undefined && (
                      <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold text-amber-300">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {onOpenUpgradeModal && (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenUpgradeModal();
                }}
                className="mt-4 w-full rounded-xl bg-emerald-600 py-2.5 text-xs font-bold text-white"
              >
                Verified Store Registration
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
