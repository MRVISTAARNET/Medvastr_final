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
    <div className="embroidery-modal-backdrop animate-fadeIn" onClick={onClose}>
      <div className="embroidery-modal-panel" onClick={(e) => e.stopPropagation()}>
        {/* Left/Top Panel: Scrub Live Preview */}
        <div className="embroidery-modal-preview">
          <EmbroideryScrubPreview
            customization={customization}
            baseScrubImage={baseScrubImage}
            embroideryPreviewImage={embroideryPreviewImage}
            selectedColorName={selectedColorName}
            onClose={onClose}
          />
        </div>

        {/* Right/Bottom Panel: Configurator */}
        <div className="embroidery-modal-config">
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

      <style jsx>{`
        .embroidery-modal-backdrop {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 99999;
          background-color: rgba(0, 0, 0, 0.75);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 16px;
        }
        .embroidery-modal-panel {
          position: relative;
          width: 100%;
          max-width: 960px;
          height: 85vh;
          max-height: 540px;
          background-color: #ffffff;
          border-radius: 16px;
          overflow: hidden;
          display: flex;
          flex-direction: row;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.35);
          border: 1px solid #e5e7eb;
        }
        .embroidery-modal-preview {
          width: 52%;
          height: 100%;
          position: relative;
          background-color: #0A1128;
          overflow: hidden;
          flex-shrink: 0;
        }
        .embroidery-modal-config {
          width: 48%;
          height: 100%;
          background-color: #ffffff;
          display: flex;
          flex-direction: column;
          overflow-y: auto;
          flex-shrink: 0;
        }

        @media (max-width: 767px) {
          .embroidery-modal-backdrop {
            padding: 8px;
          }
          .embroidery-modal-panel {
            max-width: 100%;
            height: 92vh;
            max-height: 92vh;
            flex-direction: column;
          }
          .embroidery-modal-preview {
            width: 100%;
            height: 190px;
          }
          .embroidery-modal-config {
            width: 100%;
            flex: 1;
            height: auto;
            min-height: 0;
          }
        }
      `}</style>
    </div>
  );
};
