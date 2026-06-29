import { OrderType, PaymentType } from '@prisma/client';
import { zonesService } from '../zones/zones.service';
import { rateCardsService } from '../rateCards/rateCards.service';
import { PriceBreakdown, PricingInput } from '../../types';

/**
 * Pure function — single source of truth for billable weight.
 * Called identically from preview AND confirm. Never duplicated.
 */
export function billableWeight(l: number, b: number, h: number, actualKg: number): number {
  const volumetricKg = (l * b * h) / 5000;
  return Math.max(actualKg, volumetricKg);
}

/**
 * Full rate calculation. Side-effect free aside from cache reads.
 * Called identically from /orders/preview and /orders/confirm.
 */
export async function calculateCharge(input: PricingInput): Promise<PriceBreakdown> {
  const { pickupPincode, dropPincode, orderType, paymentType, lengthCm, breadthCm, heightCm, actualWeightKg } = input;

  // 1. Resolve zones (cached)
  const fromZone = await zonesService.resolveZoneByPincode(pickupPincode);
  const toZone = await zonesService.resolveZoneByPincode(dropPincode);

  // 2. Calculate billable weight
  const bWeight = billableWeight(lengthCm, breadthCm, heightCm, actualWeightKg);

  // 3. Lookup rate card (cached)
  const rateCard = await rateCardsService.getRateCard(fromZone.id, toZone.id, orderType);
  const ratePerKg = Number(rateCard.ratePerKg);
  const base = parseFloat((ratePerKg * bWeight).toFixed(2));

  // 4. COD surcharge
  let codSurchargeAmt = 0;
  let surchargeType: string | undefined;
  let surchargeValue: number | undefined;

  if (paymentType === 'COD') {
    const surchargeConfig = await rateCardsService.getCodSurcharge(orderType);
    if (surchargeConfig && surchargeConfig.isActive) {
      surchargeType = surchargeConfig.type;
      surchargeValue = Number(surchargeConfig.value);
      codSurchargeAmt = surchargeConfig.type === 'FLAT'
        ? surchargeValue
        : parseFloat(((base * surchargeValue) / 100).toFixed(2));
    }
  }

  const total = parseFloat((base + codSurchargeAmt).toFixed(2));

  return {
    fromZoneId: fromZone.id,
    fromZoneName: fromZone.name,
    toZoneId: toZone.id,
    toZoneName: toZone.name,
    rateCardId: rateCard.id,
    ratePerKg,
    billableWeight: parseFloat(bWeight.toFixed(3)),
    base,
    codSurcharge: codSurchargeAmt,
    surchargeType,
    surchargeValue,
    total,
  };
}