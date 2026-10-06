export type UserRole = 'ADMIN' | 'SUPPLIER' | 'RESELLER' | 'CUSTOMER' | 'SUPER_ADMIN' | 'FINANCE_STAFF' | 'SUPPORT_STAFF' | 'GUEST';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  companyName: string;
  avatar: string;
  walletBalancePKR: number;
  phone: string;
  city: string;
  isRegistered?: boolean;
  logo?: string;
  categories?: string[];
  fullAddress?: string;
  cnicNumber?: string;
  ntnNumber?: string;
  fatherOrHusbandName?: string;
  registeredAt?: string;
  businessType?: string;
  totalEarnedPKR?: number;
  province?: string;
  postalCode?: string;
  storeUrl?: string;
  salesChannels?: string[];
  strnNumber?: string;
  payoutDetails?: any;
  isVerified?: boolean;
  status?: string;
  referralCode?: string;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  sku: string;
  supplierId?: string;
  supplierName?: string;
  supplierCostPKR: number;
  recSellingPricePKR: number;
  stock: number;
  image?: string;
  images?: string[];
  mediaGallery?: string[];
  videoUrl?: string;
  videoThumbnail?: string;
  isActive?: boolean;
  brand?: string;
  warranty?: string;
  highlights?: string[];
  whatsInTheBox?: string;
  weightKg?: number;
  description?: string;
  rating: number;
  salesCount?: number;
  isTrending?: boolean;
  tags?: string[];
  moq?: number;
  colorVariants?: string[];
  variants?: ProductVariant[];
  // Store & Performance Ratings (as requested by user)
  storeId?: string;
  storeName?: string;
  storeRating?: number; // e.g. 4.9
  deliveryRating?: string; // e.g. "⚡ 2-3 Days Fast Delivery (98% On-Time)"
  reviewsCount?: number; // e.g. 142
  status?: string;
  isBestSeller?: boolean;
  competitionLevel?: 'LOW' | 'MEDIUM' | 'HIGH';
  ownerRole?: string;
  lowStockThreshold?: number;
  salesPotentialScore?: number;
  estShippingCostPKR?: number;
  createdAt?: string;
  fastShipping?: boolean;
  estDeliveryDays?: number;
}

export interface Store {
  id: string;
  name: string;
  slug?: string;
  ownerId: string;
  ownerName?: string;
  ownerRole?: 'SUPPLIER' | 'RESELLER' | 'MANUFACTURER' | string;
  ownerType?: 'SUPPLIER' | 'RESELLER' | 'MANUFACTURER' | string;
  logo: string;
  banner?: string;
  city: string;
  warehouseAddress?: string;
  rating: number;
  deliveryRating: string;
  responseRate?: string;
  responseTime?: string;
  totalOrders: number;
  isVerified: boolean;
  verificationId?: string;
  category?: string;
  categories?: string[];
  description?: string;
  phone?: string;
  whatsapp?: string;
  verifiedDetails?: any;
}

export interface VerifiedRegistrationData {
  role: 'SUPPLIER' | 'RESELLER' | 'MANUFACTURER' | string; // SUPPLIER = Manufacturer / Factory
  businessName: string;
  contactName: string;
  email: string;
  phone: string;
  city: string;
  cnic: string;
  ntn?: string;
  warehouseAddress: string;
  businessAddress?: string;
  bankName: string;
  accountTitle: string;
  accountNumber: string;
  businessCategory: string;
  idCardFrontUrl?: string;
  idCardBackUrl?: string;
  taxDocUrl?: string;
  verificationId: string;
  isVerified: boolean;
  registeredAt: string;
}

export interface BankTransferDetails {
  bankName: string;
  accountTitle: string;
  accountNumber: string;
  iban?: string;
  instructions: string;
  isActive?: boolean;
}

export interface HelplineContact {
  phone: string;
  whatsapp?: string;
  email: string;
  timings?: string;
  description?: string;
}

export interface PlatformHelplinesConfig {
  buyersHelpline: HelplineContact;
  resellersHelpline: HelplineContact;
  manufacturersHelpline: HelplineContact;
}

