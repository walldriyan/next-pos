// src/components/transaction/TransactionDialogContent.tsx
'use client';
import { useForm, FormProvider } from 'react-hook-form';
import React, { useState, useEffect } from 'react';

// import { zodResolver } from '@hookform/resolvers/zod'; // උපකල්පනය: ඔබ zod භාවිතා කරනවා

import { PrintPreview } from './PrintPreview';
import { DiscountSet, SaleItem } from '@/app/Shop/discount-engine/utils/types';
import { DatabaseReadyTransaction, transformTransactionDataForDb} from '@/app/Shop/discount-engine/utils/pos-data-transformer';
import { useDrawer } from '@/app/components/UI/drawer/useDrawer';
import { toast } from 'sonner';
import { CustomerInfoPanel } from './CustomerInfoPanel'; // Assuming this component exists
import { PaymentPanel } from './PaymentPanel'; // Assuming this component exists

interface TransactionDialogContentProps {
  cart: SaleItem[];
  discountResult: any; // Using any for plain object from server
  transactionId: string;
  activeCampaign: DiscountSet;
  onTransactionComplete: () => void;
}

// Define the type for the form values
interface TransactionFormValues {
  customer: {
    name: string;
    phone: string;
    address: string;
  };
  payment: {
    paidAmount: number;
    paymentMethod: 'cash' | 'card' | 'online';
    outstandingAmount: number;
    isInstallment: boolean;
    finalTotal: number;
  };
}

export function TransactionDialogContent({
  cart,
  discountResult,
  transactionId,
  activeCampaign,
  onTransactionComplete,
}: TransactionDialogContentProps) {
  const [step, setStep] = useState<'details' | 'print'>('details');
  const [showFullPrice, setShowFullPrice] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [finalTransactionData, setFinalTransactionData] = useState<DatabaseReadyTransaction | null>(null);
  const drawer = useDrawer();
  
  // උපකල්පනය: transactionFormSchema ඔබගේ project එකේ නිර්වචනය කර ඇත.
  // const transactionFormSchema = z.object({...});

  const methods = useForm<TransactionFormValues>({
    defaultValues: {
      customer: {
        name: 'Walk-in Customer',
        phone: '',
        address: '',
      },
      payment: {
        paidAmount: 0,
        paymentMethod: 'cash',
        outstandingAmount: 0,
        isInstallment: false,
        finalTotal: 0, // Initialize finalTotal
      },
    },
    mode: 'onChange',
  });
  
  const { handleSubmit, reset, formState: { isValid } } = methods;

  useEffect(() => {
    // Reset form with new totals when discountResult changes
    const finalTotal = discountResult.finalTotal || 0;
    reset({
        customer: {
            name: 'Walk-in Customer',
            phone: '',
            address: '',
        },
        payment: {
            paidAmount: finalTotal, // Default paid amount to the final total
            paymentMethod: 'cash',
            outstandingAmount: 0,
            isInstallment: false,
            finalTotal: finalTotal, // Pass finalTotal to the form context
        }
    });
  }, [discountResult, reset]);


  const processTransaction = async (data: TransactionFormValues) => {
    setIsSaving(true);
    // The `showFullPrice` state at this moment is what matters for the initial preview
    const preparedData = transformTransactionDataForDb({
      cart,
      discountResult,
      transactionId,
      customerData: data.customer,
      paymentData: data.payment,
      activeCampaign: activeCampaign,
      isGiftReceipt: showFullPrice, // Pass the current state of the toggle
    });
    
    setFinalTransactionData(preparedData);
    setStep('print');
    setIsSaving(false);
    
  };

  const handlePrintAndFinish = async () => {
    if (!finalTransactionData) {
       toast.error("Custom Discount Applied!", {
            description: `error`,
          });
        return;
    };

    setIsSaving(true);
  //   try {
  //     // Create the final version of the data right before saving,
  //     // ensuring it captures the latest toggle state from the print preview screen.
  //     const dataToSave: DatabaseReadyTransaction = {
  //       ...finalTransactionData,
  //       transactionHeader: {
  //           ...finalTransactionData.transactionHeader,
  //           isGiftReceipt: showFullPrice 
  //       }
  //     };

  //     await saveTransaction(dataToSave);
  //     toast({
  //       title: "Transaction Saved",
  //       description: `Transaction ${dataToSave.transactionHeader.transactionId} saved.`,
  //     });
  //     console.log("Printing receipt...");
  //     onTransactionComplete();

  //   } catch (error) {
  //     console.error("Failed to save transaction:", error);
  //     toast({
  //       variant: "destructive",
  //       title: "Save Failed",
  //       description: error instanceof Error ? error.message : "An unknown error occurred.",
  //     });
  //   } finally {
  //       setIsSaving(false);
  //   }
  };


  if (step === 'print' && finalTransactionData) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex-grow overflow-y-auto bg-gray-100 p-4 rounded-md">
          <PrintPreview data={finalTransactionData} showAsGiftReceipt={showFullPrice} />
        </div>
        <div className="flex-shrink-0 pt-4 mt-4 border-t flex items-center justify-between">
            <div className="flex items-center space-x-2">
                <button type="button" role="switch" aria-checked={showFullPrice} onClick={() => setShowFullPrice(prev => !prev)} className={`${showFullPrice ? 'bg-blue-600' : 'bg-gray-200'} relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}>
                  <span aria-hidden="true" className={`${showFullPrice ? 'translate-x-5' : 'translate-x-0'} pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}/>
                </button>
                <label htmlFor="billing-mode" className="text-sm font-medium text-gray-700">Show Full Price (Gift Discount)</label>
            </div>
            <div className="flex gap-2">
                <button type="button" onClick={() => setStep('details')} className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">Back to Details</button>
                <button onClick={handlePrintAndFinish} disabled={isSaving} className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed">
                  {isSaving ? "Saving..." : "Save, Finish & Print"}
                </button>
            </div>
        </div>
      </div>
    );
  }

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(processTransaction)} className="flex flex-col">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4 flex-grow">
          <CustomerInfoPanel />
          <PaymentPanel finalTotal={discountResult.finalTotal} />
        </div>
        <div className="flex-shrink-0 pt-4 mt-4 border-t flex justify-end gap-2">
          <button type="button" onClick={() => drawer.closeDrawer()} className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">Cancel</button>
          <button type="submit" disabled={isSaving || !isValid} className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed">
            {isSaving ? "Processing..." : "Confirm & Preview Receipt"}
          </button>
        </div>
      </form>
    </FormProvider>
  );
}
