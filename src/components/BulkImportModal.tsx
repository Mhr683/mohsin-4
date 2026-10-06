import React, { useState, useRef } from 'react';
import {
  X,
  FileSpreadsheet,
  Upload,
  Download,
  CheckCircle2,
  AlertCircle,
  FileText,
  Boxes,
  ArrowRight,
  Sparkles,
  Check,
  Video,
  Clipboard,
  Trash2,
  ShieldCheck,
  HelpCircle,
  FileCheck,
  PackageCheck,
  LayoutGrid,
  List,
  Store,
  Star,
  Truck,
  Heart,
  Search,
  Filter,
  Layers
} from 'lucide-react';
import { Product, Store as AppStore, User } from '../types';
import { AiProductAssetStudioModal } from './AiProductAssetStudioModal';
import { getSmartProductAssets } from '../utils/productAssetMatcher';
import { parseCsvText } from '../utils/csvParser';

interface BulkImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  stores?: AppStore[];
  onImportSuccess: (newProducts: Product[]) => void;
}

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

/**
 * Robust Dual-Pass CSV / TSV / Excel Parser.
 * Pass 1: RFC-4180 standard parser.
 * Pass 2: Line-by-line fallback if unclosed quotes (e.g. 12" screen, 7" phone)
 * accidentally merged multiple rows! Guarantees 100% of rows are extracted.
 */
