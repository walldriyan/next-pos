// src/lib/advanced-campaigns.ts

import { DiscountSet } from "./types";


// **උදාහරණය 1: "Per-Unit Discounts" - quantity වැඩි වෙනකොට discount එකත් වැඩි වෙන්න**
export const perUnitDiscounts: DiscountSet = {
  id: 'promo-per-unit',
  name: 'Per-Unit Discounts',
  description: 'ඒකක කට වට්ටම් - quantity වැඩි වෙනකොට discount එකත් වැඩි වෙනවා',
  isActive: true,
  isDefault: false,
  isOneTimePerTransaction: false,

  productConfigurations: [
    {
      id: 'perunit-tshirt-config',
      productId: 't-shirt-01',
      productNameAtConfiguration: 'T-Shirt',
      discountSetId: 'promo-per-unit',
      isActiveForProductInCampaign: true,
      priority: 1,
      lineItemValueRuleJson: null,
      lineItemQuantityRuleJson: null,
      specificQtyThresholdRuleJson: {
          isEnabled: true,
          name: 'T-Shirt Per-Unit Discount',
          type: 'fixed',
          value: 200, 
          conditionMin: 2, 
          applyFixedOnce: false, // 🔑 false = quantity වැඩි වෙනකොට discount එකත් වැඩි වෙනවා
          description: 'Rs.200 off each T-shirt when buying 2 or more (per unit)'
      },
      specificUnitPriceThresholdRuleJson: null,
    },
    {
      id: 'perunit-jeans-config',
      productId: 'jeans-01',
      productNameAtConfiguration: 'Jeans',
      discountSetId: 'promo-per-unit',
      isActiveForProductInCampaign: true,
      priority: 1,
      lineItemValueRuleJson: null,
      lineItemQuantityRuleJson: null,
      specificQtyThresholdRuleJson: {
          isEnabled: true,
          name: 'Jeans Per-Unit Discount',
          type: 'fixed',
          value: 500, 
          conditionMin: 2, 
          applyFixedOnce: false, // Rs.500 off each jean when buying 2+
          description: 'Rs.500 off each pair of jeans when buying 2 or more'
      },
      specificUnitPriceThresholdRuleJson: null,
    }
  ],

  batchConfigurations: [],
  buyGetRulesJson: [],
  globalCartPriceRuleJson: null,
  globalCartQuantityRuleJson: null,
  defaultLineItemValueRuleJson: null,
  defaultLineItemQuantityRuleJson: null,
  defaultSpecificQtyThresholdRuleJson: null,
  defaultSpecificUnitPriceThresholdRuleJson: null,
};

// **උදාහරණය 2: "Flat Rate Discounts" - quantity කීයක් තිබුණත් discount එක එකසේ**
export const flatRateDiscounts: DiscountSet = {
  id: 'promo-flat-rate',
  name: 'Flat Rate Discounts',
  description: 'ස්ථාවර වට්ටම් - quantity වැඩි වුනත් discount එක වෙනස් වෙන්නේ නැහැ',
  isActive: true,
  isDefault: false,
  isOneTimePerTransaction: false,

  productConfigurations: [
    {
      id: 'flatrate-tshirt-config',
      productId: 't-shirt-01',
      productNameAtConfiguration: 'T-Shirt',
      discountSetId: 'promo-flat-rate',
      isActiveForProductInCampaign: true,
      priority: 1,
      lineItemValueRuleJson: null,
      lineItemQuantityRuleJson: null,
      specificQtyThresholdRuleJson: {
          isEnabled: true,
          name: 'T-Shirt Flat Discount',
          type: 'fixed',
          value: 500, 
          conditionMin: 2, 
          applyFixedOnce: true, // 🔑 true = quantity කීයක් තිබුණත් Rs.500 විතරක්
          description: 'Flat Rs.500 off T-shirt line when buying 2 or more (once per line)'
      },
      specificUnitPriceThresholdRuleJson: null,
    },
    {
      id: 'flatrate-jeans-config',
      productId: 'jeans-01',
      productNameAtConfiguration: 'Jeans',
      discountSetId: 'promo-flat-rate',
      isActiveForProductInCampaign: true,
      priority: 1,
      lineItemValueRuleJson: null,
      lineItemQuantityRuleJson: null,
      specificQtyThresholdRuleJson: {
          isEnabled: true,
          name: 'Jeans Flat Discount',
          type: 'fixed',
          value: 1000, 
          conditionMin: 2, 
          applyFixedOnce: true, // Flat Rs.1000 off per line
          description: 'Flat Rs.1000 off jeans line when buying 2 or more (once per line)'
      },
      specificUnitPriceThresholdRuleJson: null,
    }
  ],

  batchConfigurations: [],
  buyGetRulesJson: [],
  globalCartPriceRuleJson: null,
  globalCartQuantityRuleJson: null,
  defaultLineItemValueRuleJson: null,
  defaultLineItemQuantityRuleJson: null,
  defaultSpecificQtyThresholdRuleJson: null,
  defaultSpecificUnitPriceThresholdRuleJson: null,
};

