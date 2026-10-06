import { LedgerTransactionType, WalletLedgerEntry, WalletSummary } from '../types/wallet';

class WalletLedgerService {
  private ledger: WalletLedgerEntry[] = [];

  constructor() {
    this.seedInitialLedger();
  }

  private seedInitialLedger() {
    const seed: WalletLedgerEntry[] = [
      {
        id: 'led-1',
        userId: 'usr-reseller-1',
        orderId: 'ORD-9021',
        type: 'SALE_CREDIT',
        amountPKR: 1250,
        status: 'CLEARED',
        description: 'COD Clearance: M90 Pro TWS Earbuds delivered in Lahore',
        timestamp: new Date(Date.now() - 72 * 3600 * 1000).toISOString(),
        reference: 'TRAX-CN-44120',
        actor: 'COURIER_RECON'
      },
      {
        id: 'led-2',
        userId: 'usr-reseller-1',
        orderId: 'ORD-9021',
        type: 'PLATFORM_FEE',
        amountPKR: -50,
        status: 'CLEARED',
        description: '2% YourMart Platform software fee on ORD-9021',
        timestamp: new Date(Date.now() - 72 * 3600 * 1000).toISOString(),
        actor: 'SYSTEM'
      },
      {
        id: 'led-3',
        userId: 'usr-reseller-1',
        orderId: 'ORD-9035',
        type: 'SALE_CREDIT',
        amountPKR: 980,
        status: 'CLEARED',
        description: 'COD Clearance: T9 Trimmer delivered in Karachi',
        timestamp: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
        reference: 'POSTEX-78219',
        actor: 'COURIER_RECON'
      },
      {
        id: 'led-4',
        userId: 'usr-reseller-1',
        orderId: 'ORD-9040',
        type: 'SALE_CREDIT',
        amountPKR: 1650,
        status: 'PENDING_CLEARANCE',
        description: 'Pending COD: In-transit parcel via PostEx (Islamabad)',
        timestamp: new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
        reference: 'POSTEX-99120',
        actor: 'SYSTEM'
      },
      {
        id: 'led-5',
        userId: 'usr-reseller-1',
        type: 'PAYOUT',
        amountPKR: -1500,
        status: 'CLEARED',
        description: 'Withdrawal to JazzCash (Account: 0300-1234567)',
        timestamp: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
        reference: 'JC-TID-8819230',
        actor: 'ADMIN'
      }
    ];

    this.ledger = seed;
  }

  recordTransaction(entry: Omit<WalletLedgerEntry, 'id' | 'timestamp'>): WalletLedgerEntry {
    const fullEntry: WalletLedgerEntry = {
      ...entry,
      id: `led-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: new Date().toISOString()
    };

    this.ledger.unshift(fullEntry);
    return fullEntry;
  }

  getWalletSummary(userId: string): WalletSummary {
    const userEntries = this.ledger.filter((e) => e.userId === userId);

    let available = 0;
    let pending = 0;
    let held = 0;
    let totalEarnings = 0;
    let totalWithdrawn = 0;

    userEntries.forEach((entry) => {
      if (entry.status === 'CLEARED') {
        available += entry.amountPKR;
        if (entry.type === 'SALE_CREDIT' && entry.amountPKR > 0) {
          totalEarnings += entry.amountPKR;
        }
        if (entry.type === 'PAYOUT' && entry.amountPKR < 0) {
          totalWithdrawn += Math.abs(entry.amountPKR);
        }
      } else if (entry.status === 'PENDING_CLEARANCE') {
        pending += entry.amountPKR;
      } else if (entry.status === 'HELD_RESERVE') {
        held += entry.amountPKR;
      }
    });

    return {
      userId,
      availableBalancePKR: Math.max(0, available),
      pendingBalancePKR: Math.max(0, pending),
      heldBalancePKR: Math.max(0, held),
      totalEarningsPKR: totalEarnings,
      totalWithdrawnPKR: totalWithdrawn,
      ledgerHistory: userEntries
    };
  }

  recordSaleCredit(userId: string, orderId: string, marginPKR: number, isCleared = false, reference?: string): WalletLedgerEntry {
    return this.recordTransaction({
      userId,
      orderId,
      type: 'SALE_CREDIT',
      amountPKR: marginPKR,
      status: isCleared ? 'CLEARED' : 'PENDING_CLEARANCE',
      description: `Profit margin for order #${orderId.slice(-6)}`,
      reference,
      actor: 'COURIER_RECON'
    });
  }

  recordPayout(userId: string, amountPKR: number, destinationInfo: string, reference?: string): WalletLedgerEntry {
    return this.recordTransaction({
      userId,
      type: 'PAYOUT',
      amountPKR: -Math.abs(amountPKR),
      status: 'CLEARED',
      description: `Payout withdrawal disbursed to ${destinationInfo}`,
      reference,
      actor: 'ADMIN'
    });
  }

  recordRtoCharge(userId: string, orderId: string, chargePKR: number, reason = 'Courier RTO return freight deduction'): WalletLedgerEntry {
    return this.recordTransaction({
      userId,
      orderId,
      type: 'RTO_CHARGE',
      amountPKR: -Math.abs(chargePKR),
      status: 'CLEARED',
      description: `RTO Penalty on order #${orderId.slice(-6)}: ${reason}`,
      actor: 'SYSTEM'
    });
  }
}

export const walletLedgerService = new WalletLedgerService();
