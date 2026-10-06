import React, { useState } from 'react';
import {
  X,
  Plus,
  Package,
  DollarSign,
  Building2,
  Tag,
  CheckCircle2,
  Image as ImageIcon,
  Sparkles
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Product } from '../types';

export const AddProductModal: React.FC = () => {
  const {
    isAddProductModalOpen,
    setIsAddProductModalOpen,
    addProduct,
    suppliers,
    activeRole
  } = useApp();

  const [name, setName] = useState('');
  const [sku, setSku] = useState(`SKU-${Math.floor(1000 + Math.random() * 9000)}`);
  const [category, setCategory] = useState('Personal Care & Grooming');
  const [supplierCostPKR, setSupplierCostPKR] = useState<number>(1200);
  const [recSellingPricePKR, setRecSellingPricePKR] = useState<number>(2499);
  const [stock, setStock] = useState<number>(100);
  const [supplierId, setSupplierId] = useState(suppliers[0]?.id || 'sup-1');
  const [image, setImage] = useState('https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=600&q=80');
  const [description, setDescription] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isAddProductModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    const sup = suppliers.find(s => s.id === supplierId) || suppliers[0];

    const newProd: Product = {
      id: `prod-${Date.now()}`,
      name,
      sku,
      category,
      supplierCostPKR,
      recSellingPricePKR,
      stock,
      lowStockThreshold: 15,
      supplierId: sup.id,
      supplierName: sup.name,
      ownerRole: activeRole === 'RESELLER' ? 'RESELLER' : 'SUPPLIER',
      image: image || 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=600&q=80',
      description: description || `${name} - Verified wholesale product listing ready for dropship booking.`,
      isTrending: true,
      isBestSeller: false,
      salesPotentialScore: 90,
      rating: 4.8,
      reviewsCount: 1,
      competitionLevel: 'LOW',
      fastShipping: true,
      estDeliveryDays: 2,
      estShippingCostPKR: 220,
      status: 'ACTIVE'
    };

    addProduct(newProd);
    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      setIsAddProductModalOpen(false);
    }, 1000);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-6 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-white text-base sm:text-lg">List Wholesale Product</h3>
              <p className="text-xs text-slate-400">Publish stock to the YourMart Global network</p>
            </div>
          </div>
          <button
            onClick={() => setIsAddProductModalOpen(false)}
            className="p-2 rounded-xl text-slate-400 hover:text-white bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div>
            <label className="font-bold text-slate-300 mb-1 block">Product Title</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Wireless Noise Cancelling Earbuds Pro"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-300 mb-1 block">SKU Code</label>
              <input
                type="text"
                required
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="font-bold text-slate-300 mb-1 block">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="Electronics & Audio">Electronics & Audio</option>
                <option value="Personal Care & Grooming">Personal Care & Grooming</option>
                <option value="Home & Kitchen">Home & Kitchen</option>
                <option value="Mobile Accessories">Mobile Accessories</option>
                <option value="Automobile Accessories">Automobile Accessories</option>
                <option value="Health & Beauty">Health & Beauty</option>
                <option value="Fashion & Apparel">Fashion & Apparel</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-300 mb-1 block">Wholesale Base Cost (PKR)</label>
              <input
                type="number"
                required
                value={supplierCostPKR}
                onChange={(e) => setSupplierCostPKR(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-bold focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="font-bold text-slate-300 mb-1 block">Suggested Retail Price (PKR)</label>
              <input
                type="number"
                required
                value={recSellingPricePKR}
                onChange={(e) => setRecSellingPricePKR(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-emerald-400 font-bold focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-300 mb-1 block">Available Stock Quantity</label>
              <input
                type="number"
                required
                value={stock}
                onChange={(e) => setStock(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-bold focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="font-bold text-slate-300 mb-1 block">Wholesale Supplier</label>
              <select
                value={supplierId}
                onChange={(e) => setSupplierId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
              >
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.city})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-300 mb-1 block">Image URL</label>
            <input
              type="url"
              value={image}
              onChange={(e) => setImage(e.target.value)}
              placeholder="https://..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          {isSuccess && (
            <div className="bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold p-3 rounded-xl flex items-center gap-2 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Product successfully added to the wholesale catalog!</span>
            </div>
          )}

          <div className="flex gap-2 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsAddProductModalOpen(false)}
              className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-2.5 rounded-xl"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 rounded-xl transition shadow-lg shadow-emerald-600/20"
            >
              Publish Product
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
