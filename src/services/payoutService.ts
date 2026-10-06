import { walletLedgerService } from './walletLedgerService';

export type PayoutChannel = 'JAZZCASH' | 'EASYPAISA' | 'RAAST' | 'BANK_TRANSFER';

export type PayoutStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'COMPLETED';

export interface PayoutRequestItem {
  id: string;
  resellerId: string;
  resellerName: string;
  amountPKR: number;
  channel: PayoutChannel;
  accountTitle: string;
  accountNumber: string;
  bankName?: string;
  iban?: string;
  status: PayoutStatus;
  requestedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  transactionRef?: string;
  adminNotes?: string;
}

class PayoutService {
  private requests: PayoutRequestItem[] = [
    {
      id: 'pay-req-1',
      resellerId: 'usr-reseller-1',
      resellerName: 'Mohsin Traders (Lahore)',
      amountPKR: 3500,
      channel: 'JAZZCASH',
      accountTitle: 'Muhammad Mohsin',
      accountNumber: '03001234567',
      status: 'COMPLETED',
      requestedAt: new Date(Date.now() - 72 * 3600 * 1000).toISOString(),
      reviewedAt: new Date(Date.now() - 68 * 3600 * 1000).toISOString(),
      reviewedBy: 'Admin (Master Desk)',
      transactionRef: 'JC-88291044',
      adminNotes: 'Disbursed via JazzCash Bulk Gateway'
    },
    {
      id: 'pay-req-2',
      resellerId: 'usr-reseller-1',
      resellerName: 'Mohsin Traders (Lahore)',
      amountPKR: 2800,
      channel: 'RAAST',
      accountTitle: 'Muhammad Mohsin',
      accountNumber: '03001234567',
      status: 'PENDING',
      requestedAt: new Date(Date.now() - 4 * 3600 * 1000).toISOString()
    }
  ];

  getAllRequests(): PayoutRequestItem[] {
    return this.requests;
  }

  getRequestsByReseller(resellerId: string): PayoutRequestItem[] {
    return this.requests.filter((r) => r.resellerId === resellerId);
  }

  requestPayout(params: {
    resellerId: string;
    resellerName: string;
    amountPKR: number;
    channel: PayoutChannel;
    accountTitle: string;
    accountNumber: string;
    bankName?: string;
    iban?: string;
  }): { success: boolean; request?: PayoutRequestItem; error?: string } {
    const summary = walletLedgerService.getWalletSummary(params.resellerId);
    if (params.amountPKR > summary.availableBalancePKR) {
      return {
        success: false,
        error: `Requested amount (Rs. ${params.amountPKR.toLocaleString()}) exceeds your cleared available balance (Rs. ${summary.availableBalancePKR.toLocaleString()}).`
      };
    }

    if (params.amountPKR < 500) {
      return {
        success: false,
        error: 'Minimum withdrawal amount on YourMart is Rs. 500.'
      };
    }

    const newRequest: PayoutRequestItem = {
      id: `pay-req-${Date.now()}`,
      ...params,
      status: 'PENDING',
      requestedAt: new Date().toISOString()
    };

    this.requests.unshift(newRequest);
    return { success: true, request: newRequest };
  }

  approvePayout(requestId: string, transactionRef: string, adminNotes?: string, adminActor = 'ADMIN'): { success: boolean } {
    const item = this.requests.find((r) => r.id === requestId);
    if (!item) return { success: false };

    item.status = 'COMPLETED';
    item.reviewedAt = new Date().toISOString();
    item.reviewedBy = adminActor;
    item.transactionRef = transactionRef;
    item.adminNotes = adminNotes;

    // Deduct from wallet ledger
    walletLedgerService.recordPayout(
      item.resellerId,
      item.amountPKR,
      `${item.channel} (${item.accountNumber})`,
      transactionRef
    );

    return { success: true };
  }

  rejectPayout(requestId: string, reason: string, adminActor = 'ADMIN'): { success: boolean } {
    const item = this.requests.find((r) => r.id === requestId);
    if (!item) return { success: false };

    item.status = 'REJECTED';
    item.reviewedAt = new Date().toISOString();
    item.reviewedBy = adminActor;
    item.adminNotes = reason;

    return { success: true };
  }
}

export const payoutService = new PayoutService();