// **උදාහරණය 3: "Percentage vs Fixed Comparison"**
export const percentageVsFixed: DiscountSet = {
  id: 'promo-percent-vs-fixed',
  name: 'Percentage vs Fixed Demo',
  description: 'Percentage සහ Fixed discount වල වෙනස compare කරන්න',
  isActive: true,
  isDefault: false,
  isOneTimePerTransaction: false,

  productConfigurations: [
    {
      id: 'percent-tshirt-config',
      productId: 't-shirt-01',
      productNameAtConfiguration: 'T-Shirt',
      discountSetId: 'promo-percent-vs-fixed',
      isActiveForProductInCampaign: true,
      priority: 1,
      lineItemValueRuleJson: {
          isEnabled: true,
          name: 'T-Shirt Percentage Discount',
          type: 'percentage',
          value: 15, // 15% off total line value
          conditionMin: 3000,
          description: '15% off T-shirt line when value exceeds Rs.3000'
      },
      lineItemQuantityRuleJson: null,
      specificQtyThresholdRuleJson: null,
      specificUnitPriceThresholdRuleJson: null,
    },
    {
      id: 'fixed-jeans-config',
      productId: 'jeans-01',
      productNameAtConfiguration: 'Jeans',
      discountSetId: 'promo-percent-vs-fixed',
      isActiveForProductInCampaign: true,
      priority: 1,
      lineItemValueRuleJson: {
          isEnabled: true,
          name: 'Jeans Fixed Discount',
          type: 'fixed',
          value: 1000,
          conditionMin: 10000,
          applyFixedOnce: true, // Flat Rs.1000 off regardless of quantity
          description: 'Flat Rs.1000 off jeans line when value exceeds Rs.10000'
      },
      lineItemQuantityRuleJson: null,
      specificQtyThresholdRuleJson: null,
      specificUnitPriceThresholdRuleJson: null,
    }
  ],

  batchConfigurations: [],
  buyGetRulesJson: [],
  globalCartPriceRuleJson: null,
  globalCartQuantityRuleJson: null,
  defaultLineItemValueRuleJson: null,
  defaultLineItemQuantityRuleJson: null,
  defaultSpecificQtyThresholdRuleJson: null,
  defaultSpecificUnitPriceThresholdRuleJson: null,
};

// **උදාහරණය 4: "Mixed Strategy" - විවිධ approaches එකට**
export const mixedStrategy: DiscountSet = {
  id: 'promo-mixed-strategy',
  name: 'Mixed Strategy Demo',
  description: 'විවිධ discount strategies එකට test කරන්න',
  isActive: true,
  isDefault: false,
  isOneTimePerTransaction: false,

  productConfigurations: [
    {
      id: 'mixed-tshirt-tier1',
      productId: 't-shirt-01',
      productNameAtConfiguration: 'T-Shirt',
      discountSetId: 'promo-mixed-strategy',
      isActiveForProductInCampaign: true,
      priority: 1,
      lineItemValueRuleJson: null,
      lineItemQuantityRuleJson: null,
      specificQtyThresholdRuleJson: {
          isEnabled: true,
          name: 'T-Shirt Tier 1: Bulk Flat Rate',
          type: 'fixed',
          value: 300, 
          conditionMin: 3,
          conditionMax: 5, // Only for 3-5 items
          applyFixedOnce: true, // Flat Rs.300 off line
          description: 'Flat Rs.300 off when buying 3-5 T-shirts'
      },
      specificUnitPriceThresholdRuleJson: null,
    },
    {
      id: 'mixed-tshirt-tier2',
      productId: 't-shirt-01',
      productNameAtConfiguration: 'T-Shirt',
      discountSetId: 'promo-mixed-strategy',
      isActiveForProductInCampaign: true,
      priority: 2, // Lower priority - only applies if tier 1 doesn't match
      lineItemValueRuleJson: null,
      lineItemQuantityRuleJson: null,
      specificQtyThresholdRuleJson: {
          isEnabled: true,
          name: 'T-Shirt Tier 2: Volume Per-Unit',
          type: 'fixed',
          value: 200, 
          conditionMin: 6, // 6+ items
          applyFixedOnce: false, // Rs.200 off per shirt
          description: 'Rs.200 off each T-shirt when buying 6 or more'
      },
      specificUnitPriceThresholdRuleJson: null,
    }
  ],

  batchConfigurations: [
  ],
  buyGetRulesJson: [],
  globalCartPriceRuleJson: null,
  globalCartQuantityRuleJson: null,
  defaultLineItemValueRuleJson: null,
  defaultLineItemQuantityRuleJson: null,
  defaultSpecificQtyThresholdRuleJson: null,
  defaultSpecificUnitPriceThresholdRuleJson: null,
};