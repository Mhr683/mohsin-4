import React, { useState, useEffect } from 'react';
import {
  ShoppingBag,
  Truck,
  MapPin,
  Phone,
  User as UserIcon,
  Home,
  MessageSquare,
  CreditCard,
  Info,
  Clock,
  FileText,
  CheckCircle2,
  ArrowLeft,
  DollarSign,
  Store,
  Sparkles,
  ChevronRight,
  AlertCircle,
  HelpCircle,
  RotateCw,
  Upload,
  ShieldAlert,
  ShieldCheck,
  Package,
  Hash,
} from 'lucide-react';
import { Product, ProfitGuardConfig, BankTransferDetails } from '../types';
import { checkPakistanServiceability } from '../utils/serviceability';

interface BuyNowCheckoutViewProps {
  product: Product;
  quantity?: number;
  selectedVariant?: string;
  profitGuardConfig: ProfitGuardConfig;
  bankTransferDetails?: BankTransferDetails;
  onBack: () => void;
  onOrderPlaced: (orderData: {
    product: Product;
    sellingPrice: number;
    customerName: string;
    customerPhone: string;
    customerCity: string;
    customerAddress: string;
    shippingService?: string;
    specialInstructions?: string;
    paymentMethod?: string;
    profit: number;
    darazOrderId?: string;
    darazTrackingNo?: string;
    orderType?: 'DROPSHIPPING' | 'DARAZ';
  }) => void;
}

const SHIPPING_SERVICES = [
  { id: 'leopards', name: 'Leopards Courier (COD VIP)', rate: 180, cutoff: '2:00 PM' },
  { id: 'tcs', name: 'TCS Express (Same Day Dispatch)', rate: 220, cutoff: '3:00 PM' },
  { id: 'trax', name: 'Trax Logistics (Realtime Tracking)', rate: 190, cutoff: '2:30 PM' },
  { id: 'postex', name: 'PostEx (Instant Cash Flow)', rate: 175, cutoff: '1:30 PM' },
  { id: 'callcourier', name: 'Call Courier (Nationwide COD)', rate: 185, cutoff: '2:00 PM' },
  { id: 'mnp', name: 'M&P Express Logistics', rate: 195, cutoff: '2:00 PM' },
];

const PK_CITIES = [
  'Lahore',
  'Karachi',
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
  'Gujrat',
  'Mardan',
  'Kasur',
  'Sheikhupura',
  'Sahiwal',
  'Rahim Yar Khan',
];

