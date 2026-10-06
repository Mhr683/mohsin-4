export type LedgerTransactionType =
  | 'SALE_CREDIT'       // Reseller margin credited upon COD clearance
  | 'PAYOUT'            // Disbursed to JazzCash / EasyPaisa / Bank
  | 'REFUND'            // Customer dispute refund
  | 'ADJUSTMENT'        // Admin correction
  | 'SHIPPING_CHARGE'   // Courier fee deduction
  | 'PLATFORM_FEE'      // 2% or flat fee
  | 'SUPPLIER_CHARGE'   // Manufacturer wholesale payout
  | 'RTO_CHARGE';       // Return penalty or courier freight loss

export type LedgerTransactionStatus = 'CLEARED' | 'PENDING_CLEARANCE' | 'HELD_RESERVE' | 'CANCELLED';

export interface WalletLedgerEntry {
  id: string;
  userId: string;
  orderId?: string;
  type: LedgerTransactionType;
  amountPKR: number; // Positive for credits, negative for debits
  status: LedgerTransactionStatus;
  description: string;
  timestamp: string;
  reference?: string; // JazzCash TID / Raast Ref / Courier CN
  actor: string;
}

export interface WalletSummary {
  userId: string;
  availableBalancePKR: number;   // Cleared and ready to withdraw
  pendingBalancePKR: number;     // In-transit / Courier COD not yet reconciled
  heldBalancePKR: number;        // Security reserve / RTO risk hold
  totalEarningsPKR: number;      // Cumulative lifetime sales margin
  totalWithdrawnPKR: number;     // Cumulative payouts completed
  ledgerHistory: WalletLedgerEntry[];
}