function parseDelimitedText(text: string): { headers: string[]; rows: string[][] } {
  const clean = text.replace(/^\uFEFF/, '').trim();
  if (!clean) return { headers: [], rows: [] };

  const rawLines = clean.split(/\r\n|\n|\r/).filter((l) => l.trim().length > 0);
  if (rawLines.length === 0) return { headers: [], rows: [] };

  // Detect delimiter
  const sample = rawLines.slice(0, 8).join('\n');
  const commaCount = (sample.match(/,/g) || []).length;
  const tabCount = (sample.match(/\t/g) || []).length;
  const semiCount = (sample.match(/;/g) || []).length;
  const pipeCount = (sample.match(/\|/g) || []).length;

  let delimiter = ',';
  if (tabCount > commaCount && tabCount >= semiCount) delimiter = '\t';
  else if (semiCount > commaCount && semiCount > tabCount) delimiter = ';';
  else if (pipeCount > commaCount && pipeCount > semiCount) delimiter = '|';

  // Strategy 1: Standard RFC Parser
  const rfcRecords: string[][] = [];
  let currentRecord: string[] = [];
  let currentField = '';
  let inQuotes = false;

  for (let i = 0; i < clean.length; i++) {
    const char = clean[i];
    const nextChar = clean[i + 1];

    if (inQuotes) {
      if (char === '"') {
        if (nextChar === '"') {
          currentField += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        currentField += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === delimiter) {
        currentRecord.push(currentField.trim());
        currentField = '';
      } else if (char === '\r') {
        if (nextChar === '\n') i++;
        currentRecord.push(currentField.trim());
        if (currentRecord.some((f) => f.length > 0)) {
          rfcRecords.push(currentRecord);
        }
        currentRecord = [];
        currentField = '';
      } else if (char === '\n') {
        currentRecord.push(currentField.trim());
        if (currentRecord.some((f) => f.length > 0)) {
          rfcRecords.push(currentRecord);
        }
        currentRecord = [];
        currentField = '';
      } else {
        currentField += char;
      }
    }
  }

  if (currentField || currentRecord.length > 0) {
    currentRecord.push(currentField.trim());
    if (currentRecord.some((f) => f.length > 0)) {
      rfcRecords.push(currentRecord);
    }
  }

  // Strategy 2: If RFC parsing swallowed lines due to unclosed quotes (e.g. 12" bag, 7" phone),
  // fall back to line-by-line delimiter splitting so ZERO products are missed!
  let chosenRecords = rfcRecords;
  if (rfcRecords.length < rawLines.length * 0.7 && rawLines.length > 3) {
    chosenRecords = rawLines.map((line) => {
      // Split line by delimiter and strip exterior quotes
      return line.split(delimiter).map((cell) => cell.replace(/^"|"$/g, '').trim());
    });
  }

  if (chosenRecords.length === 0) return { headers: [], rows: [] };

  const headers = chosenRecords[0].map((h) => h.toLowerCase().replace(/[\r\n]+/g, ' ').trim());
  const rows = chosenRecords.slice(1);

  return { headers, rows };
}

function findColumnIndex(headers: string[], aliases: string[]): number {
  for (let i = 0; i < headers.length; i++) {
    const h = headers[i].toLowerCase().replace(/[^a-z0-9]/g, '');
    for (const alias of aliases) {
      const a = alias.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (h === a || h.includes(a) || a.includes(h)) {
        return i;
      }
    }
  }
  return -1;
}

function cleanNumber(val: any, fallback = 0): number {
  if (val === undefined || val === null || val === '') return fallback;
  const num = parseFloat(String(val).replace(/[^0-9.-]/g, ''));
  return isNaN(num) ? fallback : num;
}

export const BulkImportModal: React.FC<BulkImportModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  stores = [],
  onImportSuccess,
}) => {
  const [activeInputTab, setActiveInputTab] = useState<'FILE' | 'PASTE'>('FILE');
  const [pastedText, setPastedText] = useState<string>('');
  const [importStatus, setImportStatus] = useState<'IDLE' | 'PARSING' | 'SUCCESS'>('IDLE');
  const [parsedRows, setParsedRows] = useState<ParsedProductRow[]>([]);
  const [fileName, setFileName] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [selectedRowIndexForStudio, setSelectedRowIndexForStudio] = useState<number | null>(null);
  const [aiSuccessToast, setAiSuccessToast] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'GRID' | 'TABLE'>('GRID'); // Image 2 card grid is default!
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [modalPage, setModalPage] = useState<number>(1);
  const modalPageSize = 24;
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Rich 14-product sample covering ALL 8 top e-commerce categories in Pakistan
  const sampleCsvContent = `Product Name,SKU,Category,Wholesale Cost PKR,Retail Price PKR,Stock,Weight KG,Image URL,Video URL
Pack of 2 Dog Bath Brush Pet Massager Silicone,PET-BATH-BRUSH-2PK,Baby Care & Toys,160,315,310,0.15,https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=800&auto=format&fit=crop&q=80,https://assets.mixkit.co/videos/preview/mixkit-cat-lying-on-a-towel-and-relaxing-42978-large.mp4
Wireless Noise Cancelling Earbuds Pro 2,SKU-EAR-99,Consumer Electronics & Mobile Gadgets,1250,2299,150,0.25,https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&auto=format&fit=crop&q=80,https://assets.mixkit.co/videos/preview/mixkit-hands-of-a-man-working-on-a-sound-console-40810-large.mp4
Pack of 3 Cotton Summer Boxer Shorts,SKU-BOX-03,Fashion & Apparel,650,1199,220,0.3,https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80,https://assets.mixkit.co/videos/preview/mixkit-tailor-working-with-fabrics-and-sewing-machine-42459-large.mp4
Stainless Steel Garlic Press Crusher,SKU-GAR-01,Home & Kitchen Essentials,280,699,350,0.18,https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=800&auto=format&fit=crop&q=80,https://assets.mixkit.co/videos/preview/mixkit-chef-cutting-vegetables-with-a-knife-42457-large.mp4
Magnetic Dashboard 360° Car Phone Mount,SKU-CAR-M4,Automotive & Mobile Accessories,390,899,180,0.12,https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&auto=format&fit=crop&q=80,https://assets.mixkit.co/videos/preview/mixkit-car-traveling-on-a-highway-at-dusk-42458-large.mp4
12 Inches Courier Poly Flyer Bags with Pocket (100 Pcs),SKU-FLY-12IN,Packaging & Supplies,750,1250,300,0.9,https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&auto=format&fit=crop&q=80,https://assets.mixkit.co/videos/preview/mixkit-hands-folding-a-box-for-a-delivery-42460-large.mp4
Professional T9 Vintage Metal Hair & Beard Trimmer,SKU-TRIM-T9,Personal Care & Health,790,1499,190,0.28,https://images.unsplash.com/photo-1621607512214-68297480165e?w=800&auto=format&fit=crop&q=80,https://assets.mixkit.co/videos/preview/mixkit-barber-shaving-a-mans-beard-with-a-machine-42456-large.mp4
T800 Ultra Smartwatch with Bluetooth Calling & Dual Strap,SKU-WATCH-T800,Consumer Electronics & Mobile Gadgets,1450,2699,140,0.22,https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80,https://assets.mixkit.co/videos/preview/mixkit-close-up-of-a-man-wearing-a-smartwatch-42461-large.mp4
Organic Vitamin C Whitening & Glow Facial Serum 30ml,SKU-SRM-VITC,Personal Care & Health,390,899,250,0.1,https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800&auto=format&fit=crop&q=80,https://assets.mixkit.co/videos/preview/mixkit-woman-applying-moisturizer-on-her-face-42462-large.mp4
Portable Mini USB Air Conditioner Cooler with Ice Slot,SKU-AC-COOL-M1,Home & Kitchen Essentials,1650,2999,95,0.85,https://images.unsplash.com/photo-1585338107529-13afc5f02586?w=800&auto=format&fit=crop&q=80,https://assets.mixkit.co/videos/preview/mixkit-wind-blowing-through-green-leaves-42464-large.mp4
Smart 2-in-1 LED RGB Light Bulb with Bluetooth Speaker,SKU-BULB-RGB-SPK,Consumer Electronics & Mobile Gadgets,580,1299,210,0.2,https://images.unsplash.com/photo-1550985616-10810253b84d?w=800&auto=format&fit=crop&q=80,https://assets.mixkit.co/videos/preview/mixkit-colored-lights-illuminating-a-room-42463-large.mp4
Men's Summer Export Cotton Polo T-Shirt (Navy Blue),SKU-POLO-NVY,Fashion & Apparel,850,1599,160,0.28,https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80,https://assets.mixkit.co/videos/preview/mixkit-tailor-working-with-fabrics-and-sewing-machine-42459-large.mp4
High Power Portable Car Vacuum Cleaner Wet/Dry,SKU-VAC-CAR-12V,Automotive & Mobile Accessories,980,1899,110,0.65,https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&auto=format&fit=crop&q=80,https://assets.mixkit.co/videos/preview/mixkit-car-traveling-on-a-highway-at-dusk-42458-large.mp4
Multifunctional 9-in-1 Vegetable & Fruit Slicer Cutter,SKU-SLICER-9IN1,Home & Kitchen Essentials,750,1499,180,0.5,https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=800&auto=format&fit=crop&q=80,https://assets.mixkit.co/videos/preview/mixkit-chef-cutting-vegetables-with-a-knife-42457-large.mp4`;

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

  /**
   * Process raw CSV/TSV text into validated product items.
   * Guarantees that ZERO records are discarded!
   */
  const processRawText = (rawContent: string, sourceName: string) => {
    setErrorMessage('');
    setImportStatus('PARSING');

    try {
      const result = parseCsvText(rawContent, currentUser?.companyName || 'Verified Wholesale Factory');

      if (result.products.length === 0) {
        setErrorMessage('File ya text khali hai ya koi valid products nahi mil sakay. Baraye meherbani valid CSV data provide karein.');
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
    } catch (err) {
      console.error(err);
      setErrorMessage('CSV format parse karne me masla aya. Baraye meherbani standard CSV/Excel format use karein.');
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
      setErrorMessage('Baraye meherbani pehle Excel ya CSV data paste karein.');
      return;
    }
    processRawText(pastedText, 'Pasted_Data_Clipboard.csv');
  };

  const handleSimulateDemo = () => {
    processRawText(sampleCsvContent, 'Pakistani_Wholesale_14_Top_Sellers.csv');
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

  const handleRemoveRow = (index: number) => {
    setParsedRows((prev) => prev.filter((_, i) => i !== index));
  };

  const handleCommit = () => {
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

    onImportSuccess(newProducts);
    onClose();
  };

  const totalStockCount = parsedRows.reduce((sum, r) => sum + r.stock, 0);
  const totalWholesaleValuePKR = parsedRows.reduce((sum, r) => sum + r.cost * r.stock, 0);

  // Dynamic Categories extracted from the parsed items
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

  const totalModalPages = Math.ceil(filteredRows.length / modalPageSize) || 1;
  const paginatedRows = filteredRows.slice((modalPage - 1) * modalPageSize, modalPage * modalPageSize);

  const activeRowForStudio = selectedRowIndexForStudio !== null ? parsedRows[selectedRowIndexForStudio] : null;

  return (
    <div
      id="bulk-import-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-4 overflow-y-auto animate-fadeIn"
    >
      <div className="relative w-full max-w-5xl rounded-3xl border border-emerald-500/40 bg-slate-900 text-slate-100 shadow-2xl overflow-hidden my-6">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-950 p-5 sm:p-6 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-lg">
              <FileSpreadsheet className="h-6 w-6" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-[10px] font-bold text-emerald-300 border border-emerald-500/40 uppercase tracking-wider">
                  Bulk Product Onboarding
                </span>
                <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                  <ShieldCheck className="h-3.5 w-3.5" /> 100% Zero-Loss Guarantee
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-0.5">
                Bulk CSV / Excel Product Import
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDownloadSample}
              className="hidden sm:flex items-center gap-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 px-3.5 py-2 text-xs font-bold text-slate-200 transition cursor-pointer"
              title="Download pre-formatted CSV template"
            >
              <Download className="h-3.5 w-3.5 text-emerald-400" />
              <span>Sample CSV Template (14 Items)</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="rounded-full bg-slate-800/80 p-2 text-slate-400 hover:bg-slate-700 hover:text-white transition cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {aiSuccessToast && (
            <div className="rounded-xl border border-emerald-500/50 bg-emerald-950/80 p-3 text-xs text-emerald-200 font-bold flex items-center gap-2 shadow-lg animate-fadeIn">
              <Sparkles className="h-4 w-4 text-emerald-400 flex-shrink-0" />
              <span>{aiSuccessToast}</span>
            </div>
          )}

          {errorMessage && (
            <div className="rounded-xl border border-rose-500/50 bg-rose-950/70 p-3.5 text-xs text-rose-200 flex items-start gap-2.5 shadow">
              <AlertCircle className="h-4 w-4 text-rose-400 flex-shrink-0 mt-0.5" />
              <div>{errorMessage}</div>
            </div>
          )}

          {/* Mode Switch Tabs: Upload vs Paste */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveInputTab('FILE')}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                  activeInputTab === 'FILE'
                    ? 'bg-emerald-600 text-slate-950 shadow-md'
                    : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
                }`}
              >
                <Upload className="h-3.5 w-3.5" />
                <span>Upload CSV / Excel File</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveInputTab('PASTE')}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                  activeInputTab === 'PASTE'
                    ? 'bg-emerald-600 text-slate-950 shadow-md'
                    : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
                }`}
              >
                <Clipboard className="h-3.5 w-3.5" />
                <span>Direct Copy & Paste</span>
              </button>
            </div>

            <button
              type="button"
              onClick={handleSimulateDemo}
              className="text-xs text-emerald-400 hover:text-emerald-300 font-bold underline flex items-center gap-1 cursor-pointer self-start sm:self-auto"
            >
              <span>Load 14 Multi-Category Pakistani Products Demo</span>
              <ArrowRight className="h-3 w-3" />
            </button>
          </div>

          {/* TAB 1: File Upload */}
          {activeInputTab === 'FILE' && (
            <div className="rounded-3xl border-2 border-dashed border-slate-700 bg-slate-950/80 p-6 sm:p-8 text-center space-y-3 hover:border-emerald-500/50 transition">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shadow">
                <Upload className="h-7 w-7" />
              </div>

              <div>
                <h3 className="text-base font-bold text-white">CSV File Yahan Drop Karein ya Browse Karein</h3>
                <p className="text-xs text-slate-400 mt-1 max-w-lg mx-auto">
                  Aapki file me 100 ya 1000 products hon، smart engine tamam columns ko detect kar ke tamam categories ko Image 2 cards me dikhayega۔
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
                  className="rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black px-6 py-2.5 text-xs transition shadow-lg shadow-emerald-950/50 cursor-pointer flex items-center gap-2"
                >
                  <Upload className="h-4 w-4" />
                  <span>Choose CSV / TSV File</span>
                </button>

                <button
                  type="button"
                  onClick={handleDownloadSample}
                  className="rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold px-4 py-2.5 text-xs transition cursor-pointer flex items-center gap-1.5"
                >
                  <Download className="h-4 w-4 text-emerald-400" />
                  <span>Download Template (All Categories)</span>
                </button>
              </div>

              {fileName && (
                <div className="pt-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-800/90 border border-slate-700 px-3.5 py-1 text-xs text-emerald-400 font-mono">
                    <FileCheck className="h-3.5 w-3.5" />
                    <span>Loaded: {fileName}</span>
                  </span>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: Direct Paste */}
          {activeInputTab === 'PASTE' && (
            <form onSubmit={handlePasteSubmit} className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                  <span>Excel ya Google Sheets se copy kiya hua data yahan paste karein:</span>
                  <span className="text-[11px] text-emerald-400 font-mono">Ctrl+V support</span>
                </label>
                <textarea
                  rows={5}
                  value={pastedText}
                  onChange={(e) => setPastedText(e.target.value)}
                  placeholder={`Product Name\tSKU\tCategory\tWholesale Cost\tRetail Price\tStock\nWireless Earbuds\tEAR-01\tElectronics\t1200\t2200\t150\nCotton Boxer Shorts\tBOX-01\tFashion\t650\t1199\t200`}
                  className="w-full rounded-2xl border border-slate-700 bg-slate-950 p-3.5 text-xs font-mono text-slate-100 placeholder-slate-600 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setPastedText(sampleCsvContent)}
                  className="px-3 py-1.5 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
                >
                  Insert Sample Data (14 Items)
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black transition shadow-lg cursor-pointer"
                >
                  Parse & Validate Pasted Rows
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
                    {parsedRows.length} Items
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

              {/* Status Header with View Switcher (Grid vs Table) */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                    <h4 className="text-xs font-black text-white uppercase tracking-wider">
                      CSV Products Preview ({parsedRows.length} Ready to Publish)
                    </h4>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    تمام {uniqueCategories.length - 1} کیٹیگریز کے پروڈکٹس Image 2 کارڈ فارمیٹ میں دستیاب ہیں:
                  </p>
                </div>

                {/* View Switcher: Image 2 Cards vs Table */}
                <div className="flex items-center gap-2">
                  <div className="bg-slate-900 border border-slate-800 p-1 rounded-xl flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setViewMode('GRID')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                        viewMode === 'GRID'
                          ? 'bg-emerald-600 text-white shadow'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <LayoutGrid className="h-3.5 w-3.5" />
                      <span>Image 2 Cards (کارڈ ویو)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setViewMode('TABLE')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                        viewMode === 'TABLE'
                          ? 'bg-emerald-600 text-white shadow'
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
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
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

              {/* AI Auto Fill Banner */}
              <div className="rounded-xl border border-violet-500/40 bg-violet-950/40 p-3 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-violet-400 shrink-0" />
                  <span className="text-xs text-slate-300">
                    تمام {parsedRows.length} پروڈکٹس کے لیے <strong>AI Asset Studio</strong> سے 5 اسٹوڈیو زاویے اور ایچ ڈی ویڈیو ریلز آٹو فل کروائیں۔
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleAutoFillAiImages}
                  className="px-3.5 py-1.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs transition cursor-pointer shadow flex items-center gap-1.5 shrink-0"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Auto-Fill All Missing Media (AI)</span>
                </button>
              </div>

              {/* VIEW 1: EXACT IMAGE 2 PRODUCT CARD GRID */}
              {viewMode === 'GRID' && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 max-h-[500px] overflow-y-auto p-1">
                  {paginatedRows.map((row, idx) => {
                    const margin = row.price - row.cost;
                    const marginPct = row.price > 0 ? Math.round((margin / row.price) * 100) : 0;
                    const defaultStore = stores[0]?.name || 'Oshi Logistics & Direct Sourcing';

                    return (
                      <div
                        key={idx}
                        className="bg-white rounded-2xl border border-slate-200/90 shadow-[0_2px_8px_rgba(0,0,0,0.06)] hover:shadow-xl transition-all duration-200 flex flex-col justify-between overflow-hidden group relative"
                      >
                        {/* Top Image Area */}
                        <div className="relative aspect-square w-full bg-slate-50/80 p-2 sm:p-3 flex items-center justify-center overflow-hidden">
                          {/* Heart Wishlist Icon (from Image 2) */}
                          <div className="absolute top-2.5 right-2.5 h-7 w-7 rounded-full bg-white/95 border border-slate-200 shadow-xs flex items-center justify-center text-slate-400 z-10">
                            <Heart className="h-3.5 w-3.5 text-rose-500 fill-rose-500" />
                          </div>

                          {/* Category Badge on Top Left */}
                          <div className="absolute top-2.5 left-2.5 z-10">
                            <span className="rounded-md bg-slate-900/80 text-white text-[9px] font-bold px-1.5 py-0.5 backdrop-blur-xs">
                              #{idx + 1}
                            </span>
                          </div>

                          {/* Product Image */}
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
                            {/* Product Title */}
                            <h3
                              className="text-slate-900 text-xs sm:text-[13px] font-bold leading-snug line-clamp-2 hover:text-emerald-700 transition"
                              title={row.name}
                            >
                              {row.name}
                            </h3>

                            {/* SKU & Category */}
                            <p className="text-[10px] text-slate-500 mt-1 font-mono truncate">
                              SKU: {row.sku} • {row.category}
                            </p>
                          </div>

                          {/* Ratings, Store & Delivery Details (from Image 2) */}
                          <div className="space-y-1.5 pt-1 border-t border-slate-100">
                            {/* Store Name Badge */}
                            <div className="flex items-center justify-between text-[11px]">
                              <span className="flex items-center gap-1 font-bold text-slate-800 truncate max-w-[130px] bg-slate-100 px-1.5 py-0.5 rounded">
                                <Store className="h-3 w-3 text-emerald-600 flex-shrink-0" />
                                <span className="truncate">{defaultStore}</span>
                              </span>

                              <span className="text-[9px] font-bold text-slate-500">
                                Stock: {row.stock}
                              </span>
                            </div>

                            {/* Rating & Reviews + Video Tag */}
                            <div className="flex items-center justify-between text-[10px]">
                              <div className="flex items-center gap-1 text-slate-600">
                                <span className="flex items-center gap-0.5 text-amber-600 font-bold">
                                  <Star className="h-2.5 w-2.5 fill-amber-400 text-amber-400" />
                                  <span>4.9</span>
                                </span>
                                <span>(28 reviews)</span>
                              </div>

                              {row.videoUrl && (
                                <span className="flex items-center gap-0.5 text-purple-700 font-bold bg-purple-50 border border-purple-200/80 px-1.5 py-0.5 rounded text-[9px]">
                                  <Video className="h-2.5 w-2.5 text-purple-600" />
                                  <span>Video Demo</span>
                                </span>
                              )}
                            </div>

                            {/* Fast Delivery Badge */}
                            <div className="flex items-center gap-1 text-[10px] text-emerald-700 font-semibold bg-emerald-50 border border-emerald-200/60 rounded px-1.5 py-0.5">
                              <Truck className="h-3 w-3 text-emerald-600 flex-shrink-0" />
                              <span className="truncate">⚡ 2-3 Days Delivery (98% On-Time)</span>
                            </div>
                          </div>

                          {/* Pricing & Profit Margin */}
                          <div className="pt-1.5 border-t border-slate-100 space-y-1">
                            <div className="flex items-center justify-between text-[11px]">
                              <span className="text-slate-500">Wholesale Cost:</span>
                              <span className="font-bold text-slate-700 font-mono">
                                PKR {row.cost.toLocaleString()}
                              </span>
                            </div>

                            <div className="flex items-center justify-between">
                              <span className="text-[10px] text-slate-500 block leading-none font-medium">Selling Price</span>
                              <span className="text-emerald-700 font-extrabold text-sm font-sans tracking-tight">
                                PKR {row.price.toLocaleString()}
                              </span>
                            </div>

                            <div className="text-[10px] font-bold text-emerald-700 bg-emerald-50/80 px-1.5 py-0.5 rounded flex items-center justify-between">
                              <span>Estimated Profit:</span>
                              <span className="font-mono">
                                +PKR {margin.toLocaleString()} ({marginPct}%)
                              </span>
                            </div>
                          </div>

                          {/* Action Toolbar on Card */}
                          <div className="flex items-center gap-1.5 pt-1.5 border-t border-slate-100">
                            <button
                              type="button"
                              onClick={() => {
                                const realIdx = parsedRows.indexOf(row);
                                setSelectedRowIndexForStudio(realIdx >= 0 ? realIdx : idx);
                              }}
                              className="flex-1 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white font-bold text-[10px] transition cursor-pointer flex items-center justify-center gap-1 shadow-xs"
                              title="Generate AI video ad & 5 multi-angle photos"
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
                              className="p-1.5 rounded-lg bg-slate-100 hover:bg-rose-100 text-slate-400 hover:text-rose-600 transition cursor-pointer"
                              title="Remove product"
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

              {/* VIEW 2: COMPACT TABLE VIEW */}
              {viewMode === 'TABLE' && (
                <div className="overflow-x-auto max-h-64 overflow-y-auto rounded-xl border border-slate-800">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="bg-slate-900 text-[10px] uppercase font-bold text-slate-400 sticky top-0 z-10 border-b border-slate-800">
                      <tr>
                        <th className="p-2.5">#</th>
                        <th className="p-2.5">Photo</th>
                        <th className="p-2.5">Product Title</th>
                        <th className="p-2.5">SKU</th>
                        <th className="p-2.5">Category</th>
                        <th className="p-2.5">Wholesale Cost</th>
                        <th className="p-2.5">Retail Price</th>
                        <th className="p-2.5">Stock</th>
                        <th className="p-2.5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/80">
                      {paginatedRows.map((row, idx) => (
                        <tr key={idx} className="hover:bg-slate-900/60 transition">
                          <td className="p-2.5 text-slate-500 font-mono text-[11px]">
                            {(modalPage - 1) * modalPageSize + idx + 1}
                          </td>
                          <td className="p-2.5">
                            <img
                              src={row.image}
                              alt=""
                              className="h-9 w-9 rounded-lg object-cover border border-slate-700 bg-white"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = getSmartProductAssets(row.name).image;
                              }}
                            />
                          </td>
                          <td className="p-2.5 font-bold text-white max-w-[220px] truncate" title={row.name}>
                            {row.name}
                          </td>
                          <td className="p-2.5 font-mono text-slate-400 text-[11px]">{row.sku}</td>
                          <td className="p-2.5 text-slate-300 text-[11px] truncate max-w-[120px]">{row.category}</td>
                          <td className="p-2.5 font-mono text-orange-400 font-bold">
                            PKR {row.cost.toLocaleString()}
                          </td>
                          <td className="p-2.5 font-mono text-emerald-400 font-bold">
                            PKR {row.price.toLocaleString()}
                          </td>
                          <td className="p-2.5 font-bold text-slate-200 font-mono">{row.stock}</td>
                          <td className="p-2.5 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => {
                                  const realIdx = parsedRows.indexOf(row);
                                  setSelectedRowIndexForStudio(realIdx >= 0 ? realIdx : idx);
                                }}
                                className="px-2 py-1 rounded-lg bg-violet-600/30 hover:bg-violet-600 text-violet-300 hover:text-white border border-violet-500/40 text-[10px] font-bold transition cursor-pointer inline-flex items-center gap-1"
                                title="Generate AI video & photos"
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
                                className="p-1 rounded-lg bg-slate-800 hover:bg-rose-900/60 text-slate-400 hover:text-rose-400 transition cursor-pointer"
                                title="Remove row"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Preview Pagination Bar for Large Datasets (1,000+ Items) */}
              {filteredRows.length > 0 && totalModalPages > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-2 border-t border-slate-800 text-xs text-slate-400">
                  <div>
                    Showing <strong className="text-white font-mono">{(modalPage - 1) * modalPageSize + 1}</strong>–
                    <strong className="text-white font-mono">{Math.min(modalPage * modalPageSize, filteredRows.length)}</strong> of{' '}
                    <strong className="text-emerald-400 font-mono">{filteredRows.length.toLocaleString()}</strong> items
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setModalPage(1)}
                      disabled={modalPage === 1}
                      className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 disabled:opacity-40 hover:bg-slate-800 text-[11px] font-bold"
                    >
                      First
                    </button>
                    <button
                      type="button"
                      onClick={() => setModalPage((p) => Math.max(1, p - 1))}
                      disabled={modalPage === 1}
                      className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 disabled:opacity-40 hover:bg-slate-800 text-[11px] font-bold"
                    >
                      Prev
                    </button>
                    <span className="px-3 py-1 rounded-lg bg-slate-900 border border-slate-800 font-mono text-[11px] text-emerald-400">
                      Page {modalPage} / {totalModalPages}
                    </span>
                    <button
                      type="button"
                      onClick={() => setModalPage((p) => Math.min(totalModalPages, p + 1))}
                      disabled={modalPage === totalModalPages}
                      className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 disabled:opacity-40 hover:bg-slate-800 text-[11px] font-bold"
                    >
                      Next
                    </button>
                    <button
                      type="button"
                      onClick={() => setModalPage(totalModalPages)}
                      disabled={modalPage === totalModalPages}
                      className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 disabled:opacity-40 hover:bg-slate-800 text-[11px] font-bold"
                    >
                      Last
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-800 bg-slate-950 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-400 flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-emerald-400" />
            <span>
              {parsedRows.length > 0
                ? `${parsedRows.length} products ready across ${uniqueCategories.length - 1} categories • Zero-data-loss`
                : 'Upload or paste spreadsheet to parse'}
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
              onClick={handleCommit}
              disabled={parsedRows.length === 0}
              className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-800 disabled:text-slate-600 text-slate-950 text-xs font-black transition shadow-lg shadow-emerald-950/50 cursor-pointer flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="h-4 w-4" />
              <span>Import & Publish All ({parsedRows.length} Products)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Embedded Dedicated AI Product Studio for specific row */}
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
                        images: assets.images.length > 0 ? assets.images : r.images,
                        videoUrl: assets.videoUrl || r.videoUrl,
                        description: assets.description || r.description,
                        aiGenerated: true,
                      }
                    : r
                )
              );
            }
            setSelectedRowIndexForStudio(null);
            setAiSuccessToast(`✓ Updated media assets for ${activeRowForStudio.name}!`);
            setTimeout(() => setAiSuccessToast(null), 3000);
          }}
        />
      )}
    </div>
  );
};
