export type CodVerificationMethod = 'WHATSAPP' | 'SMS_OTP' | 'MANUAL_CALL' | 'AUTO_TRUSTED';

export type CodVerificationStatus = 'UNVERIFIED' | 'PENDING' | 'VERIFIED' | 'FAILED_REJECTED' | 'EXPIRED';

export interface CodVerificationRecord {
  id: string;
  orderId: string;
  customerPhone: string;
  customerName: string;
  method: CodVerificationMethod;
  status: CodVerificationStatus;
  otpCode?: string;
  verifiedAt?: string;
  customerResponseText?: string;
  attempts: number;
  initiatedAt: string;
  verifiedBy?: string;
}

class CodVerificationService {
  private records: Map<string, CodVerificationRecord> = new Map();

  createVerification(orderId: string, phone: string, name: string, method: CodVerificationMethod = 'WHATSAPP'): CodVerificationRecord {
    const existing = this.records.get(orderId);
    if (existing && existing.status === 'VERIFIED') {
      return existing;
    }

    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    const record: CodVerificationRecord = {
      id: `cod-ver-${Date.now()}`,
      orderId,
      customerPhone: phone,
      customerName: name,
      method,
      status: 'PENDING',
      otpCode: otp,
      attempts: (existing?.attempts || 0) + 1,
      initiatedAt: new Date().toISOString()
    };

    this.records.set(orderId, record);
    return record;
  }

  confirmVerification(
    orderId: string,
    method: CodVerificationMethod,
    actor = 'RESELLER',
    responseText = 'Customer confirmed address & COD amount'
  ): CodVerificationRecord {
    const record = this.records.get(orderId) || {
      id: `cod-ver-${Date.now()}`,
      orderId,
      customerPhone: '',
      customerName: '',
      method,
      status: 'PENDING',
      attempts: 1,
      initiatedAt: new Date().toISOString()
    };

    record.status = 'VERIFIED';
    record.method = method;
    record.verifiedAt = new Date().toISOString();
    record.customerResponseText = responseText;
    record.verifiedBy = actor;

    this.records.set(orderId, record);
    return record;
  }

  rejectVerification(orderId: string, reason = 'Customer cancelled or fake number'): CodVerificationRecord {
    const record = this.records.get(orderId) || {
      id: `cod-ver-${Date.now()}`,
      orderId,
      customerPhone: '',
      customerName: '',
      method: 'MANUAL_CALL',
      status: 'PENDING',
      attempts: 1,
      initiatedAt: new Date().toISOString()
    };

    record.status = 'FAILED_REJECTED';
    record.customerResponseText = reason;
    this.records.set(orderId, record);
    return record;
  }

  getVerification(orderId: string): CodVerificationRecord | undefined {
    return this.records.get(orderId);
  }

  generateWhatsAppMessage(orderId: string, customerName: string, totalAmountPKR: number, city: string): string {
    const cleanName = customerName || 'Customer';
    const text = `السلام علیکم ${cleanName} صاحب!
آپ کا YourMart Global پارسل (آرڈر #${orderId.slice(-6)}) کیش آن ڈیلیوری کیلئے تیار ہے۔

📦 ٹوٹل رقم: Rs. ${totalAmountPKR.toLocaleString()} (بشمول ڈلیوری چارجز)
📍 شہر: ${city}

کیا آپ یہ آرڈر کنفرم کرنا چاہتے ہیں؟
براہ کرم اس میسج کا جواب "1" لکھ کر بھیجیں تاکہ آپ کا پارسل آج ہی ڈسپیچ کیا جا سکے۔ شکریہ!`;
    return encodeURIComponent(text);
  }
}

export const codVerificationService = new CodVerificationService();
