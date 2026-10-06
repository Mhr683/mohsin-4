import React, { useState } from 'react';
import {
  X,
  Save,
  Package,
  DollarSign,
  TrendingUp,
  Tag,
  CheckCircle2,
  AlertCircle,
  Eye,
  Layers,
  Image as ImageIcon,
} from 'lucide-react';
import { Product, ProfitGuardConfig } from '../types';

interface AdminEditProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  onSaveProduct: (updatedProduct: Product) => void;
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

export const AdminEditProductModal: React.FC<AdminEditProductModalProps> = ({
  isOpen,
  onClose,
  product,
  onSaveProduct,
  profitGuardConfig,
}) => {
  if (!isOpen || !product) return null;

  const [formData, setFormData] = useState<Product>({
    ...product,
    highlights: product.highlights || [],
    tags: product.tags || [],
  });
  const [highlightsInput, setHighlightsInput] = useState<string>(
    product.highlights ? product.highlights.join('\n') : ''
  );
  const [tagsInput, setTagsInput] = useState<string>(
    product.tags ? product.tags.join(', ') : ''
  );
  const [isSaved, setIsSaved] = useState(false);

  // Calculate live profit margin estimate
  const processingFee = profitGuardConfig?.processingFeePKR ?? 30;
  const shippingFee = profitGuardConfig?.defaultShippingCostPKR ?? 250;
  const platformPct = profitGuardConfig?.platformFeePct ?? 2.0;

  const estPlatformFee = Math.round((formData.recSellingPricePKR * platformPct) / 100);
  const estResellerProfit =
    formData.recSellingPricePKR -
    formData.supplierCostPKR -
    processingFee -
    shippingFee -
    estPlatformFee;
  const estProfitMargin =
    formData.recSellingPricePKR > 0
      ? ((estResellerProfit / formData.recSellingPricePKR) * 100).toFixed(1)
      : '0';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const cleanHighlights = highlightsInput
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);

    const cleanTags = tagsInput
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const updated: Product = {
      ...formData,
      highlights: cleanHighlights,
      tags: cleanTags,
    };

    onSaveProduct(updated);
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-3 sm:p-4 backdrop-blur-md overflow-y-auto">
      <div className="w-full max-w-2xl rounded-2xl border border-purple-500/40 bg-slate-900 p-5 sm:p-6 shadow-2xl space-y-4 my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
              <Package className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded bg-purple-500/20 px-2 py-0.5 text-[10px] font-bold text-purple-300 border border-purple-500/30">
                  ADMIN PRODUCT EDITOR
                </span>
                <span className="font-mono text-xs text-slate-400">SKU: {formData.sku}</span>
              </div>
              <h2 className="text-base font-bold text-white tracking-tight mt-0.5">
                Edit Product: {product.name}
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

        {/* Live Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Product Title */}
            <div className="sm:col-span-2 space-y-1">
              <label className="text-xs font-semibold text-slate-300">Product Title / Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2 text-xs text-white focus:border-purple-500 focus:outline-none"
              />
            </div>

            {/* Category */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2 text-xs text-white focus:border-purple-500 focus:outline-none"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* SKU */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">SKU Code</label>
              <input
                type="text"
                required
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2 text-xs text-white font-mono focus:border-purple-500 focus:outline-none"
              />
            </div>

            {/* Supplier Wholesale Cost (PKR) */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">
                Wholesale Supplier Cost (PKR)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-mono font-bold text-slate-400">
                  PKR
                </span>
                <input
                  type="number"
                  min="50"
                  step="10"
                  required
                  value={formData.supplierCostPKR}
                  onChange={(e) =>
                    setFormData({ ...formData, supplierCostPKR: Number(e.target.value) })
                  }
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 pl-12 pr-3.5 py-2 text-xs font-mono font-bold text-white focus:border-purple-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Suggested Retail Price (PKR) */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">
                Recommended Retail Price (PKR)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-mono font-bold text-slate-400">
                  PKR
                </span>
                <input
                  type="number"
                  min="50"
                  step="10"
                  required
                  value={formData.recSellingPricePKR}
                  onChange={(e) =>
                    setFormData({ ...formData, recSellingPricePKR: Number(e.target.value) })
                  }
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 pl-12 pr-3.5 py-2 text-xs font-mono font-bold text-emerald-400 focus:border-purple-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Stock Quantity */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Inventory Stock Units</label>
              <input
                type="number"
                min="0"
                required
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2 text-xs font-mono font-bold text-white focus:border-purple-500 focus:outline-none"
              />
            </div>

            {/* Brand / Manufacturer */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Brand / Supplier Name</label>
              <input
                type="text"
                value={formData.brand || formData.supplierName}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2 text-xs text-white focus:border-purple-500 focus:outline-none"
              />
            </div>

            {/* Weight (Kg) */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Package Weight (Kg)</label>
              <input
                type="number"
                step="0.05"
                min="0.05"
                value={formData.weightKg || 0.5}
                onChange={(e) => setFormData({ ...formData, weightKg: Number(e.target.value) })}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2 text-xs font-mono text-white focus:border-purple-500 focus:outline-none"
              />
            </div>

            {/* Warranty */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Warranty</label>
              <input
                type="text"
                placeholder="e.g. 7 Days Replacement / 1 Year Official"
                value={formData.warranty || ''}
                onChange={(e) => setFormData({ ...formData, warranty: e.target.value })}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2 text-xs text-white focus:border-purple-500 focus:outline-none"
              />
            </div>

            {/* Main Image URL */}
            <div className="sm:col-span-2 space-y-1">
              <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                <span>Main Product Image URL</span>
                {formData.image && (
                  <span className="text-[10px] text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" /> Image Loaded
                  </span>
                )}
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  required
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  className="flex-1 rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2 text-xs text-white focus:border-purple-500 focus:outline-none"
                />
                {formData.image && (
                  <img
                    src={formData.image}
                    alt="Preview"
                    className="h-9 w-9 rounded-lg object-cover border border-slate-700"
                  />
                )}
              </div>
            </div>

            {/* Description */}
            <div className="sm:col-span-2 space-y-1">
              <label className="text-xs font-semibold text-slate-300">Product Description</label>
              <textarea
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2 text-xs text-white focus:border-purple-500 focus:outline-none"
              />
            </div>

            {/* Highlights */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Key Highlights (1 per line)</label>
              <textarea
                rows={2}
                placeholder="High quality material&#10;Fast charging support"
                value={highlightsInput}
                onChange={(e) => setHighlightsInput(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2 text-xs text-white focus:border-purple-500 focus:outline-none"
              />
            </div>

            {/* Tags */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Tags (comma separated)</label>
              <textarea
                rows={2}
                placeholder="trending, best seller, premium"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2 text-xs text-white focus:border-purple-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Dynamic Profit Guard Margin Preview Card */}
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-3.5 text-xs space-y-2">
            <div className="flex items-center justify-between text-emerald-300 font-bold">
              <span className="flex items-center gap-1.5">
                <TrendingUp className="h-4 w-4" />
                Profit Guard™ Simulation at Retail Price
              </span>
              <span className="font-mono text-sm">PKR {formData.recSellingPricePKR.toLocaleString()}</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] font-mono">
              <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                <span className="text-slate-400 block text-[10px]">Wholesale Cost:</span>
                <span className="font-bold text-slate-200">PKR {formData.supplierCostPKR}</span>
              </div>
              <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                <span className="text-slate-400 block text-[10px]">Processing + Courier:</span>
                <span className="font-bold text-slate-200">PKR {processingFee + shippingFee}</span>
              </div>
              <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                <span className="text-slate-400 block text-[10px]">Platform ({platformPct}%):</span>
                <span className="font-bold text-purple-300">PKR {estPlatformFee}</span>
              </div>
              <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                <span className="text-slate-400 block text-[10px]">Est. Reseller Margin:</span>
                <span
                  className={`font-bold ${
                    estResellerProfit > 0 ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  PKR {estResellerProfit} ({estProfitMargin}%)
                </span>
              </div>
            </div>
          </div>

          {/* Status & Flags Toggles */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-white">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="h-4 w-4 rounded border-slate-700 bg-slate-900 text-purple-600 focus:ring-purple-500"
              />
              <span>Active in Reseller Wholesale Catalog</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-amber-300">
              <input
                type="checkbox"
                checked={formData.isTrending}
                onChange={(e) => setFormData({ ...formData, isTrending: e.target.checked })}
                className="h-4 w-4 rounded border-slate-700 bg-slate-900 text-amber-500 focus:ring-amber-500"
              />
              <span>Mark as Trending / Best Seller</span>
            </label>
          </div>

          {/* Submit Actions */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-800">
            <div>
              {isSaved && (
                <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="h-4 w-4" /> Product updated successfully!
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
                className="flex items-center gap-2 rounded-xl bg-purple-600 hover:bg-purple-500 px-5 py-2 text-xs font-bold text-white shadow-lg transition"
              >
                <Save className="h-4 w-4" />
                <span>Save Product Changes</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
