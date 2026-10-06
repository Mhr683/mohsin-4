import React, { useState, useRef } from 'react';
import {
  FileSpreadsheet,
  Upload,
  Download,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Boxes,
  ArrowRight,
  Sparkles,
  LayoutGrid,
  List,
  Store,
  Star,
  Truck,
  Heart,
  Video,
  Trash2,
  PackageCheck,
  ShieldCheck,
  Filter,
  Search,
  Layers
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Product } from '../types';
import { getSmartProductAssets } from '../utils/productAssetMatcher';
import { AiProductAssetStudioModal } from './AiProductAssetStudioModal';
import { parseCsvText } from '../utils/csvParser';

export const BulkImportView: React.FC = () => {
  const { addProduct, suppliers } = useApp();

  const [importStatus, setImportStatus] = useState<'IDLE' | 'PARSING' | 'SUCCESS'>('IDLE');
  const [parsedRows, setParsedRows] = useState<any[]>([]);
  const [successCount, setSuccessCount] = useState<number>(0);
  const [viewMode, setViewMode] = useState<'GRID' | 'TABLE'>('GRID'); // Image 2 Card Grid default
  const [selectedRowIndexForStudio, setSelectedRowIndexForStudio] = useState<number | null>(null);
  const [aiSuccessToast, setAiSuccessToast] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 14 multi-category Pakistani wholesale products
  const sampleCsvContent = `Product Name,SKU,Category,Supplier Cost (PKR),Rec. Retail Price (PKR),Stock,Weight KG,Supplier
Pack of 2 Dog Bath Brush Pet Massager Silicone,PET-BATH-BRUSH-2PK,Baby Care & Toys,160,315,310,0.15,Karachi Prime Electronics
Wireless Noise Cancelling Earbuds Pro 2,SKU-EAR-99,Consumer Electronics & Mobile Gadgets,1250,2299,150,0.25,FastTrack Gadgets Hub
Pack of 3 Cotton Summer Boxer Shorts,SKU-BOX-03,Fashion & Apparel,650,1199,220,0.3,Lahore Mega Wholesale
Stainless Steel Garlic Press Crusher,SKU-GAR-01,Home & Kitchen Essentials,280,699,350,0.18,Lahore Mega Wholesale
Magnetic Dashboard 360° Car Phone Mount,SKU-CAR-M4,Automotive & Mobile Accessories,390,899,180,0.12,FastTrack Gadgets Hub
12 Inches Courier Poly Flyer Bags with Pocket (100 Pcs),SKU-FLY-12IN,Packaging & Supplies,750,1250,300,0.9,Karachi Prime Electronics
Professional T9 Vintage Metal Hair & Beard Trimmer,SKU-TRIM-T9,Personal Care & Health,790,1499,190,0.28,Karachi Prime Electronics
T800 Ultra Smartwatch with Bluetooth Calling & Dual Strap,SKU-WATCH-T800,Consumer Electronics & Mobile Gadgets,1450,2699,140,0.22,FastTrack Gadgets Hub
Organic Vitamin C Whitening & Glow Facial Serum 30ml,SKU-SRM-VITC,Personal Care & Health,390,899,250,0.1,Lahore Mega Wholesale
Portable Mini USB Air Conditioner Cooler with Ice Slot,SKU-AC-COOL-M1,Home & Kitchen Essentials,1650,2999,95,0.85,Lahore Mega Wholesale
Smart 2-in-1 LED RGB Light Bulb with Bluetooth Speaker,SKU-BULB-RGB-SPK,Consumer Electronics & Mobile Gadgets,580,1299,210,0.2,Karachi Prime Electronics
Men's Summer Export Cotton Polo T-Shirt (Navy Blue),SKU-POLO-NVY,Fashion & Apparel,850,1599,160,0.28,Lahore Mega Wholesale
High Power Portable Car Vacuum Cleaner Wet/Dry,SKU-VAC-CAR-12V,Automotive & Mobile Accessories,980,1899,110,0.65,FastTrack Gadgets Hub
Multifunctional 9-in-1 Vegetable & Fruit Slicer Cutter,SKU-SLICER-9IN1,Home & Kitchen Essentials,750,1499,180,0.5,Lahore Mega Wholesale`;

  const handleDownloadSample = () => {
    const blob = new Blob([sampleCsvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'yourmart_bulk_products_sample_all_categories.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const parseData = (rawText: string) => {
    setImportStatus('PARSING');
    setTimeout(() => {
      try {
        const result = parseCsvText(rawText, 'Verified Wholesale Hub');

        if (result.products.length === 0) {
          setImportStatus('IDLE');
          return;
        }

        const rows = result.products.map((p) => {
          const smartPack = getSmartProductAssets(p.name);
          return {
            name: p.name,
            sku: p.sku,
            category: p.category,
            cost: p.cost,
            price: p.price,
            stock: p.stock,
            weight: p.weight,
            supplier: p.brand || 'Verified Wholesale Hub',
            image: p.image,
            images: p.images || [p.image],
            videoUrl: p.videoUrl || smartPack.videoUrl,
            urduPitch: smartPack.urduPitch,
          };
        });

        setParsedRows(rows);
        setImportStatus('SUCCESS');
        setViewMode('GRID');
        setCategoryFilter('ALL');
      } catch (e) {
        console.error('Error parsing CSV:', e);
        setImportStatus('IDLE');
      }
    }, 200);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      parseData(text);
    };
    reader.readAsText(file);
  };

  const handleSimulateUpload = () => {
    parseData(sampleCsvContent);
  };

  const handleAutoFillAi = () => {
    const updated = parsedRows.map((r) => {
      const pack = getSmartProductAssets(r.name);
      return {
        ...r,
        image: pack.image,
        images: [pack.image, ...pack.extraImages],
        videoUrl: pack.videoUrl,
        category: r.category || pack.category,
      };
    });
    setParsedRows(updated);
    setAiSuccessToast(`✨ AI Asset Studio: All ${parsedRows.length} items filled with studio photos & HD video demos!`);
    setTimeout(() => setAiSuccessToast(null), 3000);
  };

  const handleRemoveRow = (index: number) => {
    setParsedRows((prev) => prev.filter((_, i) => i !== index));
  };

  const handleCommitImport = () => {
    parsedRows.forEach((row, i) => {
      const sup = suppliers.find((s) => s.name.includes('Karachi') || s.name.includes('Lahore')) || suppliers[0];
      const smartPack = getSmartProductAssets(row.name);
      const newProd: Product = {
        id: `prod-bulk-${Date.now()}-${i}`,
        name: row.name,
        sku: row.sku,
        category: row.category,
        supplierCostPKR: row.cost,
        recSellingPricePKR: row.price,
        stock: row.stock,
        lowStockThreshold: 15,
        supplierId: sup ? sup.id : 'sup-1',
        supplierName: row.supplier || (sup ? sup.name : 'Karachi Prime Electronics'),
        ownerRole: 'SUPPLIER',
        image: row.image || smartPack.image,
        images: row.images && row.images.length > 0 ? row.images : [row.image, ...smartPack.extraImages],
        videoUrl: row.videoUrl || smartPack.videoUrl,
        description: `${row.name} - Wholesale imported bulk listing for fast COD dispatch across Pakistan.`,
        isTrending: true,
        isBestSeller: false,
        salesPotentialScore: 92,
        rating: 4.8,
        reviewsCount: 22,
        competitionLevel: 'LOW',
        fastShipping: true,
        estDeliveryDays: 2,
        estShippingCostPKR: 220,
        status: 'ACTIVE',
        storeId: 'store-oshi',
        storeName: 'Oshi Logistics & Direct Sourcing',
        storeRating: 4.9,
        deliveryRating: '⚡ 2-3 Days Fast Delivery (98% On-Time)',
      };
      addProduct(newProd);
    });

    setSuccessCount(parsedRows.length);
    setParsedRows([]);
  };

  const uniqueCategories = ['ALL', ...Array.from(new Set(parsedRows.map((r) => r.category)))];

  const filteredRows = parsedRows.filter((r) => {
    const matchesCategory = categoryFilter === 'ALL' || r.category === categoryFilter;
    const matchesSearch =
      !searchQuery ||
      r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const activeRowForStudio = selectedRowIndexForStudio !== null ? parsedRows[selectedRowIndexForStudio] : null;

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold mb-2">
            <FileSpreadsheet className="w-3.5 h-3.5" /> High-Velocity Batch Onboarding
          </div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">Bulk CSV / Excel Product Import</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Import hundreds of products across all Pakistani wholesale categories with 100% zero-loss.
          </p>
        </div>

        <button
          onClick={handleDownloadSample}
          className="bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 text-xs font-bold px-4 py-2.5 rounded-xl transition flex items-center gap-2 cursor-pointer"
        >
          <Download className="w-4 h-4 text-emerald-400" />
          <span>Download All Categories Template (14 Items)</span>
        </button>
      </div>

      {/* Success Notification */}
      {successCount > 0 && (
        <div className="bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold p-4 rounded-2xl flex items-center gap-3 animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>Successfully imported and published {successCount} products across all categories to the Wholesale Catalog!</span>
        </div>
      )}

      {aiSuccessToast && (
        <div className="bg-violet-950/80 border border-violet-500/50 text-violet-200 text-xs font-bold p-3.5 rounded-2xl flex items-center gap-2 animate-fadeIn shadow-lg">
          <Sparkles className="h-4 w-4 text-violet-400" />
          <span>{aiSuccessToast}</span>
        </div>
      )}

      {/* Drag & Drop Upload Zone */}
      <div className="bg-slate-900 border-2 border-dashed border-slate-800 hover:border-emerald-500/50 rounded-3xl p-8 sm:p-10 text-center space-y-4 transition group">
        <div className="w-16 h-16 rounded-3xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/20 group-hover:scale-105 transition transform">
          <Upload className="w-8 h-8" />
        </div>

        <div>
          <h3 className="font-extrabold text-white text-base">Upload CSV or XLSX File</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
            Drag and drop your spreadsheet here or click to browse. All items will be parsed without skipping any line.
          </p>
        </div>

        <input
          type="file"
          ref={fileInputRef}
          accept=".csv,text/csv,text/plain,.tsv"
          onChange={handleFileChange}
          className="hidden"
        />

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-black text-xs px-6 py-3 rounded-xl transition shadow-lg shadow-emerald-600/20 cursor-pointer flex items-center gap-2"
          >
            <Upload className="h-4 w-4" />
            <span>Choose CSV File from Computer</span>
          </button>

          <button
            onClick={handleSimulateUpload}
            disabled={importStatus === 'PARSING'}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs px-6 py-3 rounded-xl transition cursor-pointer"
          >
            {importStatus === 'PARSING' ? 'Analyzing & Validating Rows...' : 'Load 14 Multi-Category Pakistani Products'}
          </button>
        </div>
      </div>

      {/* Parsed Preview Section */}
      {parsedRows.length > 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl space-y-4 p-5 animate-fadeIn">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-800 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                <h3 className="font-extrabold text-white text-base">
                  Validated Product Cards ({parsedRows.length} Ready to Publish across {uniqueCategories.length - 1} Categories)
                </h3>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Image 2 کارڈ فارمیٹ میں تمام پروڈکٹس کا لائیو جائزہ
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              <div className="bg-slate-950 border border-slate-800 p-1 rounded-xl flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setViewMode('GRID')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                    viewMode === 'GRID' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <LayoutGrid className="h-3.5 w-3.5" />
                  <span>Image 2 Cards</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('TABLE')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                    viewMode === 'TABLE' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <List className="h-3.5 w-3.5" />
                  <span>Table</span>
                </button>
              </div>

              <button
                type="button"
                onClick={handleAutoFillAi}
                className="px-3.5 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs transition cursor-pointer shadow flex items-center gap-1.5 shrink-0"
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>Auto-Fill AI Media</span>
              </button>

              <button
                onClick={handleCommitImport}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-5 py-2 rounded-xl transition flex items-center gap-2 shadow-lg shadow-emerald-600/20 cursor-pointer shrink-0"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Publish {parsedRows.length} Products</span>
              </button>
            </div>
          </div>

          {/* Category Tabs & Search Bar */}
          <div className="space-y-2 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
            <div className="flex flex-col sm:flex-row gap-2 items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs text-slate-400 font-bold">
                <Filter className="h-3.5 w-3.5 text-emerald-400" />
                <span>Filter by Category:</span>
              </div>

              <div className="relative w-full sm:w-64">
                <Search className="h-3.5 w-3.5 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search parsed products..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
              {uniqueCategories.map((cat) => {
                const count = cat === 'ALL'
                  ? parsedRows.length
                  : parsedRows.filter((r) => r.category === cat).length;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategoryFilter(cat)}
                    className={`whitespace-nowrap px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                      categoryFilter === cat
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-slate-800/80 text-slate-400 hover:text-white'
                    }`}
                  >
                    {cat === 'ALL' ? 'All Products' : cat} ({count})
                  </button>
                );
              })}
            </div>
          </div>

          {/* VIEW 1: IMAGE 2 PRODUCT CARDS GRID */}
          {viewMode === 'GRID' && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4 max-h-[550px] overflow-y-auto p-1">
              {filteredRows.map((row, idx) => {
                const margin = row.price - row.cost;
                const marginPct = row.price > 0 ? Math.round((margin / row.price) * 100) : 0;

                return (
                  <div
                    key={idx}
                    className="bg-white rounded-2xl border border-slate-200/90 shadow-[0_2px_8px_rgba(0,0,0,0.06)] hover:shadow-xl transition-all duration-200 flex flex-col justify-between overflow-hidden group relative"
                  >
                    {/* Top Image Area with Heart */}
                    <div className="relative aspect-square w-full bg-slate-50/80 p-2 sm:p-3 flex items-center justify-center overflow-hidden">
                      <div className="absolute top-2.5 right-2.5 h-7 w-7 rounded-full bg-white/95 border border-slate-200 shadow-xs flex items-center justify-center text-slate-400 z-10">
                        <Heart className="h-3.5 w-3.5 text-rose-500 fill-rose-500" />
                      </div>

                      <div className="absolute top-2.5 left-2.5 z-10">
                        <span className="rounded-md bg-slate-900/80 text-white text-[9px] font-bold px-1.5 py-0.5 backdrop-blur-xs">
                          #{idx + 1}
                        </span>
                      </div>

                      <img
                        src={row.image}
                        alt={row.name}
                        className="h-full w-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = getSmartProductAssets(row.name).image;
                        }}
                      />
                    </div>

                    {/* Card Body */}
                    <div className="p-3 flex flex-col flex-1 justify-between gap-2 text-left">
                      <div>
                        <h3
                          className="text-slate-900 text-xs sm:text-[13px] font-bold leading-snug line-clamp-2 hover:text-emerald-700 transition"
                          title={row.name}
                        >
                          {row.name}
                        </h3>
                        <p className="text-[10px] text-slate-500 mt-1 font-mono truncate">
                          SKU: {row.sku} • {row.category}
                        </p>
                      </div>

                      {/* Store & Rating */}
                      <div className="space-y-1.5 pt-1 border-t border-slate-100">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="flex items-center gap-1 font-bold text-slate-800 truncate max-w-[110px] bg-slate-100 px-1.5 py-0.5 rounded">
                            <Store className="h-3 w-3 text-emerald-600 flex-shrink-0" />
                            <span className="truncate">{row.supplier || 'Verified Store'}</span>
                          </span>
                          <span className="text-[9px] font-bold text-slate-500">
                            {row.stock} in stock
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-[10px]">
                          <div className="flex items-center gap-1 text-slate-600">
                            <span className="flex items-center gap-0.5 text-amber-600 font-bold">
                              <Star className="h-2.5 w-2.5 fill-amber-400 text-amber-400" />
                              <span>4.8</span>
                            </span>
                            <span>(24)</span>
                          </div>

                          {row.videoUrl && (
                            <span className="flex items-center gap-0.5 text-purple-700 font-bold bg-purple-50 border border-purple-200/80 px-1 py-0.2 rounded text-[9px]">
                              <Video className="h-2.5 w-2.5 text-purple-600" />
                              <span>Video</span>
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-1 text-[10px] text-emerald-700 font-semibold bg-emerald-50 border border-emerald-200/60 rounded px-1.5 py-0.5">
                          <Truck className="h-3 w-3 text-emerald-600 flex-shrink-0" />
                          <span className="truncate">⚡ 2-3 Days Delivery</span>
                        </div>
                      </div>

                      {/* Pricing */}
                      <div className="pt-1.5 border-t border-slate-100 space-y-0.5">
                        <div className="flex items-center justify-between text-[10px] text-slate-500">
                          <span>Cost: PKR {row.cost.toLocaleString()}</span>
                          <span className="text-emerald-700 font-bold">+{marginPct}%</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] text-slate-500">Price</span>
                          <span className="text-slate-900 font-black text-sm">
                            PKR {row.price.toLocaleString()}
                          </span>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-1 pt-1.5 border-t border-slate-100">
                        <button
                          type="button"
                          onClick={() => {
                            const realIdx = parsedRows.indexOf(row);
                            setSelectedRowIndexForStudio(realIdx >= 0 ? realIdx : idx);
                          }}
                          className="flex-1 py-1 rounded-lg bg-violet-600 hover:bg-violet-500 text-white font-bold text-[10px] transition cursor-pointer flex items-center justify-center gap-1"
                        >
                          <Sparkles className="h-3 w-3" />
                          <span>AI Studio</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const realIdx = parsedRows.indexOf(row);
                            handleRemoveRow(realIdx >= 0 ? realIdx : idx);
                          }}
                          className="p-1 rounded-lg bg-slate-100 hover:bg-rose-100 text-slate-400 hover:text-rose-600 transition cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* VIEW 2: TABLE VIEW */}
          {viewMode === 'TABLE' && (
            <div className="overflow-x-auto rounded-xl border border-slate-800">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-[10px] uppercase font-bold text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="p-3">#</th>
                    <th className="p-3">Photo</th>
                    <th className="p-3">Product Name</th>
                    <th className="p-3">SKU</th>
                    <th className="p-3">Category</th>
                    <th className="p-3">Cost</th>
                    <th className="p-3">Retail Price</th>
                    <th className="p-3">Stock</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80 font-medium">
                  {filteredRows.map((r, idx) => (
                    <tr key={idx} className="hover:bg-slate-800/40 transition">
                      <td className="p-3 font-mono text-slate-500">{idx + 1}</td>
                      <td className="p-3">
                        <img src={r.image} alt="" className="h-8 w-8 rounded-lg object-cover bg-white" />
                      </td>
                      <td className="p-3 font-bold text-white max-w-[200px] truncate">{r.name}</td>
                      <td className="p-3 font-mono text-slate-400">{r.sku}</td>
                      <td className="p-3">{r.category}</td>
                      <td className="p-3 font-mono font-bold text-white">PKR {r.cost.toLocaleString()}</td>
                      <td className="p-3 font-mono font-bold text-emerald-400">PKR {r.price.toLocaleString()}</td>
                      <td className="p-3 font-bold text-white">{r.stock} units</td>
                      <td className="p-3 text-right">
                        <button
                          type="button"
                          onClick={() => {
                            const realIdx = parsedRows.indexOf(r);
                            setSelectedRowIndexForStudio(realIdx >= 0 ? realIdx : idx);
                          }}
                          className="px-2 py-1 rounded bg-violet-600/30 text-violet-300 hover:bg-violet-600 hover:text-white text-[10px] font-bold"
                        >
                          AI Studio
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* AI Product Asset Studio Modal */}
      {activeRowForStudio && (
        <AiProductAssetStudioModal
          isOpen={selectedRowIndexForStudio !== null}
          onClose={() => setSelectedRowIndexForStudio(null)}
          initialProductName={activeRowForStudio.name}
          initialCategory={activeRowForStudio.category}
          onApplyToProduct={(assets) => {
            if (selectedRowIndexForStudio !== null) {
              setParsedRows((prev) =>
                prev.map((r, idx) =>
                  idx === selectedRowIndexForStudio
                    ? {
                        ...r,
                        image: assets.images[0] || r.image,
                        images: assets.images,
                        videoUrl: assets.videoUrl || r.videoUrl,
                      }
                    : r
                )
              );
            }
            setSelectedRowIndexForStudio(null);
          }}
        />
      )}
    </div>
  );
};
