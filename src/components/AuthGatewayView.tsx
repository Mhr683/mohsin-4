import React, { useState } from 'react';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Truck,
  Package,
  ShieldCheck,
  Check,
  RotateCw,
  ShoppingBag,
  ExternalLink,
  ArrowRight,
  Phone,
  Sparkles,
  UserCheck,
  Search,
  ChevronDown,
  ChevronLeft,
  Facebook,
  Instagram,
  MessageCircle,
  Bell,
  User as UserIcon,
  Headphones,
  FileSpreadsheet,
  LayoutDashboard,
  Building2,
  BookOpen,
} from 'lucide-react';
import { User, PlatformHelplinesConfig } from '../types';

interface AuthGatewayViewProps {
  onLoginSuccess: (user: User) => void;
  onOpenDropshipperRegister: () => void;
  onOpenSupplierRegister: () => void;
  existingUsers: User[];
  onNavigateHome?: () => void;
  onNavigateProducts?: () => void;
  onOpenWhatsNew?: () => void;
  onOpenLearningLibrary?: () => void;
  onOpenHelpSupport?: () => void;
  onExportProductsCSV?: () => void;
  onOpenBusinessDashboard?: () => void;
  cartCount?: number;
  onOpenCart?: () => void;
  helplinesConfig?: PlatformHelplinesConfig;
}

