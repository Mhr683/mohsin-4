import React, { useState } from 'react';
import {
  X,
  PlusCircle,
  Package,
  DollarSign,
  TrendingUp,
  Tag,
  CheckCircle2,
  Image as ImageIcon,
} from 'lucide-react';
import { Product, ProfitGuardConfig } from '../types';

interface AdminAddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddProduct: (productData: Omit<Product, 'id'>) => void;
  profitGuardConfig?: ProfitGuardConfig;
}

const CATEGORIES = [
  'Electronics & Gadgets',
  'Fashion & Apparel',
  'Home & Kitchen',
  'Beauty & Personal Care',
  'Watches & Wearables',
  'Jewelry & Accessories',
  'Footwear & Shoes',
  'Mobile & Computer Accessories',
  'Health & Fitness',
  'Baby & Kids',
];

export const AdminAddProductModal: React.FC<AdminAddProductModalProps> = ({
  isOpen,
  onClose,
  onAddProduct,
  profitGuardConfig,
}) => {
  if (!isOpen) return null;

  const [name, setName] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [sku, setSku] = useState(`YM-SKU-${Math.floor(1000 + Math.random() * 9000)}`);
  const [supplierCostPKR, setSupplierCostPKR] = useState<number>(1200);
  const [recSellingPricePKR, setRecSellingPricePKR] = useState<number>(2499);
  const [stock, setStock] = useState<number>(100);
  const [brand, setBrand] = useState('YourMart Direct');
  const [warranty, setWarranty] = useState('7 Days Replacement');
  const [weightKg, setWeightKg] = useState<number>(0.5);
  const [image, setImage] = useState(
    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80'
  );
  const [description, setDescription] = useState(
    'Premium wholesale product sourced directly for high-converting reseller catalogs.'
  );
  const [highlightsText, setHighlightsText] = useState(
    '100% Original High Quality\nNationwide COD available'
  );
  const [isActive, setIsActive] = useState(true);
  const [isTrending, setIsTrending] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  // Profit calculations
  const processingFee = profitGuardConfig?.processingFeePKR ?? 30;
  const shippingFee = profitGuardConfig?.defaultShippingCostPKR ?? 250;
  const platformPct = profitGuardConfig?.platformFeePct ?? 2.0;

  const estPlatformFee = Math.round((recSellingPricePKR * platformPct) / 100);
  const estResellerProfit =
    recSellingPricePKR - supplierCostPKR - processingFee - shippingFee - estPlatformFee;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const highlights = highlightsText
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);

    const newProduct: Omit<Product, 'id'> = {
      name,
      category,
      sku,
      supplierId: 'usr-1',
      supplierName: brand,
      supplierCostPKR,
      recSellingPricePKR,
      stock,
      image,
      images: [image],
      isActive,
      brand,
      warranty,
      highlights,
      whatsInTheBox: '1x Complete Unit with User Manual & Retail Box Packaging',
      weightKg,
      description,
      rating: 4.8,
      salesCount: 0,
      isTrending,
      tags: ['new', 'admin-verified', category.toLowerCase()],
      moq: 1,
    };

    onAddProduct(newProduct);
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-3 sm:p-4 backdrop-blur-md overflow-y-auto">
      <div className="w-full max-w-2xl rounded-2xl border border-emerald-500/40 bg-slate-900 p-5 sm:p-6 shadow-2xl space-y-4 my-8 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <PlusCircle className="h-5 w-5" />
            </div>
            <div>
              <span className="rounded bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-300 border border-emerald-500/30">
                ADMIN INVENTORY ONBOARDING
              </span>
              <h2 className="text-base font-bold text-white tracking-tight mt-0.5">
                Add New Wholesale Product to Catalog
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2 space-y-1">
              <label className="text-xs font-semibold text-slate-300">Product Title</label>
              <input
                type="text"
                required
                placeholder="e.g. Wireless ANC Earbuds Pro with Digital Battery Display"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">SKU Code</label>
              <input
                type="text"
                required
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2 text-xs text-white font-mono focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">
                Wholesale Supplier Cost (PKR)
              </label>
              <input
                type="number"
                min="50"
                step="10"
                required
                value={supplierCostPKR}
                onChange={(e) => setSupplierCostPKR(Number(e.target.value))}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2 text-xs font-mono font-bold text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">
                Suggested Retail Price (PKR)
              </label>
              <input
                type="number"
                min="50"
                step="10"
                required
                value={recSellingPricePKR}
                onChange={(e) => setRecSellingPricePKR(Number(e.target.value))}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2 text-xs font-mono font-bold text-emerald-400 focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Stock Inventory Units</label>
              <input
                type="number"
                min="1"
                required
                value={stock}
                onChange={(e) => setStock(Number(e.target.value))}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2 text-xs font-mono text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Brand / Supplier</label>
              <input
                type="text"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2 space-y-1">
              <label className="text-xs font-semibold text-slate-300">Product Image URL</label>
              <div className="flex gap-2">
                <input
                  type="url"
                  required
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  className="flex-1 rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
                />
                {image && (
                  <img
                    src={image}
                    alt="Preview"
                    className="h-9 w-9 rounded-lg object-cover border border-slate-700"
                  />
                )}
              </div>
            </div>

            <div className="sm:col-span-2 space-y-1">
              <label className="text-xs font-semibold text-slate-300">Description</label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-3 text-xs flex justify-between items-center font-mono">
            <span className="text-slate-300">Est. Reseller Profit Margin:</span>
            <span className="font-bold text-emerald-400">
              PKR {estResellerProfit.toLocaleString()} ({((estResellerProfit / recSellingPricePKR) * 100).toFixed(1)}%)
            </span>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-800">
            <div>
              {isSaved && (
                <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="h-4 w-4" /> Added to catalog!
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl bg-slate-800 hover:bg-slate-700 px-4 py-2 text-xs font-semibold text-slate-300 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 px-5 py-2 text-xs font-bold text-white shadow-lg transition"
              >
                <PlusCircle className="h-4 w-4" />
                <span>Publish to Catalog</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