export interface AdminSecurityConfig {
  adminKey: string;
  pin: string;
  twoFactorEnabled: boolean;
  autoLockMinutes: number;
  emergencyFreezeMode: boolean;
  ipWhitelist: string[];
}

export interface AdminAuditLog {
  id: string;
  action: string;
  details: string;
  timestamp: string;
  ip: string;
  status: 'SUCCESS' | 'WARNING' | 'FAILED';
  adminUser: string;
}

export interface ProfitGuardConfig {
  minProfitAmountPKR: number;
  minProfitMarginPct: number;
  fxRiskBufferPct: number;
  defaultShippingCostPKR: number;
  processingFeePKR: number; // Flat Rs. 30
  platformFeePct: number; // 2% Platform fee
  defaultGatewayFeePKR: number;
  enforceLock: boolean;
}

export interface OrderItem {
  productId: string;
  name?: string;
  productName?: string;
  sku?: string;
  image?: string;
  qty: number;
  quantity?: number;
  supplierCostPKR?: number;
  sellingPricePKR?: number;
}

export type OrderStatus =
  | 'PENDING_VERIFICATION'
  | 'COD_CONFIRMED'
  | 'DISPATCHED'
  | 'DELIVERED'
  | 'RETURNED'
  | 'CANCELLED'
  | 'PROCESSING'
  | 'AWAITING_CONFIRMATION'
  | 'CONFIRMED'
  | 'NEW'
  | 'PACKED'
  | 'IN_TRANSIT'
  | 'OUT_FOR_DELIVERY'
  | 'REFUNDED';

export interface TimelineEvent {
  id: string;
  status: OrderStatus;
  label?: string;
  title?: string;
  description?: string;
  timestamp: string;
  actorRole?: string;
  actorName?: string;
  actor?: string;
}

export interface ProductVariant {
  id: string;
  sku: string;
  name: string;
  attributes: Record<string, string>;
  stock: number;
  priceModifierPKR?: number;
}

export type CodRiskLevel = 'LOW' | 'MEDIUM' | 'HIGH';

export interface ChatMessage {
  id: string;
  senderRole: 'RESELLER' | 'CUSTOMER' | 'SUPPLIER' | 'PLATFORM' | 'ADMIN' | UserRole | string;
  senderName: string;
  text: string;
  timestamp: string;
}

export interface Order {
  id?: string;
  orderNumber?: string;
  orderId?: string;
  customerName: string;
  customerPhone: string;
  customerCity: string;
  customerAddress: string;
  items?: OrderItem[];
  sellingPricePKR: number;
  supplierCostPKR?: number;
  processingFeePKR?: number; // Rs. 30 flat processing fee
  shippingCostPKR?: number; // e.g. Rs. 250 delivery fee
  platformFeePKR?: number; // 2% platform fee
  resellerCommissionPKR?: number; // Net profit payout to reseller after deductions
  gatewayFeePKR?: number;
  netProfitPKR?: number;
  profitMarginPct?: number;
  status: OrderStatus;
  codRisk?: CodRiskLevel;
  codOtpVerified?: boolean;
  profitGuardApproved?: boolean;
  profitGuardReason?: string;
  createdAt: string;
  trackingNumber?: string;
  courierName?: string;
  resellerId?: string;
  resellerName?: string;
  supplierId?: string;
  supplierName?: string;
  syncedStore?: 'Shopify' | 'Daraz PK' | 'WooCommerce' | 'TikTok Shop' | 'Direct Link' | 'Direct Reseller Order' | string;
  isInternational?: boolean;
  messages?: ChatMessage[];
  // Backwards compatible optional properties
  storeName?: string;
  productName?: string;
  productSku?: string;
  storeId?: string;
  productId?: string;
  quantity?: number;
  isCustomerVerified?: boolean;
  isPhoneVerified?: boolean;
  deliveredAt?: string;
  dispatchedAt?: string;
  timeline?: TimelineEvent[];
  internalNotes?: string;
  invoicePaid?: boolean;
  profitPaid?: boolean;
  chargesPaid?: boolean;
  resellerMarginPKR?: number;
  masterCommissionPKR?: number;
  productImage?: string;
  customerEmail?: string;
  supplierPayoutPKR?: number;
  codRiskScore?: number;
  paymentMethod?: string;
  codRiskReason?: string;
  duplicateOrderDetected?: boolean;
  repeatCustomer?: boolean;
  adjustmentPending?: boolean;
  courierPartner?: string;
  totalAmountPKR?: number;
  shippingAddress?: string;
  city?: string;
  sellingPrice?: number;
}

