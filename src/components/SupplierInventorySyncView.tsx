import React, { useState } from 'react';
import {
  Boxes,
  RefreshCw,
  Upload,
  AlertTriangle,
  CheckCircle2,
  Package,
  Layers,
  Search,
  Building2,
  DollarSign
} from 'lucide-react';
import { supplierInventoryService, SupplierInventoryItem } from '../services/supplierInventoryService';

export const SupplierInventorySyncView: React.FC = () => {
  const [items, setItems] = useState<SupplierInventoryItem[]>(() => supplierInventoryService.getAllInventory());
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editStockVal, setEditStockVal] = useState<number>(0);
  const [editCostVal, setEditCostVal] = useState<number>(0);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);

  const filtered = items.filter(
    (item) =>
      item.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.supplierName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleStartEdit = (item: SupplierInventoryItem) => {
    setEditingId(item.productId);
    setEditStockVal(item.stockQuantity);
    setEditCostVal(item.supplierCostPKR);
  };

  const handleSaveEdit = (productId: string) => {
    const updated = supplierInventoryService.updateStockManually(productId, editStockVal, editCostVal);
    setItems(supplierInventoryService.getAllInventory());
    setEditingId(null);
    setSyncMessage(`Stock for ${updated.sku} updated to ${updated.stockQuantity} units.`);
    setTimeout(() => setSyncMessage(null), 3000);
  };

  const handleSimulateBatchSync = () => {
    setSyncMessage('Syncing inventory with manufacturer warehouse APIs...');
    setTimeout(() => {
      setItems(supplierInventoryService.getAllInventory());
      setSyncMessage('Manufacturer inventory successfully synchronized (All SKUs refreshed).');
      setTimeout(() => setSyncMessage(null), 3000);
    }, 800);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 text-slate-100 space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-800 pb-5">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center border border-indigo-500/20">
            <Boxes className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-extrabold text-base text-white">Manufacturer Inventory & Stock Sync Engine</h3>
            <p className="text-xs text-slate-400">
              Live warehouse stock levels prevent dropshippers from booking unfulfillable orders.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleSimulateBatchSync}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition"
          >
            <RefreshCw className="w-3.5 h-3.5 text-indigo-400" />
            <span>Sync Supplier Feeds</span>
          </button>
        </div>
      </div>

      {syncMessage && (
        <div className="p-3 bg-emerald-950/40 border border-emerald-500/30 rounded-xl text-xs text-emerald-300 flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{syncMessage}</span>
        </div>
      )}

      {/* Filter and Stats */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search SKU, product, or supplier..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center gap-4 text-xs text-slate-400">
          <span>Total Monitored SKUs: <strong className="text-white font-mono">{items.length}</strong></span>
          <span>Out of Stock: <strong className="text-rose-400 font-mono">{items.filter((i) => !i.isAvailable).length}</strong></span>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950/50">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
            <tr>
              <th className="py-3 px-4">SKU & Product</th>
              <th className="py-3 px-4">Supplier</th>
              <th className="py-3 px-4 text-center">Cost (Wholesale)</th>
              <th className="py-3 px-4 text-center">Stock Units</th>
              <th className="py-3 px-4 text-center">Availability Status</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-sans">
            {filtered.map((item) => {
              const isEditing = editingId === item.productId;
              return (
                <tr key={item.productId} className="hover:bg-slate-900/60 transition">
                  <td className="py-3.5 px-4">
                    <p className="font-bold text-white text-xs">{item.productName}</p>
                    <p className="text-[11px] text-slate-400 font-mono mt-0.5">SKU: {item.sku}</p>
                  </td>
                  <td className="py-3.5 px-4 text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <span className="truncate max-w-[180px]">{item.supplierName}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-center font-mono">
                    {isEditing ? (
                      <input
                        type="number"
                        value={editCostVal}
                        onChange={(e) => setEditCostVal(Number(e.target.value))}
                        className="w-20 bg-slate-900 border border-slate-700 rounded p-1 text-center font-mono text-xs text-emerald-400"
                      />
                    ) : (
                      <span className="font-semibold text-slate-200">Rs. {item.supplierCostPKR.toLocaleString()}</span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-center font-mono">
                    {isEditing ? (
                      <input
                        type="number"
                        value={editStockVal}
                        onChange={(e) => setEditStockVal(Number(e.target.value))}
                        className="w-16 bg-slate-900 border border-slate-700 rounded p-1 text-center font-mono text-xs text-white"
                      />
                    ) : (
                      <span className={`font-bold ${item.stockQuantity <= 10 ? 'text-amber-400' : 'text-emerald-400'}`}>
                        {item.stockQuantity} units
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    {item.isAvailable ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        <CheckCircle2 className="w-3 h-3" /> In Stock
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                        <AlertTriangle className="w-3 h-3" /> Out of Stock
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    {isEditing ? (
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleSaveEdit(item.productId)}
                          className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px]"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="px-2 py-1 rounded-lg bg-slate-800 text-slate-400 text-[11px]"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleStartEdit(item)}
                        className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold"
                      >
                        Adjust Stock
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
