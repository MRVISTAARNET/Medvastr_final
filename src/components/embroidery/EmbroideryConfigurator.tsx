'use client';

import React, { useState } from 'react';
import {
  EmbroideryCustomizationState,
  EmbroideryOptionType,
  EmbroideryPrices,
  FontStyleType,
  TextColorChoice,
} from '@/types/embroidery';

interface EmbroideryConfiguratorProps {
  customization: EmbroideryCustomizationState;
  prices: EmbroideryPrices;
  onChangeCustomization: (updated: Partial<EmbroideryCustomizationState>) => void;
  onBack: () => void;
  onReset: () => void;
  onProceed: () => void;
}

// Icon list definition
const classicIcons = [
  { id: 'caduceus', name: 'Caduceus', symbol: '⚕️' },
  { id: 'heart', name: 'Heart', symbol: '🫀' },
  { id: 'stethoscope', name: 'Stethoscope', symbol: '🩺' },
  { id: 'rn', name: 'RN Badge', symbol: '🥼' },
  { id: 'cross', name: 'Red Cross', symbol: '➕' },
  { id: 'emergency', name: 'Star of Life', symbol: '✳️' },
  { id: 'tooth', name: 'Tooth', symbol: '🦷' },
  { id: 'syringe', name: 'Syringe', symbol: '💉' },
  { id: 'ecg', name: 'ECG Monitor', symbol: '📈' },
];

const limitedIcons = [
  { id: 'organ', name: 'Anatomy', symbol: '🫁' },
  { id: 'kidney', name: 'Kidney', symbol: '🧬' },
  { id: 'injection', name: 'Care Syringe', symbol: '🧪' },
  { id: 'smile_tooth', name: 'Smile Tooth', symbol: '😃' },
  { id: 'flag_india', name: 'India Flag', symbol: '🇮🇳' },
];