export interface WalletTransaction {
  id: string;
  userId?: string;
  type: 'CREDIT' | 'DEBIT' | 'ORDER_PROFIT' | 'PAYOUT' | 'REFERRAL_BONUS';
  amountPKR: number;
  description: string;
  timestamp: string;
  status: 'COMPLETED' | 'PENDING' | 'FAILED';
  refOrderId?: string;
  balanceAfterPKR?: number;
  orderId?: string;
  referenceId?: string;
}

export interface StoreIntegration {
  id: string;
  name?: string;
  url?: string;
  apiKey?: string;
  isActive?: boolean;
  lastSyncedAt?: string;
  syncedProductsCount?: number;
  syncedOrdersCount?: number;
  autoSyncInventory?: boolean;
  autoPushOrders?: boolean;
  platform: 'Shopify' | 'Daraz PK' | 'WooCommerce' | 'TikTok Shop' | 'SHOPIFY' | 'WOOCOMMERCE' | 'DARAZ' | 'CUSTOM_API' | string;
  storeName?: string;
  connected?: boolean;
  lastSync?: string;
  activeProductsCount?: number;
  autoSyncOrders?: boolean;
  webhookStatus?: 'ACTIVE' | 'PAUSED';
}

export type UserProfile = User;

export interface AuditLogEntry {
  id: string;
  action: string;
  userId?: string;
  userEmail?: string;
  user?: string;
  userRole?: string;
  date?: string;
  time?: string;
  timestamp?: string;
  details?: Record<string, any>;
  ipAddress?: string;
  ip?: string;
  status?: string;
  oldValue?: any;
  newValue?: any;
}

export interface InventorySyncLog {
  id: string;
  storeId?: string;
  productId?: string;
  productName?: string;
  changeType?: string;
  supplierName?: string;
  triggeredAction?: string;
  oldValue?: any;
  newValue?: any;
  timestamp: string;
  itemsSynced?: number;
  status?: 'SUCCESS' | 'PARTIAL' | 'FAILED' | string;
  errors?: string[];
}

export interface CartItem {
  id?: string;
  product: Product;
  quantity: number;
  selectedVariant?: ProductVariant;
  selectedVariantId?: string;
  targetSellingPricePKR?: number;
  customSellingPricePKR?: number;
  customerMarginPKR?: number;
}

export interface Supplier {
  id: string;
  name: string;
  companyName?: string;
  email?: string;
  phone?: string;
  city: string;
  rating: number;
  productsCount?: number;
  productCount?: number;
  isVerified: boolean;
  logo?: string;
  categories?: string[];
  address?: string;
  avgShippingDays?: number;
  status?: string;
  returnPolicyDays?: number;
  contactPerson?: string;
  contactEmail?: string;
  contactPhone?: string;
  totalProducts?: number;
  fulfilledOrdersCount?: number;
  fulfillmentRate?: string | number;
  returnRate?: string | number;
  bankDetails?: any;
}

export interface Courier {
  id: string;
  name: string;
  code?: string;
  logo?: string;
  apiStatus?: string;
  trackingUrlTemplate: string;
  isActive?: boolean;
  rates?: { city: string; ratePKR: number }[];
  baseShippingChargePKR?: number;
  deliverySuccessRate?: string | number;
  returnRate?: string | number;
  avgDeliveryDays?: number | string;
  activeShipments?: number;
  successRate?: string | number;
  baseRatePKR?: number;
  coverageZones?: string[] | number | string;
}

