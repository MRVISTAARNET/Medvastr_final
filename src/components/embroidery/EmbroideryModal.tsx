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
  const [currentStep, setCurrentStep] = useState<'selection' | 'config'>('selection');
  const [customization, setCustomization] = useState<EmbroideryCustomizationState>(
    initialCustomizationState
  );

  if (!isOpen) return null;

  const prices: EmbroideryPrices = {
    ...defaultPrices,
    ...customPrices,
  };

  // Select option in Screen 2 -> Transition to Screen 3
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
      // Recalculate price if custom logo added
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/70 backdrop-blur-xs animate-fadeIn">
      {/* Centered Desktop Panel (1080px x 540px) */}
      <div className="relative w-full max-w-[1080px] h-[90vh] max-h-[580px] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row border border-gray-100">
        {/* Left Panel (55-60% width on desktop): Scrub Live Preview */}
        <div className="w-full md:w-[58%] h-[240px] md:h-full relative bg-[#0A1128]">
          <EmbroideryScrubPreview
            customization={customization}
            baseScrubImage={baseScrubImage}
            embroideryPreviewImage={embroideryPreviewImage}
            selectedColorName={selectedColorName}
          />
        </div>

        {/* Right Panel (40-45% width on desktop): Selection or Configurator */}
        <div className="w-full md:w-[42%] h-full flex flex-col bg-white overflow-hidden">
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
              onBack={() => setCurrentStep('selection')}
              onReset={handleReset}
              onProceed={handleProceed}
            />
          )}
        </div>
      </div>
    </div>
  );
};
