// src/components/transaction/CustomerInfoPanel.tsx
'use client';
import React from 'react';
import { useFormContext } from 'react-hook-form';


export function CustomerInfoPanel() {
  const { register, formState: { errors } } = useFormContext(); // react-hook-form වෙතින් අවශ්‍ය functions ලබාගැනීම

  return (
    // Card component එක වෙනුවට div එකක් සහ Tailwind classes
    <div className="p-4 border rounded-lg bg-white shadow-sm">
      <h3 className="text-lg font-semibold mb-4">Customer Details</h3>
      <div className="space-y-4">
        <div>
          <label htmlFor="customerName" className="block text-sm font-medium text-gray-700">Customer Name</label>
          <input
            id="customerName"
            {...register('customer.name')}
            placeholder="e.g., John Doe"
            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
          {errors.customer?.name && (
            <p className="text-red-500 text-xs mt-1">{errors.customer.name.message?.toString()}</p>
          )}
        </div>
        <div>
          <label htmlFor="customerPhone" className="block text-sm font-medium text-gray-700">Phone Number</label>
          <input
            id="customerPhone"
            {...register('customer.phone')}
            placeholder="e.g., 0771234567"
            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
           {errors.customer?.phone && (
            <p className="text-red-500 text-xs mt-1">{errors.customer.phone.message?.toString()}</p>
          )}
        </div>
        <div>
          <label htmlFor="customerAddress" className="block text-sm font-medium text-gray-700">Address</label>
          <input
            id="customerAddress"
            {...register('customer.address')}
            placeholder="e.g., 123, Main St, Colombo"
            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
           {errors.customer?.address && (
            <p className="text-red-500 text-xs mt-1">{errors.customer.address.message?.toString()}</p>
          )}
        </div>
      </div>
    </div>
  );
}
