// ===== FILE 5: src/discount-engine/rules/custom-item-discount-rule.ts =====
import { IDiscountRule } from './interface';
import { DiscountContext, LineItemData } from '../core/context';
import { DiscountResult } from '../core/result';
// වට්ටම් රීති ඇගයීම සහ ID ජනනය කිරීම සඳහා උපකාරක ශ්‍රිත.
import { generateRuleId, evaluateRule } from '../utils/helpers';

export class CustomItemDiscountRule implements IDiscountRule {
  readonly isPotentiallyRepeatable: boolean = false; // අභිරුචි (custom) වට්ටම් අනන්‍ය වේ.

  getId(item?: LineItemData): string {
    return `custom${item ? `-${item.lineId}` : '-unknown'}`;
  }

  // මෙම රීතියේ තර්කනය වට්ටම් සන්දර්භය මත යොදවයි.
  apply(context: DiscountContext, result: DiscountResult): void {
    context.items.forEach((item) => {
      const lineResult = result.getLineItem(item.lineId);
      if (!lineResult || !item.customDiscountValue || item.customDiscountValue <= 0) {
        return;
      }
      
      // DEBUG: SaleItem වෙතින් ලැබුණු අභිරුචි වට්ටම් දත්ත ලොග් කිරීම.
      console.log(`[CustomItemDiscountRule] Processing item ${item.lineId}:`, {
          type: item.customDiscountType,
          value: item.customDiscountValue,
          applyOnce: item.customApplyFixedOnce
      });

      let discountAmount = 0;
      const lineTotal = item.price * item.quantity;
      
      const isOneTimeFixed = item.customDiscountType === 'fixed' && item.customApplyFixedOnce;
      // මෙය එක්-වරක් ස්ථාවර (one-time fixed) වට්ටම සඳහා විශේෂ අවස්ථාවයි.
      const applyOnce = item.customApplyFixedOnce ?? false; 

      if (isOneTimeFixed) {
        // මෙය එක්-වරක් ස්ථාවර වට්ටම සඳහා විශේෂ අවස්ථාවයි.
        console.log(`[CustomItemDiscountRule] Applying a single, one-time fixed discount.`);

        // මෙය අර්ධ මුදල් ආපසු ගෙවීමේ (partial refund) අවස්ථාවක් දැයි පරීක්ෂා කිරීම.
        if (item.originalQuantity && item.originalQuantity > item.quantity) {
            // වට්ටම සමානුපාතිකව (pro-rate) ගණනය කිරීම.
            const originalDiscount = item.customDiscountValue;
            const originalQty = item.originalQuantity;
            const currentQty = item.quantity;
            discountAmount = (originalDiscount / originalQty) * currentQty;
            console.log(`[CustomItemDiscountRule] Pro-rated refund discount: (${originalDiscount} / ${originalQty}) * ${currentQty} = ${discountAmount}`);
        } else {
             // Normal sale or full refund, apply the discount as is
             // සාමාන්‍ය විකිණීමක් හෝ සම්පූර්ණ මුදල් ආපසු ගෙවීමක් නම්, වට්ටම ඒ ආකාරයෙන්ම යොදන්න.
            discountAmount = item.customDiscountValue;
        }

      } else {
        // ප්‍රතිශත (percentage) වට්ටම් හෝ ඒකකයකට ස්ථාවර (per-unit fixed) වට්ටම් සඳහා, උපකාරක ශ්‍රිතය භාවිතා කරන්න.
        console.log(`[CustomItemDiscountRule] Using evaluateRule for percentage or per-unit fixed discount.`);
        const tempRuleConfig = {
          isEnabled: true,
          name: 'Custom Rule',
          type: item.customDiscountType!,
          value: item.customDiscountValue,
          // වැදගත්: "applyOnce" කොඩිය (flag) ඇගයීම් උපකාරක ශ්‍රිතයට ලබා දෙන්න.
          applyFixedOnce: applyOnce
        };
         discountAmount = evaluateRule(
            tempRuleConfig,
            item.price,
            item.quantity,
            lineTotal,
            lineTotal // For custom rules, condition is always met, so test against lineTotal
        );
      }


      // වට්ටම, භාණ්ඩයේ මුළු වටිනාකම නොඉක්මවන බවට වග බලා ගැනීම.
      discountAmount = Math.min(discountAmount, lineTotal);
      
      // DEBUG: අවසාන වශයෙන් ගණනය කළ වට්ටම් ප්‍රමාණය ලොග් කිරීම.
      console.log(`[CustomItemDiscountRule] Final calculated discount for ${item.lineId}: ${discountAmount}, applyOnce flag: ${applyOnce}`);
      
      if (discountAmount > 0) {
        const ruleId = generateRuleId('custom', item.lineId, 'manual_discount', item.productId);
        
        // ගණනය කළ වට්ටම ප්‍රතිඵලයට (result) එකතු කිරීම.
        lineResult.addDiscount({
          ruleId,
          discountAmount,
          description: `Custom ${item.customDiscountType} discount of ${item.customDiscountValue} applied manually.`,
          // වැදගත්: නිවැරදි "isOneTime" කොඩිය (flag) ප්‍රතිඵලයට ලබා දෙන්න.
          isOneTime: applyOnce, 
          appliedRuleInfo: {
            discountCampaignName: "Manual Discount",
            sourceRuleName: `Custom ${item.customDiscountType === 'fixed' ? 'Fixed' : 'Percentage'} Discount`,
            totalCalculatedDiscount: discountAmount,
            ruleType: 'custom_item_discount',
            productIdAffected: item.productId,
            appliedOnce: applyOnce,
          },
        });
      }
    });
  }
}
