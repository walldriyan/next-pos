// ===== FILE 4: src/discount-engine/rules/buy-x-get-y-rule.ts =====
import { IDiscountRule } from './interface';
import { DiscountContext, LineItemData } from '../core/context';
import { DiscountResult } from '../core/result';
import { BuyGetRule } from '../utils/types';


export class BuyXGetYRule implements IDiscountRule {
  private config: BuyGetRule;
  private campaignName: string;
  
  readonly isPotentiallyRepeatable: boolean;

  constructor(config: BuyGetRule, campaignName?: string) {
    this.config = config;
    this.campaignName = campaignName || 'Unknown Campaign';
    this.isPotentiallyRepeatable = config.isRepeatable || false;
  }

  getId(item?: LineItemData): string {
    return `bogo-${this.config.id}${item ? `-${item.lineId}` : ''}`;
  }

  // මෙම රීතියේ තර්කනය වට්ටම් සන්දර්භය මත යොදවයි.
  apply(context: DiscountContext, result: DiscountResult): void {
    const {
      buyProductId,
      buyQuantity,
      getProductId,
      getQuantity,
      discountType,
      discountValue,
      isRepeatable,
    } = this.config;

    console.log(`Processing Buy-X-Get-Y rule: ${this.config.name}`);

    // මිලදී ගත යුතු භාණ්ඩ (buy items) කාට් එකේ තිබේදැයි සොයා බැලීම.
    const buyItems = context.items.filter((item) => item.productId === buyProductId);
    if (buyItems.length === 0) {
      console.log(`No buy items found for product ${buyProductId}`);
      return;
    }
    
    const totalBuyQuantity = buyItems.reduce((sum, item) => sum + item.quantity, 0);
    console.log(`Total buy quantity for ${buyProductId}: ${totalBuyQuantity}, required: ${buyQuantity}`);
    
    // අවශ්‍ය තරම් 'buy' භාණ්ඩ ප්‍රමාණයක් නොමැති නම්, රීතිය යෙදෙන්නේ නැත.
    if (totalBuyQuantity < buyQuantity) {
      console.log(`Insufficient buy quantity: ${totalBuyQuantity} < ${buyQuantity}`);
      return;
    }

    // වට්ටම ලැබෙන භාණ්ඩ (get items) කාට් එකේ තිබේදැයි සොයා බැලීම.
    const getItems = context.items.filter((item) => item.productId === getProductId);
    if (getItems.length === 0) {
      console.log(`No get items found for product ${getProductId}`);
      return;
    }

    const timesRuleApplies = isRepeatable ? Math.floor(totalBuyQuantity / buyQuantity) : 1;
    // වට්ටම් යෙදිය යුතු මුළු භාණ්ඩ ප්‍රමාණය.
    let freeItemsToDistribute = timesRuleApplies * getQuantity;

    console.log(`Buy-X-Get-Y rule applies ${timesRuleApplies} times, free items to distribute: ${freeItemsToDistribute}`);

    for (const getItem of getItems) {
      if (freeItemsToDistribute <= 0) break;

      // 'get' භාණ්ඩය සඳහා දැනටමත් වට්ටමක් යොදා ඇත්නම්, එය මඟ හරින්න.
      const lineResult = result.getLineItem(getItem.lineId);
      if (!lineResult || lineResult.totalDiscount > 0) {
        console.log(`Skipping get item ${getItem.lineId} - no line result or already discounted`);
        continue;
      }

      const itemsInLineToDiscount = Math.min(getItem.quantity, freeItemsToDistribute);
      if (itemsInLineToDiscount <= 0) continue;

      let discountAmountForThisLine = 0;
      // වට්ටම් වර්ගය අනුව වට්ටම් මුදල ගණනය කිරීම.
      if (discountType === 'percentage') {
        discountAmountForThisLine = getItem.price * (discountValue / 100) * itemsInLineToDiscount;
      } else if (discountType === 'free') {
        // 'free' නම් 100% වට්ටමක්.
        discountAmountForThisLine = getItem.price * itemsInLineToDiscount;
      } else { 
        // Fixed amount discount
        discountAmountForThisLine = discountValue * itemsInLineToDiscount;
      }
      
      const maxApplicableDiscount = (getItem.price * itemsInLineToDiscount);
      // වට්ටම භාණ්ඩයේ මුළු වටිනාකම නොඉක්මවන බවට වග බලා ගැනීම.
      const finalDiscount = Math.min(discountAmountForThisLine, maxApplicableDiscount);

      console.log(`Buy-X-Get-Y discount calculation: items=${itemsInLineToDiscount}, discountPerItem=${discountAmountForThisLine/itemsInLineToDiscount}, finalDiscount=${finalDiscount}`);

      // ගණනය කළ වට්ටම ප්‍රතිඵලයට (result) එකතු කිරීම.
      if (finalDiscount > 0) {
        lineResult.addDiscount({
          ruleId: `bogo-${this.config.id}`,
          discountAmount: finalDiscount,
          description: `${this.config.name}: Buy ${buyQuantity} ${buyProductId}, Get ${getQuantity} ${getProductId}`,
          appliedRuleInfo: {
            discountCampaignName: this.campaignName,
            sourceRuleName: this.config.name,
            totalCalculatedDiscount: finalDiscount,
            ruleType: 'buy_get_rule',
            productIdAffected: getItem.productId,
            appliedOnce: !isRepeatable
          },
        });
        freeItemsToDistribute -= itemsInLineToDiscount;
        console.log(`Applied Buy-X-Get-Y discount: ${finalDiscount}, remaining free items: ${freeItemsToDistribute}`);
      }
    }
  }
}
