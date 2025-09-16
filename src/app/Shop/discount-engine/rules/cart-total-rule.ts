// ===== FILE 3: src/discount-engine/rules/cart-total-rule.ts =====
import { IDiscountRule } from './interface';
import { DiscountContext, LineItemData } from '../core/context';
import { DiscountResult } from '../core/result';

// වට්ටම් රීති ඇගයීම, ID ජනනය කිරීම සහ වින්‍යාසය වලංගු කිරීම සඳහා උපකාරක ශ්‍රිත.
import { evaluateRule, generateRuleId, isOneTimeRule, validateRuleConfig } from '../utils/helpers';
import { DiscountSet } from '../utils/types';

export class CartTotalRule implements IDiscountRule {
  private campaign: DiscountSet;
  
  readonly isPotentiallyRepeatable: boolean = false; // කාට් (cart) රීති සාමාන්‍යයෙන් නැවත යෙදිය නොහැක.

  constructor(campaign: DiscountSet) {
    this.campaign = campaign;
  }

  getId(item?: LineItemData): string {
    return `cart-${this.campaign.id}`;
  }

  // මෙම රීතියේ තර්කනය වට්ටම් සන්දර්භය මත යොදවයි.
  apply(context: DiscountContext, result: DiscountResult): void {
    // භාණ්ඩ මට්ටමේ වට්ටම් වලින් පසු උප එකතුව (subtotal) ගණනය කිරීම.
    const subtotalAfterItemDiscounts = result.lineItems.reduce(
        (sum, li) => sum + li.netPrice, 0
    );
    // කාට් එකේ ඇති මුළු භාණ්ඩ ප්‍රමාණය.
    const totalQuantity = context.items.reduce((sum, item) => sum + item.quantity, 0);

    console.log(`Processing cart rules: subtotal=${subtotalAfterItemDiscounts}, totalQty=${totalQuantity}`);

    // සලකා බැලිය යුතු කාට් මට්ටමේ රීති.
    const rules = [
      { 
        config: this.campaign.globalCartPriceRuleJson, 
        valueToTest: subtotalAfterItemDiscounts, 
        type: 'campaign_global_cart_price' as const,
        description: 'Cart price threshold rule'
      },
      { 
        config: this.campaign.globalCartQuantityRuleJson, 
        valueToTest: totalQuantity, 
        type: 'campaign_global_cart_quantity' as const,
        description: 'Cart quantity threshold rule'
      },
    ];
    
    // පළමු වලංගු කාට් රීතිය පමණක් යොදවන්න.
    for (const rule of rules) {
      if (!rule.config?.isEnabled) {
        console.log(`Cart rule ${rule.type} is not enabled`);
        continue;
      }

      console.log(`Evaluating cart rule ${rule.type}:`, rule.config);

      // රීතියේ වින්‍යාසය (configuration) වලංගුදැයි පරීක්ෂා කිරීම.
      const validation = validateRuleConfig(rule.config);
      if (!validation.isValid) {
        console.warn(`Invalid cart rule configuration for ${rule.type}:`, validation.errors);
        continue;
      }

      const discountAmount = evaluateRule(
        rule.config, 
        0, 
        0, 
        subtotalAfterItemDiscounts, 
        rule.valueToTest
      );
      
      console.log(`Cart rule evaluation result for ${rule.type}: discount=${discountAmount}`);
      
      if (discountAmount > 0) {
        const ruleId = generateRuleId('cart', this.campaign.id, rule.type);
        const isOneTime = isOneTimeRule(rule.config, this.campaign.isOneTimePerTransaction);

        console.log(`Applying cart discount: ruleId=${ruleId}, amount=${discountAmount}, isOneTime=${isOneTime}`);

        // ගණනය කළ වට්ටම ප්‍රතිඵලයට (result) එකතු කිරීම.
        result.addCartDiscount({
            ruleId,
            discountAmount,
            description: `${rule.description}: '${rule.config.name}' applied.`,
            isOneTime,
            appliedRuleInfo: {
                discountCampaignName: this.campaign.name,
                sourceRuleName: rule.config.name,
                totalCalculatedDiscount: discountAmount,
                ruleType: rule.type,
                appliedOnce: isOneTime
            }
        });
        
        // පළමු සාර්ථක කාට් රීතිය යෙදීමෙන් පසු නවත්වන්න.
        break;
      } else {
        console.log(`Cart rule ${rule.type} did not qualify for discount`);
      }
    }
  }
}