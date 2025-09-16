
import { AppliedRuleInfo } from "../utils/types";
import { DiscountContext, LineItemData } from "./context";

/**
 * එක් භාණ්ඩයක් (line item) සඳහා යොදන ලද වට්ටම නිරූපණය කරයි.
 */
export interface DiscountApplication {
  ruleId: string; // යොදන ලද රීතිය සඳහා අනන්‍ය හඳුනාගැනීමක්
  discountAmount: number; // මෙම රීතිය මගින් යොදන ලද වට්ටම් ප්‍රමාණය
  description: string; // වට්ටම ලබා දීමට හේතුව විස්තර කිරීම
  appliedRuleInfo: AppliedRuleInfo;
  isOneTime?: boolean; // මෙය එක් වරක් පමණක් යෙදෙන වට්ටමක් දැයි හඳුනාගැනීම
}

/**
 * එක් භාණ්ඩයක් සඳහා වට්ටම් ගණනය කිරීමේ ප්‍රතිඵල දරයි.
 */
export class LineItemResult {
  lineId: string;
  productId: string;
  batchId?: string | null;
  originalPrice: number;
  quantity: number;
  totalDiscount: number = 0;
  appliedRules: DiscountApplication[] = [];
  private oneTimeRulesApplied: Set<string> = new Set();

  constructor(lineItem: LineItemData) {
    this.lineId = lineItem.lineId;
    this.productId = lineItem.productId;
    this.batchId = lineItem.batchId;
    this.originalPrice = lineItem.price;
    this.quantity = lineItem.quantity;
  }

  /**
   * මෙම භාණ්ඩය සඳහා එක් වරක් පමණක් යෙදෙන රීතියක් දැනටමත් යොදා ඇත්දැයි පරීක්ෂා කරයි.
   */
  private hasOneTimeRuleBeenApplied(ruleId: string): boolean {
    return this.oneTimeRulesApplied.has(ruleId);
  }

  /**
   * එක් වරක් පමණක් යෙදෙන රීතියක් මෙම භාණ්ඩය සඳහා යෙදූ බව සලකුණු කරයි.
   */
  private markOneTimeRuleAsApplied(ruleId: string): void {
    this.oneTimeRulesApplied.add(ruleId);
  }

  addDiscount(application: DiscountApplication): void {
    // DEBUG: Log the discount application being added
    console.log(`[LineItemResult] ලයින් ${this.lineId} සඳහා addDiscount ක්‍රියාත්මක විය:`, application);
    
    // එක් වරක් පමණක් යෙදෙන රීති වල තර්කනය පරීක්ෂා කිරීම
    if (application.isOneTime && this.hasOneTimeRuleBeenApplied(application.ruleId)) {
      console.log(`[LineItemResult] එක් වරක් යෙදෙන රීතිය ${application.ruleId} දැනටමත් ලයින් ${this.lineId} සඳහා යොදා ඇත, එබැවින් මඟ හරිනු ලැබේ.`);
      return;
    }

    const originalLineTotal = this.originalPrice * this.quantity;
    // වට්ටම, භාණ්ඩයේ ඉතිරි වටිනාකම නොඉක්මවන බවට වග බලා ගැනීම
    const applicableDiscount = Math.min(application.discountAmount,originalLineTotal - this.totalDiscount );

    if (applicableDiscount > 0) {
      this.totalDiscount += applicableDiscount;
      this.appliedRules.push({ ...application, discountAmount: applicableDiscount });
      console.log(`[LineItemResult] වට්ටම ${applicableDiscount} යොදන ලදී. ලයින් ${this.lineId} සඳහා නව මුළු වට්ටම: ${this.totalDiscount}`);
      
      // Mark one-time rule as applied if applicable
      if (application.isOneTime) {
        this.markOneTimeRuleAsApplied(application.ruleId);
        console.log(`[LineItemResult] Marked rule ${application.ruleId} as one-time applied.`);
      }
    } else {
        console.log(`[LineItemResult] රීතිය ${application.ruleId} සඳහා අදාළ වට්ටම 0 හෝ ඊට අඩුය. වට්ටමක් එකතු නොකළේය.`);
    }
    
  }

  get netPrice(): number {
    return this.originalPrice * this.quantity - this.totalDiscount;
  }

  /**
   * මෙම භාණ්ඩය සඳහා එක් වරක් යෙදෙන රීති පිළිබඳ සටහන් නැවත සකසයි (reset).
   */
  resetOneTimeRules(): void {
    this.oneTimeRulesApplied.clear();
  }
}

