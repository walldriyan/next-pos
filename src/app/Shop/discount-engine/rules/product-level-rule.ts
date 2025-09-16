// ===== FILE 1: src/discount-engine/rules/product-level-rule.ts =====
import { IDiscountRule } from './interface';
import { DiscountContext, LineItemData } from '../core/context';
import { DiscountResult } from '../core/result';
// වට්ටම් රීති ඇගයීම, ID ජනනය කිරීම සහ වින්‍යාසය වලංගු කිරීම සඳහා උපකාරක ශ්‍රිත.
import { evaluateRule, generateRuleId, isOneTimeRule, validateRuleConfig } from '../utils/helpers';
import { ProductDiscountConfiguration } from '../utils/types';

export class ProductLevelRule implements IDiscountRule {
  private config: ProductDiscountConfiguration;
  
  readonly isPotentiallyRepeatable: boolean = true;

  constructor(config: ProductDiscountConfiguration) {
    this.config = config;
  }

  getId(item?: LineItemData): string {
    return `product-${this.config.id}-${this.config.productId}${item ? `-${item.lineId}` : ''}`;
  }

  // මෙම රීතියේ තර්කනය වට්ටම් සන්දර්භය මත යොදවයි.
  apply(context: DiscountContext, result: DiscountResult): void {
    if (!this.config.isActiveForProductInCampaign) {
      console.log(`Product configuration ${this.config.id} is not active`);
      return;
    }

    // සන්දර්භයේ ඇති සෑම භාණ්ඩයක් සඳහාම මෙම රීතිය ක්‍රියාත්මක කරයි.
    context.items.forEach((item) => {
      // Rule only applies to matching product ID
      if (item.productId !== this.config.productId) {
        return;
      }
      
      console.log(`Processing product rule for item ${item.lineId}, product ${item.productId}`);
      
      const lineResult = result.getLineItem(item.lineId);
      // ඉහළ ප්‍රමුඛතාවයක් ඇති වට්ටමක් (උදා: custom, batch) දැනටමත් යොදා ඇත්නම්, මෙය මඟ හරින්න.
      if (!lineResult) {
        console.log(`No line result found for ${item.lineId}`);
        return;
      }
      
      if (lineResult.totalDiscount > 0) {
        console.log(`Higher priority discount already applied to ${item.lineId}, skipping product rule`);
        return;
      }

      const lineTotal = item.price * item.quantity;
      console.log(`Product rule evaluation: price=${item.price}, qty=${item.quantity}, total=${lineTotal}`);
      
      // ප්‍රමුඛතා අනුපිළිවෙලට රීති නිර්වචනය කරන්න - පළමුව ගැලපෙන රීතිය ජය ගනී.
      const rulesToConsider = [
          { 
            config: this.config.lineItemValueRuleJson, 
            type: 'product_config_line_item_value' as const, 
            valueToTest: lineTotal,
            description: 'Product line value rule'
          },
          { 
            config: this.config.lineItemQuantityRuleJson, 
            type: 'product_config_line_item_quantity' as const, 
            valueToTest: item.quantity,
            description: 'Product quantity rule'
          },
          { 
            config: this.config.specificQtyThresholdRuleJson, 
            type: 'product_config_specific_qty_threshold' as const, 
            valueToTest: item.quantity,
            description: 'Product quantity threshold rule'
          },
          { 
            config: this.config.specificUnitPriceThresholdRuleJson, 
            type: 'product_config_specific_unit_price' as const, 
            valueToTest: item.price,
            description: 'Product unit price threshold rule'
          }
      ];

      // ප්‍රමුඛතාවයට ගරු කරමින්, පළමු වලංගු රීතිය පමණක් යොදවන්න.
      for (const ruleEntry of rulesToConsider) {
        if (!ruleEntry.config?.isEnabled) {
          console.log(`Product rule ${ruleEntry.type} is not enabled`);
          continue;
        }

        console.log(`Evaluating product rule ${ruleEntry.type}:`, ruleEntry.config);

        // රීතියේ වින්‍යාසය (configuration) වලංගුදැයි පරීක්ෂා කිරීම.
        const validation = validateRuleConfig(ruleEntry.config);
        if (!validation.isValid) {
          console.warn(`Invalid rule configuration for ${ruleEntry.type}:`, validation.errors);
          continue;
        }

        const discountAmount = evaluateRule(
            ruleEntry.config,
            item.price,
            item.quantity,
            lineTotal,
            ruleEntry.valueToTest
        );

        console.log(`Product rule evaluation result for ${ruleEntry.type}: discount=${discountAmount}`);

        if (discountAmount > 0) {
          const ruleId = generateRuleId('product', this.config.id, ruleEntry.type, item.productId);
          const isOneTime = isOneTimeRule(ruleEntry.config, this.config.discountSet?.isOneTimePerTransaction);

          console.log(`Applying product discount: ruleId=${ruleId}, amount=${discountAmount}, isOneTime=${isOneTime}`);

          // ගණනය කළ වට්ටම ප්‍රතිඵලයට (result) එකතු කිරීම.
          lineResult.addDiscount({
              ruleId,
              discountAmount,
              description: `${ruleEntry.description}: '${ruleEntry.config.name}' applied.`,
              isOneTime,
              appliedRuleInfo: {
                  discountCampaignName: this.config.discountSet?.name || 'N/A',
                  sourceRuleName: ruleEntry.config.name,
                  totalCalculatedDiscount: discountAmount,
                  ruleType: ruleEntry.type,
                  productIdAffected: item.productId,
                  appliedOnce: isOneTime
              }
          });
          
          // පළමු සාර්ථක රීතිය යෙදීමෙන් පසු නවත්වන්න (ප්‍රමුඛතා තර්කය).
          break;
        } else {
          console.log(`Product rule ${ruleEntry.type} did not qualify for discount`);
        }
      }
    });
  }
}