// src/components/POSUI/CartItemCard.tsx
import React from 'react';

import { Tag, Trash2 } from 'lucide-react';

import { SaleItem } from '../../discount-engine/utils/types';


interface CartItemCardProps {
  item: SaleItem;
  discountResult: any; // Using any because it's a plain object from server, not a class instance
  onUpdateQuantity: (saleItemId: string, newDisplayQuantity: number, newDisplayUnit?: string) => void;
  onOverrideDiscount: (item: SaleItem) => void;
}

const CartItemCard: React.FC<CartItemCardProps> = ({ item, discountResult, onUpdateQuantity, onOverrideDiscount }) => {

  const lineItemResult = (discountResult && discountResult.lineItems)
    ? discountResult.lineItems.find((li: any) => li.lineId === item.saleItemId)
    : undefined;

  const hasDiscounts = lineItemResult && lineItemResult.totalDiscount > 0;
  const originalLineTotal = item.price * item.quantity;
  const finalLineTotal = lineItemResult ? originalLineTotal - lineItemResult.totalDiscount : originalLineTotal;
  
  const isCustomDiscount = item.customDiscountValue !== undefined;

  const allUnits = [{ name: item.units.baseUnit, conversionFactor: 1 }, ...(item.units.derivedUnits || [])];
  const hasDerivedUnits = allUnits.length > 1;

  const handleQuantityInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Allow empty input for user-friendliness, treat as 0
    const newQuantity = value === '' ? 0 : parseFloat(value);
    if (!isNaN(newQuantity) && newQuantity >= 0) {
      onUpdateQuantity(item.saleItemId, newQuantity);
    }
  };


  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 transition-all duration-200 ease-in-out">
      {/* Top section: Name and Price */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-grow">
          <p className="font-semibold text-gray-900">
            {item.name}{' '}
            {item.selectedBatch && (
              <span className="text-sm font-normal text-gray-500">
                (Batch: {item.selectedBatch.batchNumber})
              </span>
            )}
          </p>
          <p className="text-sm text-gray-600">Rs. {item.price.toFixed(2)} / {item.units.baseUnit}</p>
        </div>
        <p className="text-right font-bold text-lg text-gray-800">
          Rs. {finalLineTotal.toFixed(2)}
        </p>
      </div>

      {/* Middle section: Quantity and Unit Controls */}
      <div className="mt-4 flex items-center justify-between gap-2">
        <div className="flex items-center rounded-md border border-gray-300">
           <button
            onClick={() => onUpdateQuantity(item.saleItemId, item.displayQuantity - 1)}
            className="w-9 h-9 flex items-center justify-center text-gray-600 hover:bg-gray-100 rounded-l-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            -
          </button>
           <input
                type="number"
                value={item.displayQuantity}
                onChange={handleQuantityInputChange}
                onBlur={(e) => {
                    // If the user leaves the input empty, set it back to 1 to avoid confusion
                    if (e.target.value === '' || parseFloat(e.target.value) <= 0) {
                        onUpdateQuantity(item.saleItemId, 1);
                    }
                }}
                className="w-16 h-9 text-center border-l border-r border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                step="0.01" // Allow decimal inputs
            />
          <button
            onClick={() => onUpdateQuantity(item.saleItemId, item.displayQuantity + 1)}
            className="w-9 h-9 flex items-center justify-center text-gray-600 hover:bg-gray-100 rounded-r-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            +
          </button>
        </div>
        
        {hasDerivedUnits ? (
            <select
                value={item.displayUnit}
                onChange={(e) => onUpdateQuantity(item.saleItemId, item.displayQuantity, e.target.value)}
                className="w-[120px] h-9 rounded-md border border-gray-300 bg-white px-3 text-sm shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
            >
                {allUnits.map(u => (
                    <option key={u.name} value={u.name}>
                        {u.name}
                    </option>
                ))}
            </select>
        ) : (
            <span className="text-sm text-gray-500 px-3">{item.units.baseUnit}</span>
        )}

        <button
            onClick={() => onUpdateQuantity(item.saleItemId, 0)} // Setting quantity to 0 removes it
            className="flex items-center justify-center w-9 h-9 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-red-500"
        >
            <Trash2 className="h-4 w-4"/>
        </button>
      </div>
      
      {/* Bottom section: Discounts */}
      <div className="mt-3 border-t border-dashed pt-3">
        {hasDiscounts && lineItemResult ? (
          <div className="mb-2 space-y-1">
             <div className="font-bold text-sm text-green-900 mb-2 flex justify-between items-center">
                <span>Applied Discounts:</span>
                <button className="flex items-center px-2 py-1 text-xs text-blue-700 bg-blue-100 rounded-md hover:bg-blue-200 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500" onClick={() => onOverrideDiscount(item)}>
                    <Tag className="mr-2 h-3 w-3" />
                    Override
                </button>
             </div>
             {isCustomDiscount && item.customDiscountType && (
                 <p className="flex justify-between items-center text-xs bg-yellow-50 text-yellow-800 p-2 rounded-md">
                    <span className="font-bold truncate pr-2">Manual Override</span>
                    <span className="font-semibold bg-yellow-200 px-2 py-0.5 rounded-full">
                        {item.customDiscountType === 'percentage' ? `${item.customDiscountValue}%` : `Rs. ${item.customDiscountValue}`}
                    </span>
                 </p>
             )}
             {!isCustomDiscount && lineItemResult.appliedRules.map((rule: any, i: number) => (
                <p key={i} className="flex justify-between items-center text-xs">
                    <span className="truncate pr-2">{rule.appliedRuleInfo.sourceRuleName}</span>
                    <span className="font-semibold bg-green-100 text-green-800 px-2 py-0.5 rounded-full">-Rs. {rule.discountAmount.toFixed(2)}</span>
                </p>
             ))}
          </div>
        ) : (
            <div className="flex justify-end">
                 <button className="flex items-center px-2 py-1 text-xs text-gray-700 bg-gray-100 rounded-md border border-gray-300 hover:bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500" onClick={() => onOverrideDiscount(item)}>
                    <Tag className="mr-2 h-3 w-3" />
                    Add Discount
                </button>
            </div>
        )}

        <div className="flex justify-between items-baseline text-xs mt-2">
           <span className="text-gray-500">
            Total Base Qty: {item.quantity.toFixed(2)} {item.units.baseUnit}
          </span>
          {hasDiscounts && (
             <span className="text-gray-500 line-through">
                Original: Rs. {originalLineTotal.toFixed(2)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default CartItemCard;