export const AuthGatewayView: React.FC<AuthGatewayViewProps> = ({
  onLoginSuccess,
  onOpenDropshipperRegister,
  onOpenSupplierRegister,
  existingUsers,
  onNavigateHome,
  onNavigateProducts,
  onOpenWhatsNew,
  onOpenLearningLibrary,
  onOpenHelpSupport,
  onExportProductsCSV,
  onOpenBusinessDashboard,
  cartCount = 0,
  onOpenCart,
  helplinesConfig,
}) => {
  // Form State
  const [email, setEmail] = useState('mralun683@gmail.com');
  const [password, setPassword] = useState('••••••••');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [captchaChecked, setCaptchaChecked] = useState(false);
  const [captchaLoading, setCaptchaLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [forgotPasswordNotice, setForgotPasswordNotice] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [isHelpDropdownOpen, setIsHelpDropdownOpen] = useState(false);

  const officialWhatsApp = helplinesConfig?.buyersHelpline?.whatsapp || '+92 300 1122334';
  const officialPhone = helplinesConfig?.resellersHelpline?.phone || '+92 321 4455667';
  const officialEmail = helplinesConfig?.resellersHelpline?.email || 'support@yourmart.pk';

  // Handle Simulated reCAPTCHA verification
  const handleCaptchaClick = () => {
    if (captchaChecked) return;
    setCaptchaLoading(true);
    setTimeout(() => {
      setCaptchaLoading(false);
      setCaptchaChecked(true);
    }, 600);
  };

  // Handle Login Submit
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!email.trim()) {
      setErrorMessage('Please enter your email address.');
      return;
    }

    if (!captchaChecked) {
      setErrorMessage('Please verify that you are not a robot (click reCAPTCHA box).');
      return;
    }

    // Find user or create active session
    const matchedUser = existingUsers.find(
      (u) => u.email.toLowerCase() === email.trim().toLowerCase()
    );

    if (matchedUser) {
      onLoginSuccess(matchedUser);
    } else {
      // Fallback session for entered email
      const dynamicUser: User = {
        id: `usr-${Date.now()}`,
        name: email.split('@')[0] || 'Dropshipper Partner',
        email: email.trim(),
        role: 'RESELLER',
        companyName: 'YourMart Dropshipper Store',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
        walletBalancePKR: 15000,
        phone: officialWhatsApp,
        city: 'Lahore',
        isRegistered: true,
      };
      onLoginSuccess(dynamicUser);
    }
  };

  // Quick 1-Click Demo Login
  const handleQuickDemo = (userRole: 'RESELLER' | 'SUPPLIER' | 'ADMIN') => {
    const target = (existingUsers || []).find((u) => u?.role === userRole) || (existingUsers && existingUsers[0]);
    if (target) {
      onLoginSuccess(target);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToLoginCard = () => {
    const el = document.getElementById('card-welcome-back');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    } else {
      scrollToTop();
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onNavigateProducts) {
      onNavigateProducts();
    }
  };

  return (
    <div id="auth-gateway-page" className="min-h-screen flex flex-col bg-slate-100 text-slate-900 font-sans">
      {/* 1. TOPMOST ANNOUNCEMENT STRIP (Branded in YourMart Global theme) */}
      <header className="bg-[#070c18] text-slate-200 px-4 sm:px-8 py-2 text-xs border-b border-emerald-500/20 select-none">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="font-bold tracking-wider text-xs sm:text-[13px] uppercase flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-white font-extrabold">PAKISTAN’S #1 B2B WHOLESALE & DROPSHIPPING PLATFORM</span>
            <span className="hidden md:inline text-emerald-400 font-medium">| ZERO UPFRONT CAPITAL</span>
          </div>

          <div className="flex items-center gap-3 sm:gap-5 text-xs font-medium">
            <button
              onClick={onOpenHelpSupport}
              className="hover:text-emerald-400 transition cursor-pointer flex items-center gap-1"
            >
              <Headphones className="w-3 h-3 text-emerald-400" />
              <span>Contact Us</span>
            </button>
            <button
              onClick={onOpenCart || onNavigateProducts}
              className="hover:text-emerald-400 transition cursor-pointer flex items-center gap-1"
            >
              <ShoppingBag className="w-3 h-3 text-emerald-400" />
              <span>Cart ({cartCount})</span>
            </button>
            <button
              onClick={scrollToLoginCard}
              className="hover:text-emerald-400 transition cursor-pointer font-bold text-white"
            >
              Login
            </button>
            <span className="text-slate-600">|</span>
            <div className="flex items-center gap-3 text-slate-300">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-emerald-400 transition"
                title="Facebook"
              >
                <Facebook className="w-3.5 h-3.5" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-emerald-400 transition"
                title="Instagram"
              >
                <Instagram className="w-3.5 h-3.5" />
              </a>
              <a
                href={`https://wa.me/${officialWhatsApp.replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-emerald-300 transition text-emerald-400"
                title="WhatsApp Direct Support"
              >
                <MessageCircle className="w-3.5 h-3.5 fill-emerald-500/20" />
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* 2. MAIN BRAND & SEARCH HEADER (Our Brand: YourMart Global in dark midnight & emerald theme) */}
      <div className="bg-[#0b1329] text-white px-4 sm:px-8 py-3.5 border-b border-slate-800 shadow-md">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Brand Logo & Title */}
          <div
            className="flex items-center gap-3 cursor-pointer shrink-0"
            onClick={onNavigateHome || scrollToTop}
          >
            <div className="w-11 h-11 rounded-xl border-2 border-emerald-400/80 flex items-center justify-center bg-gradient-to-br from-emerald-500 to-teal-700 shadow-lg shadow-emerald-950/50">
              <ShoppingBag className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="text-2xl font-black tracking-tight leading-none text-white flex items-center gap-1.5">
                <span>YOURMART</span>
                <span className="text-emerald-400 text-lg font-bold">GLOBAL</span>
              </div>
              <div className="text-[10px] tracking-widest text-slate-300 font-bold uppercase mt-0.5">
                PAKISTAN'S B2B WHOLESALE & DROPSHIPPING ENGINE
              </div>
            </div>
          </div>

          {/* Pill Search Bar */}
          <div className="w-full max-w-xl">
            <form
              onSubmit={handleSearchSubmit}
              className="flex items-center bg-white rounded-full p-1 pl-4 shadow-sm border border-slate-200 text-slate-800"
            >
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search wholesale products, Daraz hot sellers, gadgets..."
                className="w-full bg-transparent text-sm text-slate-900 placeholder-slate-400 focus:outline-none pr-2"
              />
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                  className="flex items-center gap-1 pr-3 border-l border-slate-200 pl-3 text-xs text-slate-600 font-bold hover:text-slate-900 transition cursor-pointer"
                >
                  <span className="max-w-[90px] truncate">{selectedCategory}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>
                {isCategoryOpen && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-slate-200 rounded-xl shadow-xl z-50 py-1 text-xs text-slate-700 font-medium">
                    {['All Categories', 'Electronics & Gadgets', 'Watches & Wearables', 'Fashion & Apparel', 'Home & Kitchen', 'Beauty & Personal Care', 'Automotive Accessories'].map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => {
                          setSelectedCategory(cat);
                          setIsCategoryOpen(false);
                        }}
                        className="w-full text-left px-3.5 py-2 hover:bg-emerald-50 hover:text-emerald-800 transition"
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <button
                type="submit"
                className="w-9 h-9 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center shrink-0 transition shadow-sm cursor-pointer"
                title="Search Wholesale Products"
              >
                <Search className="w-4 h-4" />
              </button>
            </form>
          </div>

          {/* Right: WhatsApp Helpline + User Actions */}
          <div className="flex items-center gap-4 sm:gap-6 shrink-0">
            {/* WhatsApp Helpline Block */}
            <a
              href={`https://wa.me/${officialWhatsApp.replace(/[^0-9]/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2.5 text-left group hover:opacity-95 transition bg-emerald-950/40 border border-emerald-500/40 px-3 py-1.5 rounded-xl"
              title="Official WhatsApp Support"
            >
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-400/60 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition">
                <MessageCircle className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  <span className="text-[10px] font-bold text-emerald-300 tracking-wider">
                    WHATSAPP HELPLINE
                  </span>
                </div>
                <span className="text-xs sm:text-sm font-extrabold text-white tracking-tight">
                  {officialWhatsApp}
                </span>
              </div>
            </a>

            {/* Quick Action Icons */}
            <div className="flex items-center gap-2 text-slate-300">
              <button
                onClick={scrollToLoginCard}
                className="hover:text-white p-2 rounded-lg hover:bg-slate-800 transition cursor-pointer"
                title="Account / Sign In"
              >
                <UserIcon className="w-5 h-5" />
              </button>
              <button
                onClick={onOpenWhatsNew}
                className="hover:text-white p-2 rounded-lg hover:bg-slate-800 relative transition cursor-pointer"
                title="What's New & Updates"
              >
                <Bell className="w-5 h-5" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-amber-400" />
              </button>
              <button
                onClick={onOpenCart || onNavigateProducts}
                className="hover:text-white p-2 rounded-lg hover:bg-slate-800 relative transition cursor-pointer"
                title="Shopping Cart"
              >
                <ShoppingBag className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[10px] font-black flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </button>
              {onOpenBusinessDashboard && (
                <button
                  onClick={onOpenBusinessDashboard}
                  className="hidden xl:flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-emerald-400 px-3 py-1.5 rounded-lg text-xs font-bold border border-slate-700 transition"
                  title="Open Portal Dashboard"
                >
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  <span>Portal</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 3. RUNNING TICKER / ANNOUNCEMENT STRIP (Our Platform Value Props) */}
      <div className="bg-[#070e1b] text-slate-200 py-2.5 px-4 text-xs font-medium border-t border-b border-emerald-500/20 overflow-hidden select-none">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-6 whitespace-nowrap overflow-x-auto scrollbar-none">
          <div className="flex items-center gap-6">
            <span className="text-white font-bold flex items-center gap-1.5">
              <span>🇵🇰</span> Verified Karachi, Lahore & Faisalabad Wholesale Hubs
            </span>
            <span className="text-slate-600">|</span>
            <span className="flex items-center gap-1.5 font-bold text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              Zero Investment Required • 100% Free Dropshipper Onboarding
            </span>
            <span className="text-slate-600">|</span>
            <span className="flex items-center gap-1.5 text-slate-300">
              <span>🛡️</span> Profit Guard™ Automated Margin Protection
            </span>
            <span className="text-slate-600">|</span>
            <span className="flex items-center gap-1.5 text-amber-300 font-semibold">
              <span>⚡</span> Daily Instant EasyPaisa, JazzCash & Bank Payouts
            </span>
            <span className="text-slate-600">|</span>
            <span className="font-bold text-sky-400 flex items-center gap-1.5">
              <span>🚚</span> Automated COD Dispatch via TCS, Trax, Leopards & Call Courier
            </span>
            <span className="text-slate-600">|</span>
            <span className="flex items-center gap-1.5 text-emerald-300 font-semibold">
              <span>🔄</span> 1-Click Sync with Shopify, Daraz & WooCommerce
            </span>
          </div>
        </div>
      </div>

      {/* 4. CLEAN WHITE HORIZONTAL NAVIGATION BAR (The 9 Core Options) */}
      <nav
        aria-label="Platform Front Navigation"
        className="w-full bg-white border-b border-slate-200 shadow-xs select-none sticky top-0 z-40"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-2 flex flex-wrap items-center justify-between gap-3">
          {/* Navigation Links */}
          <div className="flex items-center gap-3 sm:gap-6 flex-wrap text-xs font-bold text-slate-800 tracking-wide">
            <button
              onClick={onNavigateHome || scrollToTop}
              className="text-emerald-700 hover:text-emerald-800 uppercase transition cursor-pointer py-1 border-b-2 border-emerald-600 font-black"
            >
              HOME
            </button>
            <button
              onClick={onNavigateProducts}
              className="text-slate-800 hover:text-emerald-600 uppercase transition cursor-pointer py-1"
            >
              PRODUCTS
            </button>
            <button
              onClick={onOpenDropshipperRegister}
              className="text-slate-800 hover:text-emerald-600 uppercase transition cursor-pointer py-1 flex items-center gap-1"
            >
              <span>DROPSHIPPER REGISTRATION</span>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded-full font-bold">FREE</span>
            </button>
            <button
              onClick={onOpenSupplierRegister}
              className="text-slate-800 hover:text-emerald-600 uppercase transition cursor-pointer py-1 flex items-center gap-1"
            >
              <span>SUPPLIER REGISTRATION</span>
              <span className="text-[10px] bg-indigo-100 text-indigo-800 px-1.5 py-0.2 rounded-full font-bold">FACTORY</span>
            </button>
            <button
              onClick={onOpenWhatsNew}
              className="hover:opacity-90 uppercase transition cursor-pointer py-1 flex items-center gap-1"
            >
              <span>WHAT'S</span>
              <span className="text-amber-600 font-black bg-amber-100 px-1.5 py-0.5 rounded-md border border-amber-300">
                NEW
              </span>
            </button>
            <button
              onClick={onOpenLearningLibrary}
              className="text-slate-800 hover:text-emerald-600 uppercase transition cursor-pointer py-1"
            >
              LEARNING LIBRARY
            </button>
            <div className="relative">
              <button
                onClick={() => setIsHelpDropdownOpen(!isHelpDropdownOpen)}
                className="text-slate-800 hover:text-emerald-600 uppercase transition cursor-pointer py-1 flex items-center gap-1"
              >
                <span>HELP & SUPPORT</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
              </button>
              {isHelpDropdownOpen && (
                <div className="absolute left-0 top-full mt-2 w-64 bg-white border border-slate-200 rounded-xl shadow-xl z-50 py-2 text-xs text-slate-700">
                  <div className="px-4 py-1.5 text-[10px] uppercase font-bold text-slate-400 border-b border-slate-100">
                    Dedicated Support Desks
                  </div>
                  <button
                    onClick={() => {
                      setIsHelpDropdownOpen(false);
                      if (onOpenHelpSupport) onOpenHelpSupport();
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-slate-50 font-bold text-emerald-800 flex items-center justify-between"
                  >
                    <span>Resellers Helpline (24/7)</span>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded">Active</span>
                  </button>
                  <button
                    onClick={() => {
                      setIsHelpDropdownOpen(false);
                      if (onOpenHelpSupport) onOpenHelpSupport();
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-slate-50 font-medium"
                  >
                    Buyers & Retail Order Desk
                  </button>
                  <button
                    onClick={() => {
                      setIsHelpDropdownOpen(false);
                      if (onOpenHelpSupport) onOpenHelpSupport();
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-slate-50 font-medium"
                  >
                    Manufacturer & Escrow Hub
                  </button>
                  <div className="border-t border-slate-100 mt-1 pt-1">
                    <button
                      onClick={() => {
                        setIsHelpDropdownOpen(false);
                        if (onOpenLearningLibrary) onOpenLearningLibrary();
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-slate-50 text-sky-700 font-semibold flex items-center gap-1.5"
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>Dropshipping Video Guides</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Action Buttons: EXPORT PRODUCTS CSV & BUSINESS DASHBOARD */}
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              id="btn-export-products-csv"
              onClick={onExportProductsCSV}
              className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-3.5 py-2 rounded-lg tracking-wider flex items-center gap-1.5 uppercase transition shadow-xs cursor-pointer border border-slate-700"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
              <span>EXPORT PRODUCTS CSV</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            <button
              type="button"
              id="btn-business-dashboard"
              onClick={onOpenBusinessDashboard}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs px-4 py-2 rounded-lg tracking-wider uppercase transition shadow-sm cursor-pointer flex items-center gap-1.5"
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>BUSINESS DASHBOARD</span>
            </button>
          </div>
        </div>
      </nav>

      {/* 5. BREADCRUMBS & MY ACCOUNT HEADING */}
      <div className="pt-8 pb-3 text-center">
        <nav
          aria-label="Breadcrumb"
          className="flex items-center justify-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-widest mb-2"
        >
          <button
            onClick={onNavigateHome || scrollToTop}
            className="hover:text-emerald-700 transition cursor-pointer"
          >
            HOME
          </button>
          <span className="text-slate-400 font-bold">&gt;</span>
          <button
            onClick={onNavigateProducts}
            className="hover:text-emerald-700 transition cursor-pointer"
          >
            WHOLESALE CATALOG
          </button>
          <span className="text-slate-400 font-bold">&gt;</span>
          <span className="text-slate-800">MY ACCOUNT & PORTAL</span>
        </nav>

        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          My Account & Portal Login
        </h1>
        <p className="text-sm text-slate-600 max-w-lg mx-auto mt-1 font-medium">
          Access Pakistan's premier dropshipping and wholesale fulfillment engine
        </p>
      </div>

      {/* 6. MAIN DUAL CARDS SECTION (Welcome Back! & New to YourMart Global?) */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8 flex flex-col justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10 items-stretch">
          {/* LEFT CARD: Welcome Back! */}
          <section
            id="card-welcome-back"
            className="bg-white rounded-2xl border border-slate-300 shadow-sm p-7 sm:p-10 flex flex-col justify-between"
          >
            <div>
              <div className="text-center mb-8">
                <h2 className="text-3xl sm:text-[32px] font-black tracking-tight text-slate-900 mb-1.5">
                  Welcome Back!
                </h2>
                <p className="text-emerald-600 font-bold text-base sm:text-lg">
                  Trusted by 10,000+ Dropshippers across Pakistan
                </p>
              </div>

              {errorMessage && (
                <div
                  id="login-error-banner"
                  className="mb-6 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-center gap-2"
                >
                  <span className="w-2 h-2 rounded-full bg-rose-500" />
                  {errorMessage}
                </div>
              )}

              {forgotPasswordNotice && (
                <div
                  id="forgot-password-banner"
                  className="mb-6 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center justify-between"
                >
                  <span>A secure password reset link has been dispatched to {email}.</span>
                  <button
                    onClick={() => setForgotPasswordNotice(false)}
                    className="text-xs font-bold text-emerald-900 underline ml-2 cursor-pointer"
                  >
                    Dismiss
                  </button>
                </div>
              )}

              <form onSubmit={handleLoginSubmit} className="space-y-5">
                {/* Email Address */}
                <div>
                  <label
                    htmlFor="login-email-input"
                    className="block text-sm font-bold text-slate-700 mb-1.5"
                  >
                    Email address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-emerald-600">
                      <Mail className="h-5 w-5" />
                    </div>
                    <input
                      id="login-email-input"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-900 text-sm transition"
                      required
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label
                    htmlFor="login-password-input"
                    className="block text-sm font-bold text-slate-700 mb-1.5"
                  >
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-emerald-600">
                      <Lock className="h-5 w-5" />
                    </div>
                    <input
                      id="login-password-input"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      className="w-full pl-11 pr-11 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-900 text-sm transition"
                      required
                    />
                    <button
                      type="button"
                      id="toggle-password-visibility"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition cursor-pointer"
                      title={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                {/* Remember Me & Forgot Password */}
                <div className="flex items-center justify-between text-sm pt-1">
                  <label className="flex items-center gap-2 cursor-pointer select-none text-slate-600 font-medium">
                    <input
                      id="remember-me-checkbox"
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                    />
                    <span>Remember me</span>
                  </label>
                  <button
                    type="button"
                    id="forgot-password-link"
                    onClick={() => setForgotPasswordNotice(true)}
                    className="text-slate-800 hover:text-emerald-600 font-bold transition cursor-pointer"
                  >
                    Forgot Password?
                  </button>
                </div>

                {/* reCAPTCHA Box */}
                <div
                  id="recaptcha-interactive-box"
                  className="p-3.5 bg-slate-50 border border-slate-300 rounded-lg flex items-center justify-between select-none shadow-2xs"
                >
                  <button
                    type="button"
                    onClick={handleCaptchaClick}
                    className="flex items-center gap-3.5 text-left focus:outline-none cursor-pointer"
                  >
                    <div className="w-7 h-7 rounded-[4px] border border-slate-300 bg-white flex items-center justify-center transition">
                      {captchaLoading ? (
                        <RotateCw className="w-4 h-4 text-emerald-600 animate-spin" />
                      ) : captchaChecked ? (
                        <Check className="w-5 h-5 text-emerald-600 stroke-[3]" />
                      ) : null}
                    </div>
                    <span className="text-sm font-semibold text-slate-800">I'm not a robot</span>
                  </button>
                  <div className="flex flex-col items-center justify-center text-[10px] text-slate-400">
                    <div className="w-7 h-7 flex items-center justify-center">
                      <ShieldCheck className="w-6 h-6 text-emerald-600" />
                    </div>
                    <span className="text-[9px] font-bold text-slate-500">Secure reCAPTCHA</span>
                    <div className="flex gap-1 text-[8px] text-slate-400">
                      <span>Privacy</span>
                      <span>•</span>
                      <span>Terms</span>
                    </div>
                  </div>
                </div>

                {/* LOGIN BUTTON */}
                <button
                  id="btn-gateway-login"
                  type="submit"
                  className="w-full py-3.5 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black tracking-wider text-base uppercase transition shadow-md active:scale-[0.99] cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>LOGIN TO PORTAL</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              </form>
            </div>

            {/* Quick Demo Access Bar */}
            <div className="mt-8 pt-6 border-t border-slate-100">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5 text-center">
                Instant 1-Click Demo Login
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                <button
                  type="button"
                  id="quick-login-reseller"
                  onClick={() => handleQuickDemo('RESELLER')}
                  className="px-2.5 py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-900 text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer"
                >
                  <Truck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Dropshipper</span>
                </button>
                <button
                  type="button"
                  id="quick-login-supplier"
                  onClick={() => handleQuickDemo('SUPPLIER')}
                  className="px-2.5 py-2.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-900 text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer"
                >
                  <Package className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Supplier</span>
                </button>
                <button
                  type="button"
                  id="quick-login-admin"
                  onClick={() => handleQuickDemo('ADMIN')}
                  className="col-span-2 sm:col-span-1 px-2.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-800 text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-slate-700" />
                  <span>Super Admin</span>
                </button>
              </div>
            </div>
          </section>

          {/* RIGHT CARD: New to YourMart Global? */}
          <section
            id="card-new-to-yourmart"
            className="bg-white rounded-2xl border border-slate-300 shadow-sm p-7 sm:p-10 flex flex-col justify-between"
          >
            <div>
              <div className="text-center mb-8">
                <h2 className="text-3xl sm:text-[32px] font-black tracking-tight text-slate-900 mb-1.5">
                  New to YourMart Global?
                </h2>
                <p className="text-slate-700 font-semibold text-base sm:text-lg">
                  Start Selling Online with{' '}
                  <span className="text-emerald-600 font-black">ZERO INVESTMENT</span>
                </p>
              </div>

              <div className="space-y-6">
                {/* 1. Dropshipper Registration Subcard */}
                <div
                  id="subcard-dropshipper-registration"
                  className="p-6 sm:p-7 rounded-2xl border border-slate-200 bg-gradient-to-br from-emerald-50/50 via-white to-white hover:border-emerald-400 hover:shadow-sm transition text-center flex flex-col items-center"
                >
                  <div className="flex items-center justify-center gap-2 mb-2 text-slate-900">
                    <span className="text-3xl" role="img" aria-label="truck">
                      🚚
                    </span>
                    <h3 className="text-xl font-black tracking-tight text-slate-900">
                      Dropshipper Registration
                    </h3>
                  </div>
                  <p className="text-slate-600 text-sm max-w-sm mb-5 leading-relaxed font-medium">
                    Sell thousands of winning wholesale products on Shopify, Daraz & Social Media with automated COD dispatch and daily payouts!
                  </p>
                  <button
                    type="button"
                    id="btn-register-dropshipper"
                    onClick={onOpenDropshipperRegister}
                    className="py-2.5 px-8 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold tracking-wider text-sm uppercase transition shadow-sm active:scale-[0.98] cursor-pointer flex items-center gap-2"
                  >
                    <span>REGISTER AS DROPSHIPPER</span>
                    <ArrowRight className="w-4 h-4 text-emerald-400" />
                  </button>
                </div>

                {/* 2. Supplier Registration Subcard */}
                <div
                  id="subcard-supplier-registration"
                  className="p-6 sm:p-7 rounded-2xl border border-slate-200 bg-gradient-to-br from-indigo-50/50 via-white to-white hover:border-indigo-400 hover:shadow-sm transition text-center flex flex-col items-center"
                >
                  <div className="flex items-center justify-center gap-2 mb-2 text-slate-900">
                    <span className="text-3xl" role="img" aria-label="package">
                      📦
                    </span>
                    <h3 className="text-xl font-black tracking-tight text-slate-900">
                      Supplier Registration
                    </h3>
                  </div>
                  <p className="text-slate-600 text-sm max-w-sm mb-5 leading-relaxed font-medium">
                    List your factory wholesale inventory, reach thousands of verified active resellers, and receive bulk COD orders nationwide.
                  </p>
                  <button
                    type="button"
                    id="btn-register-supplier"
                    onClick={onOpenSupplierRegister}
                    className="py-2.5 px-8 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold tracking-wider text-sm uppercase transition shadow-sm active:scale-[0.98] cursor-pointer flex items-center gap-2"
                  >
                    <span>REGISTER AS SUPPLIER</span>
                    <ArrowRight className="w-4 h-4 text-indigo-400" />
                  </button>
                </div>
              </div>
            </div>

            {/* Bottom Perks Banner */}
            <div className="mt-8 pt-6 border-t border-slate-100 flex flex-wrap items-center justify-around gap-4 text-xs font-bold text-slate-600">
              <span className="flex items-center gap-1.5 text-emerald-700">
                <Check className="w-4 h-4 text-emerald-500 stroke-[3]" /> 100% Free Registration
              </span>
              <span className="flex items-center gap-1.5 text-emerald-700">
                <Check className="w-4 h-4 text-emerald-500 stroke-[3]" /> Daily EasyPaisa & Bank Payouts
              </span>
              <span className="flex items-center gap-1.5 text-emerald-700">
                <Check className="w-4 h-4 text-emerald-500 stroke-[3]" /> Auto COD Verification
              </span>
            </div>
          </section>
        </div>
      </main>

      {/* 7. FOOTER (Our Platform Branding & Real Information) */}
      <footer
        id="auth-gateway-footer"
        className="bg-[#0b1329] text-slate-300 border-t border-slate-800 pt-12 pb-8 px-4 sm:px-6 lg:px-8 mt-auto"
      >
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 pb-10 border-b border-slate-800">
            {/* Col 1: About Platform */}
            <div className="lg:col-span-2">
              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white font-black text-sm shadow-md">
                  YM
                </div>
                <div>
                  <span className="text-xl font-black tracking-tight text-white">YOURMART</span>
                  <span className="text-emerald-400 text-xl font-bold ml-1">GLOBAL</span>
                </div>
              </div>
              <p className="text-xs text-slate-400 mb-4 leading-relaxed max-w-sm">
                Pakistan’s premier B2B wholesale and automated dropshipping engine. Connecting verified Karachi & Lahore wholesale factories with Shopify, Daraz, and social commerce resellers nationwide.
              </p>
              <div className="space-y-1 text-xs text-slate-300 font-medium">
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Helpline (Resellers): {officialPhone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
                  <span>WhatsApp Desk: {officialWhatsApp}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Support Email: {officialEmail}</span>
                </div>
              </div>
            </div>

            {/* Col 2: Reseller Tools */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-3">
                For Dropshippers
              </h4>
              <ul className="space-y-2 text-xs text-slate-400">
                <li>
                  <button
                    onClick={onOpenDropshipperRegister}
                    className="hover:text-white transition cursor-pointer"
                  >
                    Register as Reseller
                  </button>
                </li>
                <li>
                  <button
                    onClick={onNavigateProducts}
                    className="hover:text-white transition cursor-pointer"
                  >
                    Browse Wholesale Products
                  </button>
                </li>
                <li>
                  <button
                    onClick={onOpenWhatsNew}
                    className="hover:text-white transition cursor-pointer"
                  >
                    Profit Guard™ Protection
                  </button>
                </li>
                <li>
                  <button
                    onClick={onOpenLearningLibrary}
                    className="hover:text-white transition cursor-pointer"
                  >
                    Shopify & Daraz Sync Guides
                  </button>
                </li>
              </ul>
            </div>

            {/* Col 3: Supplier Hub */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-3">
                For Suppliers
              </h4>
              <ul className="space-y-2 text-xs text-slate-400">
                <li>
                  <button
                    onClick={onOpenSupplierRegister}
                    className="hover:text-white transition cursor-pointer"
                  >
                    Factory Supplier Onboarding
                  </button>
                </li>
                <li>
                  <button
                    onClick={onOpenHelpSupport}
                    className="hover:text-white transition cursor-pointer"
                  >
                    Bulk Sourcing Desk
                  </button>
                </li>
                <li>
                  <button
                    onClick={onOpenLearningLibrary}
                    className="hover:text-white transition cursor-pointer"
                  >
                    Escrow & Settlement Policy
                  </button>
                </li>
                <li>
                  <button
                    onClick={onExportProductsCSV}
                    className="hover:text-white transition cursor-pointer"
                  >
                    Download Wholesale CSV
                  </button>
                </li>
              </ul>
            </div>

            {/* Col 4: 24/7 Helpline */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-3">
                24/7 Dedicated Support
              </h4>
              <p className="text-xs text-slate-400 mb-3 leading-relaxed">
                Assistance with catalog sourcing, courier COD remissions, wallet payouts, and multi-store connections.
              </p>
              <button
                type="button"
                onClick={onOpenHelpSupport}
                className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition cursor-pointer shadow-sm"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Contact Helplines</span>
              </button>
            </div>
          </div>

          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-3">
            <p>© {new Date().getFullYear()} YourMart Global Pakistan. All rights reserved.</p>
            <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-[11px]">
              <span>Nationwide Logistics: TCS • Leopards • Trax • Call Courier</span>
              <span>•</span>
              <span className="text-emerald-400 font-semibold">100% Cash On Delivery</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
