'use client';

import React, { useState } from 'react';
import {
  EmbroideryCustomizationState,
  EmbroideryOptionType,
  EmbroideryPrices,
} from '@/types/embroidery';
import { EmbroideryScrubPreview } from './EmbroideryScrubPreview';
import { EmbroiderySelection } from './EmbroiderySelection';
import { EmbroideryConfigurator } from './EmbroideryConfigurator';

interface EmbroideryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveCustomization: (customization: EmbroideryCustomizationState) => void;
  baseScrubImage?: string;
  embroideryPreviewImage?: string;
  selectedColorName?: string;
  customPrices?: Partial<EmbroideryPrices>;
}

const defaultPrices: EmbroideryPrices = {
  bundlePrice: 99,
  bundleOriginalPrice: 199,
  topPrice: 99,
  bottomPrice: 99,
  customLogoExtraPrice: 100,
};

const initialCustomizationState: EmbroideryCustomizationState = {
  selectedOption: 'bundle',
  line1: '',
  line2: '',
  fontStyle: 'block',
  textColor: 'white',
  selectedIconId: '',
  customLogoUrl: null,
  customLogoFileName: null,
  customLogoSize: null,
  textPositionPlacement: 'Left Chest',
  iconPositionPlacement: 'Right Chest',
  totalEmbroideryPrice: 99,
};

export const EmbroideryModal: React.FC<EmbroideryModalProps> = ({
  isOpen,
  onClose,
  onSaveCustomization,
  baseScrubImage,
  embroideryPreviewImage,
  selectedColorName,
  customPrices,
}) => {
  const [currentStep, setCurrentStep] = useState<'selection' | 'config'>('config');
  const [customization, setCustomization] = useState<EmbroideryCustomizationState>(
    initialCustomizationState
  );

  if (!isOpen) return null;

  const prices: EmbroideryPrices = {
    ...defaultPrices,
    ...customPrices,
  };

  const handleSelectOption = (option: EmbroideryOptionType) => {
    let price = prices.bundlePrice;
    if (option === 'top') price = prices.topPrice;
    if (option === 'bottom') price = prices.bottomPrice;

    setCustomization((prev) => ({
      ...prev,
      selectedOption: option,
      totalEmbroideryPrice: price,
    }));
    setCurrentStep('config');
  };

  const handleUpdateCustomization = (updated: Partial<EmbroideryCustomizationState>) => {
    setCustomization((prev) => {
      const next = { ...prev, ...updated };
      let price =
        next.selectedOption === 'bundle'
          ? prices.bundlePrice
          : next.selectedOption === 'top'
          ? prices.topPrice
          : prices.bottomPrice;

      if (next.customLogoUrl) {
        price += prices.customLogoExtraPrice;
      }
      return { ...next, totalEmbroideryPrice: price };
    });
  };

  const handleReset = () => {
    setCustomization({
      ...initialCustomizationState,
      selectedOption: customization.selectedOption,
      totalEmbroideryPrice:
        customization.selectedOption === 'bundle'
          ? prices.bundlePrice
          : customization.selectedOption === 'top'
          ? prices.topPrice
          : prices.bottomPrice,
    });
  };

  const handleProceed = () => {
    onSaveCustomization(customization);
    onClose();
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 99999,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
      }}
      className="animate-fadeIn"
      onClick={onClose}
    >
      {/* Responsive Panel Container (side-by-side on desktop, vertical stack on mobile) */}
      <div
        className="relative w-full max-w-[960px] h-[92vh] md:h-[85vh] max-h-[92vh] md:max-h-[540px] bg-white rounded-2xl overflow-hidden flex flex-col md:flex-row shadow-2xl border border-gray-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top/Left Panel: Scrub Live Preview */}
        <div className="w-full md:w-[52%] h-[230px] sm:h-[260px] md:h-full relative bg-[#0A1128] overflow-hidden flex-shrink-0">
          <EmbroideryScrubPreview
            customization={customization}
            baseScrubImage={baseScrubImage}
            embroideryPreviewImage={embroideryPreviewImage}
            selectedColorName={selectedColorName}
            onClose={onClose}
          />
        </div>

        {/* Bottom/Right Panel: Configurator */}
        <div className="w-full md:w-[48%] flex-1 md:h-full bg-white flex flex-col overflow-y-auto flex-shrink-0 min-h-0">
          {currentStep === 'selection' ? (
            <EmbroiderySelection
              selectedOption={customization.selectedOption}
              prices={prices}
              onSelectOption={handleSelectOption}
            />
          ) : (
            <EmbroideryConfigurator
              customization={customization}
              prices={prices}
              onChangeCustomization={handleUpdateCustomization}
              onBack={onClose}
              onReset={handleReset}
              onProceed={handleProceed}
            />
          )}
        </div>
      </div>
    </div>
  );
};
