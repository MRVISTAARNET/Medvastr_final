'use client';

import React from 'react';
import { EmbroideryCustomizationState } from '@/types/embroidery';

interface EmbroideryCardProps {
  isEmbroiderySelected: boolean;
  onToggleAddEmbroidery: (add: boolean) => void;
  customization: EmbroideryCustomizationState | null;
  onOpenModal: () => void;
  onDeleteEmbroidery: () => void;
}

export const EmbroideryCard: React.FC<EmbroideryCardProps> = ({
  isEmbroiderySelected,
  onToggleAddEmbroidery,
  customization,
  onOpenModal,
  onDeleteEmbroidery,
}) => {
  return (
    <div className="w-full my-4 font-sans text-gray-900 select-none">
      {/* Embroidery Card Wrapper */}
      <div className="rounded-xl overflow-hidden shadow-sm border border-gray-200 bg-white">
        {/* Purple Branding Header */}
        <div
          onClick={onOpenModal}
          className="bg-[#462D8C] text-white p-3.5 sm:p-4 cursor-pointer flex items-center gap-3 transition-opacity hover:opacity-95"
        >
          {/* Pencil / Embroidery Icon */}
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/15 flex items-center justify-center flex-shrink-0">
            <span className="text-xl">✏️</span>
          </div>

          <div className="flex-1">
            <h3 className="font-semibold text-base sm:text-lg text-white leading-tight tracking-wide">
              Custom Embroidery
            </h3>
            <p className="text-xs sm:text-sm text-[#E0D8F3] font-medium mt-0.5">
              Starting at ₹99 personalise your scrubs
            </p>
          </div>
        </div>

        {/* Content Area: Not Configured Yet vs Configured */}
        {!isEmbroiderySelected || !customization || (!customization.line1 && !customization.selectedIconId && !customization.customLogoUrl) ? (
          <div className="bg-[#F9F9FB] p-3.5 sm:p-4 space-y-2.5">
            {/* Option 1: Add Embroidery */}
            <div
              onClick={() => {
                onToggleAddEmbroidery(true);
                onOpenModal();
              }}
              className="flex items-start gap-3 p-3 rounded-lg border border-transparent hover:bg-[#F0EBFA] cursor-pointer transition"
            >
              <input
                type="radio"
                id="showEmb"
                name="embroidery"
                checked={isEmbroiderySelected}
                onChange={() => {
                  onToggleAddEmbroidery(true);
                  onOpenModal();
                }}
                className="mt-1 w-4 h-4 accent-[#462D8C] cursor-pointer flex-shrink-0"
              />
              <label htmlFor="showEmb" className="cursor-pointer flex-1">
                <span className="block font-bold text-[#462D8C] text-sm sm:text-base leading-tight">
                  Add Embroidery
                </span>
                <span className="block text-xs text-[#554e65] mt-1 leading-normal">
                  Make it yours - name, hospital logo, or icon
                </span>
              </label>
            </div>

            {/* Option 2: Skip for Now */}
            <div
              onClick={() => onToggleAddEmbroidery(false)}
              className="flex items-start gap-3 p-3 rounded-lg border border-transparent hover:bg-gray-100 cursor-pointer transition"
            >
              <input
                type="radio"
                id="dontShowEmbroidery"
                name="embroidery"
                checked={!isEmbroiderySelected}
                onChange={() => onToggleAddEmbroidery(false)}
                className="mt-1 w-4 h-4 accent-[#462D8C] cursor-pointer flex-shrink-0"
              />
              <label htmlFor="dontShowEmbroidery" className="cursor-pointer flex-1">
                <span className="block font-bold text-[#462D8C] text-sm sm:text-base leading-tight">
                  Skip for Now
                </span>
                <span className="block text-xs text-[#554e65] mt-1 leading-normal">
                  and risk misplacing your scrubs
                </span>
              </label>
            </div>
          </div>
        ) : (
          /* Configured Summary View */
          <div className="bg-[#F7F1FF] p-4 border-t border-[#E0D8F3]">
            <div className="flex items-center justify-between border-b border-[#D4C6EF] pb-3 mb-3">
              <div className="flex items-center gap-2">
                <span className="text-base">✨</span>
                <span className="font-bold text-[#462D8C] text-sm sm:text-base">
                  Custom Embroidery Configured
                </span>
              </div>

              <div className="flex items-center gap-2.5">
                <span className="font-bold text-gray-900 text-base">
                  ₹{customization.totalEmbroideryPrice}
                </span>

                <button
                  onClick={onOpenModal}
                  className="text-xs font-bold text-[#462D8C] hover:underline px-2.5 py-1 rounded bg-white border border-[#462D8C]/30 shadow-xs"
                >
                  EDIT
                </button>

                <button
                  onClick={onDeleteEmbroidery}
                  className="text-gray-400 hover:text-rose-600 transition p-1 text-sm"
                  title="Remove Embroidery"
                >
                  🗑️
                </button>
              </div>
            </div>

            {/* Customization Details Breakdown */}
            <div className="text-xs text-gray-700 space-y-1 bg-white/80 p-3 rounded-lg border border-[#E0D8F3]">
              <div className="flex justify-between">
                <span className="font-semibold text-gray-500">Option:</span>
                <span className="font-bold capitalize text-gray-900">
                  {customization.selectedOption} Embroidery
                </span>
              </div>

              {customization.line1 && (
                <div className="flex justify-between">
                  <span className="font-semibold text-gray-500">Text Line 1:</span>
                  <span className="font-medium text-gray-900">{customization.line1}</span>
                </div>
              )}

              {customization.line2 && (
                <div className="flex justify-between">
                  <span className="font-semibold text-gray-500">Text Line 2:</span>
                  <span className="font-medium text-gray-900">{customization.line2}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span className="font-semibold text-gray-500">Font & Color:</span>
                <span className="font-medium capitalize text-gray-900">
                  {customization.fontStyle} | {customization.textColor}
                </span>
              </div>

              {customization.selectedIconId && (
                <div className="flex justify-between">
                  <span className="font-semibold text-gray-500">Icon:</span>
                  <span className="font-medium capitalize text-gray-900">
                    {customization.selectedIconId}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
