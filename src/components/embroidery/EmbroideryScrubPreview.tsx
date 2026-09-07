'use client';

import React from 'react';
import { EmbroideryCustomizationState, FontStyleType, TextColorChoice } from '@/types/embroidery';

interface EmbroideryScrubPreviewProps {
  customization: EmbroideryCustomizationState;
  baseScrubImage?: string;
  selectedColorName?: string;
}

// Color hex mappings for preview overlay
const textColorHexMap: Record<TextColorChoice, string> = {
  white: '#FFFFFF',
  black: '#111827',
  yellow: '#FACC15',
  green: '#86EFAC',
  pink: '#F472B6',
};

// Font family mappings for preview overlay
const fontStyleFamilyMap: Record<FontStyleType, string> = {
  block: "'Inter', 'Arial Black', sans-serif",
  script: "'Brush Script MT', 'Dancing Script', cursive",
};

export const EmbroideryScrubPreview: React.FC<EmbroideryScrubPreviewProps> = ({
  customization,
  baseScrubImage,
  selectedColorName = 'Navy Blue',
}) => {
  // Default base image if none provided
  const scrubImage =
    baseScrubImage ||
    'https://cdn.shopify.com/s/files/1/0562/9247/5063/products/1_3a8c17b8-8e65-4fef-b5bb-413158f333fb.jpg?v=1700000000';

  const textColorHex = textColorHexMap[customization.textColor] || '#FFFFFF';
  const fontStyleFamily = fontStyleFamilyMap[customization.fontStyle] || 'sans-serif';

  return (
    <div className="relative w-full h-full min-h-[380px] bg-[#0A1128] overflow-hidden flex items-center justify-center select-none">
      {/* Background Scrub Image */}
      <img
        src={scrubImage}
        alt={`Scrub top preview - ${selectedColorName}`}
        className="w-full h-full object-cover object-top filter brightness-[0.98]"
        onError={(e) => {
          // Fallback image if image fails to load
          (e.target as HTMLImageElement).src =
            'https://cdn.shopify.com/s/files/1/0562/9247/5063/files/knya-scrub-placeholder.jpg';
        }}
      />

      {/* Top Left Close Indicator / Placement Overlay */}
      <div className="absolute top-4 left-4 z-10 bg-white/95 backdrop-blur-sm px-3 py-1 rounded shadow text-xs font-semibold tracking-wider text-gray-800 uppercase border border-gray-200">
        ✕ CLOSE
      </div>

      {/* Dynamic Chest Embroidery Preview Overlay */}
      <div className="absolute inset-0 z-20 pointer-events-none">
        {/* Right Chest Medical Icon / Logo Overlay (Viewer's Left side) */}
        <div className="absolute top-[34%] left-[16%] sm:left-[18%] w-[60px] sm:w-[80px] h-[60px] sm:h-[80px] flex items-center justify-center">
          {customization.customLogoUrl ? (
            <img
              src={customization.customLogoUrl}
              alt="Custom uploaded logo"
              className="max-w-full max-h-full object-contain filter drop-shadow"
            />
          ) : customization.selectedIconId === 'caduceus' ? (
            <svg
              viewBox="0 0 100 100"
              className="w-full h-full filter drop-shadow-md"
              fill={textColorHex}
            >
              {/* Caduceus SVG Emblem */}
              <path d="M50 5v90M50 15c-15 0-25 10-25 20s15 15 25 25c10-10 25-15 25-25s-10-20-25-20z" stroke={textColorHex} strokeWidth="3" fill="none" />
              <circle cx="50" cy="10" r="5" fill={textColorHex} />
              <path d="M30 25c10-5 25 0 35 0M25 45c15-5 30 0 40 0" stroke={textColorHex} strokeWidth="2.5" fill="none" />
            </svg>
          ) : customization.selectedIconId === 'heart' ? (
            <svg viewBox="0 0 24 24" className="w-10 h-10 filter drop-shadow" fill={textColorHex}>
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
          ) : customization.selectedIconId === 'stethoscope' ? (
            <svg viewBox="0 0 24 24" className="w-10 h-10 filter drop-shadow" fill={textColorHex}>
              <path d="M19 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm-7 14a8 8 0 0 1-8-8V4h2v10a6 6 0 0 0 12 0V4h2v10a8 8 0 0 1-8 8z" />
            </svg>
          ) : customization.selectedIconId === 'emergency' ? (
            <svg viewBox="0 0 24 24" className="w-10 h-10 filter drop-shadow" fill={textColorHex}>
              <path d="M10.5 2h3v6.3l5.5-3.2 1.5 2.6-5.5 3.2 5.5 3.2-1.5 2.6-5.5-3.2V22h-3v-6.3l-5.5 3.2-1.5-2.6 5.5-3.2-5.5-3.2 1.5-2.6 5.5 3.2V2z" />
            </svg>
          ) : null}
        </div>

        {/* Left Pocket / Chest Text Overlay (Viewer's Right side) */}
        <div className="absolute top-[35%] right-[16%] sm:right-[18%] w-[130px] sm:w-[160px]">
          {/* Dashed Guideline Box */}
          <div className="border border-dashed border-white/40 rounded p-2 bg-black/20 backdrop-blur-[1px] min-h-[50px] flex flex-col justify-center">
            <div className="text-[9px] uppercase tracking-widest text-gray-300 font-sans mb-0.5 text-left opacity-75">
              Your Text Goes Here
            </div>

            {customization.line1 || customization.line2 ? (
              <div className="leading-tight text-left overflow-hidden">
                {customization.line1 && (
                  <p
                    className="text-[13px] sm:text-[15px] font-semibold truncate tracking-wide"
                    style={{
                      color: textColorHex,
                      fontFamily: fontStyleFamily,
                    }}
                  >
                    {customization.line1}
                  </p>
                )}
                {customization.line2 && (
                  <p
                    className="text-[11px] sm:text-[13px] opacity-90 truncate tracking-wide mt-0.5"
                    style={{
                      color: textColorHex,
                      fontFamily: fontStyleFamily,
                    }}
                  >
                    {customization.line2}
                  </p>
                )}
              </div>
            ) : (
              <div className="text-gray-400 text-[11px] font-sans leading-tight">
                <p>Line 1</p>
                <p>Line 2</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