/**
 * සම්පූර්ණ විකිණීමක් සඳහා සියලුම වට්ටම් ප්‍රතිඵල එකතු කරයි.
 */
export class DiscountResult {
  lineItems: LineItemResult[];
  totalItemDiscount: number = 0;
  totalCartDiscount: number = 0;
  appliedCartRules: DiscountApplication[] = [];
  private oneTimeCartRulesApplied: Set<string> = new Set();

  constructor(context: DiscountContext) {
    this.lineItems = context.items.map((item) => new LineItemResult(item));
  }

  getLineItem(lineId: string): LineItemResult | undefined {
    return this.lineItems.find((li) => li.lineId === lineId);
  }

  /**
   * එක් වරක් පමණක් යෙදෙන කාට් (cart) මට්ටමේ රීතියක් යොදා ඇත්දැයි පරීක්ෂා කරයි.
   */
  private hasOneTimeCartRuleBeenApplied(ruleId: string): boolean {
    return this.oneTimeCartRulesApplied.has(ruleId);
  }

  /**
   * එක් වරක් පමණක් යෙදෙන කාට් (cart) මට්ටමේ රීතියක් යෙදූ බව සලකුණු කරයි.
   */
  private markOneTimeCartRuleAsApplied(ruleId: string): void {
    this.oneTimeCartRulesApplied.add(ruleId);
  }

  addCartDiscount(application: DiscountApplication): void {
    // කාට් මට්ටමේ වට්ටම් සඳහා එක් වරක් යෙදෙන රීති වල තර්කනය පරීක්ෂා කිරීම
    if (application.isOneTime && this.hasOneTimeCartRuleBeenApplied(application.ruleId)) {
      console.log(`One-time cart rule ${application.ruleId} already applied, skipping.`);
      return;
    }

    // Ensure cart discount doesn't exceed remaining subtotal
    const subtotalAfterItemDiscounts = this.lineItems.reduce((sum, li) => sum + li.netPrice, 0);
    const applicableDiscount = Math.min(application.discountAmount, subtotalAfterItemDiscounts - this.totalCartDiscount);

    if (applicableDiscount > 0) {
      this.totalCartDiscount += applicableDiscount;
      this.appliedCartRules.push({ ...application, discountAmount: applicableDiscount });
      
      // Mark one-time rule as applied if applicable
      if (application.isOneTime) {
        this.markOneTimeCartRuleAsApplied(application.ruleId);
      }
    }
  }

  /**
   * සියලුම රීති යෙදීමෙන් පසු මුළු එකතුව අවසන් කරයි.
   */
  finalize(): void {
    this.totalItemDiscount = this.lineItems.reduce(
      (sum, item) => sum + item.totalDiscount,
      0
    );
    // Cart discount is already calculated via addCartDiscount
  }

  /**
   * සාරාංශයක් සඳහා, යොදන ලද සියලුම රීති වල ලැයිස්තුවක් ජනනය කරයි.
   */
  getAppliedRulesSummary(): AppliedRuleInfo[] {
    const summary: AppliedRuleInfo[] = [];

    this.lineItems.forEach((line) => {
      line.appliedRules.forEach((app) => {
        summary.push(app.appliedRuleInfo);
      });
    });

    this.appliedCartRules.forEach((app) => {
      summary.push(app.appliedRuleInfo);
    });

    return summary;
  }

  /**
   * එක් වරක් පමණක් යෙදෙන සියලුම රීති පිළිබඳ සටහන් නැවත සකසයි (reset).
   */
  resetOneTimeRules(): void {
    this.oneTimeCartRulesApplied.clear();
    this.lineItems.forEach(item => item.resetOneTimeRules());
  }

  /**
   * මුළු වට්ටම් ප්‍රමාණය ලබා ගනී (භාණ්ඩ + කාට් වට්ටම්).
   */
  get totalDiscount(): number {
    return this.totalItemDiscount + this.totalCartDiscount;
  }

  /**
   * කිසිදු වට්ටමකට පෙර උප එකතුව (subtotal) ලබා ගනී.
   */
  get originalSubtotal(): number {
    return this.lineItems.reduce((sum, li) => sum + (li.originalPrice * li.quantity), 0);
  }

  /**
   * සියලුම වට්ටම් වලින් පසු අවසාන එකතුව ලබා ගනී.
   */
  get finalTotal(): number {
    return this.originalSubtotal - this.totalDiscount;
  }
}
