// src/components/POSUI/CampaignSelector.tsx
import React from 'react';
import { DiscountSet } from '../../discount-engine/utils/types';


interface CampaignSelectorProps {
  activeCampaign: DiscountSet;
  allCampaigns: DiscountSet[];
  onCampaignChange: (campaign: DiscountSet) => void;
}

const CampaignSelector: React.FC<CampaignSelectorProps> = ({
  activeCampaign,
  allCampaigns,
  onCampaignChange,
}) => {
  return (
    <div>
      <label htmlFor="campaign-selector" className="block text-sm font-medium text-gray-700 mb-2">
        Active Discount Campaign
      </label>
      <div className="relative">
        <select
          id="campaign-selector"
          value={activeCampaign.id}
          onChange={(e) => {
            const selectedCampaign = allCampaigns.find((c) => c.id === e.target.value);
            if (selectedCampaign) {
              onCampaignChange(selectedCampaign);
            }
          }}
          className="w-full h-12 appearance-none rounded-md border border-gray-300 bg-white px-4 py-3 text-base shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
        >
          {allCampaigns.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500">
          <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fillRule="evenodd" d="M10 3a1 1 0 01.707.293l3 3a1 1 0 01-1.414 1.414L10 5.414 7.707 7.707a1 1 0 01-1.414-1.414l3-3A1 1 0 0110 3zm-3.707 9.293a1 1 0 011.414 0L10 14.586l2.293-2.293a1 1 0 011.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </span>
      </div>
    </div>
  );
};

export default CampaignSelector;
