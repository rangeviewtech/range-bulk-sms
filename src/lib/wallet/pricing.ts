import { Decimal } from '@/generated/prisma/runtime/library';
import prisma from '@/lib/prisma';

export const PricingEngine = {
  async getPrice(params: { countryCode: string; networkCode?: string; clientId?: string; agentId?: string }) {
    let priceRecord = null;
    
    if (params.clientId) {
      priceRecord = await prisma.smsPricing.findFirst({
        where: { clientId: params.clientId, countryCode: params.countryCode }
      });
    }

    if (!priceRecord && params.agentId) {
      priceRecord = await prisma.smsPricing.findFirst({
        where: { agentId: params.agentId, countryCode: params.countryCode }
      });
    }

    if (!priceRecord) {
      priceRecord = await prisma.smsPricing.findFirst({
        where: { 
          countryCode: params.countryCode, 
          clientId: null, 
          agentId: null 
        }
      });
    }

    if (!priceRecord) {
      return {
        costPerSms: new Decimal(0.01),
        sellingPrice: new Decimal(0.02),
        currency: 'USD'
      };
    }

    return {
      costPerSms: priceRecord.costPrice,
      sellingPrice: priceRecord.sellingPrice,
      currency: priceRecord.currency || 'USD'
    };
  },
  
  async calculateCost(params: { recipientCount: number; segmentCount: number; countryCode?: string; clientId?: string }) {
    const countryCode = params.countryCode || '+256';
    const totalUnits = params.recipientCount * params.segmentCount;
    
    const price = await this.getPrice({ countryCode, clientId: params.clientId });
    const totalCost = price.sellingPrice.mul(totalUnits);
    
    return {
      totalCost,
      costPerUnit: price.sellingPrice,
      totalUnits,
      currency: price.currency
    };
  },
  
  async getPricingTable(params?: { countryCode?: string; clientId?: string }) {
    const where: any = {};
    if (params?.countryCode) where.countryCode = params.countryCode;
    if (params?.clientId) where.clientId = params.clientId;

    return await prisma.smsPricing.findMany({ where });
  }
};
