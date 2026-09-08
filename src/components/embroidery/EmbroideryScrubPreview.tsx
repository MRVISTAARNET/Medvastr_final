'use client';

import React from 'react';
import { EmbroideryCustomizationState, FontStyleType, TextColorChoice } from '@/types/embroidery';

interface EmbroideryScrubPreviewProps {
  customization: EmbroideryCustomizationState;
  baseScrubImage?: string;
  embroideryPreviewImage?: string;
  selectedColorName?: string;
  onClose?: () => void;
}

// Dedicated high-resolution close-up scrub top chest images by color
const closeUpScrubImageMap: Record<string, string> = {
  'navy blue': 'https://cdn.shopify.com/s/files/1/0562/9247/5063/files/knya_navy_close_up_scrub_top.jpg',
  navy: 'https://cdn.shopify.com/s/files/1/0562/9247/5063/files/knya_navy_close_up_scrub_top.jpg',
  black: 'https://cdn.shopify.com/s/files/1/0562/9247/5063/files/knya_black_close_up_scrub_top.jpg',
  'royal blue': 'https://cdn.shopify.com/s/files/1/0562/9247/5063/files/knya_royal_blue_close_up_scrub_top.jpg',
  wine: 'https://cdn.shopify.com/s/files/1/0562/9247/5063/files/knya_wine_close_up_scrub_top.jpg',
  burgundy: 'https://cdn.shopify.com/s/files/1/0562/9247/5063/files/knya_wine_close_up_scrub_top.jpg',
  'ceil blue': 'https://cdn.shopify.com/s/files/1/0562/9247/5063/files/knya_ceil_blue_close_up_scrub_top.jpg',
};

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
  embroideryPreviewImage,
  selectedColorName = 'Navy Blue',
  onClose,
}) => {
  const normalizedColor = selectedColorName.toLowerCase().trim();
  const colorCloseUp = closeUpScrubImageMap[normalizedColor];

  const scrubImage =
    embroideryPreviewImage ||
    baseScrubImage ||
    colorCloseUp ||
    'https://cdn.shopify.com/s/files/1/0562/9247/5063/products/1_3a8c17b8-8e65-4fef-b5bb-413158f333fb.jpg?v=1700000000';

  const textColorHex = textColorHexMap[customization.textColor] || '#FFFFFF';
  const fontStyleFamily = fontStyleFamilyMap[customization.fontStyle] || 'sans-serif';

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', minHeight: '320px', backgroundColor: '#0A1128', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', userSelect: 'none' }}>
      {/* Background Scrub Close-Up Image */}
      <img
        src={scrubImage}
        alt={`Scrub top chest embroidery preview - ${selectedColorName}`}
        style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center', display: 'block' }}
        onError={(e) => {
          (e.target as HTMLImageElement).src =
            'https://cdn.shopify.com/s/files/1/0562/9247/5063/products/1_3a8c17b8-8e65-4fef-b5bb-413158f333fb.jpg?v=1700000000';
        }}
      />

      {/* Top Left Close Button Overlay */}
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            left: '16px',
            zIndex: 30,
            backgroundColor: '#ffffff',
            color: '#111827',
            fontWeight: 700,
            padding: '6px 12px',
            borderRadius: '6px',
            fontSize: '12px',
            border: '1px solid #e5e7eb',
            cursor: 'pointer',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <span>✕</span> CLOSE
        </button>
      )}
      <div className="absolute inset-0 z-20 pointer-events-none">
        {/* Right Chest Medical Icon / Logo Overlay (Viewer's Left side) */}
        <div className="absolute top-[32%] sm:top-[34%] left-[22%] sm:left-[24%] w-[60px] sm:w-[75px] h-[60px] sm:h-[75px] flex items-center justify-center">
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

        {/* Left Pocket / Chest Text Overlay (Viewer's Right side - Positioned directly over Chest Pocket) */}
        <div className="absolute top-[37%] sm:top-[39%] right-[28%] sm:right-[31%] w-[125px] sm:w-[145px]">
          {/* Dashed Guideline Box */}
          <div className="border border-dashed border-white/70 rounded-md p-1.5 bg-black/30 backdrop-blur-[2px] min-h-[46px] flex flex-col justify-center shadow-md">
            <div className="text-[8.5px] uppercase tracking-widest text-gray-200 font-sans mb-0.5 text-center font-medium opacity-90">
              Your Text Goes Here
            </div>

            {customization.line1 || customization.line2 ? (
              <div className="leading-tight text-center overflow-hidden">
                {customization.line1 && (
                  <p
                    className="text-[12px] sm:text-[14px] font-bold truncate tracking-wide"
                    style={{
                      color: textColorHex,
                      fontFamily: fontStyleFamily,
                      textShadow: '0 1px 3px rgba(0,0,0,0.8)',
                    }}
                  >
                    {customization.line1}
                  </p>
                )}
                {customization.line2 && (
                  <p
                    className="text-[10px] sm:text-[12px] opacity-95 truncate tracking-wide mt-0.5 font-medium"
                    style={{
                      color: textColorHex,
                      fontFamily: fontStyleFamily,
                      textShadow: '0 1px 3px rgba(0,0,0,0.8)',
                    }}
                  >
                    {customization.line2}
                  </p>
                )}
              </div>
            ) : (
              <div className="text-gray-300 text-[10px] font-sans leading-tight text-center opacity-90">
                <p className="font-medium">Line 1 (Name)</p>
                <p className="font-medium">Line 2 (Designation)</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
