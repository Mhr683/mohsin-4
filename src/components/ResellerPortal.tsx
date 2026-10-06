import React, { useState } from 'react';
import {
  Search,
  Heart,
  Eye,
  Store,
  Check,
  Tag,
  Star,
  Truck,
  Video,
  ShieldCheck,
  ShoppingCart,
  FileSpreadsheet,
  Flame,
  RefreshCw,
  Package,
} from 'lucide-react';
import { Product, ProfitGuardConfig, User, StoreIntegration, BankTransferDetails, Order } from '../types';
import { ProductOverview } from './ProductOverview';
import { WinningProductsView } from './WinningProductsView';
import { OrdersManager } from './OrdersManager';

interface ResellerPortalProps {
  currentUser: User;
  products: Product[];
  profitGuardConfig: ProfitGuardConfig;
  bankTransferDetails?: BankTransferDetails;
  stores: StoreIntegration[];
  onPlaceSampleOrder: (
    product: Product,
    sellingPrice: number,
    customerDetails: {
      customerName: string;
      customerPhone?: string;
      customerCity?: string;
      customerAddress?: string;
    }
  ) => void;
  onPushToStore: (product: Product, storePlatform: string, sellingPrice: number) => void;
  onOpenStoreSyncModal: () => void;
  onOpenStoreFront?: (storeId: string) => void;
  onOpenVerifiedRegistration?: () => void;
  onAddToCart?: (product: Product, quantity: number, variant?: string) => void;
  onOpenBulkImport?: () => void;
  // Integrated Winning Products & Orders & Dispatch props
  initialSubSection?: 'all-products' | 'winning-products' | 'orders-dispatch';
  orders?: Order[];
  onOpenAdCopyModal?: (product: Product) => void;
  onVerifyCod?: (orderId: string) => void;
  onDispatchOrder?: (orderId: string, courierName: string, trackingNumber?: string) => void;
  onDeliverOrder?: (orderId: string) => void;
  onCancelOrder?: (orderId: string, reason?: string) => void;
  onSendMessage?: (orderId: string, text: string) => void;
  onOpenBatchPrint?: () => void;
  onBulkDispatchOrders?: (dispatches: { orderId: string; courierName: string; trackingNumber: string }[]) => void;
  onOpenWhatsAppVerification?: (order: Order) => void;
  onOpenCourierBooking?: (order: Order) => void;
  onOpenThermalSlip?: (order: Order) => void;
}