export const EmbroideryConfigurator: React.FC<EmbroideryConfiguratorProps> = ({
  customization,
  prices,
  onChangeCustomization,
  onBack,
  onReset,
  onProceed,
}) => {
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Current title based on option
  const optionTitle =
    customization.selectedOption === 'bundle'
      ? 'Embroidery Bundle'
      : customization.selectedOption === 'top'
      ? 'Top Embroidery'
      : 'Bottom Embroidery';

  // Handle Logo Upload Validation
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    // Check format (JPG/JPEG)
    if (!['image/jpeg', 'image/jpg'].includes(file.type.toLowerCase())) {
      setUploadError('Uploaded file must be JPG or JPEG format.');
      return;
    }

    // Check 5MB limit
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('File size exceeds 5MB limit.');
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    onChangeCustomization({
      customLogoUrl: objectUrl,
      customLogoFileName: file.name,
      customLogoSize: file.size,
    });
  };

  return (
    <div className="w-full h-full flex flex-col justify-between bg-white font-sans overflow-y-auto p-5 sm:p-6 text-gray-800">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-gray-200 pb-3 mb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-700 transition"
            title="Back"
          >
            ←
          </button>
          <h2 className="text-lg sm:text-xl font-bold text-gray-900">{optionTitle}</h2>
        </div>

        <div className="text-right">
          {customization.selectedOption === 'bundle' && (
            <span className="line-through text-gray-400 text-xs sm:text-sm mr-1.5 font-medium">
              ₹{prices.bundleOriginalPrice}
            </span>
          )}
          <span className="font-bold text-gray-900 text-base sm:text-lg">
            ₹
            {customization.selectedOption === 'bundle'
              ? prices.bundlePrice
              : customization.selectedOption === 'top'
              ? prices.topPrice
              : prices.bottomPrice}
          </span>
        </div>
      </div>

      <div className="space-y-5 flex-1 pr-1">
        {/* Selected Embroidery Summary Bar */}
        <div className="text-xs sm:text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded-md flex justify-between items-center">
          <span>
            <strong>Embroidery Selected:</strong>{' '}
            {customization.selectedOption === 'bundle'
              ? 'Both Text + Icon'
              : customization.selectedOption === 'top'
              ? 'Top Text / Icon'
              : 'Bottom Text'}
          </span>
        </div>

        {/* SECTION: Add Text */}
        <div className="bg-[#F8F9FA] p-4 rounded-xl space-y-4">
          <h3 className="font-semibold text-gray-900 text-sm sm:text-base">Add Text</h3>

          {/* Line 1 (Name) */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Text</label>
            <div className="relative">
              <input
                type="text"
                maxLength={22}
                value={customization.line1}
                onChange={(e) => onChangeCustomization({ line1: e.target.value })}
                placeholder="Line 1 (Name)"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-16 text-sm focus:outline-none focus:border-[#462D8C] bg-white text-gray-900"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                <span className="bg-gray-100 text-gray-600 text-[10px] font-bold px-1.5 py-0.5 rounded border border-gray-300">
                  Aa
                </span>
              </div>
            </div>
            <div className="flex justify-between items-center mt-1 text-[11px]">
              <span className="text-emerald-600 font-medium">
                {customization.selectedOption === 'bundle'
                  ? '*on both top and bottom'
                  : '*on scrub top'}
              </span>
              <span className="text-gray-400">{customization.line1.length}/22</span>
            </div>
          </div>

          {/* Line 2 (Designation) - Not needed for bottom-only */}
          {customization.selectedOption !== 'bottom' && (
            <div>
              <div className="relative">
                <input
                  type="text"
                  maxLength={22}
                  value={customization.line2}
                  onChange={(e) => onChangeCustomization({ line2: e.target.value })}
                  placeholder="Line 2 (Designation)"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-16 text-sm focus:outline-none focus:border-[#462D8C] bg-white text-gray-900"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                  <span className="bg-gray-100 text-gray-600 text-[10px] font-bold px-1.5 py-0.5 rounded border border-gray-300">
                    Aa
                  </span>
                </div>
              </div>
              <div className="flex justify-between items-center mt-1 text-[11px]">
                <span className="text-gray-500">*on top only</span>
                <span className="text-gray-400">{customization.line2.length}/22</span>
              </div>
            </div>
          )}

          {/* Text Color Selector */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-2">
              Text Color: <span className="capitalize font-normal text-gray-600">{customization.textColor}</span>
            </label>
            <div className="flex items-center gap-3">
              {(['white', 'black', 'yellow', 'green', 'pink'] as TextColorChoice[]).map((col) => {
                const bgClassMap: Record<TextColorChoice, string> = {
                  white: 'bg-white border-gray-400',
                  black: 'bg-black border-black',
                  yellow: 'bg-yellow-400 border-yellow-400',
                  green: 'bg-green-300 border-green-300',
                  pink: 'bg-pink-400 border-pink-400',
                };
                return (
                  <button
                    key={col}
                    onClick={() => onChangeCustomization({ textColor: col })}
                    className={`w-7 h-7 rounded-full border-2 transition-all ${bgClassMap[col]} ${
                      customization.textColor === col
                        ? 'ring-2 ring-offset-2 ring-[#462D8C] scale-110'
                        : 'opacity-80 hover:opacity-100'
                    }`}
                    title={col}
                  />
                );
              })}
            </div>
          </div>

          {/* Font Type Toggle */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-2">Font Type:</label>
            <div className="flex items-center gap-3">
              <button
                onClick={() => onChangeCustomization({ fontStyle: 'block' })}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition ${
                  customization.fontStyle === 'block'
                    ? 'bg-[#262626] text-white shadow'
                    : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                AA Block
              </button>
              <button
                onClick={() => onChangeCustomization({ fontStyle: 'script' })}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition font-serif italic ${
                  customization.fontStyle === 'script'
                    ? 'bg-[#262626] text-white shadow'
                    : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                Aa Script
              </button>
            </div>
          </div>

          {/* Purple info notice box */}
          <div className="bg-[#F0EBFA] border border-[#DCD0F5] text-[#462D8C] text-xs px-3 py-2 rounded-lg font-medium">
            Name (First Line) added on bottom scrub
          </div>
        </div>

        {/* Commented out Logo / Icon Section for now per user request */}
        {/*
        {customization.selectedOption !== 'bottom' && (
          <div className="bg-[#F8F9FA] p-4 rounded-xl space-y-4">
            <h3 className="font-semibold text-gray-900 text-sm sm:text-base">Add Logo / Icon</h3>

            <div>
              <p className="text-xs font-semibold text-gray-600 mb-2">Classic Icons:</p>
              <div className="grid grid-cols-5 gap-2">
                {classicIcons.map((ic) => (
                  <button
                    key={ic.id}
                    onClick={() =>
                      onChangeCustomization({
                        selectedIconId: ic.id,
                        customLogoUrl: null,
                      })
                    }
                    className={`h-12 rounded-lg border flex flex-col items-center justify-center transition bg-white text-xl ${
                      customization.selectedIconId === ic.id && !customization.customLogoUrl
                        ? 'border-2 border-[#462D8C] bg-[#F7F1FF] shadow-sm scale-105'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    title={ic.name}
                  >
                    <span>{ic.symbol}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
        */}
      </div>

      {/* Bottom Action Bar */}
      <div className="flex items-center justify-between gap-4 pt-4 mt-2 border-t border-gray-200">
        <button
          onClick={onReset}
          className="px-5 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-bold text-xs sm:text-sm hover:bg-gray-50 transition"
        >
          RESET
        </button>
        <button
          onClick={onProceed}
          className="flex-1 py-2.5 rounded-lg bg-[#462D8C] text-white font-bold text-xs sm:text-sm shadow hover:bg-[#392375] transition"
        >
          PROCEED
        </button>
      </div>
    </div>
  );
};