export const BuyNowCheckoutView: React.FC<BuyNowCheckoutViewProps> = ({
  product,
  quantity = 1,
  selectedVariant = 'Multicolor/ ×1',
  profitGuardConfig,
  bankTransferDetails,
  onBack,
  onOrderPlaced,
}) => {
  // Checkout Mode: Dropshipping vs Daraz
  const [checkoutMode, setCheckoutMode] = useState<'DROPSHIPPING' | 'DARAZ'>('DROPSHIPPING');

  // Dropshipping Form State
  const [fullName, setFullName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [shippingService, setShippingService] = useState('');
  const [city, setCity] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'ADVANCE' | 'DARAZ'>('COD');

  // Daraz Form State
  const [darazOrderId, setDarazOrderId] = useState('');
  const [darazTrackingNo, setDarazTrackingNo] = useState('');
  const [darazPdfFileName, setDarazPdfFileName] = useState<string>('');
  const [paymentProofFileName, setPaymentProofFileName] = useState<string>('');
  const [copiedNumber, setCopiedNumber] = useState(false);

  // Active Bank details from Admin Config
  const activeBank = bankTransferDetails || {
    bankName: 'EasyPaisa',
    accountTitle: 'Sufyan ahmed',
    accountNumber: '+92-3422245222',
    iban: '',
    instructions:
      'Please ensure all payments are genuine and transferred to our account. Attempting fake payments may result in restrictions or a negative impact on your account.',
    isActive: true,
  };

  // Financial Calculations
  const subtotal = (product.supplierCostPKR || product.recSellingPricePKR) * quantity;
  const weightKg = product.weightKg || 0.4;
  const baseShipping = checkoutMode === 'DARAZ'
    ? 0
    : shippingService
    ? SHIPPING_SERVICES.find((s) => s.id === shippingService)?.rate || 180
    : 180;
  const processingFee = 30; // standard flat/minimum fee
  const baseTotalCost = subtotal + baseShipping + processingFee;

  // COD & Profit for Dropshipping
  const [codAmountInput, setCodAmountInput] = useState<string>(
    String(product.recSellingPricePKR * quantity + baseShipping + processingFee)
  );
  const [calculatedProfit, setCalculatedProfit] = useState<number | null>(null);
  const [isCalculated, setIsCalculated] = useState<boolean>(false);

  // Submission State
  const [isOrderSubmitted, setIsOrderSubmitted] = useState<boolean>(false);
  const [orderTrackingNum, setOrderTrackingNum] = useState<string>('');
  const [validationError, setValidationError] = useState<string | null>(null);

  // Auto-calculate on initial load
  useEffect(() => {
    if (checkoutMode === 'DROPSHIPPING') {
      const recommendedCOD = product.recSellingPricePKR * quantity + baseShipping + processingFee;
      setCodAmountInput(String(recommendedCOD));
      const net = recommendedCOD - baseTotalCost;
      setCalculatedProfit(net);
      setIsCalculated(true);
    }
  }, [product, quantity, baseShipping, processingFee, baseTotalCost, checkoutMode]);

  const handleCalculateProfit = () => {
    const enteredCOD = Number(codAmountInput) || 0;
    if (enteredCOD < baseTotalCost) {
      const loss = baseTotalCost - enteredCOD;
      setCalculatedProfit(-loss);
      setIsCalculated(true);
      return;
    }
    const net = enteredCOD - baseTotalCost;
    setCalculatedProfit(net);
    setIsCalculated(true);
    setValidationError(null);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (checkoutMode === 'DROPSHIPPING') {
      if (!isCalculated || calculatedProfit === null) {
        setValidationError('Please calculate profit before submitting the order.');
        return;
      }

      if (!shippingService) {
        setValidationError('Please select a shipping courier service to proceed.');
        return;
      }

      if (!city) {
        setValidationError('Please select the customer destination city.');
        return;
      }

      const enteredCOD = Number(codAmountInput) || (product.recSellingPricePKR * quantity);
      const tracking = `YM-PK-${Math.floor(100000 + Math.random() * 900000)}`;
      setOrderTrackingNum(tracking);

      onOrderPlaced({
        product,
        sellingPrice: enteredCOD,
        customerName: fullName || 'Direct Customer',
        customerPhone: mobileNumber || '0300-1234567',
        customerCity: city,
        customerAddress: deliveryAddress || 'Address on record',
        shippingService,
        specialInstructions,
        paymentMethod,
        profit: calculatedProfit,
        orderType: 'DROPSHIPPING',
      });
    } else {
      // DARAZ CHECKOUT SUBMIT
      if (!darazOrderId.trim()) {
        setValidationError('Please enter your Daraz Order ID.');
        return;
      }
      if (!darazTrackingNo.trim()) {
        setValidationError('Please enter your Daraz Tracking Number.');
        return;
      }

      const tracking = darazTrackingNo || `DZ-${Math.floor(10000000 + Math.random() * 90000000)}`;
      setOrderTrackingNum(tracking);

      onOrderPlaced({
        product,
        sellingPrice: baseTotalCost,
        customerName: `Daraz Order #${darazOrderId}`,
        customerPhone: '+92-3422245222',
        customerCity: 'Daraz Hub Center',
        customerAddress: 'Daraz Fulfilment Route',
        shippingService: 'Daraz Express (DEX)',
        specialInstructions: darazPdfFileName ? `Label PDF: ${darazPdfFileName}` : 'Standard label attached',
        paymentMethod: 'ADVANCE',
        profit: 0,
        darazOrderId,
        darazTrackingNo,
        orderType: 'DARAZ',
      });
    }

    setIsOrderSubmitted(true);
  };

  // Success Screen
  if (isOrderSubmitted) {
    return (
      <div className="min-h-screen bg-[#f1f5f9] p-4 sm:p-8 flex items-center justify-center">
        <div className="w-full max-w-lg rounded-3xl bg-white border border-slate-200 p-8 shadow-xl text-center space-y-5">
          <div className="h-16 w-16 mx-auto rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center ring-8 ring-emerald-50">
            <CheckCircle2 className="h-10 w-10" />
          </div>

          <div>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              {checkoutMode === 'DARAZ' ? 'Daraz Order Booked & Dispatched' : 'COD Order Booked Successfully'}
            </span>
            <h2 className="text-2xl font-black text-slate-900 mt-2">
              {checkoutMode === 'DARAZ' ? 'Daraz Order Received!' : 'Order Confirmed!'}
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Tracking / Order ID: <span className="font-mono font-bold text-slate-900">{orderTrackingNum}</span>
            </p>
          </div>

          <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4 text-left text-xs space-y-2 text-slate-700">
            {checkoutMode === 'DARAZ' ? (
              <>
                <div className="flex justify-between border-b border-slate-200/80 pb-2">
                  <span className="text-slate-500">Daraz Order ID:</span>
                  <span className="font-bold text-slate-900">{darazOrderId}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200/80 pb-2">
                  <span className="text-slate-500">Tracking Number:</span>
                  <span className="font-bold text-slate-900">{darazTrackingNo}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200/80 pb-2">
                  <span className="text-slate-500">Fulfillment Hub:</span>
                  <span className="font-bold text-slate-900">Daraz Drop-off Hub</span>
                </div>
                <div className="flex justify-between pt-1">
                  <span className="text-slate-500">Advance Paid:</span>
                  <span className="font-bold text-orange-600 text-sm">PKR {baseTotalCost}</span>
                </div>
              </>
            ) : (
              <>
                <div className="flex justify-between border-b border-slate-200/80 pb-2">
                  <span className="text-slate-500">Customer:</span>
                  <span className="font-bold text-slate-900">{fullName} ({mobileNumber})</span>
                </div>
                <div className="flex justify-between border-b border-slate-200/80 pb-2">
                  <span className="text-slate-500">Destination:</span>
                  <span className="font-bold text-slate-900">{city}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200/80 pb-2">
                  <span className="text-slate-500">Courier:</span>
                  <span className="font-bold text-slate-900 uppercase">{shippingService} Express</span>
                </div>
                <div className="flex justify-between border-b border-slate-200/80 pb-2">
                  <span className="text-slate-500">Customer COD Bill:</span>
                  <span className="font-bold text-orange-600 text-sm">PKR {Number(codAmountInput).toLocaleString()}</span>
                </div>
                <div className="flex justify-between pt-1">
                  <span className="text-slate-500">Your Reseller Net Profit:</span>
                  <span className="font-bold text-emerald-600 text-sm">PKR {calculatedProfit?.toLocaleString()}</span>
                </div>
              </>
            )}
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onBack}
              className="flex-1 rounded-xl bg-slate-900 text-white font-bold py-3 text-xs hover:bg-slate-800 transition"
            >
              Back to Catalog
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f1f5f9] p-3 sm:p-6 lg:p-8 space-y-6">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 sm:h-11 sm:w-11 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md">
            <ShoppingBag className="h-5 w-5 stroke-[2.3]" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              {checkoutMode === 'DARAZ' ? 'Daraz Checkout' : 'Checkout'}
            </h1>
            <p className="text-xs text-slate-500">
              {checkoutMode === 'DARAZ' ? 'Complete your Daraz order' : 'Finalize your order details'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 px-3.5 py-2.5 rounded-xl shadow-sm transition"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Cancel</span>
          </button>

          {checkoutMode === 'DROPSHIPPING' ? (
            <button
              type="button"
              onClick={() => {
                setCheckoutMode('DARAZ');
                setValidationError(null);
              }}
              className="flex items-center gap-2 rounded-xl bg-[#f85606] hover:bg-[#e04c03] text-white px-4 py-2.5 text-xs font-bold shadow-md transition cursor-pointer"
            >
              <Store className="h-4 w-4" />
              <span>Switch to Daraz Checkout</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                setCheckoutMode('DROPSHIPPING');
                setValidationError(null);
              }}
              className="flex items-center gap-2 rounded-xl bg-[#f85606] hover:bg-[#e04c03] text-white px-4 py-2.5 text-xs font-bold shadow-md transition cursor-pointer"
            >
              <RotateCw className="h-4 w-4" />
              <span>Switch to Dropshipping</span>
            </button>
          )}
        </div>
      </div>

      {/* Validation Error Notice */}
      {validationError && (
        <div className="flex items-center gap-2 rounded-2xl border border-rose-300 bg-rose-50 p-4 text-xs font-bold text-rose-700 shadow-sm animate-pulse">
          <AlertCircle className="h-4 w-4 flex-shrink-0 text-rose-600" />
          <span>{validationError}</span>
        </div>
      )}

      {/* =========================================================================
          MODE A: DARAZ CHECKOUT INTERFACE (EXACT SCREENSHOT MATCH)
      ========================================================================= */}
      {checkoutMode === 'DARAZ' ? (
        <form onSubmit={handleFormSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT COLUMN: Daraz Order Details, Payment Method, Advance Details, Info (8 cols) */}
          <div className="lg:col-span-8 space-y-5">
            {/* Card 1: Daraz Order Details */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-sm space-y-5">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                <Package className="h-4 w-4 text-blue-600 stroke-[2.3]" />
                <span>Daraz Order Details</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                {/* Daraz Order ID */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <span className="text-orange-500 font-black text-sm">#</span>
                    <span>Daraz Order ID</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Enter Daraz Order ID"
                    value={darazOrderId}
                    onChange={(e) => setDarazOrderId(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 transition"
                  />
                </div>

                {/* Daraz Tracking No */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Truck className="h-4 w-4 text-emerald-600 stroke-[2.3]" />
                    <span>Daraz Tracking No</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Enter Daraz Tracking Number"
                    value={darazTrackingNo}
                    onChange={(e) => setDarazTrackingNo(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition"
                  />
                </div>
              </div>

              {/* Daraz PDF File Upload */}
              <div className="space-y-1.5 pt-1">
                <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <FileText className="h-4 w-4 text-purple-600 stroke-[2.3]" />
                  <span>Daraz PDF</span>
                </label>
                <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-2.5 flex items-center gap-3">
                  <label className="cursor-pointer rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold px-3 py-1.5 text-xs transition">
                    Choose File
                    <input
                      type="file"
                      accept=".pdf"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) setDarazPdfFileName(file.name);
                      }}
                    />
                  </label>
                  <span className="text-xs text-slate-500 truncate">
                    {darazPdfFileName || 'No file chosen'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Upload Daraz order PDF (PDF format only, Max size: 5MB)
                </p>
              </div>
            </div>

            {/* Card 2: Payment Method */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-teal-700 stroke-[2.3]" />
                <h3 className="text-xs sm:text-sm font-bold text-teal-900">
                  Payment Method
                </h3>
              </div>

              {/* Advance Payment Card */}
              <div className="p-3.5 max-w-sm rounded-xl border-2 border-[#ea580c] bg-orange-50/40 shadow-sm flex items-center gap-3">
                <div className="h-9 w-12 rounded bg-white border border-orange-200 flex items-center justify-center text-amber-600">
                  <DollarSign className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">
                    Advance Payment
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Pay in advance through secure methods
                  </div>
                </div>
              </div>
            </div>

            {/* Card 3: Advance Payment Details */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-sm space-y-5">
              <div className="flex items-center gap-2 text-amber-700 font-bold text-xs sm:text-sm">
                <DollarSign className="h-4 w-4 text-amber-600 stroke-[2.3]" />
                <span>Advance Payment Details</span>
              </div>

              {/* Warning Alert Box */}
              <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-3.5 text-xs text-amber-900 flex items-start gap-2.5">
                <AlertCircle className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                  <span className="font-bold">Important: </span>
                  {activeBank.instructions ||
                    'Please ensure all payments are genuine and transferred to our account. Attempting fake payments may result in restrictions or a negative impact on your account.'}
                </div>
              </div>

              {/* Bank Transfer Details & Upload Proof */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 items-start">
                {/* Bank Transfer Details Table */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-800">
                      Bank Transfer Details
                    </h4>
                    <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      Official Account
                    </span>
                  </div>
                  <div className="rounded-xl bg-slate-50/80 border border-slate-200 p-3.5 text-xs space-y-2.5 shadow-sm">
                    <div className="flex justify-between items-center border-b border-slate-200/60 pb-2">
                      <span className="text-slate-500 font-medium">Bank:</span>
                      <span className="font-bold text-slate-900">{activeBank.bankName}</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-slate-200/60 pb-2">
                      <span className="text-slate-500 font-medium">Account:</span>
                      <span className="font-bold text-slate-900">{activeBank.accountTitle}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500 font-medium">Number:</span>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                          {activeBank.accountNumber}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(activeBank.accountNumber);
                            setCopiedNumber(true);
                            setTimeout(() => setCopiedNumber(false), 2000);
                          }}
                          className="text-[10px] font-semibold text-slate-600 hover:text-slate-900 bg-slate-200/70 hover:bg-slate-300 px-1.5 py-0.5 rounded transition"
                          title="Copy Account Number"
                        >
                          {copiedNumber ? 'Copied!' : 'Copy'}
                        </button>
                      </div>
                    </div>
                    {activeBank.iban && (
                      <div className="flex justify-between items-center border-t border-slate-200/60 pt-2 text-[11px]">
                        <span className="text-slate-500 font-medium">IBAN:</span>
                        <span className="font-mono text-slate-800">{activeBank.iban}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Upload Payment Proof */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-800">
                    Upload Payment Proof
                  </h4>
                  <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-2.5 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 truncate">
                      <label className="cursor-pointer rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold px-3 py-1.5 text-xs transition flex-shrink-0">
                        Choose File
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) setPaymentProofFileName(file.name);
                          }}
                        />
                      </label>
                      <span className="text-xs text-slate-500 truncate">
                        {paymentProofFileName || 'No file chosen'}
                      </span>
                    </div>
                    <Upload className="h-4 w-4 text-slate-400 flex-shrink-0" />
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Accepted formats: JPG, PNG, JPEG (Max size: 2MB)
                  </p>
                </div>
              </div>
            </div>

            {/* Card 4: Important Information (Daraz Specific) */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-xs sm:text-sm">
                <Info className="h-4 w-4 text-amber-500 stroke-[2.3]" />
                <span>Important Information</span>
              </div>

              <div className="space-y-3 text-xs text-slate-700">
                <div className="flex items-start gap-2.5">
                  <div className="h-6 w-6 rounded bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <ShieldCheck className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <span className="font-bold text-slate-900">Available Only on Advance Payment: </span>
                    <span className="text-slate-600">
                      All services require advance payment for processing.
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <div className="h-6 w-6 rounded bg-teal-100 text-teal-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <CreditCard className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <span className="font-bold text-slate-900">Processing Fee: </span>
                    <span className="text-slate-600">
                      Fixed processing fee of Rs. 30 applied to all orders.
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <div className="h-6 w-6 rounded bg-orange-100 text-orange-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <RotateCw className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <span className="font-bold text-slate-900">Return Policy Update: </span>
                    <span className="text-slate-600">
                      Returns from Daraz will be sent to the return address set in your Daraz account. If you have selected a specific Daraz Hub, returns will be received at that selected hub.
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <div className="h-6 w-6 rounded bg-purple-100 text-purple-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Clock className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <span className="font-bold text-slate-900">Cutoff Time: </span>
                    <span className="text-slate-600">
                      Orders before 2:00 PM dispatch same day.
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 pt-1">
                  <div className="h-6 w-6 rounded bg-slate-100 text-slate-600 flex items-center justify-center flex-shrink-0">
                    <FileText className="h-3.5 w-3.5" />
                  </div>
                  <div className="text-slate-600">
                    For complete information on charges:{' '}
                    <button
                      type="button"
                      onClick={() => alert('Daraz Order Policy: Zero shipping fee collected as Daraz generates client tracking labels. Flat Rs 30 packing & hub drop fee.')}
                      className="text-[#e35614] font-bold hover:underline"
                    >
                      View Charges Details
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Order Summary & COMPLETE DARAZ ORDER Button (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm space-y-4">
              {/* Header */}
              <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                <ShoppingBag className="h-4 w-4 text-purple-600 stroke-[2.3]" />
                <span>Order Summary</span>
              </div>

              {/* Product Item Row */}
              <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                <div className="h-12 w-12 rounded-lg bg-slate-50 border border-slate-200 p-1 flex-shrink-0 flex items-center justify-center overflow-hidden">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="h-full w-full object-contain mix-blend-multiply"
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-semibold text-slate-900 line-clamp-1">
                    {product.name}
                  </h4>
                  <div className="text-[11px] text-slate-400">
                    {selectedVariant} × {quantity}
                  </div>
                </div>

                <div className="text-xs font-bold text-slate-900">
                  {subtotal}
                </div>
              </div>

              {/* Price Calculations */}
              <div className="space-y-2 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-slate-900">{subtotal}</span>
                </div>

                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span className="font-semibold text-slate-900">0</span>
                </div>

                <div className="flex justify-between">
                  <span>Processing</span>
                  <span className="font-semibold text-slate-900">{processingFee}</span>
                </div>

                <div className="flex justify-between border-t border-slate-100 pt-2 text-base font-extrabold text-slate-900">
                  <span>Total</span>
                  <span className="text-[#ea580c] font-black">{baseTotalCost}</span>
                </div>
              </div>

              {/* Complete Daraz Order Big Button */}
              <div className="pt-3 border-t border-slate-100">
                <button
                  type="submit"
                  className="w-full rounded-xl bg-[#059669] hover:bg-[#047857] active:scale-[0.99] text-white font-black py-3.5 text-xs uppercase tracking-wider shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <CheckCircle2 className="h-4 w-4 stroke-[2.5]" />
                  <span>COMPLETE DARAZ ORDER</span>
                </button>
              </div>
            </div>
          </div>
        </form>
      ) : (
        /* =========================================================================
            MODE B: STANDARD DROPSHIPPING CHECKOUT INTERFACE
        ========================================================================= */
        <form onSubmit={handleFormSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* ================= LEFT COLUMN: Forms & Options (8 Cols) ================= */}
          <div className="lg:col-span-8 space-y-5">
            {/* Card 1: Customer Details & Shipper */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-sm space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                {/* Full Name */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <UserIcon className="h-4 w-4 text-orange-500 stroke-[2.3]" />
                    <span>Full Name</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Enter customer name / کسٹمر کا نام درج کریں"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 transition"
                  />
                </div>

                {/* Mobile Number */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Phone className="h-4 w-4 text-emerald-600 stroke-[2.3]" />
                    <span>Mobile Number</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="03XX-XXXXXXX / موبائل نمبر درج کریں"
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition font-sans"
                  />
                </div>

                {/* Shipping Service */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Truck className="h-4 w-4 text-purple-600 stroke-[2.3]" />
                    <span>Shipping Service</span>
                  </label>
                  <select
                    required
                    value={shippingService}
                    onChange={(e) => {
                      setShippingService(e.target.value);
                      if (!city) setCity(PK_CITIES[0]);
                    }}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-xs text-slate-800 focus:bg-white focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition cursor-pointer"
                  >
                    <option value="">--Select Shipper--</option>
                    {SHIPPING_SERVICES.map((shipper) => (
                      <option key={shipper.id} value={shipper.id}>
                        {shipper.name} (Rs. {shipper.rate})
                      </option>
                    ))}
                  </select>
                </div>

                {/* City */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <MapPin className="h-4 w-4 text-rose-500 stroke-[2.3]" />
                    <span>City</span>
                  </label>
                  {!shippingService ? (
                    <div className="rounded-xl border border-amber-200 bg-amber-50/70 px-3.5 py-2.5 text-xs font-semibold text-amber-800 flex items-center gap-2">
                      <Info className="h-4 w-4 text-amber-600 flex-shrink-0" />
                      <span>Select shipper first to see available cities</span>
                    </div>
                  ) : (
                    <select
                      required
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-xs text-slate-800 focus:bg-white focus:border-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-500/20 transition cursor-pointer"
                    >
                      <option value="">--Select City--</option>
                      {PK_CITIES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  )}

                  {city && (() => {
                    const serv = checkPakistanServiceability({ cityName: city, requestedCod: paymentMethod === 'COD' });
                    return (
                      <div className={`mt-2 rounded-xl p-2.5 text-[11px] flex items-center justify-between transition ${
                        serv.isServiceable ? 'bg-emerald-50 border border-emerald-200 text-emerald-800' : 'bg-rose-50 border border-rose-200 text-rose-800'
                      }`}>
                        <span className="font-semibold flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>{serv.city} ({serv.province}) • Est: {serv.deliveryDaysEst}</span>
                        </span>
                        <span className="text-[10px] bg-white px-2 py-0.5 rounded-full border border-emerald-200 font-bold shrink-0">
                          {serv.codSupported ? 'COD Available' : 'Advance Required'}
                        </span>
                      </div>
                    );
                  })()}
                </div>

                {/* Delivery Address */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Home className="h-4 w-4 text-blue-600 stroke-[2.3]" />
                    <span>Delivery Address</span>
                  </label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Enter complete delivery address / مکمل ترسیلی پتہ درج کریں"
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition resize-none"
                  />
                </div>

                {/* Special Instructions */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <MessageSquare className="h-4 w-4 text-amber-500 stroke-[2.3]" />
                    <span>Special Instructions</span>
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Any special delivery instructions / کوئی خاص ترسیلی ہدایات درج کریں"
                    value={specialInstructions}
                    onChange={(e) => setSpecialInstructions(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 transition resize-none"
                  />
                  <p className="text-[11px] text-slate-400">
                    Optional: Delivery timing, security instructions, etc.
                  </p>
                </div>
              </div>
            </div>

            {/* Card 2: Payment Method */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-teal-700 stroke-[2.3]" />
                <h3 className="text-xs sm:text-sm font-bold text-teal-900">
                  Payment Method
                </h3>
              </div>

              {/* Payment Method Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Option 1: Cash On Delivery */}
                <div
                  onClick={() => setPaymentMethod('COD')}
                  className={`p-3.5 rounded-xl border-2 cursor-pointer transition flex items-center gap-3 ${
                    paymentMethod === 'COD'
                      ? 'border-[#ea580c] bg-orange-50/40 shadow-sm'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="h-9 w-12 rounded bg-slate-100 border border-slate-200 flex items-center justify-center text-[9px] font-black text-slate-800 text-center leading-tight">
                    CASH ON<br />DELIVERY
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900">
                      CASH ON DELIVERY
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Cash on delivery
                    </div>
                  </div>
                </div>

                {/* Option 2: Advance Payment */}
                <div
                  onClick={() => setPaymentMethod('ADVANCE')}
                  className={`p-3.5 rounded-xl border-2 cursor-pointer transition flex items-center gap-3 ${
                    paymentMethod === 'ADVANCE'
                      ? 'border-[#ea580c] bg-orange-50/40 shadow-sm'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="h-9 w-12 rounded bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600">
                    <Clock className="h-5 w-5 text-amber-600" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900">
                      Advance Payment
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Pay in advance
                    </div>
                  </div>
                </div>

                {/* Option 3: Daraz CheckOut */}
                <div
                  onClick={() => {
                    setCheckoutMode('DARAZ');
                    setValidationError(null);
                  }}
                  className={`p-3.5 rounded-xl border-2 cursor-pointer transition flex items-center gap-3 ${
                    paymentMethod === 'DARAZ'
                      ? 'border-[#ea580c] bg-orange-50/40 shadow-sm'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="h-9 w-12 rounded bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600">
                    <CreditCard className="h-5 w-5 text-indigo-600" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900">
                      Daraz CheckOut
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Cash on delivery
                    </div>
                  </div>
                </div>
              </div>

              {/* Info notice bar */}
              <div className="rounded-xl border border-orange-200 bg-orange-50/70 p-3 text-xs text-orange-900 flex items-center gap-2">
                <Info className="h-4 w-4 text-orange-600 flex-shrink-0" />
                <span>
                  Customer will pay cash upon delivery. You'll receive profit after deduction of shipping and processing fees.
                </span>
              </div>
            </div>

            {/* Card 3: Important Information */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-xs sm:text-sm">
                <Info className="h-4 w-4 text-amber-500 stroke-[2.3]" />
                <span>Important Information</span>
              </div>

              <div className="space-y-2.5 text-xs text-slate-700">
                <div className="flex items-center gap-2.5">
                  <div className="h-6 w-6 rounded bg-orange-100 text-orange-600 flex items-center justify-center flex-shrink-0">
                    <Truck className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <span className="font-bold text-slate-900">Shipping Charges: </span>
                    <span className="text-slate-600">
                      Shipping charges calculated according to product weight and destination city.
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <div className="h-6 w-6 rounded bg-teal-100 text-teal-600 flex items-center justify-center flex-shrink-0">
                    <CreditCard className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <span className="font-bold text-slate-900">Processing Fee: </span>
                    <span className="text-slate-600">
                      Minimum Rs. 30 or 5% of subtotal (whichever is higher).
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <div className="h-6 w-6 rounded bg-purple-100 text-purple-600 flex items-center justify-center flex-shrink-0">
                    <Clock className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <span className="font-bold text-slate-900">Cutoff Time: </span>
                    <span className="text-slate-600">
                      Orders before 2:00 PM dispatch same day.
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 pt-1">
                  <div className="h-6 w-6 rounded bg-slate-100 text-slate-600 flex items-center justify-center flex-shrink-0">
                    <FileText className="h-3.5 w-3.5" />
                  </div>
                  <div className="text-slate-600">
                    For complete information on charges:{' '}
                    <button
                      type="button"
                      onClick={() => alert('Wholesale Policy: Standard courier rate PKR 180 (0.5kg), Rs 30 flat processing fee.')}
                      className="text-[#e35614] font-bold hover:underline"
                    >
                      View Charges Details
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ================= RIGHT COLUMN: Order Summary & COD Calculator (4 Cols) ================= */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm space-y-4">
              {/* Header */}
              <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                <ShoppingBag className="h-4 w-4 text-purple-600 stroke-[2.3]" />
                <span>Order Summary</span>
              </div>

              {/* Product Item Row */}
              <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                <div className="h-12 w-12 rounded-lg bg-slate-50 border border-slate-200 p-1 flex-shrink-0 flex items-center justify-center overflow-hidden">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="h-full w-full object-contain mix-blend-multiply"
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-semibold text-slate-900 line-clamp-1">
                    {product.name}
                  </h4>
                  <div className="text-[11px] text-slate-400">
                    {selectedVariant} × {quantity}
                  </div>
                </div>

                <div className="text-xs font-bold text-slate-900">
                  {subtotal}
                </div>
              </div>

              {/* Price Calculations */}
              <div className="space-y-2 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-slate-900">{subtotal}</span>
                </div>

                <div className="flex justify-between">
                  <span>Shipping [{weightKg} kg]</span>
                  <span className="font-semibold text-slate-900">{baseShipping}</span>
                </div>

                <div className="flex justify-between">
                  <span>Processing</span>
                  <span className="font-semibold text-slate-900">{processingFee}</span>
                </div>

                <div className="flex justify-between border-t border-slate-100 pt-2 text-base font-extrabold text-slate-900">
                  <span>Total</span>
                  <span className="text-[#ea580c] font-black">{baseTotalCost}</span>
                </div>
              </div>

              {/* COD Amount Input & Calculate Button */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <label className="text-xs font-bold text-slate-800 block">
                  COD Amount
                </label>

                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-bold">$</span>
                    <input
                      type="number"
                      value={codAmountInput}
                      onChange={(e) => {
                        setCodAmountInput(e.target.value);
                        setIsCalculated(false);
                      }}
                      placeholder="0"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-900 focus:bg-white focus:border-orange-500 focus:outline-none"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleCalculateProfit}
                    className="rounded-xl bg-[#ea580c] hover:bg-[#cf4a0e] text-white px-4 py-2 text-xs font-bold shadow-sm transition cursor-pointer"
                  >
                    Calculate
                  </button>
                </div>

                {/* Profit Display Box */}
                <div className="rounded-xl bg-slate-50 border border-slate-200 p-2.5 flex items-center justify-between text-xs">
                  <span className="text-slate-600 font-semibold">Profit:</span>
                  <span
                    className={`font-black text-sm ${
                      calculatedProfit && calculatedProfit > 0
                        ? 'text-emerald-600'
                        : calculatedProfit && calculatedProfit < 0
                        ? 'text-rose-600'
                        : 'text-slate-800'
                    }`}
                  >
                    {calculatedProfit !== null ? calculatedProfit : 0}
                  </span>
                </div>

                {/* Bottom Notice or Confirm Button */}
                {!isCalculated ? (
                  <div className="rounded-xl border border-amber-200 bg-amber-50 p-2.5 text-center text-xs font-semibold text-amber-800">
                    Please calculate profit to continue.
                  </div>
                ) : (
                  <button
                    type="submit"
                    className="w-full rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-[0.99] text-white font-bold py-3 text-xs shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Confirm & Dispatch Order</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </form>
      )}
    </div>
  );
};