export const ResellerPortal: React.FC<ResellerPortalProps> = ({
  currentUser,
  products,
  profitGuardConfig,
  bankTransferDetails,
  stores,
  onPlaceSampleOrder,
  onPushToStore,
  onOpenStoreSyncModal,
  onOpenStoreFront,
  onOpenVerifiedRegistration,
  onAddToCart,
  onOpenBulkImport,
  initialSubSection = 'all-products',
  orders = [],
  onOpenAdCopyModal,
  onVerifyCod,
  onDispatchOrder,
  onDeliverOrder,
  onCancelOrder,
  onSendMessage,
  onOpenBatchPrint,
  onBulkDispatchOrders,
  onOpenWhatsAppVerification,
  onOpenCourierBooking,
  onOpenThermalSlip,
}) => {
  const [activeSubSection, setActiveSubSection] = useState<'all-products' | 'winning-products' | 'orders-dispatch'>(
    initialSubSection
  );

  React.useEffect(() => {
    setActiveSubSection(initialSubSection);
  }, [initialSubSection]);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [customPrices, setCustomPrices] = useState<Record<string, number>>({});
  const [favorites, setFavorites] = useState<Record<string, boolean>>({});
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [pushSuccess, setPushSuccess] = useState<string | null>(null);

  // Selected Product for Dedicated Overview View (Exact Screenshot Interface)
  const [selectedProductForOverview, setSelectedProductForOverview] = useState<Product | null>(null);

  // Filter ONLY Active products for resellers
  const activeProducts = products.filter(
    (p) => p.isActive !== false || currentUser?.role === 'ADMIN'
  );

  const connectedStores = stores.filter((s) => s.connected);

  const getCustomPrice = (p: Product) => {
    return customPrices[p.id] !== undefined ? customPrices[p.id] : p.recSellingPricePKR;
  };

  const toggleFavorite = (e: React.MouseEvent, productId: string) => {
    e.stopPropagation();
    setFavorites((prev) => ({ ...prev, [productId]: !prev[productId] }));
  };

  const filteredProducts = activeProducts.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.brand && p.brand.toLowerCase().includes(searchQuery.toLowerCase())) ||
      p.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCat = selectedCategory === 'ALL' || p.category === selectedCategory;
    const matchesFav = !showFavoritesOnly || favorites[p.id];
    return matchesSearch && matchesCat && matchesFav;
  });

  // If a product is clicked, render the exact Product Overview interface requested
  if (selectedProductForOverview) {
    return (
      <ProductOverview
        product={selectedProductForOverview}
        allProducts={activeProducts}
        currentUser={currentUser}
        profitGuardConfig={profitGuardConfig}
        bankTransferDetails={bankTransferDetails}
        stores={stores}
        onBackToProducts={() => setSelectedProductForOverview(null)}
        onSelectProduct={(p) => setSelectedProductForOverview(p)}
        onPlaceSampleOrder={onPlaceSampleOrder}
        onPushToStore={onPushToStore}
        onOpenStoreFront={onOpenStoreFront}
        onAddToCart={onAddToCart}
      />
    );
  }

  const categories = [
    'ALL',
    'Personal Care & Health',
    'Packaging & Supplies',
    'Fashion & Apparel',
    'Consumer Electronics',
    'Kitchen & Dining',
    'Personal Care',
    'Home & Kitchen Essentials',
  ];

  const pendingOrdersCount = orders.filter((o) => o.status === 'PENDING_VERIFICATION').length;

  return (
    <div className="space-y-6">
      {/* Unified Products Hub Navigation Bar (All Products • Winning Products & Ads • Orders & Dispatch) */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-slate-900 p-2 sm:p-2.5 border border-slate-800 shadow-lg">
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setActiveSubSection('all-products')}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-bold transition cursor-pointer ${
              activeSubSection === 'all-products'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950/50'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Package className="h-4 w-4 shrink-0" />
            <span>All Products Catalog</span>
            <span className="rounded-full bg-black/25 px-2 py-0.5 text-[10px] font-extrabold">
              {activeProducts.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubSection('winning-products')}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-bold transition cursor-pointer ${
              activeSubSection === 'winning-products'
                ? 'bg-violet-600 text-white shadow-md shadow-violet-950/50'
                : 'bg-slate-800/80 text-violet-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Flame className={`h-4 w-4 shrink-0 ${activeSubSection === 'winning-products' ? 'text-amber-300' : 'text-amber-400'}`} />
            <span>Winning Products & Ads</span>
            <span className="rounded bg-amber-400 text-[9px] font-black text-slate-950 px-1.5 py-0.5">
              HOT
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubSection('orders-dispatch')}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-bold transition cursor-pointer ${
              activeSubSection === 'orders-dispatch'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950/50'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <RefreshCw className="h-4 w-4 shrink-0" />
            <span>Orders & Dispatch</span>
            {pendingOrdersCount > 0 && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-[10px] font-black text-slate-950">
                {pendingOrdersCount}
              </span>
            )}
          </button>
        </div>

        <div className="hidden xl:flex items-center gap-2 pr-2 text-[11px] font-medium text-slate-400">
          <span>Products Hub:</span>
          <span className="text-emerald-400 font-bold">Sourcing, Viral Ads & Live COD Dispatch</span>
        </div>
      </div>

      {/* Render Winning Products & Ads Section */}
      {activeSubSection === 'winning-products' && (
        <WinningProductsView
          products={products}
          onSelectProduct={(p) => {
            if (onAddToCart) {
              onAddToCart(p, 1);
            } else {
              setSelectedProductForOverview(p);
            }
          }}
          onOpenAdCopyModal={(p) => {
            if (onOpenAdCopyModal) onOpenAdCopyModal(p);
          }}
          onOpenStoreFront={onOpenStoreFront}
        />
      )}

      {/* Render Orders & Dispatch Section */}
      {activeSubSection === 'orders-dispatch' && onVerifyCod && onDispatchOrder && onDeliverOrder && onCancelOrder && (
        <OrdersManager
          currentUser={currentUser}
          orders={orders}
          onVerifyCod={onVerifyCod}
          onDispatchOrder={onDispatchOrder}
          onDeliverOrder={onDeliverOrder}
          onCancelOrder={onCancelOrder}
          onSendMessage={onSendMessage ? (orderId, msg) => onSendMessage(orderId, typeof msg === 'string' ? msg : msg.text) : undefined}
          onOpenBatchPrint={onOpenBatchPrint}
          onBulkDispatchOrders={onBulkDispatchOrders}
          onOpenWhatsAppVerification={onOpenWhatsAppVerification}
          onOpenCourierBooking={onOpenCourierBooking}
          onOpenThermalSlip={onOpenThermalSlip}
        />
      )}

      {/* Render Standard All Products Catalog Section */}
      {activeSubSection === 'all-products' && (
        <>
          {/* Reseller Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-orange-500/20 bg-gradient-to-r from-orange-950/40 via-slate-900 to-slate-900 p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-orange-600/30 px-3 py-0.5 text-xs font-bold text-orange-400 border border-orange-500/40">
                Pakistan Wholesale & Sourcing Hub
              </span>
              <span className="text-xs text-slate-400">Zero-Working Capital Reselling</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              Sourcing Catalog & Instant Cash on Delivery Dispatch
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Wholesale rates par products select karein, apna profit margin set karein aur seedha customer ke address par COD dispatch karwayein.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={onOpenStoreSyncModal}
              className="flex items-center gap-2 rounded-xl bg-orange-600 hover:bg-orange-500 px-4 py-2.5 text-xs font-bold text-white shadow-lg transition"
            >
              <Store className="h-4 w-4" />
              <span>Channels ({connectedStores.length} Connected)</span>
            </button>

            <button
              onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
              className={`flex items-center gap-1.5 rounded-xl border px-3.5 py-2.5 text-xs font-bold transition ${
                showFavoritesOnly
                  ? 'border-rose-500 bg-rose-950/40 text-rose-300'
                  : 'border-slate-700 bg-slate-800/80 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <Heart className={`h-3.5 w-3.5 ${showFavoritesOnly ? 'fill-rose-500 text-rose-500' : ''}`} />
              <span>Wishlist ({Object.values(favorites).filter(Boolean).length})</span>
            </button>
          </div>
        </div>
      </div>

      {/* Push Notification */}
      {pushSuccess && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-600 bg-emerald-950/90 px-4 py-3 text-xs font-bold text-emerald-300 shadow-lg">
          <Check className="h-4 w-4 text-emerald-400" />
          <span>{pushSuccess}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search products (Toko D3, Bubble Wrap, Girls Co-ord Set, Earbuds, Trimmer)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-slate-700 bg-slate-950 pl-10 pr-4 py-2 text-xs sm:text-sm text-slate-200 placeholder-slate-500 focus:border-orange-500 focus:outline-none transition"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                selectedCategory === cat
                  ? 'bg-orange-600 text-white shadow-sm'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200'
              }`}
            >
              {cat === 'ALL' ? 'All Products' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Exact Grid matching User Reference Image */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
        {filteredProducts.map((p) => {
          const isFav = !!favorites[p.id];
          const displayPrice = getCustomPrice(p);

          return (
            <div
              key={p.id}
              onClick={() => setSelectedProductForOverview(p)}
              className="bg-white rounded-2xl border border-slate-200/90 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-lg transition-all duration-200 flex flex-col justify-between overflow-hidden group cursor-pointer"
            >
              {/* Image Area with Heart Top Right */}
              <div className="relative aspect-square w-full bg-slate-50/70 p-2 sm:p-3 flex items-center justify-center overflow-hidden">
                {/* Heart Wishlist Button */}
                <button
                  type="button"
                  onClick={(e) => toggleFavorite(e, p.id)}
                  aria-label="Add to Wishlist"
                  className="absolute top-2.5 right-2.5 h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-white/95 border border-slate-200/90 shadow-sm flex items-center justify-center text-slate-400 hover:text-rose-500 hover:border-rose-300 transition-colors z-10"
                >
                  <Heart
                    className={`h-3.5 w-3.5 sm:h-4 sm:w-4 transition-colors ${
                      isFav ? 'fill-rose-500 text-rose-500' : 'text-slate-400'
                    }`}
                  />
                </button>

                {/* Product Image */}
                <img
                  src={p.image}
                  alt={p.name}
                  className="h-full w-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
              </div>

              {/* Card Body */}
              <div className="p-3 sm:p-3.5 flex flex-col flex-1 justify-between gap-2.5">
                {/* Title (2 lines clamp) */}
                <h3
                  className="text-slate-800 text-xs sm:text-[13px] font-semibold leading-snug tracking-tight line-clamp-2 hover:text-orange-600 transition-colors"
                  title={p.name}
                >
                  {p.name}
                </h3>

                {/* Ratings & Store Performance Section (As requested by user) */}
                <div className="space-y-1.5 pt-0.5 border-t border-slate-100">
                  {/* Store Name & Single Visit Store Link */}
                  <div className="flex items-center justify-between text-[11px] gap-1">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onOpenStoreFront) {
                          onOpenStoreFront(p.storeId || 'store-oshi');
                        }
                      }}
                      className="flex items-center gap-1.5 font-bold text-slate-800 hover:text-emerald-700 truncate max-w-full bg-slate-100 hover:bg-emerald-50 px-2 py-0.5 rounded-md transition cursor-pointer"
                      title={`Visit ${p.storeName || p.supplierName || 'Store'} (Order multiple items in 1 parcel)`}
                    >
                      <Store className="h-3 w-3 text-emerald-600 flex-shrink-0" />
                      <span className="truncate">{p.storeName || p.supplierName || 'Verified Store'}</span>
                    </button>
                  </div>

                  {/* Product Rating & Reviews */}
                  <div className="flex items-center justify-between text-[10px]">
                    <div className="flex items-center gap-1 text-slate-500">
                      <span className="flex items-center gap-0.5 text-amber-600 font-bold">
                        <Star className="h-2.5 w-2.5 fill-amber-400 text-amber-400" />
                        <span>{p.rating || 4.8}</span>
                      </span>
                      <span>({p.reviewsCount || Math.floor((p.salesCount || 100) * 0.15)} reviews)</span>
                    </div>

                    {p.videoUrl && (
                      <span className="flex items-center gap-0.5 text-purple-600 font-bold bg-purple-50 px-1 py-0.2 rounded text-[9px]">
                        <Video className="h-2.5 w-2.5" />
                        <span>Video</span>
                      </span>
                    )}
                  </div>

                  {/* Delivery Time Rating */}
                  <div className="flex items-center gap-1 text-[10px] text-emerald-700 font-semibold bg-emerald-50/90 border border-emerald-200/60 rounded-md px-1.5 py-0.5">
                    <Truck className="h-3 w-3 text-emerald-600 flex-shrink-0" />
                    <span className="truncate">
                      {p.deliveryRating || '⚡ 2-3 Days (98% On-Time)'}
                    </span>
                  </div>
                </div>

                {/* Bottom Row: Price on left, Orange Eye Button on right */}
                <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                  <div>
                    <span className="text-[10px] text-slate-400 block leading-none font-medium">Selling Price</span>
                    <div className="text-slate-900 font-bold text-sm sm:text-base font-sans tracking-tight">
                      PKR {displayPrice.toLocaleString()}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {onAddToCart && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onAddToCart(p, 1);
                        }}
                        className="h-8 w-8 sm:h-9 sm:w-9 rounded-xl bg-indigo-50 hover:bg-indigo-600 hover:text-white text-indigo-600 active:scale-95 flex items-center justify-center border border-indigo-200 transition-all cursor-pointer"
                        title="Add to Store Cart (Single Parcel by Weight)"
                      >
                        <ShoppingCart className="h-4 w-4" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedProductForOverview(p);
                      }}
                      className="h-8 w-8 sm:h-9 sm:w-9 rounded-xl bg-[#e35614] hover:bg-[#cf4a0e] active:scale-95 text-white flex items-center justify-center shadow-sm cursor-pointer transition-all"
                      title="View Product Overview & Order"
                    >
                      <Eye className="h-4 w-4 stroke-[2.5]" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredProducts.length === 0 && (
        <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-12 text-center text-slate-400">
          <p className="text-base font-bold text-slate-200">No products found matching your search</p>
          <p className="text-xs mt-1">Try resetting filters or searching with another keyword.</p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('ALL');
              setShowFavoritesOnly(false);
            }}
            className="mt-4 rounded-xl bg-orange-600 px-4 py-2 text-xs font-bold text-white hover:bg-orange-500"
          >
            Clear All Filters
          </button>
        </div>
      )}
        </>
      )}
    </div>
  );
};
