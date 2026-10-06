import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { CartDrawer, CartItem } from './components/CartDrawer';
import { AdminDashboard } from './components/AdminDashboard';
import { SupplierPortal } from './components/SupplierPortal';
import { ResellerPortal } from './components/ResellerPortal';
import { ProfitGuardModal } from './components/ProfitGuardModal';
import { StoreSyncModal } from './components/StoreSyncModal';
import { WalletModal } from './components/WalletModal';
import { AdminAuthModal } from './components/AdminAuthModal';
import { HelplinesModal } from './components/HelplinesModal';
import { DarazCalculator } from './components/DarazCalculator';
import { VerifiedRegistrationModal } from './components/VerifiedRegistrationModal';
import { ProductListingModal } from './components/ProductListingModal';
import { StoreFrontView } from './components/StoreFrontView';
import { StoresDirectoryView } from './components/StoresDirectoryView';
import { FrontPageDashboard } from './components/FrontPageDashboard';
import { BulkImportModal } from './components/BulkImportModal';
import { BulkImportView } from './components/BulkImportView';
import { ProfileSettingsModal } from './components/ProfileSettingsModal';
import { PlatformPoliciesModal } from './components/PlatformPoliciesModal';
import { RegistrationRequiredModal } from './components/RegistrationRequiredModal';
import { AdCopyGeneratorModal } from './components/AdCopyGeneratorModal';
import { FraudBlacklistManager } from './components/FraudBlacklistManager';
import { AdvancePaymentGateModal } from './components/AdvancePaymentGateModal';
import { CourierReconciliationView } from './components/CourierReconciliationView';
import { BulkLabelPrinterModal } from './components/BulkLabelPrinterModal';
import { WhatsAppVerificationModal } from './components/WhatsAppVerificationModal';
import { CourierBookingModal } from './components/CourierBookingModal';
import { ResellerPayoutsDeskView } from './components/ResellerPayoutsDeskView';
import { ReverseLogisticsRtoView } from './components/ReverseLogisticsRtoView';
import { PublicTrackingView } from './components/PublicTrackingView';
import { WhiteLabelBrandingModal } from './components/WhiteLabelBrandingModal';
import { ShopifySyncModal } from './components/ShopifySyncModal';
import { AbandonedCartRecoveryView } from './components/AbandonedCartRecoveryView';
import { BarcodeScannerModal } from './components/BarcodeScannerModal';
import { SupportDisputeDeskView } from './components/SupportDisputeDeskView';
import { AiProductAssetStudioModal } from './components/AiProductAssetStudioModal';
import { KnowledgeCenterView } from './components/KnowledgeCenterView';
import { AIDispatchModal } from './components/AIDispatchModal';
import { AdminBusinessSettingsView } from './components/AdminBusinessSettingsView';
import { SupplierInventorySyncView } from './components/SupplierInventorySyncView';
import { AdminAuditLogView } from './components/AdminAuditLogView';
import { LocationSelectorModal } from './components/LocationSelectorModal';
import { CodVerificationModal } from './components/CodVerificationModal';
import { PayoutRequestModal } from './components/PayoutRequestModal';
import { ArrowLeft, Home, ChevronRight } from 'lucide-react';
import { AppLanguage } from './context/LanguageContext';
import { calculateCustomerRisk } from './utils/riskCalculator';
import { RiskAssessment } from './types';
import { initialStores } from './data/storesData';
import {
  initialProfitGuardConfig,
  initialUsers,
  initialProducts,
  initialOrders,
  initialStoreIntegrations,
  initialTransactions,
  initialBankTransferDetails,
  initialAdminSecurityConfig,
  initialAdminAuditLogs,
  initialPlatformHelplinesConfig,
  initialPayoutRequests,
  initialWhiteLabelConfig,
} from './data/initialData';
import {
  User,
  Product,
  Order,
  ProfitGuardConfig,
  StoreIntegration,
  WalletTransaction,
  ChatMessage,
  BankTransferDetails,
  AdminSecurityConfig,
  AdminAuditLog,
  PlatformHelplinesConfig,
  Store,
  VerifiedRegistrationData,
  PayoutRequest,
  WhiteLabelConfig,
} from './types';
import { evaluateOrderFinancials } from './utils/profitGuard';

const FUNCTION_INFO: Record<string, { title: string; subtitle: string; tag: string }> = {
  'catalog': {
    title: 'Products & Wholesale Sourcing',
    subtitle: 'Verified Pakistani Manufacturer Wholesale Catalog & Reseller Sourcing',
    tag: 'Sourcing Hub',
  },
  'winning-products': {
    title: 'Winning Products & Viral Sourcing',
    subtitle: 'High Velocity, Trending & Fast Dispatch Products Across Pakistan',
    tag: 'Viral Sourcing',
  },
  'orders': {
    title: 'Orders & Dispatch Manager',
    subtitle: 'Live COD Verification, Trax / PostEx Booking & Thermal 4x6 Slips',
    tag: 'Fulfillment & Logistics',
  },
  'supplier-hub': {
    title: 'Supplier & Manufacturer Hub',
    subtitle: 'Warehouse Stock, Batch Orders & Dispatch Processing Desk',
    tag: 'Manufacturer Desk',
  },
  'payouts': {
    title: 'Profit Payouts & Reseller Ledger',
    subtitle: 'Daily Automated COD Clearances via JazzCash, EasyPaisa & Raast',
    tag: 'Financial Ledger',
  },
  'public-tracking': {
    title: 'Live Parcel Tracking',
    subtitle: 'Universal Courier Tracking Across Trax, PostEx, TCS & Leopards',
    tag: 'Logistics Tracking',
  },
  'reverse-logistics': {
    title: 'RTO & Reverse Logistics Claims',
    subtitle: 'Manage Returned Parcels, Stock Restorations & Courier Damage Claims',
    tag: 'RTO Management',
  },
  'fraud-blacklist': {
    title: 'RTO Fraud Blacklist & Risk Engine',
    subtitle: 'Pakistan Fake Order Detection, Blacklisted Numbers & AI Address Guard',
    tag: 'Risk Protection',
  },
  'courier-reconciliation': {
    title: 'Courier Settlement Reconciliation CSV',
    subtitle: 'Automated Discrepancy Audits for Trax, PostEx & TCS Payout Sheets',
    tag: 'Reconciliation',
  },
  'daraz-calculator': {
    title: 'Daraz Profit & Commission Calculator',
    subtitle: 'Accurate Wholesale vs Daraz Commission, VAT & Net Profit Calculator',
    tag: 'Profit Calculator',
  },
  'stores-directory': {
    title: 'Stores & Wholesale Directory',
    subtitle: 'Verified Karachi, Lahore & Faisalabad Wholesale Suppliers',
    tag: 'Wholesale Directory',
  },
  'store-front': {
    title: 'Wholesale Store Front',
    subtitle: 'Direct Manufacturer Sourcing & Combined Single Delivery Parcel',
    tag: 'Store Sourcing',
  },
  'bulk-import': {
    title: 'Bulk CSV / Excel Product Import',
    subtitle: 'Upload hundreds of wholesale products with zero-data-loss & Image 2 cards',
    tag: 'Batch Onboarding',
  },
  'abandoned-carts': {
    title: 'Abandoned Cart Recovery Desk',
    subtitle: 'Automated WhatsApp Prompts & Customer Reconnection Engine',
    tag: 'Cart Recovery',
  },
  'support-tickets': {
    title: 'Helplines & Dispute Support Desk',
    subtitle: 'Official Pakistani B2B Helplines & Fast Dispute Resolution',
    tag: 'Support & Help',
  },
  'knowledge-center': {
    title: 'Knowledge Center & Seller Academy',
    subtitle: 'Complete Urdu & English Playbooks for Pakistan COD Dropshipping',
    tag: 'Seller Academy',
  },
  'admin-hq': {
    title: 'Admin Master HQ Control',
    subtitle: 'Central Governance, Security Lockdown & Full System Audit Logs',
    tag: 'Master Admin',
  },
  'supplier-inventory': {
    title: 'Manufacturer Inventory & Stock Sync',
    subtitle: 'Live Factory Stock Monitoring, Low-Stock Alerts & Batch Sync Feeds',
    tag: 'Inventory Sync',
  },
  'business-rules': {
    title: 'Platform Business Rules & Tariffs',
    subtitle: 'Dynamic Pakistan Shipping Tariffs, COD Thresholds & Fee Configuration',
    tag: 'Platform Rules',
  },
  'audit-log': {
    title: 'Immutable Platform Audit Ledger',
    subtitle: 'Transparent Admin Trail for Payouts, Wallet Adjustments & Policy Overrides',
    tag: 'Security & Audit',
  },
};

