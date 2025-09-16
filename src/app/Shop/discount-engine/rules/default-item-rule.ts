// ===== FILE 2: src/discount-engine/rules/default-item-rule.ts =====
import { IDiscountRule } from './interface';
import { DiscountContext, LineItemData } from '../core/context';
import { DiscountResult } from '../core/result';
// වට්ටම් රීති ඇගයීම, ID ජනනය කිරීම සහ වින්‍යාසය වලංගු කිරීම සඳහා උපකාරක ශ්‍රිත.

import { evaluateRule, generateRuleId, isOneTimeRule, validateRuleConfig } from '../utils/helpers';
import { DiscountSet } from '../utils/types';

export class DefaultItemRule implements IDiscountRule {
  private campaign: DiscountSet;
  
  readonly isPotentiallyRepeatable: boolean = true;

  constructor(campaign: DiscountSet) {
    this.campaign = campaign;
  }

  getId(item?: LineItemData): string {
    return `default-${this.campaign.id}${item ? `-${item.lineId}` : ''}`;
  }

  // මෙම රීතියේ තර්කනය වට්ටම් සන්දර්භය මත යොදවයි.
  apply(context: DiscountContext, result: DiscountResult): void {
    context.items.forEach((item) => {
      const lineResult = result.getLineItem(item.lineId);
      if (!lineResult) {
        console.log(`No line result found for ${item.lineId}`);
        return;
      }
      
      // *** නිවැරදි කිරීම ***
      // අතින් (manually) වට්ටමක් සකසා ඇත්නම් (එය 0 වුවද),
      // අපි කිසිදු පෙරනිමි (default) වට්ටමක් යෙදිය යුතු නැත.
      // custom අගයක් තිබීමෙන් පෙන්නුම් කරන්නේ සියලුම campaign රීති අභිබවා යාමට පරිශීලකයාගේ අභිප්‍රායයි.
      if (item.customDiscountValue !== undefined) {
        console.log(`Custom discount value is set for ${item.lineId}, skipping default rule.`);
        return;
      }
      
      // ඉහළ ප්‍රමුඛතාවයක් ඇති වට්ටමක් (උදා: batch, product-specific) දැනටමත් යොදා ඇත්නම්, මෙම භාණ්ඩය සඳහා පෙරනිමි රීති මඟ හරින්න.
      if (lineResult.totalDiscount > 0) {
        console.log(`Higher priority discount already applied to ${item.lineId}, skipping default rule`);
        return;
      }

      console.log(`Processing default rule for item ${item.lineId}, product ${item.productId}`);

      const lineTotal = item.price * item.quantity;
      
      // ප්‍රමුඛතා අනුපිළිවෙලට පෙරනිමි රීති නිර්වචනය කරන්න.
      const rules = [
        { 
          config: this.campaign.defaultLineItemValueRuleJson, 
          valueToTest: lineTotal, 
          type: 'campaign_default_line_item_value' as const,
          description: 'Default line value rule'
        },
        { 
          config: this.campaign.defaultLineItemQuantityRuleJson, 
          valueToTest: item.quantity, 
          type: 'campaign_default_line_item_quantity' as const,
          description: 'Default quantity rule'
        },
        { 
          config: this.campaign.defaultSpecificQtyThresholdRuleJson, 
          valueToTest: item.quantity, 
          type: 'campaign_default_specific_qty_threshold' as const,
          description: 'Default quantity threshold rule'
        },
        { 
          config: this.campaign.defaultSpecificUnitPriceThresholdRuleJson, 
          valueToTest: item.price, 
          type: 'campaign_default_specific_unit_price' as const,
          description: 'Default unit price threshold rule'
        },
      ];
      
      // පළමු වලංගු පෙරනිමි රීතිය පමණක් යොදවන්න.
      for (const rule of rules) {
        if (!rule.config?.isEnabled) {
          // console.log(`Default rule ${rule.type} is not enabled`);
          continue;
        }

        console.log(`Evaluating default rule ${rule.type}:`, rule.config);

        // රීතියේ වින්‍යාසය (configuration) වලංගුදැයි පරීක්ෂා කිරීම.
        const validation = validateRuleConfig(rule.config);
        if (!validation.isValid) {
          console.warn(`Invalid default rule configuration for ${rule.type}:`, validation.errors);
          continue;
        }

        const discountAmount = evaluateRule(
          rule.config, 
          item.price, 
          item.quantity, 
          lineTotal, 
          rule.valueToTest
        );
        
        console.log(`Default rule evaluation result for ${rule.type}: discount=${discountAmount}`);
        
        if (discountAmount > 0) {
          const ruleId = generateRuleId('default', this.campaign.id, rule.type, item.productId);
          const isOneTime = isOneTimeRule(rule.config, this.campaign.isOneTimePerTransaction);

          console.log(`Applying default discount: ruleId=${ruleId}, amount=${discountAmount}, isOneTime=${isOneTime}`);

          // ගණනය කළ වට්ටම ප්‍රතිඵලයට (result) එකතු කිරීම.
          lineResult.addDiscount({
              ruleId,
              discountAmount,
              description: `${rule.description}: '${rule.config.name}' applied.`,
              isOneTime,
              appliedRuleInfo: {
                  discountCampaignName: this.campaign.name,
                  sourceRuleName: rule.config.name,
                  totalCalculatedDiscount: discountAmount,
                  ruleType: rule.type,
                  productIdAffected: item.productId,
                  appliedOnce: isOneTime
              }
          });
          
          // පළමු සාර්ථක පෙරනිමි රීතිය යෙදීමෙන් පසු නවත්වන්න.
          break;
        } else {
          // console.log(`Default rule ${rule.type} did not qualify for discount`);
        }
      }
    });
  }
}
