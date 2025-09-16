// src/components/transaction/PaymentPanel.tsx
'use client';
import React, { useEffect } from 'react';
import { useFormContext, Controller } from 'react-hook-form';

interface PaymentPanelProps {
  finalTotal: number;
}

export function PaymentPanel({ finalTotal }: PaymentPanelProps) {
  const { control, watch, setValue, formState: { errors } } = useFormContext();
  const paidAmount = watch('payment.paidAmount');
  const isInstallment = watch('payment.isInstallment');

  useEffect(() => {
    // When isInstallment is toggled, re-validate the paidAmount field
    // to apply the new rules immediately.
  }, [isInstallment]);

  useEffect(() => {
    const outstanding = finalTotal - (paidAmount || 0);
    // Outstanding amount is only relevant if it's positive (customer owes money)
    setValue('payment.outstandingAmount', outstanding > 0 ? outstanding : 0, { shouldValidate: true });
    setValue('payment.finalTotal', finalTotal, { shouldValidate: true });

  }, [paidAmount, finalTotal, setValue]);

  return (
    <div className="p-4 border rounded-lg bg-white shadow-sm">
      <h3 className="text-lg font-semibold mb-4">Payment Details</h3>
      <div className="space-y-4">
        <div className="text-4xl font-bold text-blue-600 text-center p-4 bg-blue-50 rounded-lg">
          <div>Total to Pay</div>
          <div>Rs. {finalTotal.toFixed(2)}</div>
        </div>

        <div>
          <label htmlFor="paymentMethod" className="block text-sm font-medium text-gray-700">Payment Method</label>
          <Controller
            control={control}
            name="payment.paymentMethod"
            render={({ field }) => (
              <select {...field} id="paymentMethod" className="mt-1 block w-full h-10 px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
                <option value="cash">Cash</option>
                <option value="card">Card</option>
                <option value="online">Online</option>
              </select>
            )}
          />
           {errors.payment?.paymentMethod && (
            <p className="text-red-500 text-xs mt-1">{errors.payment.paymentMethod.message?.toString()}</p>
          )}
        </div>

        <div>
          <label htmlFor="paidAmount" className="block text-sm font-medium text-gray-700">Amount Paid</label>
           <Controller
            control={control}
            name="payment.paidAmount"
            render={({ field }) => (
              <input
                {...field}
                id="paidAmount"
                type="number"
                placeholder="e.g., 5000.00"
                onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            )}
          />
          {errors.payment?.paidAmount && <p className="text-red-500 text-xs mt-1">{errors.payment.paidAmount.message?.toString()}</p>}
        </div>
        
        <div>
            <div className="text-2xl font-bold text-red-600 text-center p-3 bg-red-50 rounded-lg">
            <div>Outstanding</div>
            <div>Rs. {watch('payment.outstandingAmount').toFixed(2)}</div>
            </div>
             {errors.payment?.outstandingAmount && (
                <p className="text-red-500 text-xs mt-1">{errors.payment.outstandingAmount.message?.toString()}</p>
            )}
        </div>

        <div className="flex items-center space-x-2 pt-4">
           <Controller
            control={control}
            name="payment.isInstallment"
            render={({ field }) => (
              <button type="button" role="switch" aria-checked={field.value} onClick={() => field.onChange(!field.value)} className={`${field.value ? 'bg-blue-600' : 'bg-gray-200'} relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}>
                <span aria-hidden="true" className={`${field.value ? 'translate-x-5' : 'translate-x-0'} pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}/>
              </button>
            )}
           />
          <label htmlFor="installment-mode" className="text-sm font-medium text-gray-700">Pay by Installments</label>
        </div>

      </div>
    </div>
  );
}
