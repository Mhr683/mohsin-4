import React, { useState } from 'react';
import {
  Package,
  PlusCircle,
  Search,
  Filter,
  Edit,
  Pencil,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Tag,
  TrendingUp,
  DollarSign,
  Layers,
  ArrowUpDown,
  Eye,
  RotateCcw,
} from 'lucide-react';
import { Product, ProfitGuardConfig } from '../types';
import { AdminEditProductModal } from './AdminEditProductModal';
import { AdminAddProductModal } from './AdminAddProductModal';

interface AdminProductsManagerProps {
  products: Product[];
  onUpdateProduct: (product: Product) => void;
  onAddProduct: (productData: Omit<Product, 'id'>) => void;
  onDeleteProduct: (productId: string) => void;
  profitGuardConfig: ProfitGuardConfig;
}

export const AdminProductsManager: React.FC<AdminProductsManagerProps> = ({
  products,
  onUpdateProduct,
  onAddProduct,
  onDeleteProduct,
  profitGuardConfig,
}) => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [stockFilter, setStockFilter] = useState<'ALL' | 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK' | 'INACTIVE'>('ALL');
  const [selectedProductForEdit, setSelectedProductForEdit] = useState<Product | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Extract unique categories
  const categories = ['ALL', ...Array.from(new Set(products.map((p) => p.category)))];

  // Filtering
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase()) ||
      (p.brand && p.brand.toLowerCase().includes(search.toLowerCase()));

    const matchesCategory = selectedCategory === 'ALL' || p.category === selectedCategory;

    let matchesStock = true;
    if (stockFilter === 'IN_STOCK') matchesStock = p.stock > 10;
    if (stockFilter === 'LOW_STOCK') matchesStock = p.stock > 0 && p.stock <= 10;
    if (stockFilter === 'OUT_OF_STOCK') matchesStock = p.stock === 0;
    if (stockFilter === 'INACTIVE') matchesStock = !p.isActive;

    return matchesSearch && matchesCategory && matchesStock;
  });

  // KPI calculations
  const totalStockCount = products.reduce((sum, p) => sum + p.stock, 0);
  const lowStockCount = products.filter((p) => p.stock <= 10).length;
  const activeCount = products.filter((p) => p.isActive).length;
  const totalWholesaleValue = products.reduce((sum, p) => sum + p.supplierCostPKR * p.stock, 0);

  // Quick Stock adjustment inline
  const handleQuickStockChange = (product: Product, delta: number) => {
    const updated = { ...product, stock: Math.max(0, product.stock + delta) };
    onUpdateProduct(updated);
  };

  // Quick Active toggle inline
  const handleToggleActive = (product: Product) => {
    const updated = { ...product, isActive: !product.isActive };
    onUpdateProduct(updated);
  };

  return (
    <div className="space-y-6">
      {/* Top Header & KPIs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded bg-purple-500/20 px-2 py-0.5 text-[10px] font-bold text-purple-300 border border-purple-500/30">
              WHOLESALE INVENTORY HUB
            </span>
            <span className="text-xs text-slate-400">Total Products: {products.length}</span>
          </div>
          <h2 className="text-lg font-bold text-white tracking-tight mt-0.5 flex items-center gap-2">
            <Package className="h-5 w-5 text-purple-400" />
            <span>Product Catalog & Inventory Management</span>
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 rounded-xl bg-purple-600 hover:bg-purple-500 px-4 py-2 text-xs font-bold text-white shadow-lg transition"
          >
            <PlusCircle className="h-4 w-4" />
            <span>Add New Product</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-3.5">
          <span className="text-[11px] text-slate-400 block">Total Catalog Items</span>
          <span className="text-xl font-bold font-mono text-white mt-1 block">
            {products.length} Products
          </span>
          <span className="text-[10px] text-emerald-400 mt-0.5 block">
            {activeCount} Active for Resellers
          </span>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-3.5">
          <span className="text-[11px] text-slate-400 block">Total Inventory Stock</span>
          <span className="text-xl font-bold font-mono text-emerald-300 mt-1 block">
            {totalStockCount.toLocaleString()} Units
          </span>
          <span className="text-[10px] text-slate-400 mt-0.5 block">Across all warehouses</span>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-3.5">
          <span className="text-[11px] text-slate-400 block">Low / Out of Stock</span>
          <span className="text-xl font-bold font-mono text-amber-400 mt-1 block">
            {lowStockCount} Products
          </span>
          <span className="text-[10px] text-amber-400/80 mt-0.5 block">Requires factory replenishment</span>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-3.5">
          <span className="text-[11px] text-slate-400 block">Wholesale Asset Value</span>
          <span className="text-xl font-bold font-mono text-purple-300 mt-1 block">
            PKR {totalWholesaleValue.toLocaleString()}
          </span>
          <span className="text-[10px] text-slate-400 mt-0.5 block">At supplier landing cost</span>
        </div>
      </div>

      {/* Search & Filters Bar */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between bg-slate-900/60 p-3 rounded-2xl border border-slate-800">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search product title, SKU, category, brand..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-700 bg-slate-950 pl-9 pr-3.5 py-2 text-xs text-white placeholder-slate-500 focus:border-purple-500 focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white focus:border-purple-500 focus:outline-none"
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c === 'ALL' ? 'All Categories' : c}
              </option>
            ))}
          </select>

          {/* Stock Filter */}
          <select
            value={stockFilter}
            onChange={(e) => setStockFilter(e.target.value as any)}
            className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white focus:border-purple-500 focus:outline-none"
          >
            <option value="ALL">All Stock Levels</option>
            <option value="IN_STOCK">In Stock (&gt;10)</option>
            <option value="LOW_STOCK">Low Stock (≤10)</option>
            <option value="OUT_OF_STOCK">Out of Stock (0)</option>
            <option value="INACTIVE">Inactive / Hidden</option>
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/90 shadow-xl">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
            <tr>
              <th className="px-4 py-3.5">Product & SKU</th>
              <th className="px-4 py-3.5">Category</th>
              <th className="px-4 py-3.5 text-right">Wholesale Cost</th>
              <th className="px-4 py-3.5 text-right">Retail Suggested</th>
              <th className="px-4 py-3.5 text-center">Stock Units</th>
              <th className="px-4 py-3.5 text-center">Catalog Status</th>
              <th className="px-4 py-3.5 text-right">Admin Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/80 bg-slate-900/40">
            {filteredProducts.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                  No products matched your search or filters.
                </td>
              </tr>
            ) : (
              filteredProducts.map((prod) => {
                // Calculate quick margin
                const processingFee = profitGuardConfig.processingFeePKR;
                const shippingFee = profitGuardConfig.defaultShippingCostPKR;
                const platformFee = Math.round((prod.recSellingPricePKR * profitGuardConfig.platformFeePct) / 100);
                const netProfit = prod.recSellingPricePKR - prod.supplierCostPKR - processingFee - shippingFee - platformFee;
                const marginPct = ((netProfit / prod.recSellingPricePKR) * 100).toFixed(0);

                return (
                  <tr key={prod.id} className="hover:bg-slate-800/50 transition">
                    {/* Product & SKU */}
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <img
                          src={prod.image}
                          alt={prod.name}
                          className="h-10 w-10 rounded-xl object-cover border border-slate-700 shrink-0"
                        />
                        <div className="min-w-0 max-w-xs">
                          <div className="font-bold text-white truncate" title={prod.name}>
                            {prod.name}
                          </div>
                          <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono mt-0.5">
                            <span>SKU: {prod.sku}</span>
                            {prod.isTrending && (
                              <span className="rounded bg-amber-500/20 px-1.5 py-0.2 text-[9px] font-bold text-amber-300 border border-amber-500/40">
                                HOT
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="px-4 py-3.5">
                      <span className="rounded bg-slate-950 px-2 py-1 text-[11px] text-slate-300 border border-slate-800">
                        {prod.category}
                      </span>
                    </td>

                    {/* Wholesale Cost */}
                    <td className="px-4 py-3.5 text-right font-mono font-bold text-slate-200">
                      PKR {prod.supplierCostPKR.toLocaleString()}
                    </td>

                    {/* Retail Suggested Price & Margin */}
                    <td className="px-4 py-3.5 text-right">
                      <div className="font-mono font-bold text-emerald-400">
                        PKR {prod.recSellingPricePKR.toLocaleString()}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        Margin: ~{marginPct}% (PKR {netProfit})
                      </div>
                    </td>

                    {/* Stock Units with Quick +/- Steppers */}
                    <td className="px-4 py-3.5 text-center">
                      <div className="inline-flex items-center gap-1.5 bg-slate-950 px-2 py-1 rounded-xl border border-slate-800">
                        <button
                          onClick={() => handleQuickStockChange(prod, -5)}
                          title="Decrease 5 units"
                          className="h-5 w-5 flex items-center justify-center rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold"
                        >
                          -
                        </button>
                        <span
                          className={`font-mono font-bold px-1 text-xs ${
                            prod.stock === 0
                              ? 'text-rose-400'
                              : prod.stock <= 10
                              ? 'text-amber-400'
                              : 'text-white'
                          }`}
                        >
                          {prod.stock}
                        </span>
                        <button
                          onClick={() => handleQuickStockChange(prod, 10)}
                          title="Increase 10 units"
                          className="h-5 w-5 flex items-center justify-center rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold"
                        >
                          +
                        </button>
                      </div>
                    </td>

                    {/* Catalog Status Toggle */}
                    <td className="px-4 py-3.5 text-center">
                      <button
                        onClick={() => handleToggleActive(prod)}
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold border transition ${
                          prod.isActive
                            ? 'bg-emerald-950/60 text-emerald-400 border-emerald-800/60 hover:bg-emerald-900/60'
                            : 'bg-slate-950 text-slate-500 border-slate-800 hover:text-slate-300'
                        }`}
                      >
                        <span className={`h-1.5 w-1.5 rounded-full ${prod.isActive ? 'bg-emerald-400' : 'bg-slate-500'}`} />
                        <span>{prod.isActive ? 'Active' : 'Hidden'}</span>
                      </button>
                    </td>

                    {/* Admin Actions: Edit & Delete */}
                    <td className="px-4 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Edit Button */}
                        <button
                          onClick={() => setSelectedProductForEdit(prod)}
                          className="flex items-center gap-1 rounded-lg bg-purple-600/20 hover:bg-purple-600 text-purple-300 hover:text-white border border-purple-500/40 px-2.5 py-1.5 text-xs font-bold transition shadow-sm"
                          title="Edit complete product specifications"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                          <span>Edit</span>
                        </button>

                        {/* Delete Button */}
                        {deleteConfirmId === prod.id ? (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => {
                                onDeleteProduct(prod.id);
                                setDeleteConfirmId(null);
                              }}
                              className="rounded-lg bg-rose-600 hover:bg-rose-500 text-white px-2 py-1 text-[11px] font-bold transition"
                            >
                              Confirm
                            </button>
                            <button
                              onClick={() => setDeleteConfirmId(null)}
                              className="rounded-lg bg-slate-800 text-slate-400 hover:text-white px-2 py-1 text-[11px] transition"
                            >
                              ✕
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setDeleteConfirmId(prod.id)}
                            className="rounded-lg bg-rose-600/10 hover:bg-rose-600 text-rose-400 hover:text-white border border-rose-500/30 p-1.5 text-xs transition"
                            title="Delete product from catalog"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Edit Product Modal */}
      {selectedProductForEdit && (
        <AdminEditProductModal
          isOpen={!!selectedProductForEdit}
          onClose={() => setSelectedProductForEdit(null)}
          product={selectedProductForEdit}
          onSaveProduct={(updated) => {
            onUpdateProduct(updated);
            setSelectedProductForEdit(null);
          }}
          profitGuardConfig={profitGuardConfig}
        />
      )}

      {/* Add Product Modal */}
      {isAddModalOpen && (
        <AdminAddProductModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onAddProduct={(newProd) => {
            onAddProduct(newProd);
            setIsAddModalOpen(false);
          }}
          profitGuardConfig={profitGuardConfig}
        />
      )}
    </div>
  );
};