export interface PricingRule {
  id: string;
  name: string;
  type?: 'MARKUP_PERCENT' | 'FIXED_PROFIT' | 'TIERED';
  value?: number;
  appliesTo?: string;
  targetCategory?: string;
  marginType?: string;
  marginValue?: number;
  minProfitPKR?: number;
  maxSellingPricePKR?: number;
  createdAt?: string;
  psychologicalEnding?: boolean | number;
  roundNearest?: number;
  isActive?: boolean;
  strategy?: string;
  marginPercentage?: number;
  fixedMarkupPKR?: number;
  roundToNearest?: number;
  usePsychologicalPricing?: boolean;
  profitGuardActive?: boolean;
}

export interface ConnectedStore {
  id: string;
  name?: string;
  platform: string;
  url?: string;
  domain?: string;
  status: string;
  syncedProducts?: number;
  lastSyncAt?: string;
  lastSyncTime?: string;
  storeName?: string;
  productCount?: number;
  orderCount?: number;
  apiKeyMasked?: string;
  autoSyncInventory?: boolean;
  autoSyncPrice?: boolean;
  autoSyncOrders?: boolean;
  lastErrorMessage?: string;
  syncedOrdersCount?: number;
  syncedProductsCount?: number;
  lastSyncedAt?: string;
}

export interface ReturnRequest {
  id: string;
  orderId: string;
  orderNumber?: string;
  customerName: string;
  reason: string;
  status: 'REQUESTED' | 'APPROVED' | 'REJECTED' | 'REFUNDED' | 'RECEIVED' | 'APPROVED_FOR_REFUND' | string;
  requestedAt?: string;
  createdAt?: string;
  updatedAt?: string;
  amountPKR?: number;
  productName?: string;
  customerPhone?: string;
  refundAmountPKR?: number;
  replacementRequested?: boolean;
  courierName?: string;
  returnTrackingNumber?: string;
  inspectionNotes?: string;
  city?: string;
}

export interface CustomerProfile {
  id: string;
  name: string;
  phone: string;
  email?: string;
  city: string;
  address: string;
  totalOrders: number;
  deliveredOrders: number;
  returnRatePct?: number;
  codTrustScore?: number;
  trustScore?: number;
  cancelledOrders?: number;
  returnedOrders?: number;
  totalSpendingPKR?: number;
  lastOrderDate?: string;
  status?: string;
  ordersCount?: number;
  deliveredOrdersCount?: number;
  totalSpentPKR?: number;
  returnedOrdersCount?: number;
}

export type PayoutMethod = 'JAZZCASH' | 'EASYPAISA' | 'RAAST' | 'BANK_TRANSFER' | string;

export interface PayoutRequest {
  id: string;
  userId?: string;
  resellerId?: string;
  amountPKR: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'PROCESSED' | 'PAID' | 'UNDER_REVIEW' | string;
  requestedAt?: string;
  processedAt?: string;
  bankDetails?: string;
  userName?: string;
  resellerName?: string;
  resellerEmail?: string;
  userRole?: string;
  bankName?: string;
  accountTitle?: string;
  paymentMethod?: string;
  method?: PayoutMethod;
  accountNumber?: string;
  accountDetails?: string;
  adminNote?: string;
  adminNotes?: string;
  transactionRef?: string;
  transactionId?: string;
  receiptUrl?: string;
  createdAt?: string;
}

export interface SupportTicket {
  id: string;
  ticketNumber?: string;
  userId: string;
  subject: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  createdAt: string;
  updatedAt?: string;
  category?: string;
  userName?: string;
  userEmail?: string;
  messages: { id?: string; sender: string; senderRole?: string; text?: string; message?: string; time?: string; timestamp?: string }[];
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR' | 'ORDER' | 'STOCK' | 'PAYOUT' | string;
  timestamp: string;
  read?: boolean;
  isRead?: boolean;
  link?: string;
  targetTab?: string;
}

