import React, { useState, useRef } from 'react';
import {
  X,
  PackagePlus,
  Image as ImageIcon,
  Video,
  Plus,
  Trash2,
  Play,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Eye,
  Layers,
  Store,
  Tag,
  ShieldCheck,
  Scale,
  FileSpreadsheet,
  Upload,
  Download,
  LayoutGrid,
  List,
  Search,
  Filter,
  FileCheck,
  PackageCheck,
  FileText
} from 'lucide-react';
import { Product, Store as AppStore, User } from '../types';
import { AiProductAssetStudioModal } from './AiProductAssetStudioModal';
import { getSmartProductAssets } from '../utils/productAssetMatcher';
import { parseCsvText } from '../utils/csvParser';

export interface ParsedProductRow {
  name: string;
  sku: string;
  category: string;
  cost: number;
  price: number;
  stock: number;
  weight: number;
  image: string;
  images?: string[];
  videoUrl?: string;
  description?: string;
  brand?: string;
  aiGenerated?: boolean;
}

interface ProductListingModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  stores?: AppStore[];
  onAddProduct?: (product: Omit<Product, 'id'>) => void;
  onProductCreated?: (newProduct: Product | any) => void;
  onBulkImportSuccess?: (newProducts: Product[]) => void;
  initialMode?: 'SINGLE' | 'BULK_CSV';
}

export const CATEGORIES_LIST = [
  'Consumer Electronics & Mobile Gadgets',
  'Fashion & Apparel',
  'Home & Kitchen Essentials',
  'Personal Care & Health',
  'Packaging & Supplies',
  'Automotive & Mobile Accessories',
  'Watches & Fashion Jewelry',
  'Baby Care & Toys',
];

