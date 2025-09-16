// src/components/transaction/PrintPreview.tsx
import React from 'react';

import { ThermalReceipt } from './receipt-templates/ThermalReceipt';
import { DatabaseReadyTransaction } from '@/app/Shop/discount-engine/utils/pos-data-transformer';

interface PrintPreviewProps {
  data: DatabaseReadyTransaction;
  showAsGiftReceipt: boolean; // Add prop to control billing mode
}

export function PrintPreview({ data, showAsGiftReceipt }: PrintPreviewProps) {
  return (
    <div className="w-full h-full p-4 bg-white shadow-md rounded-md overflow-y-scroll">
      {/* 
        Pass the live toggle state `showAsGiftReceipt` to the ThermalReceipt.
        This ensures the receipt preview updates in real-time when the toggle is clicked.
        The ThermalReceipt component will prioritize this prop over the saved data.
      */}
      <ThermalReceipt data={data} showAsGiftReceipt={showAsGiftReceipt} />
    </div>
  );
}