export interface CouponPromotion {
  id: string;
  code: string;
  discountType?: 'PERCENT' | 'FIXED' | string;
  discountValue?: number;
  minOrderAmountPKR?: number;
  isActive: boolean;
  expiresAt: string;
  type?: string;
  value?: number;
  minOrderPKR?: number;
  usageCount?: number;
  targetScope?: string;
  revenueGeneratedPKR?: number;
  maxUsage?: number;
  totalDiscountGivenPKR?: number;
}

export interface ReferralStat {
  id?: string;
  referrerId?: string;
  referredUserId?: string;
  status?: string;
  bonusEarnedPKR?: number;
  createdAt?: string;
  referralCode?: string;
  clicks?: number;
  registrations?: number;
  activeReferrals?: number;
  commissionEarnedPKR?: number;
  commissionPaidPKR?: number;
  pendingCommissionPKR?: number;
}

export type CourierPartner = Courier;

// --- Multi-Supplier Auto Order Splitting Core ---
export interface SplitSubOrder {
  subOrderId: string;
  parentOrderId: string;
  supplierId: string;
  supplierName: string;
  items: Array<{
    productId: string;
    productName: string;
    sku: string;
    quantity: number;
    supplierCostPKR: number;
    sellingPricePKR: number;
    weightKg: number;
  }>;
  totalCostPKR: number;
  totalWeightKg: number;
  allocatedCourier?: string;
  status: OrderStatus;
  warehouseLocation?: string;
}

// --- Customer RTO & COD Fraud Score & Blacklist ---
export interface RiskAssessment {
  phone: string;
  riskScore: number; // 0 to 100 (High > 60)
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  isBlacklisted: boolean;
  refusalRatePercentage: number;
  totalOrders: number;
  deliveredOrders: number;
  returnedOrders: number;
  requiresAdvanceFee: boolean; // 200 PKR Advance Guarantee Fee
  reasons: string[];
}

export interface BlacklistEntry {
  id: string;
  phone: string;
  customerName: string;
  city: string;
  address?: string;
  reason: string;
  reportedBy: string;
  reportedAt: string;
  failedDeliveriesCount: number;
}

// --- Courier Webhook Payload ---
export interface CourierWebhookPayload {
  courier: 'TRAX' | 'POSTEX' | 'TCS' | 'LEOPARDS';
  trackingNumber: string;
  orderId: string;
  status: string;
  location: string;
  updatedAt: string;
  ndrReason?: string;
  recipientContact?: string;
}

// --- Courier Settlement Reconciliation ---
export interface CourierReconciliationRecord {
  id: string;
  courier: string;
  trackingNumber: string;
  orderId: string;
  expectedCodPKR: number;
  receivedCodPKR: number;
  shippingFeeChargedPKR: number;
  discrepancyPKR: number;
  payoutDate: string;
  settlementStatus: 'MATCHED' | 'DISCREPANCY' | 'PENDING';
}

// --- Winning Product Analytics ---
export interface WinningProductData {
  product: Product;
  dailyVelocity: number;
  conversionRate: number;
  profitMarginPercent: number;
  viralScore: number; // 1-100
  tiktokAdInterest: string;
  recommendedBudgetPKR: number;
  videoCreativeUrl?: string;
}

// --- AI Dispatch & Support Knowledge Assistant ---
export interface KnowledgeDoc {
  id: string;
  category: 'DELIVERY' | 'REFUND' | 'COD' | 'DARAZ_SYNC' | 'GENERAL';
  title: string;
  content: string;
  keywords: string[];
  updatedAt: string;
}

export interface AIChatMessage {
  id: string;
  sender: 'CUSTOMER' | 'AI_BOT' | 'HUMAN_AGENT';
  text: string;
  timestamp: string;
  confidenceScore?: number;
  matchedDocTitle?: string;
  escalated?: boolean;
  escalatedToHuman?: boolean;
}

