// src/discount-engine/index.ts

// අවශ්‍ය කරන core components සහ විවිධ රීති (rules) import කරගැනීම.
import { DiscountContext } from './core/context';
import { DiscountResult } from './core/result';
import { IDiscountRule } from './rules/interface';
import { ProductLevelRule } from './rules/product-level-rule';
import { DefaultItemRule } from './rules/default-item-rule';
import { BuyXGetYRule } from './rules/buy-x-get-y-rule';
import { CartTotalRule } from './rules/cart-total-rule';
import { BatchSpecificRule } from './rules/batch-specific-rule';
import { CustomItemDiscountRule } from './rules/custom-item-discount-rule';
import { DiscountSet } from './utils/types';

/**
 * DiscountEngine class එක තමයි සම්පූර්ණ වට්ටම් ක්‍රියාවලිය කළමනාකරණය කරන්නේ.
 * Campaign එකක් දුන්නම, ඒකට අදාළ රීති (rules) හදාගෙන, process() method එකෙන් වට්ටම් ගණනය කරනවා.
 */
export class DiscountEngine {
  // IDiscountRule interface එක implement කරන rule object ගබඩා කරගන්නා array එක.
  private rules: IDiscountRule[] = [];
  // ගනුදෙනුවක් තුළ එක් වරක් පමණක් යෙදිය යුතු රීති (one-time rules) මොනවද කියලා මතක තියාගන්නා Set එක.
  private appliedOneTimeRules: Set<string> = new Set();

  // constructor එක මගින් campaign object එකක් අරගෙන, ඒකට අදාළ රීති පිළිවෙලකට හදනවා.
  constructor(campaign: DiscountSet) {
    this.buildRulesFromCampaign(campaign);
  }

  /**
   * Campaign configuration එක අනුව, වට්ටම් රීති ලැයිස්තුවක් (rule processors) ගතිකව (dynamically) ගොඩනගනවා.
   * මෙහිදී රීති එකතු කරන පිළිවෙල ඉතා වැදගත්, මොකද ඒකෙන් තමයි වට්ටම් වල ප්‍රමුඛතාවය (precedence) තීරණය වෙන්නේ.
   */
  private buildRulesFromCampaign(campaign: DiscountSet): void {
    // ප්‍රමුඛතාවය 1: භාණ්ඩයකට කෙලින්ම දෙන අභිරුචි (custom) වට්ටම්. මේවාට තමයි ඉහළම ප්‍රමුඛතාවය.
    this.rules.push(new CustomItemDiscountRule());

    // ප්‍රමුඛතාවය 2: Batch එකකට විශේෂිත වට්ටම්. (උදා: කල් ඉකුත් වීමට ආසන්න batch එකකට දෙන වට්ටමක්).
    if (campaign.batchConfigurations) {
      campaign.batchConfigurations.forEach((config) => {
        this.rules.push(new BatchSpecificRule(config));
      });
    }

    // ප්‍රමුඛතාවය 3: භාණ්ඩයකට (product) විශේෂිත වට්ටම්.
    if (campaign.productConfigurations) {
      // අවශ්‍ය නම්, මේවාත් තවදුරටත් ප්‍රමුඛතාවය අනුව සකස් කරන්න පුළුවන්.
      campaign.productConfigurations.forEach((config) => {
        this.rules.push(new ProductLevelRule(config));
      });
    }

    // ප්‍රමුඛතාවය 4: "Buy X, Get Y" (BOGO) වැනි විශේෂ දීමනා.
    if (campaign.buyGetRulesJson) {
      campaign.buyGetRulesJson.forEach((ruleConfig) => {
        this.rules.push(new BuyXGetYRule(ruleConfig, campaign.name));
      });
    }

    // ප්‍රමුඛතාවය 5: Campaign එකේ පොදු (default) භාණ්ඩ මට්ටමේ වට්ටම්.
    // ඉහත කිසිම විශේෂිත වට්ටමක් නොලැබුණු භාණ්ඩ වලට මේවා අදාළ වෙන්න පුළුවන්.
    this.rules.push(new DefaultItemRule(campaign));

    // ප්‍රමුඛතාවය 6: සම්පූර්ණ බිලට (cart) දෙන වට්ටම්. මේවා අන්තිමටම තමයි යෙදෙන්නේ.
    this.rules.push(new CartTotalRule(campaign));
  }

  /**
   * එක් වරක් පමණක් යෙදිය යුතු රීතියක් දැනටමත් යොදා ඇත්දැයි පරීක්ෂා කරනවා.
   */
  private hasOneTimeRuleBeenApplied(ruleId: string): boolean {
    return this.appliedOneTimeRules.has(ruleId);
  }

  /**
   * එක් වරක් පමණක් යෙදිය යුතු රීතියක් යෙදූ බව සලකුණු කරනවා.
   */
  private markOneTimeRuleAsApplied(ruleId: string): void {
    this.appliedOneTimeRules.add(ruleId);
  }

  /**
   * විකිණීමේ සන්දර්භය (sale context) අරගෙන, සකස් කරගත් සියලුම වට්ටම් රීති පිළිවෙලින් යොදනවා.
   * @param context විකිණීමට අදාළ සියලුම භාණ්ඩ සහ තොරතුරු අඩංගු object එක.
   * @param transactionId එක් වරක් යෙදෙන රීති track කිරීමට අවශ්‍ය නම් ගනුදෙනුවේ ID එක. (මෙය දැනට භාවිත නොවේ).
   * @returns වට්ටම් යෙදීමෙන් පසු ලැබෙන ප්‍රතිඵල (DiscountResult object) එකක් return කරනවා.
   */
  public process(context: DiscountContext, transactionId?: string): DiscountResult {
    // වට්ටම් ප්‍රතිඵල ගබඩා කිරීමට අලුත් DiscountResult object එකක් හදාගන්නවා.
    const result = new DiscountResult(context);

    // හදාගත් රීති ලැයිස්තුව හරහා පිළිවෙලින් ගොස්, එකින් එක යොදනවා.
    // මෙහිදී පිළිවෙල වැදගත්, මොකද ඉහළ ප්‍රමුඛතාවයක් ඇති රීතියක් යෙදුනොත්, පහළ රීති යෙදෙන්නේ නැහැ.
    for (const rule of this.rules) {
      // අදාළ රීතියේ apply() method එක call කරලා, වට්ටම් ගණනය කරලා, result object එකට එකතු කරගන්නවා.
      rule.apply(context, result);
    }

    // සියලුම රීති යෙදීමෙන් පසු, මුළු වට්ටම් වැනි අවසන් ගණනය කිරීම් කරනවා.
    result.finalize();

    // අවසන් ප්‍රතිඵලය return කරනවා.
    return result;
  }

  /**
   * එක් වරක් යෙදෙන රීති පිළිබඳ මතකය ඉවත් කරනවා. (අලුත් ගනුදෙනුවක් පටන් ගන්නකොට මේක call කරන්න ඕන).
   */
  public resetOneTimeRules(): void {
    this.appliedOneTimeRules.clear();
  }

  /**
   * Debugging සඳහා, යොදන ලද එක්-වරක් රීති මොනවද කියලා බලාගන්න පුළුවන්.
   */
  public getAppliedOneTimeRules(): string[] {
    return Array.from(this.appliedOneTimeRules);
  }
}