export const ProductListingModal: React.FC<ProductListingModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  stores = [],
  onAddProduct,
  onProductCreated,
  onBulkImportSuccess,
  initialMode = 'SINGLE',
}) => {
  // Navigation Mode: SINGLE or BULK_CSV
  const [activeMode, setActiveMode] = useState<'SINGLE' | 'BULK_CSV'>(initialMode);

  // ================= SINGLE PRODUCT FORM STATE =================
  const [productName, setProductName] = useState('');
  const [category, setCategory] = useState(CATEGORIES_LIST[0]);
  const [sku, setSku] = useState(`SKU-${Math.floor(1000 + Math.random() * 9000)}`);
  const [brand, setBrand] = useState('');
  const [warranty, setWarranty] = useState('7 Days Replacement Guarantee');
  const [supplierCostPKR, setSupplierCostPKR] = useState<number>(650);
  const [recSellingPricePKR, setRecSellingPricePKR] = useState<number>(1150);
  const [stock, setStock] = useState<number>(150);
  const [weightKg, setWeightKg] = useState<number>(0.35);
  const [moq, setMoq] = useState<number>(1);

  // Media: Images
  const [imageUrls, setImageUrls] = useState<string[]>([
    'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=600&auto=format&fit=crop&q=80',
  ]);
  const [newImageUrl, setNewImageUrl] = useState('');

  // Media: Video
  const [hasVideo, setHasVideo] = useState<boolean>(true);
  const [videoUrl, setVideoUrl] = useState<string>(
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4'
  );
  const [showVideoPreview, setShowVideoPreview] = useState<boolean>(false);

  // Specs
  const [highlights, setHighlights] = useState<string>(
    'Premium ergonomic build quality\nFast dispatch packaging\nHigh customer repeat demand'
  );
  const [whatsInTheBox, setWhatsInTheBox] = useState('1x Main Product Unit, 1x User Manual');
  const [description, setDescription] = useState('');
  const [colorVariants, setColorVariants] = useState('Standard, Black, Silver');

  const userStore = stores.find((s) => s.ownerId === currentUser.id) || stores[0];
  const [selectedStoreId, setSelectedStoreId] = useState<string>(userStore ? userStore.id : 'store-oshi');

  const [errorMessage, setErrorMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [isAiStudioOpen, setIsAiStudioOpen] = useState(false);

  // ================= BULK CSV IMPORT STATE =================
  const [activeInputTab, setActiveInputTab] = useState<'FILE' | 'PASTE'>('FILE');
  const [pastedText, setPastedText] = useState<string>('');
  const [importStatus, setImportStatus] = useState<'IDLE' | 'PARSING' | 'SUCCESS'>('IDLE');
  const [parsedRows, setParsedRows] = useState<ParsedProductRow[]>([]);
  const [fileName, setFileName] = useState<string>('');
  const [bulkErrorMessage, setBulkErrorMessage] = useState<string>('');
  const [selectedRowIndexForStudio, setSelectedRowIndexForStudio] = useState<number | null>(null);
  const [aiSuccessToast, setAiSuccessToast] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'GRID' | 'TABLE'>('GRID');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [modalPage, setModalPage] = useState<number>(1);
  const modalPageSize = 24;
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Sample CSV Content
  const sampleCsvContent = `Product Name,SKU,Category,Wholesale Cost PKR,Retail Price PKR,Stock,Weight KG,Image URL,Video URL
Pack of 2 Dog Bath Brush Pet Massager Silicone,PET-BATH-BRUSH-2PK,Baby Care & Toys,160,315,310,0.15,https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=800&auto=format&fit=crop&q=80,https://assets.mixkit.co/videos/preview/mixkit-cat-lying-on-a-towel-and-relaxing-42978-large.mp4
Wireless Noise Cancelling Earbuds Pro 2,SKU-EAR-99,Consumer Electronics & Mobile Gadgets,1250,2299,150,0.25,https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&auto=format&fit=crop&q=80,https://assets.mixkit.co/videos/preview/mixkit-hands-of-a-man-working-on-a-sound-console-40810-large.mp4
Pack of 3 Cotton Summer Boxer Shorts,SKU-BOX-03,Fashion & Apparel,650,1199,220,0.3,https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80,https://assets.mixkit.co/videos/preview/mixkit-tailor-working-with-fabrics-and-sewing-machine-42459-large.mp4
Stainless Steel Garlic Press Crusher,SKU-GAR-01,Home & Kitchen Essentials,280,699,350,0.18,https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=800&auto=format&fit=crop&q=80,https://assets.mixkit.co/videos/preview/mixkit-chef-cutting-vegetables-with-a-knife-42457-large.mp4
Magnetic Dashboard 360° Car Phone Mount,SKU-CAR-M4,Automotive & Mobile Accessories,390,899,180,0.12,https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&auto=format&fit=crop&q=80,https://assets.mixkit.co/videos/preview/mixkit-car-traveling-on-a-highway-at-dusk-42458-large.mp4`;

  const handleDownloadSample = () => {
    const blob = new Blob([sampleCsvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'yourmart_bulk_products_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const processRawText = (rawContent: string, sourceName: string) => {
    setBulkErrorMessage('');
    setImportStatus('PARSING');

    try {
      const result = parseCsvText(rawContent, currentUser?.companyName || 'Verified Wholesale Factory');

      if (result.products.length === 0) {
        setBulkErrorMessage('File ya text khali hai ya koi valid products nahi mil sakay. Baraye meherbani valid CSV data provide karein.');
        setImportStatus('IDLE');
        return;
      }

      const parsed: ParsedProductRow[] = result.products.map((p) => ({
        name: p.name,
        sku: p.sku,
        category: p.category,
        cost: p.cost,
        price: p.price,
        stock: p.stock,
        weight: p.weight,
        image: p.image,
        images: p.images || [p.image],
        videoUrl: p.videoUrl,
        description: p.description,
        brand: p.brand,
      }));

      setFileName(sourceName);
      setParsedRows(parsed);
      setImportStatus('SUCCESS');
      setViewMode('GRID');
      setCategoryFilter('ALL');
      setModalPage(1);
    } catch (err) {
      console.error(err);
      setBulkErrorMessage('CSV format parse karne me masla aya. Baraye meherbani standard CSV/Excel format use karein.');
      setImportStatus('IDLE');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      processRawText(text, file.name);
    };
    reader.readAsText(file);
  };

  const handlePasteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pastedText.trim()) {
      setBulkErrorMessage('Baraye meherbani pehle Excel ya CSV data paste karein.');
      return;
    }
    processRawText(pastedText, 'Pasted_Data_Clipboard.csv');
  };

  const handleAutoFillAiImages = () => {
    const updated = parsedRows.map((row) => {
      const pack = getSmartProductAssets(row.name);
      return {
        ...row,
        image: pack.image,
        images: [pack.image, ...pack.extraImages],
        videoUrl: pack.videoUrl,
        category: row.category || pack.category,
        aiGenerated: true,
      };
    });

    setParsedRows(updated);
    setAiSuccessToast(`✨ AI Asset Studio: All ${parsedRows.length} items filled with studio photos & HD video demos!`);
    setTimeout(() => setAiSuccessToast(null), 3500);
  };

  const handleRemoveBulkRow = (index: number) => {
    setParsedRows((prev) => prev.filter((_, i) => i !== index));
  };

  const handleCommitBulk = () => {
    if (parsedRows.length === 0) return;

    const assignedStore = stores.find((s) => s.ownerId === currentUser?.id) || stores[0];

    const newProducts: Product[] = parsedRows.map((r, i) => {
      const smartPack = getSmartProductAssets(r.name);
      return {
        id: `prod-bulk-${Date.now()}-${i + 1}`,
        name: r.name,
        sku: r.sku,
        category: r.category,
        supplierId: currentUser?.id || 'sup-verified-1',
        supplierName: assignedStore ? assignedStore.name : currentUser?.companyName || currentUser?.name || 'Verified Wholesale Factory',
        supplierCostPKR: r.cost,
        recSellingPricePKR: r.price,
        stock: r.stock,
        lowStockThreshold: 15,
        isActive: true,
        image: r.image,
        images: r.images && r.images.length > 0 ? r.images : [r.image, ...smartPack.extraImages],
        videoUrl: r.videoUrl || smartPack.videoUrl,
        brand: r.brand || 'Direct Factory Import',
        warranty: '7 Days Check Warranty',
        weightKg: r.weight || 0.3,
        description: r.description || `${r.name} - Factory wholesale product available for instant COD dispatch across Pakistan.`,
        rating: 4.8,
        salesCount: Math.floor(Math.random() * 80) + 20,
        isTrending: true,
        tags: ['Bulk Import', 'Wholesale', 'Fast Dispatch'],
        moq: 1,
        storeId: assignedStore ? assignedStore.id : 'store-oshi',
        storeName: assignedStore ? assignedStore.name : 'Oshi Logistics & Direct Sourcing',
        storeRating: assignedStore ? assignedStore.rating : 4.9,
        deliveryRating: assignedStore ? assignedStore.deliveryRating : '⚡ 2-3 Days Fast Delivery (98% On-Time)',
        reviewsCount: Math.floor(Math.random() * 30) + 12,
      };
    });

    if (onBulkImportSuccess) {
      onBulkImportSuccess(newProducts);
    } else if (onProductCreated) {
      newProducts.forEach((p) => onProductCreated(p));
    }
    onClose();
  };

  // Bulk Filtered Rows
  const totalStockCount = parsedRows.reduce((sum, r) => sum + r.stock, 0);
  const totalWholesaleValuePKR = parsedRows.reduce((sum, r) => sum + r.cost * r.stock, 0);
  const uniqueCategories = ['ALL', ...Array.from(new Set(parsedRows.map((r) => r.category)))];

  const filteredBulkRows = parsedRows.filter((r) => {
    const matchesCategory = categoryFilter === 'ALL' || r.category === categoryFilter;
    const matchesSearch =
      !searchQuery ||
      r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const totalModalPages = Math.ceil(filteredBulkRows.length / modalPageSize) || 1;
  const paginatedBulkRows = filteredBulkRows.slice((modalPage - 1) * modalPageSize, modalPage * modalPageSize);
  const activeRowForStudio = selectedRowIndexForStudio !== null ? parsedRows[selectedRowIndexForStudio] : null;

  // Single Item Handlers
  const handleAddImage = () => {
    if (newImageUrl.trim()) {
      setImageUrls((prev) => [...prev, newImageUrl.trim()]);
      setNewImageUrl('');
    }
  };

  const handleRemoveImage = (idx: number) => {
    if (imageUrls.length <= 1) {
      setErrorMessage('Kam az kam 1 image hona zaroori hai.');
      return;
    }
    setImageUrls((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSingleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!productName.trim()) {
      setErrorMessage('Product ka title / name darj karein.');
      return;
    }
    if (supplierCostPKR <= 0) {
      setErrorMessage('Durust wholesale / factory purchase cost enter karein.');
      return;
    }
    if (recSellingPricePKR <= supplierCostPKR) {
      setErrorMessage('Retail price factory cost se zyada honi chahiye taake munafa ho.');
      return;
    }
    if (imageUrls.length === 0) {
      setErrorMessage('Kam az kam 1 product image zaroori hai.');
      return;
    }

    const assignedStore = stores.find((s) => s.id === selectedStoreId) || userStore || stores[0];

    const highlightsArray = highlights
      .split('\n')
      .map((h) => h.trim())
      .filter(Boolean);

    const variantsArray = colorVariants
      .split(',')
      .map((v) => v.trim())
      .filter(Boolean);

    const newProductData: Omit<Product, 'id'> = {
      name: productName.trim(),
      category,
      sku: sku.trim() || `SKU-${Date.now()}`,
      supplierId: currentUser.id,
      supplierName: assignedStore ? assignedStore.name : currentUser.companyName || currentUser.name,
      supplierCostPKR: Number(supplierCostPKR),
      recSellingPricePKR: Number(recSellingPricePKR),
      stock: Number(stock) || 50,
      image: imageUrls[0],
      images: imageUrls,
      videoUrl: hasVideo && videoUrl.trim() ? videoUrl.trim() : undefined,
      isActive: true,
      brand: brand.trim() || 'Direct Factory Import',
      warranty: warranty.trim() || '7 Days Replacement Warranty',
      highlights: highlightsArray,
      whatsInTheBox: whatsInTheBox.trim(),
      weightKg: Number(weightKg) || 0.3,
      description:
        description.trim() ||
        `${productName} - Wholesale product directly dispatched from verified warehouse with express delivery.`,
      rating: 4.9,
      salesCount: 1,
      isTrending: true,
      tags: ['New Arrival', 'Factory Direct'],
      moq: Number(moq) || 1,
      colorVariants: variantsArray,
      storeId: assignedStore ? assignedStore.id : 'store-oshi',
      storeName: assignedStore ? assignedStore.name : 'Verified Manufacturer Hub',
      storeRating: assignedStore ? assignedStore.rating : 4.9,
      deliveryRating: assignedStore ? assignedStore.deliveryRating : '⚡ 2-3 Days Fast Delivery (98% On-Time)',
      reviewsCount: 12,
    };

    if (onAddProduct) {
      onAddProduct(newProductData);
    }
    if (onProductCreated) {
      onProductCreated({ ...newProductData, id: `prod-${Date.now()}` });
    }
    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      onClose();
    }, 1200);
  };

  return (
    <div
      id="product-listing-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-4 overflow-y-auto animate-fadeIn"
    >
      <div className="relative w-full max-w-5xl rounded-3xl border border-emerald-500/40 bg-slate-900 text-slate-100 shadow-2xl overflow-hidden my-6">
        {/* Top Header with Unified Listing Branding & Mode Toggle */}
        <div className="relative bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-950 p-5 sm:p-6 border-b border-slate-800">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 rounded-full bg-slate-800/80 p-2 text-slate-400 hover:bg-slate-700 hover:text-white transition cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-lg">
                <PackagePlus className="h-6 w-6" />
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-[10px] font-bold text-emerald-300 border border-emerald-500/40 uppercase tracking-wider">
                    Official Product Listing Station
                  </span>
                  <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                    <ShieldCheck className="h-3.5 w-3.5" /> Live Wholesale Publishing
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-0.5">
                  Listing Hub
                </h2>
              </div>
            </div>

            {/* UNIFIED MODE SWITCHER TABS: Single Product vs Bulk CSV Import */}
            <div className="flex bg-slate-950 p-1.5 rounded-2xl border border-slate-800 self-start sm:self-auto shadow-inner">
              <button
                type="button"
                onClick={() => setActiveMode('SINGLE')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                  activeMode === 'SINGLE'
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <PackagePlus className="h-4 w-4" />
                <span>Single Product (ایک پروڈکٹ)</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveMode('BULK_CSV')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                  activeMode === 'BULK_CSV'
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <FileSpreadsheet className="h-4 w-4" />
                <span>Bulk CSV / Excel (ایک ساتھ تمام)</span>
              </button>
            </div>
          </div>
        </div>

        {/* ================= TAB 1: SINGLE PRODUCT LISTING ================= */}
        {activeMode === 'SINGLE' && (
          <form onSubmit={handleSingleSubmit} className="p-5 sm:p-6 space-y-5 max-h-[75vh] overflow-y-auto">
            {errorMessage && (
              <div className="rounded-xl border border-rose-500/40 bg-rose-950/40 p-3.5 text-xs text-rose-200 flex items-start gap-2.5">
                <AlertCircle className="h-4 w-4 text-rose-400 flex-shrink-0 mt-0.5" />
                <div>{errorMessage}</div>
              </div>
            )}

            {isSuccess && (
              <div className="rounded-xl border border-emerald-500/40 bg-emerald-950/40 p-4 text-xs text-emerald-200 flex items-center gap-2.5">
                <CheckCircle2 className="h-5 w-5 text-emerald-400 flex-shrink-0" />
                <div className="font-bold text-sm">
                  Product Kamyabi se List Ho Gaya Hai! Store aur Catalog mein live add kar diya gaya hai.
                </div>
              </div>
            )}

            {/* Section 1: Basic Information */}
            <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4 space-y-3.5">
              <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="h-3.5 w-3.5" />
                <span>1. Basic Product Specifications</span>
              </h3>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  Product Title / Heading *
                </label>
                <input
                  type="text"
                  required
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  placeholder="e.g. Wireless Noise-Cancelling Bluetooth Earbuds Pro 5.3"
                  className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">
                    Category *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-2.5 text-xs text-white focus:border-emerald-500 focus:outline-none"
                  >
                    {CATEGORIES_LIST.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">
                    SKU / Barcode Code
                  </label>
                  <input
                    type="text"
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-2.5 text-xs text-white font-mono focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Brand / Manufacturer</label>
                  <input
                    type="text"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    placeholder="e.g. Apex Direct / Audionic"
                    className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Warranty Policy</label>
                  <input
                    type="text"
                    value={warranty}
                    onChange={(e) => setWarranty(e.target.value)}
                    placeholder="7 Days Check Warranty"
                    className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Weight (KG)</label>
                  <input
                    type="number"
                    step="0.05"
                    min="0.05"
                    value={weightKg}
                    onChange={(e) => setWeightKg(parseFloat(e.target.value) || 0.3)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-2.5 text-xs text-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Pricing & Inventory */}
            <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4 space-y-3.5">
              <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                <Tag className="h-3.5 w-3.5" />
                <span>2. Pricing, Margin & Stock Levels</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">
                    Wholesale / Base Cost (PKR) *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={supplierCostPKR}
                    onChange={(e) => setSupplierCostPKR(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-2.5 text-xs text-white font-mono focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">
                    Suggested Retail Price (PKR) *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={recSellingPricePKR}
                    onChange={(e) => setRecSellingPricePKR(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-2.5 text-xs text-white font-mono focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">
                    Physical Stock Units *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={stock}
                    onChange={(e) => setStock(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-2.5 text-xs text-white font-mono focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Profit Margin Preview Bar */}
              <div className="bg-slate-900/90 rounded-xl p-3 border border-slate-800 flex items-center justify-between text-xs">
                <div>
                  <span className="text-slate-400">Reseller Profit Margin:</span>
                  <span className="ml-2 font-bold text-emerald-400">
                    PKR {(recSellingPricePKR - supplierCostPKR).toLocaleString()} (
                    {recSellingPricePKR > 0
                      ? Math.round(((recSellingPricePKR - supplierCostPKR) / recSellingPricePKR) * 100)
                      : 0}
                    %)
                  </span>
                </div>
                <div className="text-slate-400 text-[11px]">
                  <span>Fast COD Dispatch across Pakistan</span>
                </div>
              </div>
            </div>

            {/* Section 3: Multi-Images & Optional Video */}
            <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4 space-y-3.5">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                  <ImageIcon className="h-3.5 w-3.5" />
                  <span>3. Media: High-Res Photos & Optional Video Reel</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setIsAiStudioOpen(true)}
                  className="px-2.5 py-1 rounded-lg bg-violet-600/30 hover:bg-violet-600 text-violet-300 hover:text-white border border-violet-500/40 text-[10px] font-bold transition flex items-center gap-1 cursor-pointer"
                >
                  <Sparkles className="h-3 w-3" />
                  <span>Launch AI Media Studio</span>
                </button>
              </div>

              {/* Image Previews */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                {imageUrls.map((url, idx) => (
                  <div key={idx} className="relative group rounded-xl overflow-hidden border border-slate-700 bg-slate-900 aspect-square">
                    <img src={url} alt={`Preview ${idx + 1}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(idx)}
                      className="absolute top-1.5 right-1.5 p-1 rounded-lg bg-black/70 text-rose-400 opacity-0 group-hover:opacity-100 transition cursor-pointer"
                      title="Remove image"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                    {idx === 0 && (
                      <span className="absolute bottom-1.5 left-1.5 px-2 py-0.5 rounded text-[9px] font-bold bg-emerald-600 text-white shadow">
                        Main Display
                      </span>
                    )}
                  </div>
                ))}

                {/* Add New Image Input */}
                <div className="border border-dashed border-slate-700 rounded-xl p-3 flex flex-col justify-center gap-2 bg-slate-900/50">
                  <input
                    type="url"
                    value={newImageUrl}
                    onChange={(e) => setNewImageUrl(e.target.value)}
                    placeholder="Paste Image URL"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-1.5 text-[10px] text-white focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleAddImage}
                    className="w-full py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 font-bold transition flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Plus className="h-3 w-3" />
                    <span>Add Photo</span>
                  </button>
                </div>
              </div>

              {/* Video Section */}
              <div className="pt-2 border-t border-slate-800/80 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-300 flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={hasVideo}
                      onChange={(e) => setHasVideo(e.target.checked)}
                      className="rounded border-slate-700 text-emerald-500 focus:ring-0"
                    />
                    <span>Attach HD Video Demo Reel (MP4)</span>
                  </label>
                  {hasVideo && (
                    <button
                      type="button"
                      onClick={() => setShowVideoPreview(!showVideoPreview)}
                      className="text-[11px] text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Play className="h-3 w-3" />
                      <span>{showVideoPreview ? 'Hide Preview' : 'Preview Video'}</span>
                    </button>
                  )}
                </div>

                {hasVideo && (
                  <input
                    type="url"
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    placeholder="https://.../product_demo.mp4"
                    className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-2 text-xs text-white font-mono focus:border-emerald-500 focus:outline-none"
                  />
                )}

                {hasVideo && showVideoPreview && (
                  <div className="rounded-xl overflow-hidden border border-slate-800 bg-black aspect-video max-h-48 mt-2">
                    <video src={videoUrl} controls className="w-full h-full object-contain" />
                  </div>
                )}
              </div>
            </div>

            {/* Section 4: Store Association */}
            <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4 space-y-3.5">
              <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                <Store className="h-3.5 w-3.5" />
                <span>4. Store & Warehouse Association</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Assign to Storefront</label>
                  <select
                    value={selectedStoreId}
                    onChange={(e) => setSelectedStoreId(e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-2.5 text-xs text-white focus:border-emerald-500 focus:outline-none"
                  >
                    {stores.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.city || 'Pakistan'})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Color Variants (Comma separated)</label>
                  <input
                    type="text"
                    value={colorVariants}
                    onChange={(e) => setColorVariants(e.target.value)}
                    placeholder="Black, Silver, Blue, Gold"
                    className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-2.5 text-xs text-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black transition shadow-lg shadow-emerald-950/60 cursor-pointer flex items-center gap-2"
              >
                <CheckCircle2 className="h-4 w-4" />
                <span>Publish & List Product Live</span>
              </button>
            </div>
          </form>
        )}

        {/* ================= TAB 2: BULK CSV / EXCEL IMPORT ================= */}
        {activeMode === 'BULK_CSV' && (
          <div className="p-5 sm:p-6 space-y-5 max-h-[75vh] overflow-y-auto">
            {bulkErrorMessage && (
              <div className="rounded-xl border border-rose-500/40 bg-rose-950/40 p-3.5 text-xs text-rose-200 flex items-start gap-2.5">
                <AlertCircle className="h-4 w-4 text-rose-400 flex-shrink-0 mt-0.5" />
                <div>{bulkErrorMessage}</div>
              </div>
            )}

            {aiSuccessToast && (
              <div className="rounded-xl border border-violet-500/50 bg-violet-950/80 p-3 text-xs text-violet-200 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-violet-400" />
                <span>{aiSuccessToast}</span>
              </div>
            )}

            {/* Input Selection Tabs: File Upload vs Direct Paste */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setActiveInputTab('FILE')}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg transition cursor-pointer ${
                    activeInputTab === 'FILE'
                      ? 'bg-purple-600 text-white shadow-xs'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Upload className="h-3.5 w-3.5" />
                  <span>Upload CSV / TSV File</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveInputTab('PASTE')}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg transition cursor-pointer ${
                    activeInputTab === 'PASTE'
                      ? 'bg-purple-600 text-white shadow-xs'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <FileText className="h-3.5 w-3.5" />
                  <span>Direct Excel / Sheets Paste</span>
                </button>
              </div>

              <button
                type="button"
                onClick={handleDownloadSample}
                className="hidden sm:flex items-center gap-1.5 text-xs text-purple-300 hover:text-white font-bold transition cursor-pointer"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Download Template (.CSV)</span>
              </button>
            </div>

            {/* TAB A: File Upload Zone */}
            {activeInputTab === 'FILE' && (
              <div className="border-2 border-dashed border-purple-500/40 bg-purple-950/10 rounded-2xl p-6 text-center space-y-3">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-500/20 text-purple-400 border border-purple-500/40">
                  <FileSpreadsheet className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Upload Catalog File (CSV, TSV, or Excel Export)</h4>
                  <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                    Shopify, Daraz, WooCommerce ya custom supplier format files drop karein. Multi-line descriptions اور تمام کیٹیگریز 100% محفوظ رہیں گی۔
                  </p>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,text/csv,text/plain,.tsv"
                  onChange={handleFileChange}
                  className="hidden"
                />

                <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold px-6 py-2.5 text-xs transition shadow-lg cursor-pointer flex items-center gap-2"
                  >
                    <Upload className="h-4 w-4" />
                    <span>Choose CSV File from Computer</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => processRawText(sampleCsvContent, 'Pakistani_Top_Sellers_Sample.csv')}
                    className="rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 font-bold px-4 py-2.5 text-xs transition cursor-pointer flex items-center gap-1.5"
                  >
                    <Sparkles className="h-4 w-4 text-purple-400" />
                    <span>Load Sample Data</span>
                  </button>
                </div>

                {fileName && (
                  <div className="pt-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-800 border border-slate-700 px-3.5 py-1 text-xs text-emerald-400 font-mono">
                      <FileCheck className="h-3.5 w-3.5" />
                      <span>Loaded: {fileName}</span>
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* TAB B: Direct Paste */}
            {activeInputTab === 'PASTE' && (
              <form onSubmit={handlePasteSubmit} className="space-y-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                    <span>Excel ya Google Sheets se copy kiya hua data yahan paste karein:</span>
                    <span className="text-[11px] text-purple-400 font-mono">Ctrl+V support</span>
                  </label>
                  <textarea
                    rows={5}
                    value={pastedText}
                    onChange={(e) => setPastedText(e.target.value)}
                    placeholder={`Product Name\tSKU\tCategory\tWholesale Cost\tRetail Price\tStock\nWireless Earbuds\tEAR-01\tElectronics\t1200\t2200\t150\nCotton Boxer Shorts\tBOX-01\tFashion\t650\t1199\t200`}
                    className="w-full rounded-2xl border border-slate-700 bg-slate-950 p-3.5 text-xs font-mono text-slate-100 placeholder-slate-600 focus:border-purple-500 focus:outline-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setPastedText(sampleCsvContent)}
                    className="px-3 py-1.5 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
                  >
                    Insert Sample
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-black transition shadow-lg cursor-pointer"
                  >
                    Parse Pasted Rows
                  </button>
                </div>
              </form>
            )}

            {/* Parsed Rows Preview Section */}
            {parsedRows.length > 0 && (
              <div className="rounded-2xl border border-slate-800 bg-slate-950 overflow-hidden space-y-4 p-4 shadow-xl">
                {/* Summary Metrics */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-900/80 p-3.5 rounded-xl border border-slate-800">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400">Total Products</span>
                    <p className="text-base sm:text-lg font-black text-white mt-0.5">
                      {parsedRows.length.toLocaleString()} Items
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400">Categories Detected</span>
                    <p className="text-base sm:text-lg font-black text-emerald-400 mt-0.5 flex items-center gap-1">
                      <Layers className="h-4 w-4" /> {uniqueCategories.length - 1} Categories
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400">Total Stock</span>
                    <p className="text-base sm:text-lg font-black text-slate-200 mt-0.5">
                      {totalStockCount.toLocaleString()} Units
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400">Wholesale Value</span>
                    <p className="text-base sm:text-lg font-black text-orange-400 mt-0.5 font-mono">
                      PKR {totalWholesaleValuePKR.toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* View Switcher Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                      <h4 className="text-xs font-black text-white uppercase tracking-wider">
                        CSV Preview ({parsedRows.length} Items Ready)
                      </h4>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="bg-slate-900 border border-slate-800 p-1 rounded-xl flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setViewMode('GRID')}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                          viewMode === 'GRID'
                            ? 'bg-purple-600 text-white shadow'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        <LayoutGrid className="h-3.5 w-3.5" />
                        <span>Card Grid</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setViewMode('TABLE')}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                          viewMode === 'TABLE'
                            ? 'bg-purple-600 text-white shadow'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        <List className="h-3.5 w-3.5" />
                        <span>Table View</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Category Filter & Search Bar */}
                <div className="space-y-2 bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                  <div className="flex flex-col sm:flex-row gap-2 items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs text-slate-400 font-bold">
                      <Filter className="h-3.5 w-3.5 text-purple-400" />
                      <span>Filter Category:</span>
                    </div>

                    <div className="relative w-full sm:w-64">
                      <Search className="h-3.5 w-3.5 text-slate-500 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search parsed items..."
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                    {uniqueCategories.map((cat) => {
                      const count =
                        cat === 'ALL'
                          ? parsedRows.length
                          : parsedRows.filter((r) => r.category === cat).length;
                      return (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => {
                            setCategoryFilter(cat);
                            setModalPage(1);
                          }}
                          className={`whitespace-nowrap px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                            categoryFilter === cat
                              ? 'bg-purple-600 text-white shadow-xs'
                              : 'bg-slate-800/80 text-slate-400 hover:text-white'
                          }`}
                        >
                          {cat === 'ALL' ? 'All Products' : cat} ({count})
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* AI Auto-Fill Media Button */}
                <div className="rounded-xl border border-violet-500/40 bg-violet-950/40 p-3 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-violet-400 shrink-0" />
                    <span className="text-xs text-slate-300">
                      Auto-generate HD demo videos and studio images for all items via AI Asset Studio.
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleAutoFillAiImages}
                    className="px-3.5 py-1.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs transition cursor-pointer shadow flex items-center gap-1.5 shrink-0"
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>Auto-Fill Media (AI)</span>
                  </button>
                </div>

                {/* CARD GRID VIEW */}
                {viewMode === 'GRID' && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-[450px] overflow-y-auto p-1">
                    {paginatedBulkRows.map((row, idx) => (
                      <div
                        key={idx}
                        className="bg-white rounded-2xl border border-slate-200 shadow-sm p-3 flex flex-col justify-between text-slate-900"
                      >
                        <div>
                          <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-slate-100 mb-2">
                            <img src={row.image} alt="" className="w-full h-full object-cover" />
                          </div>
                          <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider block truncate">
                            {row.category}
                          </span>
                          <h5 className="text-xs font-bold line-clamp-2 mt-0.5" title={row.name}>
                            {row.name}
                          </h5>
                          <p className="text-[10px] text-slate-500 font-mono mt-0.5">{row.sku}</p>
                        </div>

                        <div className="pt-2 border-t border-slate-100 mt-2 flex items-center justify-between text-xs">
                          <div>
                            <span className="text-[9px] text-slate-400 block">Cost</span>
                            <span className="font-bold text-slate-700">PKR {row.cost}</span>
                          </div>
                          <div className="text-right">
                            <span className="text-[9px] text-emerald-600 font-bold block">Sell</span>
                            <span className="font-black text-emerald-700">PKR {row.price}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* TABLE VIEW */}
                {viewMode === 'TABLE' && (
                  <div className="overflow-x-auto max-h-60 overflow-y-auto rounded-xl border border-slate-800">
                    <table className="w-full text-left text-xs text-slate-300">
                      <thead className="bg-slate-900 text-[10px] uppercase font-bold text-slate-400 sticky top-0 z-10 border-b border-slate-800">
                        <tr>
                          <th className="p-2.5">#</th>
                          <th className="p-2.5">Photo</th>
                          <th className="p-2.5">Product Title</th>
                          <th className="p-2.5">SKU</th>
                          <th className="p-2.5">Category</th>
                          <th className="p-2.5">Cost</th>
                          <th className="p-2.5">Price</th>
                          <th className="p-2.5">Stock</th>
                          <th className="p-2.5 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/80">
                        {paginatedBulkRows.map((row, idx) => (
                          <tr key={idx} className="hover:bg-slate-900/60 transition">
                            <td className="p-2.5 text-slate-500 font-mono text-[11px]">
                              {(modalPage - 1) * modalPageSize + idx + 1}
                            </td>
                            <td className="p-2.5">
                              <img src={row.image} alt="" className="h-8 w-8 rounded-lg object-cover" />
                            </td>
                            <td className="p-2.5 font-bold text-white max-w-[200px] truncate" title={row.name}>
                              {row.name}
                            </td>
                            <td className="p-2.5 font-mono text-slate-400 text-[11px]">{row.sku}</td>
                            <td className="p-2.5 text-slate-300 text-[11px] truncate max-w-[120px]">
                              {row.category}
                            </td>
                            <td className="p-2.5 font-mono text-orange-400 font-bold">PKR {row.cost}</td>
                            <td className="p-2.5 font-mono text-emerald-400 font-bold">PKR {row.price}</td>
                            <td className="p-2.5 font-bold text-slate-200">{row.stock}</td>
                            <td className="p-2.5 text-right">
                              <button
                                type="button"
                                onClick={() => handleRemoveBulkRow((modalPage - 1) * modalPageSize + idx)}
                                className="p-1 rounded bg-slate-800 hover:bg-rose-900 text-rose-400 transition cursor-pointer"
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Pagination Controls */}
                {filteredBulkRows.length > 0 && totalModalPages > 1 && (
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-2 border-t border-slate-800 text-xs text-slate-400">
                    <div>
                      Showing <strong className="text-white">{(modalPage - 1) * modalPageSize + 1}</strong>–
                      <strong className="text-white">{Math.min(modalPage * modalPageSize, filteredBulkRows.length)}</strong> of{' '}
                      <strong className="text-purple-400">{filteredBulkRows.length.toLocaleString()}</strong> items
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setModalPage(1)}
                        disabled={modalPage === 1}
                        className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 disabled:opacity-40 hover:bg-slate-800 text-[11px]"
                      >
                        First
                      </button>
                      <button
                        type="button"
                        onClick={() => setModalPage((p) => Math.max(1, p - 1))}
                        disabled={modalPage === 1}
                        className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 disabled:opacity-40 hover:bg-slate-800 text-[11px]"
                      >
                        Prev
                      </button>
                      <span className="px-3 py-1 rounded-lg bg-slate-900 border border-slate-800 font-mono text-[11px] text-purple-400">
                        Page {modalPage} of {totalModalPages}
                      </span>
                      <button
                        type="button"
                        onClick={() => setModalPage((p) => Math.min(totalModalPages, p + 1))}
                        disabled={modalPage === totalModalPages}
                        className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 disabled:opacity-40 hover:bg-slate-800 text-[11px]"
                      >
                        Next
                      </button>
                      <button
                        type="button"
                        onClick={() => setModalPage(totalModalPages)}
                        disabled={modalPage === totalModalPages}
                        className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 disabled:opacity-40 hover:bg-slate-800 text-[11px]"
                      >
                        Last
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Bulk Commit Footer */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-800">
              <div className="text-xs text-slate-400 flex items-center gap-2">
                <span className="flex h-2 w-2 rounded-full bg-purple-400" />
                <span>
                  {parsedRows.length > 0
                    ? `${parsedRows.length} items parsed across ${uniqueCategories.length - 1} categories`
                    : 'Select or paste spreadsheet to parse'}
                </span>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleCommitBulk}
                  disabled={parsedRows.length === 0}
                  className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:bg-slate-800 disabled:text-slate-600 text-white text-xs font-black transition shadow-lg cursor-pointer flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Import & Publish All ({parsedRows.length} Products)</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Embedded Dedicated AI Product Studio for specific row */}
      {activeRowForStudio && (
        <AiProductAssetStudioModal
          isOpen={selectedRowIndexForStudio !== null}
          onClose={() => setSelectedRowIndexForStudio(null)}
          initialProductName={activeRowForStudio.name}
          initialCategory={activeRowForStudio.category}
          onApplyToProduct={(assets) => {
            const updated = [...parsedRows];
            updated[selectedRowIndexForStudio!] = {
              ...activeRowForStudio,
              image: assets.images?.[0] || activeRowForStudio.image,
              images: assets.images?.length ? assets.images : [activeRowForStudio.image],
              videoUrl: assets.videoUrl || activeRowForStudio.videoUrl,
              category: activeRowForStudio.category,
              aiGenerated: true,
            };
            setParsedRows(updated);
            setSelectedRowIndexForStudio(null);
          }}
        />
      )}

      {/* Embedded AI Studio for single product mode */}
      <AiProductAssetStudioModal
        isOpen={isAiStudioOpen}
        onClose={() => setIsAiStudioOpen(false)}
        initialProductName={productName || 'Wholesale Wireless Earbuds'}
        initialCategory={category}
        onApplyToProduct={(assets) => {
          if (assets.images?.length) {
            setImageUrls(assets.images);
          }
          if (assets.videoUrl) {
            setVideoUrl(assets.videoUrl);
            setHasVideo(true);
          }
          setIsAiStudioOpen(false);
        }}
      />
    </div>
  );
};
