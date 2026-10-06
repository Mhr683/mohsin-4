export type AdminAuditActionType =
  | 'PRODUCT_CHANGE'
  | 'USER_CHANGE'
  | 'ORDER_CHANGE'
  | 'WALLET_ADJUSTMENT'
  | 'PAYOUT_DECISION'
  | 'BUSINESS_RULE_CHANGE'
  | 'SUPPLIER_CHANGE'
  | 'SECURITY_OVERRIDE';

export interface ComprehensiveAuditLog {
  id: string;
  adminEmail: string;
  adminName: string;
  action: AdminAuditActionType;
  targetId: string;
  targetDescription: string;
  timestamp: string;
  ipAddress?: string;
  oldValue?: string;
  newValue?: string;
  status: 'SUCCESS' | 'FAILED' | 'FLAGGED';
  notes?: string;
}

class AdminAuditService {
  private logs: ComprehensiveAuditLog[] = [
    {
      id: 'aud-1',
      adminEmail: 'admin@yourmart.pk',
      adminName: 'Chief Administrator',
      action: 'PAYOUT_DECISION',
      targetId: 'pay-req-1',
      targetDescription: 'Approved JazzCash payout Rs. 3,500 for Mohsin Traders',
      timestamp: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
      status: 'SUCCESS',
      oldValue: 'PENDING',
      newValue: 'COMPLETED',
      notes: 'Disbursed via Bulk Portal'
    },
    {
      id: 'aud-2',
      adminEmail: 'admin@yourmart.pk',
      adminName: 'Chief Administrator',
      action: 'WALLET_ADJUSTMENT',
      targetId: 'usr-reseller-1',
      targetDescription: 'Wallet bonus credit Rs. 500 for achieving 50 COD deliveries',
      timestamp: new Date(Date.now() - 72 * 3600 * 1000).toISOString(),
      status: 'SUCCESS',
      oldValue: 'Rs. 2,100',
      newValue: 'Rs. 2,600'
    },
    {
      id: 'aud-3',
      adminEmail: 'admin@yourmart.pk',
      adminName: 'Chief Administrator',
      action: 'BUSINESS_RULE_CHANGE',
      targetId: 'tariffs',
      targetDescription: 'Updated base shipping rate across Pakistan to Rs. 200',
      timestamp: new Date(Date.now() - 96 * 3600 * 1000).toISOString(),
      status: 'SUCCESS',
      oldValue: 'Rs. 190',
      newValue: 'Rs. 200'
    }
  ];

  record(entry: Omit<ComprehensiveAuditLog, 'id' | 'timestamp'>): ComprehensiveAuditLog {
    const fullLog: ComprehensiveAuditLog = {
      ...entry,
      id: `aud-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: new Date().toISOString()
    };
    this.logs.unshift(fullLog);
    return fullLog;
  }

  getLogs(filterAction?: AdminAuditActionType): ComprehensiveAuditLog[] {
    if (filterAction) {
      return this.logs.filter((l) => l.action === filterAction);
    }
    return this.logs;
  }
}

export const adminAuditService = new AdminAuditService();