// --- Supplier Operations & Claims Desk ---
export interface ReturnClaim {
  id: string;
  orderNumber: string;
  resellerName: string;
  customerName: string;
  customerCity: string;
  productName: string;
  productSku: string;
  reason: string;
  proofImages?: string[];
  proofVideo?: string;
  claimDate: string;
  status: 'PENDING_SUPPLIER_REVIEW' | 'ACCEPTED_REFUNDED' | 'REJECTED_DISPUTED';
  supplierResponse?: string;
  refundAmountPKR: number;
}

export interface SupplierLogisticsConfig {
  warehouseName?: string;
  contactPerson?: string;
  contactPhone?: string;
  pickupAddress?: string;
  city?: string;
  postalCode?: string;
  pickupTimings?: string;
  specialInstructions?: string;
  // Courier API Keys
  traxApiKey?: string;
  traxMerchantId?: string;
  postexApiToken?: string;
  tcsAccountNumber?: string;
  tcsSecretKey?: string;
  leopardsApiKey?: string;
  leopardsOriginCity?: string;
  autoBookCourierOnAccept?: boolean;
  lowStockThreshold?: number;

  // Nested structures used in settings form
  warehouseAddress?: {
    facilityName: string;
    contactPerson: string;
    phone: string;
    streetAddress: string;
    city: string;
    postalCode: string;
    operatingHours: string;
    specialInstructions: string;
  };
  courierApiKeys?: {
    traxApiKey?: string;
    traxMerchantId?: string;
    postExApiToken?: string;
    postexApiToken?: string;
    postexMerchantCode?: string;
    tcsAccountNumber?: string;
    tcsSecretKey?: string;
    tcsApiCostCenterCode?: string;
    leopardApiKey?: string;
    leopardsApiKey?: string;
    leopardsPassword?: string;
    [key: string]: any;
  };
  automationSettings?: {
    autoBookCourierOnPack: boolean;
    defaultCourier: string;
    autoPrintLabels: boolean;
    lowStockThreshold: number;
    emailAlertsOnRto: boolean;
  };
  autoCourierBookingEnabled?: boolean;
}

export interface RtoClaim {
  id: string;
  orderId: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  customerCity: string;
  trackingNumber: string;
  courierName: string;
  sellingPricePKR: number;
  returnFeePKR: number; // e.g. PKR 180 standard reverse courier penalty
  returnDate: string;
  reason: 'CUSTOMER_REFUSED' | 'PHONE_UNREACHABLE' | 'WRONG_ADDRESS' | 'DAMAGED_PARCEL';
  condition: 'INTACT_RESTOCKABLE' | 'DAMAGED_TRANSIT' | 'PILFERAGE_MISSING';
  status: 'RETURNED_TO_HUB' | 'RESTOCKED' | 'CLAIM_FILED_WITH_COURIER' | 'CLOSED';
  warehouseInspectorName?: string;
  proofPhotos?: string[];
  claimCompensationPKR?: number;
}

export interface WhiteLabelConfig {
  storeName: string;
  brandTagline: string;
  supportPhone: string;
  returnCity: string;
  returnHubAddress: string;
  hideSupplierCostOnFlyer: boolean;
  hideYourMartBranding: boolean;
  customInvoiceNote: string;
}

export interface WholesalePricingTier {
  minQty: number;
  maxQty: number | null;
  discountPct: number;
  label: string;
}

export type TierLevel = 'BRONZE' | 'SILVER' | 'GOLD' | 'DIAMOND';

export interface ResellerTierInfo {
  level: TierLevel;
  totalDeliveredOrders: number;
  unclaimedBonusPKR: number;
  totalBonusesEarnedPKR: number;
  benefits: string[];
}

export interface AbandonedCartSession {
  id: string;
  customerName: string;
  customerPhone: string;
  customerCity?: string;
  productName: string;
  productImage?: string;
  cartTotalPKR: number;
  itemsCount: number;
  abandonedAt: string;
  recoveryStatus: 'PENDING' | 'MESSAGE_SENT' | 'RECOVERED' | 'EXPIRED';
  discountOfferedPct?: number;
}

// Re-export modular domain models
export * from './types/location';
export * from './types/courier';
export * from './types/orderStatus';
export * from './types/wallet';
export * from './types/notification';


