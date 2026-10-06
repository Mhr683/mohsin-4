import React, { useState, useEffect } from 'react';
import {
  ShoppingCart,
  X,
  Trash2,
  Plus,
  Minus,
  Truck,
  CheckCircle2,
  Store as StoreIcon,
  ShieldCheck,
  ArrowRight,
  Package,
  AlertCircle,
  Scale,
  Sparkles,
} from 'lucide-react';
import { Product, ProfitGuardConfig, User } from '../types';
import { calculateRealProfit } from '../utils/realProfitCalculator';
import { ShippingRatePreview } from './ShippingRatePreview';
import { PAKISTAN_CITIES as ALL_PK_CITIES } from '../utils/pakistanLocations';

export interface CartItem {
  product: Product;
  quantity: number;
  selectedVariant?: string;
  resellerSellingPrice?: number;
}

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onClearCart: () => void;
  profitGuardConfig: ProfitGuardConfig;
  currentUser: User;
  onCheckoutOrder: (orderPayload: {
    items: { product: Product; quantity: number }[];
    totalAmount: number;
    customerDetails: {
      customerName: string;
      customerPhone: string;
      customerCity: string;
      customerAddress: string;
    };
    deliveryCharges: number;
    totalWeightKg: number;
  }) => void;
}

const PAKISTAN_CITIES = [
  'Karachi',
  'Lahore',
  'Islamabad',
  'Rawalpindi',
  'Faisalabad',
  'Multan',
  'Peshawar',
  'Quetta',
  'Sialkot',
  'Gujranwala',
  'Hyderabad',
  'Bahawalpur',
  'Sargodha',
  'Abbottabad',
  'Sukkur',
  'Mardan',
];

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  profitGuardConfig,
  currentUser,
  onCheckoutOrder,
}) => {
  const [step, setStep] = useState<'CART' | 'CHECKOUT' | 'SUCCESS'>('CART');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerCity, setCustomerCity] = useState('Karachi');
  const [customerAddress, setCustomerAddress] = useState('');
  const [customSellingPrices, setCustomSellingPrices] = useState<Record<string, number>>({});
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && cartItems.length === 0 && step === 'CHECKOUT') {
      setStep('CART');
    }
  }, [isOpen, cartItems.length, step]);

  if (!isOpen) return null;

  const getUnitSellingPrice = (item: CartItem) => {
    if (customSellingPrices[item.product.id] !== undefined) {
      return customSellingPrices[item.product.id];
    }
    if (item.resellerSellingPrice !== undefined) {
      return item.resellerSellingPrice;
    }
    return item.product.recSellingPricePKR || item.product.supplierCostPKR || 1500;
  };

  const getUnitWholesaleCost = (product: Product) => {
    return product.supplierCostPKR || 1000;
  };

  // Weight-based consolidated parcel calculation
  const totalItemsCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalWeightKg = Number(
    cartItems
      .reduce((sum, item) => sum + (item.product.weightKg || 0.5) * item.quantity, 0)
      .toFixed(2)
  );

  // Base 1kg = Rs 200, each additional kg = Rs 90
  const deliveryCharges =
    cartItems.length === 0
      ? 0
      : totalWeightKg <= 1
      ? 200
      : 200 + Math.ceil(totalWeightKg - 1) * 90;

  const totalWholesalePKR = cartItems.reduce(
    (sum, item) => sum + getUnitWholesaleCost(item.product) * item.quantity,
    0
  );

  const totalSellingPKR = cartItems.reduce(
    (sum, item) => sum + getUnitSellingPrice(item) * item.quantity,
    0
  );

  const processingFeePKR = cartItems.length > 0 ? profitGuardConfig.processingFeePKR ?? 30 : 0;
  const platformFeePKR = Math.round(
    totalSellingPKR * ((profitGuardConfig.platformFeePct ?? 2.0) / 100)
  );

  const customerTotalCodPKR = totalSellingPKR + deliveryCharges;
  const estimatedNetProfitPKR = Math.max(
    0,
    totalSellingPKR - totalWholesalePKR - processingFeePKR - platformFeePKR
  );

  const realProfit = calculateRealProfit({
    sellingPricePKR: totalSellingPKR,
    productCostPKR: totalWholesalePKR,
    shippingCostPKR: deliveryCharges,
    platformFeePct: profitGuardConfig.platformFeePct ?? 2.0,
    expectedRtoRatePct: 10,
    estimatedAdCostPKR: 0,
  });

  const [showRateEngine, setShowRateEngine] = useState(false);

  const storeName =
    cartItems[0]?.product.storeName ||
    cartItems[0]?.product.supplierName ||
    'Verified Factory Store';

  const handleConfirmOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !customerPhone.trim() || !customerAddress.trim()) {
      setErrorMsg('Please fill in complete customer name, WhatsApp phone, and delivery address.');
      return;
    }

    onCheckoutOrder({
      items: cartItems.map((i) => ({ product: i.product, quantity: i.quantity })),
      totalAmount: customerTotalCodPKR,
      customerDetails: {
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        customerCity,
        customerAddress: customerAddress.trim(),
      },
      deliveryCharges,
      totalWeightKg,
    });

    onClearCart();
    setStep('SUCCESS');
    setTimeout(() => {
      setStep('CART');
      setCustomerName('');
      setCustomerPhone('');
      setCustomerAddress('');
      onClose();
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/75 backdrop-blur-sm animate-fadeIn">
      <div className="relative flex h-full w-full max-w-xl flex-col border-l border-slate-800 bg-slate-900 text-slate-100 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 bg-slate-950/90 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              <ShoppingCart className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-black text-white">Consolidated Store Cart</h2>
                <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-[11px] font-bold text-emerald-300 border border-emerald-500/30">
                  {totalItemsCount} {totalItemsCount === 1 ? 'Item' : 'Items'}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Single-store parcel bundling • Weight-based courier calculation
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-xl bg-slate-800 p-2 text-slate-400 hover:bg-slate-700 hover:text-white transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="mx-6 mt-4 flex items-start gap-2.5 rounded-xl border border-rose-500/40 bg-rose-950/60 p-3 text-xs text-rose-200">
            <AlertCircle className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
            <div className="flex-1">{errorMsg}</div>
            <button onClick={() => setErrorMsg(null)} className="text-rose-400 hover:text-white">
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {step === 'SUCCESS' ? (
            <div className="flex h-full flex-col items-center justify-center text-center space-y-4 py-12">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                <CheckCircle2 className="h-10 w-10 animate-bounce" />
              </div>
              <h3 className="text-xl font-black text-white">Consolidated Parcel Booked!</h3>
              <p className="text-xs text-slate-300 max-w-sm leading-relaxed">
                Your multi-item order has been created and routed to Orders & Dispatch for verification.
              </p>
            </div>
          ) : cartItems.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center space-y-4 py-12">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-800/80 text-slate-500 border border-slate-700">
                <ShoppingCart className="h-8 w-8" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-200">Your Cart is Empty</h3>
                <p className="text-xs text-slate-400 max-w-xs">
                  Add multiple products from the catalog to ship them in a single consolidated parcel!
                </p>
              </div>
              <button
                onClick={onClose}
                className="rounded-xl bg-emerald-500 px-5 py-2.5 text-xs font-bold text-slate-950 hover:bg-emerald-400 transition"
              >
                Explore Products Catalog
              </button>
            </div>
          ) : step === 'CART' ? (
            <div className="space-y-5">
              {/* Store Banner */}
              <div className="flex items-center justify-between rounded-xl border border-emerald-500/30 bg-emerald-950/30 px-4 py-2.5 text-xs">
                <div className="flex items-center gap-2">
                  <StoreIcon className="h-4 w-4 text-emerald-400" />
                  <span className="font-bold text-emerald-200">{storeName}</span>
                </div>
                <button
                  onClick={onClearCart}
                  className="flex items-center gap-1 text-rose-400 hover:text-rose-300 font-semibold"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Clear All</span>
                </button>
              </div>

              {/* Items List */}
              <div className="space-y-3">
                {cartItems.map((item) => {
                  const unitWholesale = getUnitWholesaleCost(item.product);
                  const unitSelling = getUnitSellingPrice(item);

                  return (
                    <div
                      key={item.product.id}
                      className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4 space-y-3 hover:border-slate-700 transition"
                    >
                      <div className="flex items-start gap-3">
                        <img
                          src={item.product.image}
                          alt={item.product.name}
                          className="h-16 w-16 rounded-xl object-cover border border-slate-800 shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="text-xs font-bold text-white truncate">
                              {item.product.name}
                            </h4>
                            <button
                              onClick={() => onRemoveItem(item.product.id)}
                              className="text-slate-500 hover:text-rose-400 transition"
                              title="Remove item"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>

                          <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-slate-400">
                            <span>SKU: {item.product.sku}</span>
                            <span>•</span>
                            <span className="text-emerald-400 font-semibold">
                              Wholesale: PKR {unitWholesale.toLocaleString()}
                            </span>
                            <span>•</span>
                            <span>{item.product.weightKg || 0.5} kg/unit</span>
                          </div>

                          <div className="mt-3 flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800/80">
                            {/* Quantity */}
                            <div className="flex items-center gap-2">
                              <span className="text-[11px] text-slate-400">Qty:</span>
                              <div className="flex items-center rounded-lg border border-slate-700 bg-slate-900">
                                <button
                                  type="button"
                                  onClick={() => onUpdateQuantity(item.product.id, item.quantity - 1)}
                                  className="p-1.5 text-slate-300 hover:text-white"
                                >
                                  <Minus className="h-3 w-3" />
                                </button>
                                <span className="px-2.5 text-xs font-bold text-white">
                                  {item.quantity}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
                                  className="p-1.5 text-slate-300 hover:text-white"
                                >
                                  <Plus className="h-3 w-3" />
                                </button>
                              </div>
                            </div>

                            {/* Selling Price */}
                            <div className="flex items-center gap-2">
                              <label className="text-[11px] font-semibold text-slate-300">
                                Selling (PKR):
                              </label>
                              <input
                                type="number"
                                min={unitWholesale}
                                value={unitSelling}
                                onChange={(e) =>
                                  setCustomSellingPrices((prev) => ({
                                    ...prev,
                                    [item.product.id]: Math.max(0, Number(e.target.value)),
                                  }))
                                }
                                className="w-24 rounded-lg border border-emerald-500/40 bg-slate-900 px-2.5 py-1 text-xs font-bold text-emerald-300 focus:border-emerald-400 focus:outline-none"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Financial Breakdown */}
              <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4 space-y-2.5 text-xs">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="font-bold text-slate-300 flex items-center gap-1.5">
                    <ShieldCheck className="h-4 w-4 text-emerald-400" />
                    <span>Consolidated Parcel Breakdown</span>
                  </span>
                  <span className="flex items-center gap-1 rounded bg-slate-800 px-2 py-0.5 text-[10px] font-bold text-slate-300">
                    <Scale className="h-3 w-3 text-emerald-400" />
                    {totalWeightKg} kg
                  </span>
                </div>

                <div className="flex justify-between text-slate-400">
                  <span>Wholesale Base Cost ({totalItemsCount} units):</span>
                  <span className="font-semibold text-slate-200">
                    PKR {totalWholesalePKR.toLocaleString()}
                  </span>
                </div>

                <div className="flex justify-between text-slate-400">
                  <span>Selling Subtotal:</span>
                  <span className="font-semibold text-slate-200">
                    PKR {totalSellingPKR.toLocaleString()}
                  </span>
                </div>

                <div className="flex justify-between text-slate-400">
                  <span>Consolidated Weight Delivery Fee:</span>
                  <span className="font-semibold text-slate-200">
                    PKR {deliveryCharges.toLocaleString()}
                  </span>
                </div>

                <div className="flex justify-between text-slate-400">
                  <span>Platform Clearance (2%) + Processing:</span>
                  <span className="font-semibold text-slate-200">
                    PKR {(platformFeePKR + processingFeePKR).toLocaleString()}
                  </span>
                </div>

                <div className="flex justify-between border-t border-slate-800 pt-2 text-sm font-bold text-white">
                  <span>Customer Total COD Collectable:</span>
                  <span className="text-amber-400">PKR {customerTotalCodPKR.toLocaleString()}</span>
                </div>

                <div className="flex justify-between rounded-xl bg-emerald-950/60 border border-emerald-500/30 p-2.5 font-black text-emerald-300">
                  <span>Your Estimated Net Profit:</span>
                  <span>PKR {estimatedNetProfitPKR.toLocaleString()}</span>
                </div>

                {/* Real Profit Engine Diagnostics */}
                <div className="bg-slate-950/70 p-2.5 rounded-xl border border-slate-800 text-[11px] space-y-1">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-emerald-400" /> Real Net (w/ 10% RTO Buffer):
                    </span>
                    <span className="font-mono font-bold text-emerald-400">
                      PKR {realProfit.estimatedRealNetProfitPKR.toLocaleString()} ({realProfit.realNetProfitMarginPct}%)
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-slate-500 text-[10px]">
                    <span>Break-even Price Floor:</span>
                    <span className="font-mono text-slate-300">PKR {realProfit.breakEvenSellingPricePKR.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* CHECKOUT FORM */
            <form id="cart-checkout-form" onSubmit={handleConfirmOrder} className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-black text-white uppercase tracking-wider">
                  Customer COD Delivery Details
                </h3>
                <button
                  type="button"
                  onClick={() => setStep('CART')}
                  className="text-xs font-bold text-emerald-400 hover:underline"
                >
                  ← Back to Cart
                </button>
              </div>

              {/* Rate Engine Toggle */}
              <div>
                <button
                  type="button"
                  onClick={() => setShowRateEngine(!showRateEngine)}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 hover:border-slate-700 transition"
                >
                  <span className="flex items-center gap-1.5 font-semibold text-emerald-400">
                    <Truck className="w-4 h-4" />
                    <span>{showRateEngine ? 'Hide Courier Rates' : 'Check Live Pakistan Courier Rates (Trax/TCS/PostEx)'}</span>
                  </span>
                  <span className="text-[11px] font-mono text-slate-400">{customerCity} ({totalWeightKg}kg)</span>
                </button>

                {showRateEngine && (
                  <div className="mt-2 animate-fadeIn">
                    <ShippingRatePreview
                      originCity="Lahore"
                      destinationCity={customerCity}
                      weightKg={totalWeightKg}
                      codAmountPKR={customerTotalCodPKR}
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Customer Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Muhammad Bilal Khan"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-xs text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    WhatsApp Mobile Number *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="0300-1234567"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-xs text-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Destination City *
                  </label>
                  <select
                    value={customerCity}
                    onChange={(e) => setCustomerCity(e.target.value)}
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-xs text-white focus:border-emerald-500 focus:outline-none"
                  >
                    {PAKISTAN_CITIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Complete House / Street / Landmark Address *
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="House #, Street #, Sector/Block, Near Famous Landmark..."
                  value={customerAddress}
                  onChange={(e) => setCustomerAddress(e.target.value)}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 p-3 text-xs text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>
            </form>
          )}
        </div>

        {/* Footer */}
        {cartItems.length > 0 && step !== 'SUCCESS' && (
          <div className="border-t border-slate-800 bg-slate-950 p-5">
            {step === 'CART' ? (
              <button
                type="button"
                onClick={() => setStep('CHECKOUT')}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-500 hover:bg-emerald-400 py-3.5 text-sm font-black text-slate-950 shadow-lg transition cursor-pointer"
              >
                <span>Proceed to Checkout (PKR {customerTotalCodPKR.toLocaleString()})</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                type="submit"
                form="cart-checkout-form"
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-500 hover:bg-emerald-400 py-3.5 text-sm font-black text-slate-950 shadow-lg transition cursor-pointer"
              >
                <Truck className="h-4 w-4" />
                <span>
                  Place Consolidated Order (PKR {customerTotalCodPKR.toLocaleString()})
                </span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
