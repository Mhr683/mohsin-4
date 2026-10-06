import { evaluateOrderFinancials, OrderFinancialInputs, ProfitGuardEvaluation } from './profitGuard';

export interface RealProfitInput {
  sellingPricePKR: number;
  productCostPKR: number;
  shippingCostPKR?: number;
  codFeePKR?: number;
  platformFeePct?: number; // Default 2.0%
  paymentFeePKR?: number;   // E.g. Raast/EasyPaisa gateway fee
  discountPKR?: number;
  estimatedAdCostPKR?: number; // CPA per purchase (e.g., Rs. 350 on TikTok/Meta Ads)
  expectedRtoRatePct?: number; // e.g. 10% (standard in Pakistan dropshipping)
  rtoReturnShippingLossPKR?: number; // Average courier return charge (~Rs. 180-250)
}

export interface RealProfitCalculation {
  sellingPricePKR: number;
  productCostPKR: number;
  grossProfitPKR: number;
  grossMarginPct: number;
  // Cost breakdown
  shippingCostPKR: number;
  codFeePKR: number;
  platformFeePKR: number;
  paymentFeePKR: number;
  discountPKR: number;
  adCostPKR: number;
  estimatedRtoLossPerOrderPKR: number;
  totalDirectCostsPKR: number;
  // Real Net Profit
  estimatedRealNetProfitPKR: number;
  realNetProfitMarginPct: number;
  breakEvenSellingPricePKR: number;
  isProfitable: boolean;
  verdict: 'HIGHLY_PROFITABLE' | 'HEALTHY_PROFIT' | 'SLIM_MARGIN' | 'UNPROFITABLE';
  recommendations: string[];
}

export function calculateRealProfit(input: RealProfitInput): RealProfitCalculation {
  const price = Math.max(0, Number(input.sellingPricePKR) || 0);
  const cost = Math.max(0, Number(input.productCostPKR) || 0);
  const shipping = input.shippingCostPKR !== undefined ? Number(input.shippingCostPKR) : 200;
  const codFee = input.codFeePKR !== undefined ? Number(input.codFeePKR) : Math.max(35, Math.round(price * 0.015));
  const platformFeePct = input.platformFeePct !== undefined ? Number(input.platformFeePct) : 2.0;
  const platformFee = Math.round((price * platformFeePct) / 100);
  const paymentFee = Number(input.paymentFeePKR) || 0;
  const discount = Number(input.discountPKR) || 0;
  const adCost = Number(input.estimatedAdCostPKR) || 0;

  // Expected RTO Loss:
  // If RTO rate is 10%, 1 in 10 orders fails, losing delivery + return shipping (~Rs. 350-450)
  const rtoRate = input.expectedRtoRatePct !== undefined ? input.expectedRtoRatePct : 10;
  const rtoTripLoss = input.rtoReturnShippingLossPKR !== undefined ? input.rtoReturnShippingLossPKR : (shipping * 1.5);
  const estimatedRtoLossPerOrder = Math.round((rtoRate / 100) * rtoTripLoss);

  const grossProfit = price - cost;
  const grossMargin = price > 0 ? (grossProfit / price) * 100 : 0;

  const totalDeductions =
    cost +
    shipping +
    codFee +
    platformFee +
    paymentFee +
    discount +
    adCost +
    estimatedRtoLossPerOrder;

  const realNetProfit = price - totalDeductions;
  const realNetMargin = price > 0 ? (realNetProfit / price) * 100 : 0;

  // Break-even selling price (where net profit == 0)
  // Price = FixedCosts / (1 - platformFeePct/100 - codFeePct/100)
  const fixedCosts = cost + shipping + paymentFee + discount + adCost + estimatedRtoLossPerOrder;
  const variableRate = 1 - (platformFeePct / 100 + 0.015);
  const breakEvenPrice = Math.round(fixedCosts / Math.max(0.1, variableRate));

  let verdict: RealProfitCalculation['verdict'] = 'HEALTHY_PROFIT';
  const recommendations: string[] = [];

  if (realNetProfit <= 0) {
    verdict = 'UNPROFITABLE';
    recommendations.push(`Raising your selling price to at least Rs. ${breakEvenPrice.toLocaleString()} is required to break even.`);
    recommendations.push('Consider requiring advance delivery payment (Rs. 250) to mitigate RTO exposure.');
  } else if (realNetMargin < 12) {
    verdict = 'SLIM_MARGIN';
    recommendations.push('Thin margin. A small spike in ad CPA or courier RTO could push this campaign into net loss.');
  } else if (realNetMargin > 30) {
    verdict = 'HIGHLY_PROFITABLE';
    recommendations.push('Strong margin profile with solid buffer against courier delivery failures.');
  }

  return {
    sellingPricePKR: price,
    productCostPKR: cost,
    grossProfitPKR: grossProfit,
    grossMarginPct: Math.round(grossMargin * 10) / 10,
    shippingCostPKR: shipping,
    codFeePKR: codFee,
    platformFeePKR: platformFee,
    paymentFeePKR: paymentFee,
    discountPKR: discount,
    adCostPKR: adCost,
    estimatedRtoLossPerOrderPKR: estimatedRtoLossPerOrder,
    totalDirectCostsPKR: totalDeductions,
    estimatedRealNetProfitPKR: realNetProfit,
    realNetProfitMarginPct: Math.round(realNetMargin * 10) / 10,
    breakEvenSellingPricePKR: breakEvenPrice,
    isProfitable: realNetProfit > 0,
    verdict,
    recommendations
  };
}