export default function App() {
  // Global Application State
  const [profitGuardConfig, setProfitGuardConfig] = useState<ProfitGuardConfig>(initialProfitGuardConfig);
  const [bankTransferDetails, setBankTransferDetails] = useState<BankTransferDetails>(() => {
    const saved = localStorage.getItem('ym_bank_transfer_details');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return initialBankTransferDetails;
  });

  const [helplinesConfig, setHelplinesConfig] = useState<PlatformHelplinesConfig>(() => {
    const saved = localStorage.getItem('ym_helplines_config');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return initialPlatformHelplinesConfig;
  });

  // Security & Admin Session Management
  const [securityConfig, setSecurityConfig] = useState<AdminSecurityConfig>(() => {
    const saved = localStorage.getItem('ym_admin_security_config');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return initialAdminSecurityConfig;
  });

  const [auditLogs, setAuditLogs] = useState<AdminAuditLog[]>(() => {
    const saved = localStorage.getItem('ym_admin_audit_logs');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return initialAdminAuditLogs;
  });

  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem('ym_admin_auth') === 'true';
  });
  const [isAdminAuthModalOpen, setIsAdminAuthModalOpen] = useState<boolean>(false);

  // Users & Sourcing State - Default to Reseller (Ali Raza / Zainab) so Admin is isolated
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [currentUser, setCurrentUser] = useState<User>(() => {
    if (isAdminAuthenticated) {
      return initialUsers.find((u) => u?.role === 'ADMIN') || initialUsers[1] || initialUsers[0];
    }
    return initialUsers.find((u) => u?.role === 'RESELLER') || initialUsers[3] || initialUsers[2] || initialUsers[0];
  });
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('ym_all_products');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {}
    }
    return initialProducts;
  });

  useEffect(() => {
    localStorage.setItem('ym_all_products', JSON.stringify(products));
  }, [products]);
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [stores, setStores] = useState<StoreIntegration[]>(initialStoreIntegrations);
  const [transactions, setTransactions] = useState<WalletTransaction[]>(initialTransactions);

  // Verified Stores State (Manufacturers & Reseller Stores)
  const [allStores, setAllStores] = useState<Store[]>(() => {
    const saved = localStorage.getItem('ym_all_stores');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return initialStores;
  });
  const [selectedStoreForView, setSelectedStoreForView] = useState<Store | null>(null);

  // Navigation State - Default to Front Page Dashboard (matching screenshot)
  const [activeTab, setActiveTab] = useState<string>(() => {
    return isAdminAuthenticated ? 'admin-hq' : 'dashboard';
  });
  const [navHistory, setNavHistory] = useState<string[]>(['dashboard']);

  // Consolidated Multi-Item Cart for Single Store / Consolidated Delivery by Weight
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('ym_multi_cart_items');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return [];
  });
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('ym_multi_cart_items', JSON.stringify(cartItems));
  }, [cartItems]);

  const handleAddToCart = (product: Product, quantity = 1, variant?: string) => {
    setCartItems((prev) => {
      // Check if adding from a different store:
      if (prev.length > 0) {
        const existingStore = prev[0].product.supplierId || prev[0].product.storeId;
        const newStore = product.supplierId || product.storeId;
        if (existingStore && newStore && existingStore !== newStore) {
          const confirmSwitch = window.confirm(
            `Aap ke cart me pehle se doosre store ki cheezyn hain. Pakistan me delivery fees aik parcel k wazan (weight) k hisaab se lagti hy.\n\nKia aap is naye store ka naya parcel shuru krna chahtay hain?`
          );
          if (confirmSwitch) {
            return [{ product, quantity, selectedVariant: variant }];
          } else {
            return prev;
          }
        }
      }

      const existingIndex = prev.findIndex((item) => item.product.id === product.id);
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + quantity,
        };
        return updated;
      } else {
        return [...prev, { product, quantity, selectedVariant: variant }];
      }
    });
    setIsCartDrawerOpen(true);
  };

  const handleUpdateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveCartItem(productId);
      return;
    }
    setCartItems((prev) =>
      prev.map((item) => (item.product.id === productId ? { ...item, quantity } : item))
    );
  };

  const handleRemoveCartItem = (productId: string) => {
    setCartItems((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const handleClearCart = () => {
    setCartItems([]);
  };

  // Modals & Drawers
  const [isRegistrationRequiredModalOpen, setIsRegistrationRequiredModalOpen] = useState(false);
  const [isProfitGuardModalOpen, setIsProfitGuardModalOpen] = useState(false);
  const [isStoreSyncModalOpen, setIsStoreSyncModalOpen] = useState(false);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [isHelplinesModalOpen, setIsHelplinesModalOpen] = useState(false);
  const [isVerifiedRegistrationOpen, setIsVerifiedRegistrationOpen] = useState(false);
  const [isProductListingOpen, setIsProductListingOpen] = useState(false);
  const [isBulkImportOpen, setIsBulkImportOpen] = useState(false);
  const [isProfileSettingsOpen, setIsProfileSettingsOpen] = useState(false);
  const [isPoliciesModalOpen, setIsPoliciesModalOpen] = useState(false);
  const [selectedProductForAd, setSelectedProductForAd] = useState<Product | null>(null);
  const [isAdCopyModalOpen, setIsAdCopyModalOpen] = useState(false);
  const [isBulkLabelPrinterOpen, setIsBulkLabelPrinterOpen] = useState(false);
  const [isAdvanceGateModalOpen, setIsAdvanceGateModalOpen] = useState(false);
  const [activeRiskAssessment, setActiveRiskAssessment] = useState<RiskAssessment | null>(null);

  // Pending orders waiting for guest registration
  const [pendingSingleOrder, setPendingSingleOrder] = useState<{
    product: Product;
    sellingPrice: number;
    customerName: string;
    customerPhone?: string;
    customerCity?: string;
    customerAddress?: string;
  } | null>(null);

  const [pendingMultiOrder, setPendingMultiOrder] = useState<{
    store: any;
    items: { product: Product; quantity: number }[];
    totalAmount: number;
    customerDetails: {
      customerName: string;
      customerPhone: string;
      customerCity: string;
      customerAddress: string;
    };
    deliveryCharges?: number;
    totalWeightKg?: number;
  } | null>(null);

  // Missing Feature States: Payouts & White-Label & Courier & WhatsApp
  const [payoutRequests, setPayoutRequests] = useState<PayoutRequest[]>(() => {
    const saved = localStorage.getItem('ym_payout_requests');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return initialPayoutRequests;
  });

  const [whiteLabelConfig, setWhiteLabelConfig] = useState<WhiteLabelConfig>(() => {
    const saved = localStorage.getItem('ym_whitelabel_config');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return initialWhiteLabelConfig;
  });

  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false);
  const [selectedOrderForWhatsApp, setSelectedOrderForWhatsApp] = useState<Order | null>(null);

  const [isCourierBookingModalOpen, setIsCourierBookingModalOpen] = useState(false);
  const [selectedOrderForCourier, setSelectedOrderForCourier] = useState<Order | null>(null);

  const [isWhiteLabelModalOpen, setIsWhiteLabelModalOpen] = useState(false);
  const [isShopifySyncModalOpen, setIsShopifySyncModalOpen] = useState(false);
  const [isAiAssetStudioModalOpen, setIsAiAssetStudioModalOpen] = useState(false);

  // Language & Gamification & Scanner States
  const [appLanguage, setAppLanguage] = useState<AppLanguage>(() => {
    const saved = localStorage.getItem('ym_language') as AppLanguage;
    return saved === 'en' || saved === 'roman-urdu' || saved === 'ur' ? saved : 'en';
  });

  const handleToggleLanguage = (lang: AppLanguage) => {
    setAppLanguage(lang);
    localStorage.setItem('ym_language', lang);
    if (lang === 'ur') {
      document.documentElement.dir = 'rtl';
      document.documentElement.lang = 'ur';
    } else {
      document.documentElement.dir = 'ltr';
      document.documentElement.lang = 'en';
    }
  };

  const [isBarcodeScannerOpen, setIsBarcodeScannerOpen] = useState(false);
  const [isAIDispatchModalOpen, setIsAIDispatchModalOpen] = useState(false);
  const [isLocationSelectorOpen, setIsLocationSelectorOpen] = useState(false);
  const [isCodVerificationModalOpen, setIsCodVerificationModalOpen] = useState(false);
  const [selectedOrderForCodVer, setSelectedOrderForCodVer] = useState<Order | null>(null);
  const [isPayoutRequestModalOpen, setIsPayoutRequestModalOpen] = useState(false);

  const handleClaimBonus = (bonusAmountPKR: number, tierTitle: string) => {
    // Credit wallet balance
    setUsers((prev) =>
      prev.map((u) =>
        u.id === currentUser.id
          ? { ...u, walletBalancePKR: (u.walletBalancePKR || 0) + bonusAmountPKR }
          : u
      )
    );
    setCurrentUser((prev) => ({
      ...prev,
      walletBalancePKR: (prev.walletBalancePKR || 0) + bonusAmountPKR,
    }));

    // Add transaction
    setTransactions((prev) => [
      {
        id: `tx-bonus-${Date.now()}`,
        userId: currentUser.id,
        type: 'REFERRAL_BONUS',
        amountPKR: bonusAmountPKR,
        description: `🏆 Reseller Milestone Cash Bonus (${tierTitle}) Credited!`,
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
        status: 'COMPLETED',
      },
      ...prev,
    ]);

    handleLogAudit('BONUS_CLAIMED', `Reseller ${currentUser.name} claimed ${tierTitle} bonus of PKR ${bonusAmountPKR}`, 'SUCCESS');
  };

  const handleRecoverCartToOrder = (session: any) => {
    const sampleProduct = products[0] || initialProducts[0];
    const newOrder: Order = {
      id: `ord-recovered-${Date.now()}`,
      orderNumber: `YM-REC-${Math.floor(1000 + Math.random() * 9000)}`,
      customerName: session.customerName,
      customerPhone: session.customerPhone,
      customerCity: session.customerCity || 'Lahore',
      customerAddress: 'Direct Customer Delivery Address',
      items: [{
        productId: sampleProduct.id,
        name: session.productName,
        sku: sampleProduct.sku,
        image: sampleProduct.image,
        qty: session.itemsCount || 1,
        supplierCostPKR: sampleProduct.supplierCostPKR,
        sellingPricePKR: session.cartTotalPKR,
      }],
      sellingPricePKR: session.cartTotalPKR,
      supplierCostPKR: sampleProduct.supplierCostPKR,
      shippingCostPKR: 200,
      processingFeePKR: 30,
      platformFeePKR: Math.round(session.cartTotalPKR * 0.02),
      resellerCommissionPKR: session.cartTotalPKR - sampleProduct.supplierCostPKR - 230,
      status: 'COD_CONFIRMED',
      codOtpVerified: true,
      profitGuardApproved: true,
      profitGuardReason: 'Recovered via Automated WhatsApp Cart Recovery Bot',
      createdAt: new Date().toISOString(),
      resellerId: currentUser.id,
      resellerName: currentUser.name,
      supplierId: sampleProduct.supplierId,
      supplierName: sampleProduct.supplierName,
      syncedStore: 'WhatsApp Cart Recovery Bot',
      messages: [{
        id: `msg-${Date.now()}`,
        senderRole: 'PLATFORM',
        senderName: 'WhatsApp Cart Recovery Engine',
        text: `Customer accepted WhatsApp 5% discount offer and confirmed order! Ready for courier booking.`,
        timestamp: new Date().toISOString(),
      }],
    };

    setOrders((prev) => [newOrder, ...prev]);
    setActiveTab('orders');
    handleLogAudit('CART_RECOVERED', `Recovered cart for ${session.customerName} (PKR ${session.cartTotalPKR}) into active order`, 'SUCCESS');
  };

  const handleUpdateBarcodeScannedOrderStatus = (orderId: string, status: string, notes?: string) => {
    setOrders((prev) =>
      prev.map((o) =>
        (o.id === orderId || o.orderNumber === orderId)
          ? {
              ...o,
              status: status as any,
              messages: [
                ...(o.messages || []),
                {
                  id: `msg-${Date.now()}`,
                  senderRole: 'PLATFORM',
                  senderName: 'Warehouse Barcode Scanner',
                  text: notes || `Status updated to ${status} via laser barcode scan.`,
                  timestamp: new Date().toISOString(),
                },
              ],
            }
          : o
      )
    );
    handleLogAudit('BARCODE_SCAN_UPDATE', `Scanned order ${orderId} -> ${status}`, 'SUCCESS');
  };

  // Payout Handlers
  const handleRequestPayout = (payoutData: Omit<PayoutRequest, 'id' | 'requestedAt' | 'status'>) => {
    const newRequest: PayoutRequest = {
      ...payoutData,
      id: `PO-${Math.floor(1000 + Math.random() * 9000)}`,
      requestedAt: new Date().toISOString(),
      status: 'PENDING',
    };
    const updated = [newRequest, ...payoutRequests];
    setPayoutRequests(updated);
    localStorage.setItem('ym_payout_requests', JSON.stringify(updated));
    handleLogAudit('PAYOUT_REQUESTED', `Reseller ${payoutData.resellerName} requested PKR ${payoutData.amountPKR} via ${payoutData.method}`, 'SUCCESS');
  };

  const handleApprovePayout = (payoutId: string, transactionId: string, notes?: string) => {
    const target = payoutRequests.find((p) => p.id === payoutId);
    if (!target) return;

    const updated = payoutRequests.map((p) =>
      p.id === payoutId
        ? {
            ...p,
            status: 'APPROVED' as const,
            processedAt: new Date().toISOString(),
            transactionId,
            adminNotes: notes || p.adminNotes,
          }
        : p
    );
    setPayoutRequests(updated);
    localStorage.setItem('ym_payout_requests', JSON.stringify(updated));

    // Deduct from reseller wallet balance
    setUsers((prev) =>
      prev.map((u) =>
        u.id === target.resellerId
          ? { ...u, walletBalancePKR: Math.max(0, (u.walletBalancePKR || 0) - target.amountPKR) }
          : u
      )
    );

    // Also deduct if currentUser is this reseller
    if (currentUser.id === target.resellerId) {
      setCurrentUser((prev) => ({
        ...prev,
        walletBalancePKR: Math.max(0, (prev.walletBalancePKR || 0) - target.amountPKR),
      }));
    }

    // Add debit transaction
    setTransactions((prev) => [
      {
        id: `tx-${Date.now()}`,
        userId: target.resellerId,
        type: 'PAYOUT',
        amountPKR: target.amountPKR,
        description: `Disbursed ${target.method} Payout (Ref: ${transactionId}) to ${target.accountTitle}`,
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
        status: 'COMPLETED',
      },
      ...prev,
    ]);

    handleLogAudit('PAYOUT_DISBURSED', `Disbursed PKR ${target.amountPKR} to ${target.resellerName} (${transactionId})`, 'SUCCESS');
  };

  const handleRejectPayout = (payoutId: string, reason: string) => {
    const updated = payoutRequests.map((p) =>
      p.id === payoutId ? { ...p, status: 'REJECTED' as const, adminNotes: reason } : p
    );
    setPayoutRequests(updated);
    localStorage.setItem('ym_payout_requests', JSON.stringify(updated));
    handleLogAudit('PAYOUT_REJECTED', `Payout ${payoutId} rejected: ${reason}`, 'WARNING');
  };

  // WhatsApp COD Verification Handler
  const handleConfirmWhatsAppVerification = (orderId: string, verifiedMethod: string) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? {
              ...o,
              status: 'COD_CONFIRMED',
              codOtpVerified: true,
              messages: [
                ...(o.messages || []),
                {
                  id: `msg-${Date.now()}`,
                  senderRole: 'PLATFORM',
                  senderName: 'WhatsApp Verification Bot',
                  text: `Customer confirmed COD delivery via ${verifiedMethod}. Ready for courier booking.`,
                  timestamp: new Date().toISOString(),
                },
              ],
            }
          : o
      )
    );
    handleLogAudit('WHATSAPP_COD_VERIFIED', `Order ${orderId} verified via WhatsApp interactive bot`, 'SUCCESS');
  };

  // 1-Click Courier Booking Confirmation
  const handleConfirmCourierBooking = (orderId: string, courierName: string, trackingNumber: string, notes?: string) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? {
              ...o,
              status: 'DISPATCHED',
              courierName,
              trackingNumber,
              messages: [
                ...(o.messages || []),
                {
                  id: `msg-${Date.now()}`,
                  senderRole: 'PLATFORM',
                  senderName: 'Courier Dispatch Engine',
                  text: `Parcel booked with ${courierName}. CN Number: ${trackingNumber}. ${notes || ''}`,
                  timestamp: new Date().toISOString(),
                },
              ],
            }
          : o
      )
    );
    handleLogAudit('COURIER_BOOKED', `Booked ${courierName} Airway Bill ${trackingNumber} for Order ${orderId}`, 'SUCCESS');
  };

  // Simulate Incoming Shopify Order
  const handleSimulateShopifyIncomingOrder = () => {
    const sampleProduct = products[0] || initialProducts[0];
    const newShopifyOrder: Order = {
      id: `ord-shopify-${Date.now()}`,
      orderNumber: `YM-SHP-${Math.floor(1000 + Math.random() * 9000)}`,
      customerName: 'Zubair Ahmed (Shopify Customer)',
      customerPhone: '0312-9847192',
      customerCity: 'Islamabad',
      customerAddress: 'House 14, Street 9, Sector F-8/2',
      items: [{
        productId: sampleProduct.id,
        name: sampleProduct.name,
        sku: sampleProduct.sku,
        image: sampleProduct.image,
        qty: 1,
        supplierCostPKR: sampleProduct.supplierCostPKR,
        sellingPricePKR: Math.round(sampleProduct.supplierCostPKR * 2.2),
      }],
      sellingPricePKR: Math.round(sampleProduct.supplierCostPKR * 2.2),
      supplierCostPKR: sampleProduct.supplierCostPKR,
      shippingCostPKR: 250,
      processingFeePKR: 30,
      platformFeePKR: Math.round(sampleProduct.supplierCostPKR * 2.2 * 0.02),
      resellerCommissionPKR: Math.round(sampleProduct.supplierCostPKR * 2.2) - sampleProduct.supplierCostPKR - 280,
      status: 'PENDING_VERIFICATION',
      codRisk: 'LOW',
      profitGuardApproved: true,
      profitGuardReason: 'Imported via Shopify Webhook Sync API',
      createdAt: new Date().toISOString(),
      resellerId: currentUser.id,
      resellerName: currentUser.name,
      supplierId: sampleProduct.supplierId,
      supplierName: sampleProduct.supplierName,
      syncedStore: 'Shopify Store (Zainab Hub)',
      messages: [{
        id: `msg-${Date.now()}`,
        senderRole: 'PLATFORM',
        senderName: 'Shopify Webhook Ingestion',
        text: 'Order placed by customer on online Shopify storefront. Awaiting WhatsApp COD confirmation.',
        timestamp: new Date().toISOString(),
      }],
    };

    setOrders((prev) => [newShopifyOrder, ...prev]);
    setActiveTab('orders');
    handleLogAudit('SHOPIFY_WEBHOOK_INGESTION', `Auto-imported Order ${newShopifyOrder.orderNumber} from Shopify`, 'SUCCESS');
  };

  // Check if active user is registered (not guest)
  const isRegisteredUser = (user?: User | null): boolean => {
    if (!user) return false;
    if (user.role === 'GUEST') return false;
    if (user.isRegistered === false) return false;
    return true;
  };

  const handleUpdateUserProfile = (updated: Partial<User>) => {
    if (!currentUser) return;
    const updatedUser: User = { ...currentUser, ...updated };
    setCurrentUser(updatedUser);
    setUsers((prev) => prev.map((u) => (u.id === currentUser.id ? updatedUser : u)));
    handleLogAudit(
      'USER_PROFILE_UPDATED',
      `Updated profile & settings for ${updatedUser.name} (${updatedUser.role || 'USER'})`,
      'SUCCESS'
    );
  };

  // Persist allStores
  useEffect(() => {
    localStorage.setItem('ym_all_stores', JSON.stringify(allStores));
  }, [allStores]);

  // Global Keyboard shortcut listener for Software Creator Admin access (Alt + A)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.altKey && e.key.toLowerCase() === 'a') || (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'a')) {
        e.preventDefault();
        setIsAdminAuthModalOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Audit Logger Helper
  const handleLogAudit = (
    action: string,
    details: string,
    status: 'SUCCESS' | 'WARNING' | 'FAILED'
  ) => {
    const newLog: AdminAuditLog = {
      id: `log-${Date.now()}`,
      action,
      details,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      ip: '110.39.42.18 (Lahore PK)',
      status,
      adminUser: currentUser.role === 'ADMIN' ? currentUser.name : 'Master Administrator',
    };
    setAuditLogs((prev) => {
      const updated = [newLog, ...prev];
      localStorage.setItem('ym_admin_audit_logs', JSON.stringify(updated));
      return updated;
    });
  };

  // Admin Authentication Success
  const handleAuthenticateAdminSuccess = () => {
    setIsAdminAuthenticated(true);
    sessionStorage.setItem('ym_admin_auth', 'true');
    const adminUser = users.find((u) => u?.role === 'ADMIN') || users[1] || users[0];
    setCurrentUser(adminUser);
    setActiveTab('admin-hq');
    setIsAdminAuthModalOpen(false);
  };

  // Admin Lock / Logout
  const handleLockAdmin = () => {
    setIsAdminAuthenticated(false);
    sessionStorage.removeItem('ym_admin_auth');
    const resellerUser = users.find((u) => u?.role === 'RESELLER') || users[3] || users[2] || users[0];
    setCurrentUser(resellerUser);
    setActiveTab('catalog');
    handleLogAudit('ADMIN_CONSOLE_LOCKED', 'Master Admin session closed and locked', 'SUCCESS');
  };

  // Update Security Config
  const handleUpdateSecurityConfig = (newSec: AdminSecurityConfig) => {
    setSecurityConfig(newSec);
    localStorage.setItem('ym_admin_security_config', JSON.stringify(newSec));
  };

  // Update Helplines Config (Buyers, Resellers, Manufacturers)
  const handleUpdateHelplinesConfig = (newHelplines: PlatformHelplinesConfig) => {
    setHelplinesConfig(newHelplines);
    localStorage.setItem('ym_helplines_config', JSON.stringify(newHelplines));
  };

  // Global Handlers
  const handleSelectUser = (user: User) => {
    if (!user) return;
    if (user.role === 'ADMIN' && !isAdminAuthenticated) {
      setIsAdminAuthModalOpen(true);
      return;
    }

    setCurrentUser(user);
    if (user.role === 'ADMIN') {
      setActiveTab('admin-hq');
    } else if (user.role === 'SUPPLIER') {
      setActiveTab('supplier-hub');
    } else if (user.role === 'RESELLER') {
      setActiveTab('catalog');
    }
  };

  // Handle Tab Selection with Protected Route Guard & Navigation History
  const handleSelectTab = (tab: string) => {
    if (tab === 'admin-hq' && !isAdminAuthenticated) {
      setIsAdminAuthModalOpen(true);
      return;
    }
    if (tab !== activeTab) {
      setNavHistory((prev) => [...prev, activeTab]);
    }
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleGoBack = () => {
    if (navHistory.length > 0) {
      const prevTab = navHistory[navHistory.length - 1];
      setNavHistory((prev) => prev.slice(0, -1));
      setActiveTab(prevTab || 'dashboard');
    } else {
      setActiveTab('dashboard');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Direct Wallet Balance Adjustment by Admin
  const handleAdjustUserBalance = (userId: string, amountChange: number, reason: string) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === userId
          ? { ...u, walletBalancePKR: Math.max(0, u.walletBalancePKR + amountChange) }
          : u
      )
    );

    const now = new Date().toISOString().replace('T', ' ').substring(0, 16);
    setTransactions((prev) => [
      {
        id: `tx-${Date.now()}`,
        userId,
        type: amountChange >= 0 ? 'CREDIT' : 'DEBIT',
        amountPKR: Math.abs(amountChange),
        description: `Admin Adjustment: ${reason}`,
        timestamp: now,
        status: 'COMPLETED',
      },
      ...prev,
    ]);
  };

  // Add Product from Supplier (Daraz-style multi-image, video, active status)
  const handleAddProduct = (newProductData: Omit<Product, 'id'>) => {
    const newProduct: Product = {
      ...newProductData,
      id: `prod-${Date.now()}`,
    };
    setProducts((prev) => [newProduct, ...prev]);
    handleLogAudit(
      'PRODUCT_ADDED',
      `New product "${newProduct.name}" (SKU: ${newProduct.sku}) added to catalog. Wholesale: PKR ${newProduct.supplierCostPKR}`,
      'SUCCESS'
    );
  };

  // Full Product Update by Admin or Supplier
  const handleUpdateProduct = (updatedProduct: Product) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === updatedProduct.id ? updatedProduct : p))
    );
    handleLogAudit(
      'PRODUCT_EDITED',
      `Product "${updatedProduct.name}" (SKU: ${updatedProduct.sku}) updated. Wholesale: PKR ${updatedProduct.supplierCostPKR}, Stock: ${updatedProduct.stock}, Active: ${updatedProduct.isActive ? 'Yes' : 'No'}`,
      'SUCCESS'
    );
  };

  // Delete Product from Catalog
  const handleDeleteProduct = (productId: string) => {
    const prod = products.find((p) => p.id === productId);
    setProducts((prev) => prev.filter((p) => p.id !== productId));
    handleLogAudit(
      'PRODUCT_DELETED',
      `Product "${prod?.name || productId}" removed from catalog.`,
      'WARNING'
    );
  };

  // Full Order Update by Admin
  const handleUpdateOrder = (updatedOrder: Order) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === updatedOrder.id ? updatedOrder : o))
    );
    handleLogAudit(
      'ORDER_EDITED',
      `Order #${updatedOrder.orderNumber} edited by Admin. Status: ${updatedOrder.status}, Customer: ${updatedOrder.customerName}, Tracking: ${updatedOrder.trackingNumber || 'N/A'}`,
      'SUCCESS'
    );
  };

  // Full User Account Update by Admin
  const handleUpdateUser = (updatedUser: User) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === updatedUser.id ? updatedUser : u))
    );
    if (currentUser.id === updatedUser.id) {
      setCurrentUser(updatedUser);
    }
    handleLogAudit(
      'USER_ACCOUNT_EDITED',
      `User ${updatedUser.name} (${updatedUser.email}, Role: ${updatedUser.role}) profile updated.`,
      'SUCCESS'
    );
  };

  // Toggle Product Active / Inactive Status
  const handleToggleProductActive = (productId: string) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, isActive: !p.isActive } : p))
    );
  };

  // Update Stock
  const handleUpdateStock = (productId: string, newStock: number) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, stock: newStock } : p))
    );
  };

  // Update Supplier Cost
  const handleUpdateCost = (productId: string, newCost: number) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, supplierCostPKR: newCost } : p))
    );
  };

  // Execute Reseller Customer Order with Exact Deductions (30 Rs processing + delivery + 2% platform)
  const executeCreateSingleOrder = (
    {
      product,
      sellingPrice,
      customerName,
      customerPhone,
      customerCity,
      customerAddress,
    }: {
      product: Product;
      sellingPrice: number;
      customerName: string;
      customerPhone?: string;
      customerCity?: string;
      customerAddress?: string;
    },
    userToUse: User
  ) => {
    const shippingCost = profitGuardConfig.defaultShippingCostPKR;
    const processingFee = profitGuardConfig.processingFeePKR ?? 30;
    const platformFeePct = profitGuardConfig.platformFeePct ?? 2.0;

    // Evaluate with Profit Guard
    const evaluation = evaluateOrderFinancials(
      {
        sellingPricePKR: sellingPrice,
        supplierCostPKR: product.supplierCostPKR,
        shippingCostPKR: shippingCost,
        processingFeePKR: processingFee,
        platformFeePct: platformFeePct,
      },
      profitGuardConfig
    );

    const platformFee = evaluation.financials.platformFeePKR;
    const resellerCommission = evaluation.financials.resellerNetProfitPKR;

    // Check COD Fraud Risk Engine & Blacklist
    const phoneToAssess = customerPhone || '03001234567';
    const cityToAssess = customerCity || 'Lahore';
    const risk = calculateCustomerRisk(phoneToAssess, cityToAssess);

    if (risk.requiresAdvanceFee) {
      setActiveRiskAssessment(risk);
      setIsAdvanceGateModalOpen(true);
    }

    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      orderNumber: `YM-${Math.floor(10000 + Math.random() * 90000)}`,
      customerName: customerName || 'Direct Reseller Customer',
      customerPhone: phoneToAssess,
      customerCity: cityToAssess,
      customerAddress: customerAddress || 'Gulberg III, Main Boulevard, Lahore, Pakistan',
      items: [
        {
          productId: product.id,
          name: product.name,
          sku: product.sku,
          image: product.image,
          qty: 1,
          supplierCostPKR: product.supplierCostPKR,
          sellingPricePKR: sellingPrice,
        },
      ],
      sellingPricePKR: sellingPrice,
      supplierCostPKR: product.supplierCostPKR,
      shippingCostPKR: shippingCost,
      processingFeePKR: processingFee,
      gatewayFeePKR: 0,
      resellerCommissionPKR: resellerCommission,
      platformFeePKR: platformFee,
      netProfitPKR: resellerCommission,
      profitMarginPct: evaluation.financials.profitMarginPct,
      status: 'PENDING_VERIFICATION',
      codRisk: risk.riskLevel,
      codOtpVerified: false,
      profitGuardApproved: evaluation.approved,
      profitGuardReason: evaluation.reason,
      createdAt: new Date().toISOString(),
      resellerId: userToUse?.role === 'RESELLER' ? userToUse.id : 'usr-2',
      resellerName: userToUse?.role === 'RESELLER' ? userToUse.name : 'Pro Reseller',
      supplierId: product.supplierId,
      supplierName: product.supplierName,
      syncedStore: 'Direct Reseller Order',
      messages: [
        {
          id: `msg-${Date.now()}`,
          senderRole: 'PLATFORM',
          senderName: 'Profit Guard™ Engine',
          text: `Order registered with selling price PKR ${sellingPrice.toLocaleString()}. Supplier Cost: PKR ${product.supplierCostPKR.toLocaleString()}, Processing: PKR ${processingFee}, Courier: PKR ${shippingCost}, Platform Take (2%): PKR ${platformFee}. Reseller Payout: PKR ${resellerCommission.toLocaleString()}. Status: ${
            evaluation.approved ? 'APPROVED & READY FOR VERIFICATION' : 'BLOCKED DUE TO DEFICIT'
          }`,
          timestamp: new Date().toISOString(),
        },
      ],
    };

    setOrders((prev) => [newOrder, ...prev]);

    // Debit Flat 30 Rs Processing Fee & Escrow from Reseller Wallet or track
    if (evaluation.approved) {
      setTransactions((prev) => [
        {
          id: `tx-${Date.now()}`,
          userId: userToUse.id,
          type: 'DEBIT',
          amountPKR: processingFee,
          description: `Flat Processing Fee for Order ${newOrder.orderNumber}`,
          timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
          status: 'COMPLETED',
          refOrderId: newOrder.id,
        },
        ...prev,
      ]);
    }
  };

  // Place Reseller Customer Order with Registration Enforcement
  const handlePlaceOrder = (orderData: {
    product: Product;
    sellingPrice: number;
    customerName: string;
    customerPhone?: string;
    customerCity?: string;
    customerAddress?: string;
  }) => {
    // ENFORCE: Any guest/unregistered visitor can freely browse, but must register to place orders
    if (!isRegisteredUser(currentUser)) {
      setPendingSingleOrder(orderData);
      setIsRegistrationRequiredModalOpen(true);
      return;
    }
    executeCreateSingleOrder(orderData, currentUser);
  };

  // Order Lifecycle Handlers
  const handleVerifyCod = (orderId: string) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? {
              ...o,
              status: 'COD_CONFIRMED',
              codOtpVerified: true,
              messages: [
                ...o.messages,
                {
                  id: `msg-${Date.now()}`,
                  senderRole: 'PLATFORM',
                  senderName: 'System Verification',
                  text: 'Customer OTP verified successfully. Order confirmed for warehouse dispatch.',
                  timestamp: new Date().toISOString(),
                },
              ],
            }
          : o
      )
    );
  };

  const handleDispatchOrder = (orderId: string, courierName: string, trackingNumber?: string) => {
    const finalTracking = trackingNumber || `TCS-${Math.floor(10000000 + Math.random() * 90000000)}-PK`;
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? {
              ...o,
              status: 'DISPATCHED',
              courierName,
              trackingNumber: finalTracking,
              messages: [
                ...o.messages,
                {
                  id: `msg-${Date.now()}`,
                  senderRole: 'SUPPLIER',
                  senderName: 'Warehouse Fulfilled',
                  text: `Order packed & dispatched via ${courierName}. Tracking #${finalTracking}.`,
                  timestamp: new Date().toISOString(),
                },
              ],
            }
          : o
      )
    );
  };

  const handleBulkDispatchOrders = (
    dispatches: { orderId: string; courierName: string; trackingNumber: string }[]
  ) => {
    const dispatchMap = new Map(dispatches.map((d) => [d.orderId, d]));
    setOrders((prev) =>
      prev.map((o) => {
        const match = dispatchMap.get(o.id);
        if (match) {
          return {
            ...o,
            status: 'DISPATCHED',
            courierName: match.courierName,
            trackingNumber: match.trackingNumber,
            messages: [
              ...o.messages,
              {
                id: `msg-${Date.now()}-${o.id}`,
                senderRole: 'SUPPLIER',
                senderName: 'Warehouse Fulfilled',
                text: `Order packed & dispatched via ${match.courierName}. Tracking #${match.trackingNumber}.`,
                timestamp: new Date().toISOString(),
              },
            ],
          };
        }
        return o;
      })
    );
  };

  const handleBatchAcceptAndPack = (orderIds: string[]) => {
    setOrders((prev) =>
      prev.map((o) =>
        orderIds.includes(o.id)
          ? {
              ...o,
              status: 'PROCESSING',
              messages: [
                ...o.messages,
                {
                  id: `msg-${Date.now()}-${o.id}`,
                  senderRole: 'SUPPLIER',
                  senderName: currentUser.companyName || currentUser.name || 'Warehouse Staff',
                  text: '1-Click Accepted & Packed by Warehouse. Moved to In-Processing queue for courier handover.',
                  timestamp: new Date().toISOString(),
                },
              ],
            }
          : o
      )
    );
  };

  const handleUpdateOrderStatus = (orderId: string, newStatus: any) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? {
              ...o,
              status: newStatus,
              messages: [
                ...o.messages,
                {
                  id: `msg-${Date.now()}`,
                  senderRole: 'SUPPLIER',
                  senderName: currentUser.companyName || currentUser.name || 'Warehouse Staff',
                  text: `Order status shifted to ${newStatus}.`,
                  timestamp: new Date().toISOString(),
                },
              ],
            }
          : o
      )
    );
  };

  const handleDeliverOrder = (orderId: string) => {
    const targetOrder = orders.find((o) => o.id === orderId);
    if (!targetOrder) return;

    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? {
              ...o,
              status: 'DELIVERED',
              messages: [
                ...o.messages,
                {
                  id: `msg-${Date.now()}`,
                  senderRole: 'PLATFORM',
                  senderName: 'Courier Payout Clearance',
                  text: `COD collected successfully. Supplier escrow (PKR ${o.supplierCostPKR.toLocaleString()}) and Reseller profit (PKR ${o.resellerCommissionPKR.toLocaleString()}) credited to respective wallets.`,
                  timestamp: new Date().toISOString(),
                },
              ],
            }
          : o
      )
    );

    // Credit Reseller Wallet with exact net commission
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === targetOrder.resellerId) {
          return {
            ...u,
            walletBalancePKR: u.walletBalancePKR + targetOrder.resellerCommissionPKR,
          };
        }
        if (u.id === targetOrder.supplierId) {
          return {
            ...u,
            walletBalancePKR: u.walletBalancePKR + targetOrder.supplierCostPKR,
          };
        }
        return u;
      })
    );

    const now = new Date().toISOString().replace('T', ' ').substring(0, 16);
    setTransactions((prev) => [
      {
        id: `tx-${Date.now()}-res`,
        userId: targetOrder.resellerId,
        type: 'CREDIT',
        amountPKR: targetOrder.resellerCommissionPKR,
        description: `Net Profit Commission for Order ${targetOrder.orderNumber}`,
        timestamp: now,
        status: 'COMPLETED',
        refOrderId: targetOrder.id,
      },
      {
        id: `tx-${Date.now()}-sup`,
        userId: targetOrder.supplierId,
        type: 'CREDIT',
        amountPKR: targetOrder.supplierCostPKR,
        description: `Supplier Wholesale Escrow Release for Order ${targetOrder.orderNumber}`,
        timestamp: now,
        status: 'COMPLETED',
        refOrderId: targetOrder.id,
      },
      ...prev,
    ]);
  };

  const handleCancelOrder = (orderId: string, reason?: string) => {
    const cancelReason = reason || 'Cancelled by user';
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? {
              ...o,
              status: 'CANCELLED',
              messages: [
                ...o.messages,
                {
                  id: `msg-${Date.now()}`,
                  senderRole: currentUser.role as any,
                  senderName: currentUser.name,
                  text: `Order Cancelled: ${cancelReason}`,
                  timestamp: new Date().toISOString(),
                },
              ],
            }
          : o
      )
    );
  };

  const handleSendMessage = (orderId: string, messageOrText: Omit<ChatMessage, 'id' | 'timestamp'> | string) => {
    const isObj = typeof messageOrText === 'object' && messageOrText !== null;
    const text: string = isObj ? messageOrText.text : (messageOrText as string);
    const senderRole = isObj ? messageOrText.senderRole : currentUser.role;
    const senderName = isObj ? messageOrText.senderName : currentUser.name;

    const newMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      senderRole: senderRole as any,
      senderName,
      text,
      timestamp: new Date().toISOString(),
    };

    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, messages: [...o.messages, newMessage] } : o))
    );
  };

  const handlePushToStore = (product: Product, storePlatform: string, markupPrice: number) => {
    alert(
      `Product "${product.name}" successfully pushed to your ${storePlatform} store at PKR ${markupPrice.toLocaleString()}!`
    );
  };

  const handleAddFunds = (amount: number) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === currentUser.id ? { ...u, walletBalancePKR: u.walletBalancePKR + amount } : u
      )
    );
    setCurrentUser((prev) => ({ ...prev, walletBalancePKR: prev.walletBalancePKR + amount }));
    const now = new Date().toISOString().replace('T', ' ').substring(0, 16);
    setTransactions((prev) => [
      {
        id: `tx-${Date.now()}`,
        userId: currentUser.id,
        type: 'CREDIT',
        amountPKR: amount,
        description: 'Instant EasyPaisa / JazzCash Top-up',
        timestamp: now,
        status: 'COMPLETED',
      },
      ...prev,
    ]);
  };

  const handleWithdrawFunds = (amount: number, bankDetails: string) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === currentUser.id ? { ...u, walletBalancePKR: u.walletBalancePKR - amount } : u
      )
    );
    setCurrentUser((prev) => ({ ...prev, walletBalancePKR: prev.walletBalancePKR - amount }));
    const now = new Date().toISOString().replace('T', ' ').substring(0, 16);
    setTransactions((prev) => [
      {
        id: `tx-${Date.now()}`,
        userId: currentUser.id,
        type: 'DEBIT',
        amountPKR: amount,
        description: `Bank Withdrawal Payout to ${bankDetails}`,
        timestamp: now,
        status: 'COMPLETED',
      },
      ...prev,
    ]);
  };

  // Verified Store Registration Handler (Manufacturer & Reseller)
  const handleVerifiedRegister = (data: VerifiedRegistrationData) => {
    const newStoreId = `store-${Date.now()}`;
    const newStore: Store = {
      id: newStoreId,
      name: data.businessName,
      slug: data.businessName.toLowerCase().replace(/[^a-z0-9]/g, '-'),
      logo: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=150&auto=format&fit=crop&q=80',
      ownerId: currentUser.id,
      ownerType: data.role === 'MANUFACTURER' || data.role === 'SUPPLIER' ? 'SUPPLIER' : 'RESELLER',
      city: data.city,
      rating: 5.0,
      totalOrders: 0,
      deliveryRating: '⚡ 2-3 Days Fast Delivery (100% On-Time)',
      responseTime: '< 15 mins',
      description: `${data.businessAddress || data.warehouseAddress} - Fully Verified under NTN: ${data.ntn || 'N/A'} & CNIC: ${data.cnic}`,
      isVerified: true,
      categories: ['Wholesale Direct', 'Verified Factory Sourced'],
      verifiedDetails: data,
    };

    setAllStores((prev) => [newStore, ...prev]);

    // Upgrade User Profile & Switch role
    const updatedUser: User = {
      ...currentUser,
      companyName: data.businessName,
      role: data.role === 'MANUFACTURER' || data.role === 'SUPPLIER' ? 'SUPPLIER' : 'RESELLER',
      phone: data.phone,
    };
    setCurrentUser(updatedUser);
    setUsers((prev) => prev.map((u) => (u.id === currentUser.id ? updatedUser : u)));

    // Switch view to their brand new store or supplier dashboard
    setSelectedStoreForView(newStore);
    if (data.role === 'MANUFACTURER' || data.role === 'SUPPLIER') {
      setActiveTab('supplier-hub');
    } else {
      setActiveTab('store-front');
    }

    handleLogAudit(
      'STORE_VERIFICATION_REGISTERED',
      `Registered fully verified ${data.role} store "${data.businessName}" under NTN ${data.ntn}`,
      'SUCCESS'
    );
  };

  // Product Listing Handler (with multi-images, optional video, store assignment)
  const handleListProduct = (newProduct: Product) => {
    setProducts((prev) => [newProduct, ...prev]);
    handleLogAudit(
      'PRODUCT_LISTED',
      `Listed new product "${newProduct.name}" (${newProduct.sku}) in store "${newProduct.storeName || 'Default Store'}"`,
      'SUCCESS'
    );
  };

  // Bulk CSV / Excel Import Handler
  const handleBulkImport = (importedProducts: Product[]) => {
    setProducts((prev) => [...importedProducts, ...prev]);
    handleLogAudit(
      'BULK_PRODUCTS_IMPORTED',
      `Batch imported ${importedProducts.length} wholesale products from CSV into catalog`,
      'SUCCESS'
    );
  };

  // Store Front Navigation Handler
  const handleOpenStoreFront = (storeId: string) => {
    const store = allStores.find((s) => s.id === storeId) || allStores[0];
    if (store) {
      setSelectedStoreForView(store);
      setActiveTab('store-front');
    }
  };

  // Execute Multi-Product Store Consolidated Order Handler
  const executeCreateMultiOrder = (
    store: Store,
    items: { product: Product; quantity: number }[],
    totalAmount: number,
    customerDetails: {
      customerName: string;
      customerPhone: string;
      customerCity: string;
      customerAddress: string;
    },
    userToUse: User,
    deliveryCharges?: number,
    totalWeightKg?: number
  ) => {
    const orderNumber = `ORD-MULTI-${Date.now().toString().slice(-6)}`;
    const totalSupplierCost = items.reduce(
      (sum, item) => sum + item.product.supplierCostPKR * item.quantity,
      0
    );
    const totalSellingPrice = items.reduce(
      (sum, item) => sum + item.product.recSellingPricePKR * item.quantity,
      0
    );

    const shippingCostPKR = deliveryCharges ?? 200;
    const processingFeePKR = profitGuardConfig.processingFeePKR ?? 30;
    const platformFeePKR = Math.round(totalSellingPrice * ((profitGuardConfig.platformFeePct ?? 2.0) / 100));
    const resellerCommissionPKR = Math.max(0, totalSellingPrice - totalSupplierCost - processingFeePKR - platformFeePKR);

    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      orderNumber,
      customerName: customerDetails.customerName,
      customerPhone: customerDetails.customerPhone,
      customerCity: customerDetails.customerCity,
      customerAddress: customerDetails.customerAddress,
      items: items.map((i) => ({
        productId: i.product.id,
        name: i.product.name,
        productName: i.product.name,
        sku: i.product.sku,
        image: i.product.image || '',
        qty: i.quantity,
        supplierCostPKR: i.product.supplierCostPKR,
        sellingPricePKR: i.product.recSellingPricePKR,
      })),
      sellingPricePKR: totalSellingPrice,
      supplierCostPKR: totalSupplierCost,
      shippingCostPKR, // Consolidated flat delivery for multiple items from same store by weight!
      processingFeePKR,
      gatewayFeePKR: 0,
      resellerCommissionPKR: resellerCommissionPKR,
      platformFeePKR: platformFeePKR,
      netProfitPKR: resellerCommissionPKR,
      profitMarginPct: Math.round(((totalSellingPrice - totalSupplierCost) / totalSellingPrice) * 100),
      status: 'PENDING_VERIFICATION',
      codRisk: 'LOW',
      codOtpVerified: false,
      profitGuardApproved: true,
      profitGuardReason: `Consolidated parcel order from store "${store.name}". Weight: ${totalWeightKg || 1.0} kg. Delivery Fee: PKR ${shippingCostPKR}. Platform clearance: 2%.`,
      createdAt: new Date().toISOString(),
      resellerId: userToUse?.role === 'RESELLER' ? userToUse.id : 'usr-2',
      resellerName: userToUse?.role === 'RESELLER' ? userToUse.name : 'Pro Reseller',
      supplierId: store.ownerId || store.id,
      supplierName: store.name,
      syncedStore: store.name,
      messages: [
        {
          id: `msg-${Date.now()}`,
          senderRole: 'PLATFORM',
          senderName: 'Consolidated Store Order',
          text: `Consolidated parcel order placed for ${items.length} products (Total Weight: ${totalWeightKg || 1.0} kg) from store "${store.name}". Weight-based delivery fee: PKR ${shippingCostPKR}. Customer COD Total: PKR ${totalAmount.toLocaleString()} (Platform Fee 2%: PKR ${platformFeePKR.toLocaleString()}).`,
          timestamp: new Date().toISOString(),
        },
      ],
    };

    setOrders((prev) => [newOrder, ...prev]);
    setActiveTab('orders');
  };

  // Multi-Product Store Consolidated Order Handler with Registration Enforcement
  const handlePlaceMultiOrder = (
    store: Store,
    items: { product: Product; quantity: number }[],
    totalAmount: number,
    customerDetails: {
      customerName: string;
      customerPhone: string;
      customerCity: string;
      customerAddress: string;
    },
    deliveryCharges?: number,
    totalWeightKg?: number
  ) => {
    // ENFORCE: Any guest/unregistered visitor can freely browse, but must register to place orders
    if (!isRegisteredUser(currentUser)) {
      setPendingMultiOrder({
        store,
        items,
        totalAmount,
        customerDetails,
        deliveryCharges,
        totalWeightKg,
      });
      setIsRegistrationRequiredModalOpen(true);
      return;
    }
    executeCreateMultiOrder(store, items, totalAmount, customerDetails, currentUser, deliveryCharges, totalWeightKg);
  };

  // Checkout Handler for CartDrawer
  const handleCheckoutOrder = (orderPayload: {
    items: { product: Product; quantity: number }[];
    totalAmount: number;
    customerDetails: {
      customerName: string;
      customerPhone: string;
      customerCity: string;
      customerAddress: string;
    };
    deliveryCharges: number;
    totalWeightKg: number;
  }) => {
    const firstProduct = orderPayload.items[0]?.product;
    const targetStore =
      allStores.find((s) => s.ownerId === firstProduct?.supplierId || s.id === firstProduct?.storeId) ||
      allStores[0];

    if (!isRegisteredUser(currentUser)) {
      setPendingMultiOrder({
        store: targetStore,
        items: orderPayload.items,
        totalAmount: orderPayload.totalAmount,
        customerDetails: orderPayload.customerDetails,
        deliveryCharges: orderPayload.deliveryCharges,
        totalWeightKg: orderPayload.totalWeightKg,
      });
      setIsRegistrationRequiredModalOpen(true);
      return;
    }

    executeCreateMultiOrder(
      targetStore,
      orderPayload.items,
      orderPayload.totalAmount,
      orderPayload.customerDetails,
      currentUser,
      orderPayload.deliveryCharges,
      orderPayload.totalWeightKg
    );
  };

  // Callback when a guest finishes registration or switches to a registered user
  const handleRegistrationCompleted = (registeredUser: User) => {
    setCurrentUser(registeredUser);
    setUsers((prev) => {
      const exists = prev.some((u) => u.id === registeredUser.id);
      return exists ? prev.map((u) => (u.id === registeredUser.id ? registeredUser : u)) : [registeredUser, ...prev];
    });
    setIsRegistrationRequiredModalOpen(false);

    // Auto-resume pending order placement if one was blocked!
    if (pendingSingleOrder) {
      executeCreateSingleOrder(pendingSingleOrder, registeredUser);
      setPendingSingleOrder(null);
    } else if (pendingMultiOrder) {
      executeCreateMultiOrder(
        pendingMultiOrder.store,
        pendingMultiOrder.items,
        pendingMultiOrder.totalAmount,
        pendingMultiOrder.customerDetails,
        registeredUser,
        pendingMultiOrder.deliveryCharges,
        pendingMultiOrder.totalWeightKg
      );
      setPendingMultiOrder(null);
    }
  };

  const pendingOrdersCount = orders.filter((o) => o.status === 'PENDING_VERIFICATION').length;

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col font-sans">
      {/* Unified Primary Dashboard Navigation */}
      <Navbar
        activeTab={activeTab}
        onSelectTab={handleSelectTab}
        pendingOrdersCount={pendingOrdersCount}
        cartCount={cartItems.reduce((sum, item) => sum + item.quantity, 0)}
        currentUser={currentUser}
        isAdminAuthenticated={isAdminAuthenticated}
        language={appLanguage}
        onToggleLanguage={handleToggleLanguage}
        onOpenBatchPrinter={() => setIsBulkLabelPrinterOpen(true)}
        onOpenUpgradeModal={() => setIsVerifiedRegistrationOpen(true)}
        onOpenStoreSyncModal={() => setIsStoreSyncModalOpen(true)}
        onOpenWalletModal={() => setIsWalletModalOpen(true)}
        onOpenCart={() => setIsCartDrawerOpen(true)}
        onOpenHelplinesModal={() => setIsHelplinesModalOpen(true)}
        onOpenAdminAuth={() => setIsAdminAuthModalOpen(true)}
        onLockAdmin={handleLockAdmin}
        onOpenProfitGuardModal={() => setIsProfitGuardModalOpen(true)}
        onOpenProductListing={() => setIsProductListingOpen(true)}
        onOpenBulkImport={() => setIsBulkImportOpen(true)}
        onOpenPoliciesModal={() => setIsPoliciesModalOpen(true)}
        onOpenWhiteLabelModal={() => setIsWhiteLabelModalOpen(true)}
        onOpenShopifySyncModal={() => setIsShopifySyncModalOpen(true)}
        onOpenBarcodeScanner={() => setIsBarcodeScannerOpen(true)}
        onOpenAiAssetStudio={() => setIsAiAssetStudioModalOpen(true)}
        onOpenProfile={() => setIsProfileSettingsOpen(true)}
        onOpenAIDispatchModal={() => setIsAIDispatchModalOpen(true)}
        onOpenLocationSelector={() => setIsLocationSelectorOpen(true)}
        stores={stores}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#F8FAFC]">
        {/* Main App Body */}
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-6 sm:px-6 space-y-6">
          {/* Universal Back Arrow Navigation Bar for Every Function / Tool Screen */}
          {activeTab !== 'dashboard' && (
            <div className="sticky top-16 z-30 bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-2xl p-3 sm:p-4 shadow-sm flex items-center justify-between gap-3 transition-all animate-fadeIn">
              <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                <button
                  type="button"
                  onClick={handleGoBack}
                  className="group inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-emerald-600 text-white font-bold text-xs sm:text-sm shadow-md transition-all active:scale-95 cursor-pointer shrink-0"
                  title="Go Back to Previous Screen (واپس جائیں)"
                >
                  <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                  <span>Back (واپس)</span>
                </button>

                <div className="h-6 w-px bg-slate-200 shrink-0" />

                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 shrink-0">
                      {FUNCTION_INFO[activeTab]?.tag || 'Function'}
                    </span>
                    <h2 className="text-sm sm:text-base font-extrabold text-slate-900 truncate">
                      {FUNCTION_INFO[activeTab]?.title || activeTab}
                    </h2>
                  </div>
                  {FUNCTION_INFO[activeTab]?.subtitle && (
                    <p className="text-[11px] text-slate-500 truncate hidden md:block mt-0.5">
                      {FUNCTION_INFO[activeTab]?.subtitle}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    if (activeTab !== 'dashboard') {
                      setNavHistory((prev) => [...prev, activeTab]);
                    }
                    setActiveTab('dashboard');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition cursor-pointer"
                  title="Go to Dashboard Overview"
                >
                  <Home className="w-3.5 h-3.5 text-slate-500" />
                  <span className="hidden sm:inline">Dashboard</span>
                </button>
              </div>
            </div>
          )}

          {activeTab === 'dashboard' && (
            <FrontPageDashboard
              orders={orders}
              products={products}
              currentUser={currentUser}
              onNavigateTab={handleSelectTab}
              onOpenAddProduct={() => setIsProductListingOpen(true)}
              onOpenBulkImport={() => setIsBulkImportOpen(true)}
              onOpenPolicies={() => setIsPoliciesModalOpen(true)}
              onOpenProfileSettings={() => setIsProfileSettingsOpen(true)}
              onOpenStoreSyncModal={() => setIsStoreSyncModalOpen(true)}
              onOpenHelplinesModal={() => setIsHelplinesModalOpen(true)}
            />
          )}

        {(activeTab === 'catalog' || activeTab === 'winning-products' || activeTab === 'orders') && (
          <ResellerPortal
            currentUser={currentUser}
            products={products}
            profitGuardConfig={profitGuardConfig}
            bankTransferDetails={bankTransferDetails}
            stores={stores}
            initialSubSection={
              activeTab === 'winning-products'
                ? 'winning-products'
                : activeTab === 'orders'
                ? 'orders-dispatch'
                : 'all-products'
            }
            orders={orders}
            onOpenAdCopyModal={(p) => {
              setSelectedProductForAd(p);
              setIsAdCopyModalOpen(true);
            }}
            onVerifyCod={handleVerifyCod}
            onDispatchOrder={handleDispatchOrder}
            onDeliverOrder={handleDeliverOrder}
            onCancelOrder={handleCancelOrder}
            onSendMessage={handleSendMessage}
            onOpenBatchPrint={() => setIsBulkLabelPrinterOpen(true)}
            onBulkDispatchOrders={handleBulkDispatchOrders}
            onOpenWhatsAppVerification={(ord) => {
              setSelectedOrderForWhatsApp(ord);
              setIsWhatsAppModalOpen(true);
            }}
            onOpenCourierBooking={(ord) => {
              setSelectedOrderForCourier(ord);
              setIsCourierBookingModalOpen(true);
            }}
            onOpenThermalSlip={(ord) => {
              setSelectedOrderForCourier(ord);
              setIsCourierBookingModalOpen(true);
            }}
            onPlaceSampleOrder={(p, price, customerDetails) =>
              handlePlaceOrder({
                product: p,
                sellingPrice: price,
                customerName: customerDetails.customerName,
                customerPhone: customerDetails.customerPhone,
                customerCity: customerDetails.customerCity,
                customerAddress: customerDetails.customerAddress,
              })
            }
            onPushToStore={handlePushToStore}
            onOpenStoreSyncModal={() => setIsStoreSyncModalOpen(true)}
            onOpenStoreFront={handleOpenStoreFront}
            onOpenVerifiedRegistration={() => setIsVerifiedRegistrationOpen(true)}
            onAddToCart={handleAddToCart}
            onOpenBulkImport={() => setIsBulkImportOpen(true)}
          />
        )}

        {activeTab === 'stores-directory' && (
          <StoresDirectoryView
            stores={allStores}
            products={products}
            onSelectStore={(store) => {
              setSelectedStoreForView(store);
              setActiveTab('store-front');
            }}
            onOpenVerifiedRegistration={() => setIsVerifiedRegistrationOpen(true)}
          />
        )}

        {activeTab === 'store-front' && (
          <StoreFrontView
            store={selectedStoreForView || allStores[0]}
            allProducts={products}
            currentUser={currentUser}
            profitGuardConfig={profitGuardConfig}
            bankTransferDetails={bankTransferDetails}
            onBack={() => setActiveTab('catalog')}
            onSelectProduct={() => {}}
            onPlaceMultiOrder={(items, customerDetails, totalAmountPKR) => {
              handlePlaceMultiOrder(
                selectedStoreForView || allStores[0],
                items.map((i) => ({ product: i.product, quantity: i.quantity })),
                totalAmountPKR,
                customerDetails
              );
            }}
            onPlaceBulkOrder={(bulkData) => {
              handlePlaceMultiOrder(
                bulkData.store,
                [{ product: bulkData.product, quantity: bulkData.quantity }],
                bulkData.totalAmountPKR,
                {
                  customerName: `${bulkData.resellerName} (Wholesale B2B Bulk)`,
                  customerPhone: bulkData.resellerPhone,
                  customerCity: bulkData.resellerCity,
                  customerAddress: `${bulkData.deliveryAddress} [Transport: ${bulkData.deliveryMethod === 'CARGO_BILTY' ? 'Goods Transport Bilty Cargo' : 'Express Courier'}] ${bulkData.notes ? `| Note: ${bulkData.notes}` : ''}`,
                }
              );
            }}
          />
        )}

        {activeTab === 'admin-hq' && (
          <AdminDashboard
            profitGuardConfig={profitGuardConfig}
            onUpdateConfig={setProfitGuardConfig}
            orders={orders}
            onUpdateOrder={handleUpdateOrder}
            products={products}
            onUpdateProduct={handleUpdateProduct}
            onAddProduct={handleAddProduct}
            onDeleteProduct={handleDeleteProduct}
            users={users}
            onUpdateUser={handleUpdateUser}
            transactions={transactions}
            onOpenProfitGuardModal={() => setIsProfitGuardModalOpen(true)}
            bankTransferDetails={bankTransferDetails}
            onUpdateBankDetails={(newDetails) => {
              setBankTransferDetails(newDetails);
              localStorage.setItem('ym_bank_transfer_details', JSON.stringify(newDetails));
            }}
            securityConfig={securityConfig}
            onUpdateSecurityConfig={handleUpdateSecurityConfig}
            auditLogs={auditLogs}
            onLogAudit={handleLogAudit}
            onLockAdmin={handleLockAdmin}
            onAdjustUserBalance={handleAdjustUserBalance}
            helplinesConfig={helplinesConfig}
            onUpdateHelplinesConfig={handleUpdateHelplinesConfig}
          />
        )}

        {activeTab === 'supplier-hub' && (
          <SupplierPortal
            currentUser={currentUser}
            products={products}
            orders={orders}
            onAddProduct={handleAddProduct}
            onUpdateStock={handleUpdateStock}
            onUpdateCost={handleUpdateCost}
            onToggleActive={handleToggleProductActive}
            onDispatchOrder={handleDispatchOrder}
            onBulkDispatchOrders={handleBulkDispatchOrders}
            onBatchAcceptAndPack={handleBatchAcceptAndPack}
            onUpdateOrderStatus={handleUpdateOrderStatus}
            onWithdrawFunds={handleWithdrawFunds}
            onSaveLogisticsConfig={(cfg) => localStorage.setItem('ym_supplier_logistics_config', JSON.stringify(cfg))}
          />
        )}

        {activeTab === 'daraz-calculator' && (
          <DarazCalculator
            products={products}
            onSelectProductForOrder={(product, price) => {
              handlePlaceOrder({
                product,
                sellingPrice: price,
                customerName: 'Daraz Customer',
                customerPhone: '0300-1234567',
                customerCity: 'Lahore',
                customerAddress: 'Daraz Hub Transit',
              });
              setActiveTab('orders');
            }}
          />
        )}

        {activeTab === 'fraud-blacklist' && (
          <FraudBlacklistManager />
        )}

        {activeTab === 'courier-reconciliation' && (
          <CourierReconciliationView />
        )}

        {activeTab === 'payouts' && (
          <ResellerPayoutsDeskView
            currentUser={currentUser}
            allUsers={users}
            payoutRequests={payoutRequests}
            onRequestPayout={handleRequestPayout}
            onApprovePayout={handleApprovePayout}
            onRejectPayout={handleRejectPayout}
            onLogAudit={handleLogAudit}
          />
        )}

        {activeTab === 'reverse-logistics' && (
          <ReverseLogisticsRtoView
            orders={orders}
            onRestockOrder={(ordId) => {
              handleLogAudit('RTO_RESTOCKED', `Order ${ordId} restocked to inventory`, 'SUCCESS');
            }}
          />
        )}

        {activeTab === 'public-tracking' && (
          <PublicTrackingView
            orders={orders}
          />
        )}

        {activeTab === 'abandoned-carts' && (
          <AbandonedCartRecoveryView
            onRecoverToOrder={handleRecoverCartToOrder}
          />
        )}

        {activeTab === 'support-tickets' && (
          <SupportDisputeDeskView
            currentUser={currentUser}
            orders={orders}
            onRefundDispute={(resellerId, amount, reason) => {
              handleClaimBonus(amount, `Refund Dispute: ${reason}`);
            }}
            onLogAudit={handleLogAudit}
          />
        )}

        {activeTab === 'bulk-import' && (
          <BulkImportView />
        )}

        {activeTab === 'knowledge-center' && (
          <KnowledgeCenterView onBack={handleGoBack} />
        )}

        {activeTab === 'supplier-inventory' && (
          <SupplierInventorySyncView />
        )}

        {activeTab === 'business-rules' && (
          <AdminBusinessSettingsView />
        )}

        {activeTab === 'audit-log' && (
          <AdminAuditLogView />
        )}
      </main>

      {/* Ad Copy Generator Modal */}
      <AdCopyGeneratorModal
        isOpen={isAdCopyModalOpen}
        onClose={() => setIsAdCopyModalOpen(false)}
        product={selectedProductForAd}
      />

      {/* Bulk Thermal Label Printer Modal */}
      <BulkLabelPrinterModal
        isOpen={isBulkLabelPrinterOpen}
        onClose={() => setIsBulkLabelPrinterOpen(false)}
        orders={orders}
      />

      {/* Advance Guarantee Payment Gate Modal */}
      {activeRiskAssessment && (
        <AdvancePaymentGateModal
          isOpen={isAdvanceGateModalOpen}
          onClose={() => setIsAdvanceGateModalOpen(false)}
          riskAssessment={activeRiskAssessment}
          orderTotalPKR={3500}
          customerPhone={activeRiskAssessment.phone}
          onConfirmAdvancePayment={(ref) => {
            alert(`Advance payment confirmed with Ref ${ref}. Parcel unlocked for dispatch!`);
          }}
        />
      )}

      {/* Admin Security Authentication Gateway Modal */}
      <AdminAuthModal
        isOpen={isAdminAuthModalOpen}
        onClose={() => setIsAdminAuthModalOpen(false)}
        securityConfig={securityConfig}
        onAuthenticateSuccess={handleAuthenticateAdminSuccess}
        onLogAudit={handleLogAudit}
      />

      {/* Global Modals */}
      <ProfitGuardModal
        isOpen={isProfitGuardModalOpen}
        onClose={() => setIsProfitGuardModalOpen(false)}
        config={profitGuardConfig}
        onSaveConfig={(updatedConfig) => {
          setProfitGuardConfig(updatedConfig);
          localStorage.setItem('ym_profit_guard_config', JSON.stringify(updatedConfig));
          handleLogAudit(
            'PLATFORM_FEE_UPDATED',
            `Admin updated platform fee to ${updatedConfig.platformFeePct}% and order fee to PKR ${updatedConfig.processingFeePKR}`,
            'SUCCESS'
          );
        }}
      />

      <StoreSyncModal
        isOpen={isStoreSyncModalOpen}
        onClose={() => setIsStoreSyncModalOpen(false)}
        stores={stores}
        onToggleStoreConnection={(id) =>
          setStores((prev) =>
            prev.map((s) => (s.id === id ? { ...s, connected: !s.connected } : s))
          )
        }
        onSyncNow={(id) =>
          setStores((prev) =>
            prev.map((s) => (s.id === id ? { ...s, lastSync: 'Just now' } : s))
          )
        }
      />

      <WalletModal
        isOpen={isWalletModalOpen}
        onClose={() => setIsWalletModalOpen(false)}
        currentUser={currentUser}
        transactions={transactions}
        onAddFunds={handleAddFunds}
        onWithdrawFunds={handleWithdrawFunds}
      />

      {/* Helplines (Buyers, Resellers, Manufacturers) Support Modal */}
      <HelplinesModal
        isOpen={isHelplinesModalOpen}
        onClose={() => setIsHelplinesModalOpen(false)}
        helplinesConfig={helplinesConfig}
        onUpdateHelplinesConfig={handleUpdateHelplinesConfig}
        isAdminAuthenticated={isAdminAuthenticated}
        onOpenAdminAuth={() => setIsAdminAuthModalOpen(true)}
        onLogAudit={handleLogAudit}
        currentUser={currentUser}
      />

      {/* Verified Registration Modal (Manufacturers & Resellers) */}
      <VerifiedRegistrationModal
        isOpen={isVerifiedRegistrationOpen}
        onClose={() => setIsVerifiedRegistrationOpen(false)}
        currentUser={currentUser}
        onRegistrationSuccess={handleVerifiedRegister}
      />

      {/* Product Listing Modal (Single & Bulk CSV Merged) */}
      <ProductListingModal
        isOpen={isProductListingOpen}
        onClose={() => setIsProductListingOpen(false)}
        currentUser={currentUser}
        stores={allStores}
        onProductCreated={handleListProduct}
        onBulkImportSuccess={handleBulkImport}
      />

      {/* Bulk CSV / Excel Import Modal */}
      <BulkImportModal
        isOpen={isBulkImportOpen}
        onClose={() => setIsBulkImportOpen(false)}
        currentUser={currentUser}
        stores={allStores}
        onImportSuccess={handleBulkImport}
      />

      {/* Registered User Profile & Settings Modal */}
      <ProfileSettingsModal
        isOpen={isProfileSettingsOpen}
        onClose={() => setIsProfileSettingsOpen(false)}
        currentUser={currentUser}
        onUpdateUser={handleUpdateUserProfile}
      />

      {/* Platform Policies & Software Usage Rules (2% Commission) Modal */}
      <PlatformPoliciesModal
        isOpen={isPoliciesModalOpen}
        onClose={() => setIsPoliciesModalOpen(false)}
        currentUser={currentUser}
      />

      {/* Registration Required Interception Modal for Guest Orders */}
      <RegistrationRequiredModal
        isOpen={isRegistrationRequiredModalOpen}
        onClose={() => {
          setIsRegistrationRequiredModalOpen(false);
          setPendingSingleOrder(null);
          setPendingMultiOrder(null);
        }}
        currentUser={currentUser}
        allUsers={users}
        existingUsers={users}
        onSelectRegisteredUser={handleRegistrationCompleted}
        onSelectExistingUser={handleRegistrationCompleted}
        onRegistrationSuccess={handleRegistrationCompleted}
        onRegisterSuccess={handleRegistrationCompleted}
        onOpenFullVerifiedRegistration={() => {
          setIsRegistrationRequiredModalOpen(false);
          setIsVerifiedRegistrationOpen(true);
        }}
        pendingOrderSummary={
          pendingSingleOrder
            ? {
                productName: pendingSingleOrder.product.name,
                totalAmountPKR: pendingSingleOrder.sellingPrice,
                itemsCount: 1,
              }
            : pendingMultiOrder
            ? {
                productName: pendingMultiOrder.items[0]?.product.name,
                totalAmountPKR: pendingMultiOrder.totalAmount,
                itemsCount: pendingMultiOrder.items.length,
              }
            : undefined
        }
      />

      {/* Unified Multi-Product Consolidated Cart Drawer */}
      <CartDrawer
        isOpen={isCartDrawerOpen}
        onClose={() => setIsCartDrawerOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveCartItem}
        onClearCart={handleClearCart}
        profitGuardConfig={profitGuardConfig}
        currentUser={currentUser}
        onCheckoutOrder={handleCheckoutOrder}
      />

      {/* WhatsApp Interactive COD Verification Modal */}
      <WhatsAppVerificationModal
        isOpen={isWhatsAppModalOpen}
        onClose={() => {
          setIsWhatsAppModalOpen(false);
          setSelectedOrderForWhatsApp(null);
        }}
        order={selectedOrderForWhatsApp}
        onConfirmVerification={(ordId, method) => {
          handleConfirmWhatsAppVerification(ordId, method);
          setIsWhatsAppModalOpen(false);
          setSelectedOrderForWhatsApp(null);
        }}
        onRejectOrder={(ordId, reason) => {
          handleCancelOrder(ordId, reason || 'Customer cancelled via WhatsApp prompt');
          setIsWhatsAppModalOpen(false);
          setSelectedOrderForWhatsApp(null);
        }}
      />

      {/* 1-Click Pakistani Courier Booking & Thermal 4x6 Slip Modal */}
      <CourierBookingModal
        isOpen={isCourierBookingModalOpen}
        onClose={() => {
          setIsCourierBookingModalOpen(false);
          setSelectedOrderForCourier(null);
        }}
        order={selectedOrderForCourier}
        onConfirmBooking={(ordId, courierName, trackingNumber, notes) => {
          handleConfirmCourierBooking(ordId, courierName, trackingNumber, notes);
        }}
      />

      {/* White-Label Reseller Flyer Branding Modal */}
      <WhiteLabelBrandingModal
        isOpen={isWhiteLabelModalOpen}
        onClose={() => setIsWhiteLabelModalOpen(false)}
        currentUser={currentUser}
        onSaveConfig={(cfg) => {
          setWhiteLabelConfig(cfg);
          localStorage.setItem('ym_whitelabel_config', JSON.stringify(cfg));
          handleLogAudit('WHITELABEL_SAVED', `Updated flyer brand: ${cfg.storeName}`, 'SUCCESS');
        }}
      />

      {/* Shopify & WooCommerce 1-Click Auto-Sync Modal */}
      <ShopifySyncModal
        isOpen={isShopifySyncModalOpen}
        onClose={() => setIsShopifySyncModalOpen(false)}
        products={products}
        stores={stores}
        onPushProductToStore={(prodId, storeId, markupPrice) => {
          const targetProduct = products.find((p) => p.id === prodId) || products[0];
          if (targetProduct) {
            handlePushToStore(targetProduct, storeId, markupPrice);
          }
          handleLogAudit('SHOPIFY_PRODUCT_PUSH', `Pushed product ${prodId} with selling price PKR ${markupPrice}`, 'SUCCESS');
        }}
        onSimulateIncomingShopifyOrder={handleSimulateShopifyIncomingOrder}
      />

      {/* Mobile Camera Barcode & QR Code Scanner Modal */}
      <BarcodeScannerModal
        isOpen={isBarcodeScannerOpen}
        onClose={() => setIsBarcodeScannerOpen(false)}
        orders={orders}
        onUpdateOrderStatus={handleUpdateBarcodeScannedOrderStatus}
      />

      {/* Unified AI Dispatch & Auto-Reply Modal */}
      <AIDispatchModal
        isOpen={isAIDispatchModalOpen}
        onClose={() => setIsAIDispatchModalOpen(false)}
        currentUser={currentUser}
        helplinesConfig={helplinesConfig}
      />

      {/* Pakistan-Wide Location & Courier Serviceability Modal */}
      <LocationSelectorModal
        isOpen={isLocationSelectorOpen}
        onClose={() => setIsLocationSelectorOpen(false)}
        onSelectCity={(city, serviceability) => {
          handleLogAudit('LOCATION_SELECTED', `User checked serviceability for ${city.name} (${serviceability.deliveryDaysEst})`, 'SUCCESS');
        }}
      />

      {/* COD Risk Verification Modal (WhatsApp / Phone Call / SMS OTP) */}
      {selectedOrderForCodVer && (
        <CodVerificationModal
          isOpen={isCodVerificationModalOpen}
          onClose={() => {
            setIsCodVerificationModalOpen(false);
            setSelectedOrderForCodVer(null);
          }}
          orderId={selectedOrderForCodVer.orderId}
          customerName={selectedOrderForCodVer.customerName}
          customerPhone={selectedOrderForCodVer.customerPhone}
          city={selectedOrderForCodVer.city || 'Pakistan'}
          totalAmountPKR={selectedOrderForCodVer.totalAmountPKR || 2500}
          onVerificationComplete={(method) => {
            handleVerifyCod(selectedOrderForCodVer.orderId);
            setIsCodVerificationModalOpen(false);
            setSelectedOrderForCodVer(null);
          }}
          onRejectOrder={(reason) => {
            handleCancelOrder(selectedOrderForCodVer.orderId, reason);
            setIsCodVerificationModalOpen(false);
            setSelectedOrderForCodVer(null);
          }}
        />
      )}

      {/* Profit Payout Withdrawal Request Modal */}
      <PayoutRequestModal
        isOpen={isPayoutRequestModalOpen}
        onClose={() => setIsPayoutRequestModalOpen(false)}
        resellerId={currentUser.id}
        resellerName={currentUser.name}
        onSuccess={() => {
          handleLogAudit('PAYOUT_REQUESTED', `Reseller ${currentUser.name} submitted withdrawal request`, 'SUCCESS');
        }}
      />

      {/* Global AI Product Asset Studio & Video Creator Modal */}
      <AiProductAssetStudioModal
        isOpen={isAiAssetStudioModalOpen}
        onClose={() => setIsAiAssetStudioModalOpen(false)}
        initialProductName="T9 Vintage Hair Trimmer Professional Clipper"
        initialCategory="Personal Care & Health"
        onApplyToProduct={(assets) => {
          setIsProductListingOpen(true);
          setIsAiAssetStudioModalOpen(false);
        }}
      />

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-950 py-4 text-xs text-slate-500 text-center">
        <div className="mx-auto max-w-7xl px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>YourMart Global • Wholesale B2B, Reseller Sourcing & COD Payout Engine</span>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => setIsPoliciesModalOpen(true)}
              className="text-slate-400 hover:text-emerald-400 font-medium transition flex items-center gap-1"
              title="Platform Policies & 2% Standard"
            >
              <span>📜 Policies (2% Fee)</span>
            </button>
            <span className="text-slate-700 hidden sm:inline">•</span>
            <button
              onClick={() => setIsProfileSettingsOpen(true)}
              className="text-slate-400 hover:text-slate-200 font-medium transition flex items-center gap-1"
              title="Profile & Settings"
            >
              <span>⚙️ Profile Settings</span>
            </button>
            <span className="text-slate-700 hidden sm:inline">•</span>
            <button
              onClick={() => setIsHelplinesModalOpen(true)}
              className="text-emerald-400 hover:text-emerald-300 font-semibold underline flex items-center gap-1 transition"
            >
              <span>📞 Helplines</span>
            </button>
            <span className="font-mono text-[11px] text-slate-500 hidden lg:inline">
              Rs. 30 Processing • 2% Platform Clearance
            </span>
            {/* Discreet Creator Access Link */}
            <button
              onClick={() => {
                if (isAdminAuthenticated) {
                  handleSelectTab('admin-hq');
                } else {
                  setIsAdminAuthModalOpen(true);
                }
              }}
              className="text-slate-600 hover:text-slate-400 transition ml-1"
              title="Software Creator Access (Alt+A)"
            >
              🔒
            </button>
          </div>
        </div>
      </footer>
      </div>
    </div>
  );
}
