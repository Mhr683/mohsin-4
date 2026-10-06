import { calculateCustomerRisk } from '../utils/riskCalculator';
import { CustomerAddress } from '../types/location';

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type RecommendedRiskAction = 
  | 'NORMAL_COD'
  | 'VERIFICATION_REQUIRED'
  | 'ADVANCE_PAYMENT_REQUIRED'
  | 'BLOCK_ORDER';

export interface RiskRuleConfig {
  lowThresholdMax: number;       // e.g. <= 30
  mediumThresholdMax: number;    // e.g. <= 65
  highThresholdMax: number;      // e.g. <= 85
  highValueCodThresholdPKR: number; // e.g. 5,000
  advanceDeliveryFeePKR: number;   // e.g. 250
  autoBlockBlacklisted: boolean;
  requireAdvanceOnMediumRemote: boolean;
}

export interface RiskEvaluationResult {
  score: number; // 0 to 100
  level: RiskLevel;
  action: RecommendedRiskAction;
  riskReasons: string[];
  safeFactors: string[];
  requiresAdvancePayment: boolean;
  suggestedAdvanceAmountPKR: number;
  phone: string;
  matchedBlacklist: boolean;
}

export const DEFAULT_RISK_CONFIG: RiskRuleConfig = {
  lowThresholdMax: 30,
  mediumThresholdMax: 65,
  highThresholdMax: 85,
  highValueCodThresholdPKR: 5000,
  advanceDeliveryFeePKR: 250,
  autoBlockBlacklisted: true,
  requireAdvanceOnMediumRemote: true
};

class RiskEngine {
  private config: RiskRuleConfig = { ...DEFAULT_RISK_CONFIG };

  getConfig(): RiskRuleConfig {
    return this.config;
  }

  updateConfig(newConfig: Partial<RiskRuleConfig>): RiskRuleConfig {
    this.config = { ...this.config, ...newConfig };
    return this.config;
  }

  evaluateOrderRisk(params: {
    phone: string;
    customerName?: string;
    address?: string | CustomerAddress;
    city?: string;
    orderAmountPKR: number;
    previousOrdersCount?: number;
    previousRtoCount?: number;
  }): RiskEvaluationResult {
    const targetCity = params.city || (typeof params.address === 'object' ? params.address.city : undefined) || 'Lahore';
    const rawRisk = calculateCustomerRisk(
      params.phone,
      targetCity
    );

    let calculatedScore = rawRisk.riskScore;
    const reasons: string[] = [...rawRisk.reasons];
    const safeFactors: string[] = [];

    // Additional RTO & order frequency evaluation
    if ((params.previousRtoCount || 0) > 0) {
      calculatedScore += Math.min(40, (params.previousRtoCount || 0) * 20);
      reasons.push(`Customer has ${params.previousRtoCount} previous uncollected RTO parcel(s).`);
    }

    if ((params.previousOrdersCount || 0) >= 3 && (params.previousRtoCount || 0) === 0) {
      calculatedScore = Math.max(5, calculatedScore - 25);
      safeFactors.push(`Trusted buyer with ${params.previousOrdersCount} successful COD deliveries.`);
    }

    // High value COD order check
    if (params.orderAmountPKR > this.config.highValueCodThresholdPKR) {
      calculatedScore += 15;
      reasons.push(`High COD basket value (Rs. ${params.orderAmountPKR.toLocaleString()} > Rs. ${this.config.highValueCodThresholdPKR.toLocaleString()}).`);
    }

    // Clamp score
    calculatedScore = Math.max(0, Math.min(100, calculatedScore));

    // Determine Level
    let level: RiskLevel = 'LOW';
    if (calculatedScore > this.config.highThresholdMax) {
      level = 'CRITICAL';
    } else if (calculatedScore > this.config.mediumThresholdMax) {
      level = 'HIGH';
    } else if (calculatedScore > this.config.lowThresholdMax) {
      level = 'MEDIUM';
    } else {
      level = 'LOW';
    }

    // Determine Action
    let action: RecommendedRiskAction = 'NORMAL_COD';
    let requiresAdvance = false;
    let advanceAmount = 0;

    if (rawRisk.isBlacklisted && this.config.autoBlockBlacklisted) {
      action = 'BLOCK_ORDER';
    } else if (level === 'CRITICAL' || level === 'HIGH') {
      action = 'ADVANCE_PAYMENT_REQUIRED';
      requiresAdvance = true;
      advanceAmount = this.config.advanceDeliveryFeePKR;
    } else if (level === 'MEDIUM') {
      action = 'VERIFICATION_REQUIRED';
    } else {
      action = 'NORMAL_COD';
    }

    return {
      score: calculatedScore,
      level,
      action,
      riskReasons: reasons,
      safeFactors,
      requiresAdvancePayment: requiresAdvance,
      suggestedAdvanceAmountPKR: advanceAmount,
      phone: params.phone,
      matchedBlacklist: rawRisk.isBlacklisted
    };
  }
}

export const riskEngine = new RiskEngine();
