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
      {/* Centered Desktop Panel */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '960px',
          height: '85vh',
          maxHeight: '540px',
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'row',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
          border: '1px solid #e5e7eb',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Left Panel (52% width): Scrub Live Preview */}
        <div style={{ width: '52%', height: '100%', position: 'relative', backgroundColor: '#0A1128', overflow: 'hidden', flexShrink: 0 }}>
          <EmbroideryScrubPreview
            customization={customization}
            baseScrubImage={baseScrubImage}
            embroideryPreviewImage={embroideryPreviewImage}
            selectedColorName={selectedColorName}
            onClose={onClose}
          />
        </div>

        {/* Right Panel (48% width): Configurator */}
        <div style={{ width: '48%', height: '100%', backgroundColor: '#ffffff', display: 'flex', flexDirection: 'column', overflowY: 'auto', flexShrink: 0 }}>
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
