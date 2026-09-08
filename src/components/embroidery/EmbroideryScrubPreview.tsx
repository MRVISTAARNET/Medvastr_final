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
    <div style={{ position: 'relative', width: '100%', height: '100%', minHeight: '320px', backgroundColor: '#f8fafc', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', userSelect: 'none' }}>
      {/* Background Scrub Close-Up Image */}
      <img
        src={scrubImage}
        alt={`Scrub top chest embroidery preview - ${selectedColorName}`}
        style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top', display: 'block' }}
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
        {/* Chest Pocket Text Overlay (Viewer's Right side - Positioned 100% directly over Chest Pocket) */}
        <div className="absolute top-[38%] sm:top-[40%] left-[55%] sm:left-[57%] w-[130px] sm:w-[145px]">
          {/* Dashed Guideline Box */}
          <div className="border border-dashed border-white/80 rounded-md p-1.5 bg-black/45 backdrop-blur-[2px] min-h-[46px] flex flex-col justify-center shadow-lg">
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
                      textShadow: '0 1px 3px rgba(0,0,0,0.9)',
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
                      textShadow: '0 1px 3px rgba(0,0,0,0.9)',
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
