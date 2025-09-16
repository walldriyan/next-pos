// src/components/POSUI/CustomDiscountForm.tsx
'use client';

import React, { useState } from 'react'; 
import { SaleItem } from '../../discount-engine/utils/types';
import { useDrawer } from '@/app/components/UI/drawer/useDrawer';



interface CustomDiscountFormProps {
  item: SaleItem;
  onApplyDiscount: (saleItemId: string, type: 'fixed' | 'percentage', value: number, applyOnce: boolean) => void;
}

export function CustomDiscountForm({ item, onApplyDiscount }: CustomDiscountFormProps) {
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>(item.customDiscountType || 'percentage');
  const [discountValue, setDiscountValue] = useState<number | string>(item.customDiscountValue || '');
  // applyOnce = true means "Apply as a single, one-time discount"
  // applyOnce = false means "Apply discount to each unit"
  const [applyOnce, setApplyOnce] = useState<boolean>(item.customApplyFixedOnce ?? true);
  const [error, setError] = useState<string>('');
  const drawer = useDrawer();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const valueAsNumber = Number(discountValue);

    if (isNaN(valueAsNumber) || valueAsNumber < 0) {
      setError('Please enter a valid, non-negative number.');
      return;
    }
    if (discountType === 'percentage' && valueAsNumber > 100) {
      setError('Percentage discount cannot exceed 100.');
      return;
    }
    if (discountType === 'fixed' && valueAsNumber > item.price && applyOnce === false) {
        setError('Per-unit fixed discount cannot be greater than the unit price.');
        return;
    }
    if (discountType === 'fixed' && valueAsNumber > (item.price * item.quantity) && applyOnce === true) {
      setError('One-time fixed discount cannot be greater than the line total.');
      return;
    }


    setError('');
    // For percentage discounts, `applyOnce` is irrelevant, but we pass it anyway.
    // The logic to ignore it is in the discount engine.
    onApplyDiscount(item.saleItemId, discountType, valueAsNumber, applyOnce);
    drawer.closeDrawer();
  };
  
  const handleRemoveDiscount = () => {
    // A value of 0 will effectively remove the custom discount.
    onApplyDiscount(item.saleItemId, 'fixed', 0, false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Discount Type Radio Buttons */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Discount Type</label>
        <div className="flex gap-4 mt-2">
          <div className="flex items-center space-x-2">
            <input
              type="radio"
              id="r-percentage"
              name="discountType"
              value="percentage"
              checked={discountType === 'percentage'}
              onChange={() => setDiscountType('percentage')}
              className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
            />
            <label htmlFor="r-percentage" className="text-sm text-gray-700">Percentage (%)</label>
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="radio"
              id="r-fixed"
              name="discountType"
              value="fixed"
              checked={discountType === 'fixed'}
              onChange={() => setDiscountType('fixed')}
              className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
            />
            <label htmlFor="r-fixed" className="text-sm text-gray-700">Fixed Amount (Rs.)</label>
          </div>
        </div>
      </div>

      {/* Discount Value Input */}
      <div>
        <label htmlFor="discount-value" className="block text-sm font-medium text-gray-700">Discount Value</label>
        <input
          id="discount-value"
          type="number"
          value={discountValue} 
          onChange={(e) => setDiscountValue(e.target.value)}
          placeholder={discountType === 'percentage' ? 'e.g., 10 for 10%' : 'e.g., 500 for Rs. 500'}
          required
          className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        />
        {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
      </div>

      {/* Apply Per-Unit Switch */}
       {discountType === 'fixed' && (
        <div className="flex items-center justify-between rounded-lg border p-3 shadow-sm">
            <div className="space-y-0.5">
                <label htmlFor="apply-mode" className="text-sm font-medium text-gray-900">Apply Per-Unit</label>
                <p className="text-xs text-gray-500">
                   {applyOnce ? 'OFF: Discount is applied once to the whole line.' : 'ON: Discount is multiplied by quantity.'}
                </p>
            </div>
            <button
              type="button"
              id="apply-mode"
              role="switch"
              aria-checked={!applyOnce}
              onClick={() => setApplyOnce(prev => !prev)}
              className={`${
                !applyOnce ? 'bg-blue-600' : 'bg-gray-200'
              } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
            >
              <span
                aria-hidden="true"
                className={`${
                  !applyOnce ? 'translate-x-5' : 'translate-x-0'
                } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
              />
            </button>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-between items-center pt-4 border-t">
        <button 
            type="button" 
            onClick={handleRemoveDiscount}
            disabled={item.customDiscountValue === undefined}
            className="inline-flex justify-center rounded-md border border-transparent bg-red-100 px-4 py-2 text-sm font-medium text-red-900 hover:bg-red-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
            Remove Override
        </button>
        <div className='flex gap-2'>
            <button type="button" onClick={drawer.closeDrawer} className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                Cancel
            </button>
            <button type="submit" className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                Apply Discount
            </button>
        </div>
      </div>
    </form>
  );
}
