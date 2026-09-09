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
  'dark navy': 'https://cdn.shopify.com/s/files/1/0562/9247/5063/files/knya_navy_close_up_scrub_top.jpg',
  black: 'https://cdn.shopify.com/s/files/1/0562/9247/5063/files/knya_black_close_up_scrub_top.jpg',
  'royal blue': 'https://cdn.shopify.com/s/files/1/0562/9247/5063/files/knya_royal_blue_close_up_scrub_top.jpg',
  wine: 'https://cdn.shopify.com/s/files/1/0562/9247/5063/files/knya_wine_close_up_scrub_top.jpg',
  burgundy: 'https://cdn.shopify.com/s/files/1/0562/9247/5063/files/knya_wine_close_up_scrub_top.jpg',
  maroon: 'https://cdn.shopify.com/s/files/1/0562/9247/5063/files/knya_wine_close_up_scrub_top.jpg',
  'ceil blue': 'https://cdn.shopify.com/s/files/1/0562/9247/5063/files/knya_ceil_blue_close_up_scrub_top.jpg',
  grey: 'https://cdn.shopify.com/s/files/1/0562/9247/5063/files/knya_navy_close_up_scrub_top.jpg',
  gray: 'https://cdn.shopify.com/s/files/1/0562/9247/5063/files/knya_navy_close_up_scrub_top.jpg',
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

  // Candidates list in priority fallback order
  const imageCandidates = React.useMemo(() => {
    const list: string[] = [];
    if (embroideryPreviewImage) list.push(embroideryPreviewImage);
    if (baseScrubImage) list.push(baseScrubImage);
    if (colorCloseUp) list.push(colorCloseUp);
    // Reliable high-resolution scrub top chest fallback
    list.push('https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=800&auto=format&fit=crop');
    return Array.from(new Set(list.filter(Boolean)));
  }, [embroideryPreviewImage, baseScrubImage, colorCloseUp]);

  const [currentImgIndex, setCurrentImgIndex] = React.useState(0);
  const [isImgLoading, setIsImgLoading] = React.useState(true);

  React.useEffect(() => {
    setCurrentImgIndex(0);
    setIsImgLoading(true);
  }, [embroideryPreviewImage, baseScrubImage, selectedColorName]);

  const activeSrc = imageCandidates[currentImgIndex] || imageCandidates[0];

  const handleImageError = () => {
    if (currentImgIndex < imageCandidates.length - 1) {
      setCurrentImgIndex((prev) => prev + 1);
    } else {
      setIsImgLoading(false);
    }
  };

  const textColorHex = textColorHexMap[customization.textColor] || '#FFFFFF';
  const fontStyleFamily = fontStyleFamilyMap[customization.fontStyle] || 'sans-serif';

  return (
    <div className="preview-container">
      {/* Background Scrub Image */}
      <div className="preview-img-wrapper">
        {isImgLoading && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0f172a', color: '#ffffff', zIndex: 2, gap: '12px' }}>
            <div style={{ width: '32px', height: '32px', border: '3px solid rgba(255,255,255,0.2)', borderTopColor: '#ffffff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#94a3b8', letterSpacing: '0.05em' }}>Loading Scrub Preview...</span>
          </div>
        )}
        <img
          key={activeSrc}
          src={activeSrc}
          alt={`Scrub top chest embroidery preview - ${selectedColorName}`}
          onLoad={() => setIsImgLoading(false)}
          onError={handleImageError}
          className="preview-scrub-img"
          style={{
            display: 'block',
            opacity: isImgLoading ? 0 : 1,
            transition: 'opacity 0.25s ease-in-out',
          }}
        />
      </div>

      {/* Top Left Close Button Overlay */}
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '12px',
            left: '12px',
            zIndex: 30,
            backgroundColor: '#ffffff',
            color: '#111827',
            fontWeight: 700,
            padding: '5px 10px',
            borderRadius: '6px',
            fontSize: '11px',
            border: '1px solid #e5e7eb',
            cursor: 'pointer',
            boxShadow: '0 2px 4px rgba(0,0,0,0.15)',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          <span>✕</span> CLOSE
        </button>
      )}

      {/* Embroidery Text Overlay - Positioned Directly Above Chest Pocket Seam & Tag */}
      <div className="preview-text-overlay">
        <div
          style={{
            border: '1px dashed rgba(255, 255, 255, 0.85)',
            borderRadius: '6px',
            padding: '6px 8px',
            backgroundColor: 'rgba(0, 0, 0, 0.45)',
            backdropFilter: 'blur(2px)',
            minHeight: '48px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
          }}
        >
          <div
            style={{
              fontSize: '9px',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: 'rgba(255, 255, 255, 0.85)',
              fontFamily: 'sans-serif',
              marginBottom: '2px',
              textAlign: 'center',
              fontWeight: 500,
            }}
          >
            Your Text Goes Here
          </div>

          {customization.line1 || customization.line2 ? (
            <div style={{ textAlign: 'center', overflow: 'hidden', lineHeight: 1.25 }}>
              {customization.line1 && (
                <div
                  style={{
                    fontSize: '13px',
                    fontWeight: 700,
                    color: textColorHex,
                    fontFamily: fontStyleFamily,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    textShadow: '0 1px 3px rgba(0, 0, 0, 0.9)',
                  }}
                >
                  {customization.line1}
                </div>
              )}
              {customization.line2 && (
                <div
                  style={{
                    fontSize: '11px',
                    fontWeight: 500,
                    color: textColorHex,
                    fontFamily: fontStyleFamily,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    marginTop: '2px',
                    opacity: 0.95,
                    textShadow: '0 1px 3px rgba(0, 0, 0, 0.9)',
                  }}
                >
                  {customization.line2}
                </div>
              )}
            </div>
          ) : (
            <div
              style={{
                color: 'rgba(255, 255, 255, 0.75)',
                fontSize: '10px',
                fontFamily: 'sans-serif',
                lineHeight: 1.3,
                textAlign: 'center',
              }}
            >
              <div style={{ fontWeight: 500 }}>Line 1 (Name)</div>
              <div style={{ fontWeight: 500 }}>Line 2 (Designation)</div>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .preview-container {
          position: relative;
          width: 100%;
          height: 100%;
          min-height: 320px;
          background-color: #0f172a;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          user-select: none;
        }
        .preview-img-wrapper {
          position: absolute;
          inset: 0;
          overflow: hidden;
          z-index: 1;
          background-color: #0f172a;
        }
        .preview-scrub-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center top;
        }
        .preview-text-overlay {
          position: absolute;
          top: 38%;
          left: 58%;
          width: 150px;
          z-index: 20;
          pointer-events: none;
        }

        @media (max-width: 767px) {
          .preview-container {
            min-height: 245px;
          }
          .preview-scrub-img {
            object-position: center 25%;
          }
          .preview-text-overlay {
            top: 42%;
            left: 56%;
            width: 145px;
          }
        }
      `}</style>
    </div>
  );
};
