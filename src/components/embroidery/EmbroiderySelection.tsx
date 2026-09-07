'use client';

import React from 'react';
import { EmbroideryOptionType, EmbroideryPrices } from '@/types/embroidery';

interface EmbroiderySelectionProps {
  selectedOption: EmbroideryOptionType;
  prices: EmbroideryPrices;
  onSelectOption: (option: EmbroideryOptionType) => void;
}

export const EmbroiderySelection: React.FC<EmbroiderySelectionProps> = ({
  selectedOption,
  prices,
  onSelectOption,
}) => {
  return (
    <div className="w-full h-full flex flex-col justify-between p-6 sm:p-8 bg-white font-sans">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6 text-center sm:text-left">
          Add Your Identity
        </h2>

        <div className="space-y-4">
          {/* 1. Full Set Embroidery Bundle Option */}
          <div
            onClick={() => onSelectOption('bundle')}
            className={`relative border-2 rounded-xl p-4 sm:p-5 cursor-pointer transition-all duration-200 ${
              selectedOption === 'bundle'
                ? 'border-[#462D8C] bg-[#F7F1FF] shadow-sm'
                : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={selectedOption === 'bundle'}
                  onChange={() => onSelectOption('bundle')}
                  className="w-5 h-5 accent-[#462D8C] cursor-pointer rounded"
                />
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-gray-900 text-base sm:text-lg">
                    Full Set Custom Embroidery
                  </span>
                  <span className="bg-emerald-100 text-emerald-800 text-xs font-semibold px-2.5 py-0.5 rounded border border-emerald-300">
                    Promotional Offer
                  </span>
                </div>
              </div>

              <div className="text-right">
                <span className="line-through text-gray-400 text-sm mr-1.5 font-medium">
                  ₹{prices.bundleOriginalPrice}
                </span>
                <span className="font-bold text-gray-900 text-lg sm:text-xl">
                  ₹{prices.bundlePrice}
                </span>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-gray-600 mt-2 ml-8 leading-relaxed">
              Custom Name & Designation/Title + Icon stitched on your scrub
            </p>
          </div>

          {/* Commented out individual Top & Bottom Embroidery options for now per user request */}
          {/*
          <div className="relative my-2 flex items-center justify-center">
            <div className="border-t border-gray-200 w-full"></div>
            <span className="bg-white px-3 text-xs uppercase text-gray-400 font-semibold absolute">
              or
            </span>
          </div>

          <div
            onClick={() => onSelectOption('top')}
            className="relative border-2 rounded-xl p-4 sm:p-5 cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <span className="font-semibold text-gray-900 text-base">Top Embroidery</span>
              <span className="font-bold text-gray-900">₹{prices.topPrice}</span>
            </div>
          </div>

          <div
            onClick={() => onSelectOption('bottom')}
            className="relative border-2 rounded-xl p-4 sm:p-5 cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <span className="font-semibold text-gray-900 text-base">Bottom Embroidery</span>
              <span className="font-bold text-gray-900">₹{prices.bottomPrice}</span>
            </div>
          </div>
          */}
        </div>
      </div>
    </div>
  );
};
