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
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', backgroundColor: '#ffffff', fontFamily: 'sans-serif', padding: '20px', color: '#0f172a', boxSizing: 'border-box' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={onBack}
            style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#f1f5f9', border: '1px solid #cbd5e1', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#334155', fontSize: '16px' }}
            title="Back"
          >
            ←
          </button>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a', margin: 0 }}>{optionTitle}</h2>
        </div>

        <div style={{ textAlign: 'right' }}>
          {customization.selectedOption === 'bundle' && (
            <span style={{ textDecoration: 'line-through', color: '#94a3b8', fontSize: '13px', marginRight: '6px', fontWeight: 500 }}>
              ₹{prices.bundleOriginalPrice}
            </span>
          )}
          <span style={{ fontWeight: 700, color: '#0f172a', fontSize: '18px' }}>
            ₹
            {customization.selectedOption === 'bundle'
              ? prices.bundlePrice
              : customization.selectedOption === 'top'
              ? prices.topPrice
              : prices.bottomPrice}
          </span>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', flex: 1, overflowY: 'auto', paddingRight: '4px' }}>
        {/* Selected Embroidery Summary Bar */}
        <div style={{ fontSize: '13px', color: '#475569', backgroundColor: '#f8fafc', padding: '10px 14px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
          <strong>Embroidery Selected:</strong>{' '}
          {customization.selectedOption === 'bundle'
            ? 'Text Embroidery (Top & Bottom)'
            : customization.selectedOption === 'top'
            ? 'Text Embroidery (Top Only)'
            : 'Text Embroidery (Bottom Only)'}
        </div>

        {/* SECTION: Add Text */}
        <div style={{ backgroundColor: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <h3 style={{ fontWeight: 700, color: '#0f172a', fontSize: '15px', margin: 0 }}>Add Text</h3>

          {/* Line 1 (Name) */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>Text</label>
            <div style={{ position: 'relative', width: '100%' }}>
              <input
                type="text"
                maxLength={22}
                value={customization.line1}
                onChange={(e) => onChangeCustomization({ line1: e.target.value })}
                placeholder="Line 1 (Name)"
                style={{ width: '100%', border: '1.5px solid #cbd5e1', borderRadius: '8px', padding: '8px 45px 8px 12px', fontSize: '14px', outline: 'none', backgroundColor: '#ffffff', color: '#0f172a', boxSizing: 'border-box' }}
              />
              <div style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
                <span style={{ backgroundColor: '#f1f5f9', color: '#475569', fontSize: '10px', fontWeight: 700, padding: '2px 6px', borderRadius: '4px', border: '1px solid #cbd5e1' }}>
                  Aa
                </span>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px', fontSize: '11px' }}>
              <span style={{ color: '#059669', fontWeight: 600 }}>
                {customization.selectedOption === 'bundle'
                  ? '*on both top and bottom'
                  : '*on scrub top'}
              </span>
              <span style={{ color: '#94a3b8' }}>{customization.line1.length}/22</span>
            </div>
          </div>

          {/* Line 2 (Designation) */}
          {customization.selectedOption !== 'bottom' && (
            <div>
              <div style={{ position: 'relative', width: '100%' }}>
                <input
                  type="text"
                  maxLength={22}
                  value={customization.line2}
                  onChange={(e) => onChangeCustomization({ line2: e.target.value })}
                  placeholder="Line 2 (Designation)"
                  style={{ width: '100%', border: '1.5px solid #cbd5e1', borderRadius: '8px', padding: '8px 45px 8px 12px', fontSize: '14px', outline: 'none', backgroundColor: '#ffffff', color: '#0f172a', boxSizing: 'border-box' }}
                />
                <div style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
                  <span style={{ backgroundColor: '#f1f5f9', color: '#475569', fontSize: '10px', fontWeight: 700, padding: '2px 6px', borderRadius: '4px', border: '1px solid #cbd5e1' }}>
                    Aa
                  </span>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px', fontSize: '11px' }}>
                <span style={{ color: '#64748b' }}>*on top only</span>
                <span style={{ color: '#94a3b8' }}>{customization.line2.length}/22</span>
              </div>
            </div>
          )}

          {/* Text Color Selector */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
              Text Color: <span style={{ textTransform: 'capitalize', fontWeight: 400, color: '#64748b' }}>{customization.textColor}</span>
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {(['white', 'black', 'yellow', 'green', 'pink'] as TextColorChoice[]).map((col) => {
                const bgMap: Record<TextColorChoice, string> = {
                  white: '#FFFFFF',
                  black: '#111827',
                  yellow: '#FACC15',
                  green: '#86EFAC',
                  pink: '#F472B6',
                };
                const borderMap: Record<TextColorChoice, string> = {
                  white: '#94a3b8',
                  black: '#111827',
                  yellow: '#EAB308',
                  green: '#4ADE80',
                  pink: '#EC4899',
                };
                const isSel = customization.textColor === col;
                return (
                  <button
                    key={col}
                    type="button"
                    onClick={() => onChangeCustomization({ textColor: col })}
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      backgroundColor: bgMap[col],
                      border: `2px solid ${borderMap[col]}`,
                      cursor: 'pointer',
                      boxShadow: isSel ? '0 0 0 2px #1e1b4b' : 'none',
                      transform: isSel ? 'scale(1.1)' : 'scale(1)',
                      transition: 'all 0.15s ease',
                    }}
                    title={col}
                  />
                );
              })}
            </div>
          </div>

          {/* Font Type Toggle */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>Font Type:</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <button
                type="button"
                onClick={() => onChangeCustomization({ fontStyle: 'block' })}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  backgroundColor: customization.fontStyle === 'block' ? '#1e1b4b' : '#ffffff',
                  color: customization.fontStyle === 'block' ? '#ffffff' : '#334155',
                  border: '1.5px solid #cbd5e1',
                }}
              >
                AA Block
              </button>
              <button
                type="button"
                onClick={() => onChangeCustomization({ fontStyle: 'script' })}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  fontFamily: 'serif',
                  fontStyle: 'italic',
                  backgroundColor: customization.fontStyle === 'script' ? '#1e1b4b' : '#ffffff',
                  color: customization.fontStyle === 'script' ? '#ffffff' : '#334155',
                  border: '1.5px solid #cbd5e1',
                }}
              >
                Aa Script
              </button>
            </div>
          </div>

          {/* Info notice box */}
          <div style={{ backgroundColor: '#F0F4F8', border: '1px solid #CBD5E1', color: '#1e1b4b', fontSize: '12px', padding: '8px 12px', borderRadius: '8px', fontWeight: 500 }}>
            Name (First Line) added on bottom scrub
          </div>
        </div>
      </div>

      {/* Bottom Action Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', paddingTop: '16px', marginTop: '16px', borderTop: '1px solid #e2e8f0' }}>
        <button
          type="button"
          onClick={onReset}
          style={{ padding: '10px 20px', borderRadius: '8px', border: '1.5px solid #cbd5e1', backgroundColor: '#ffffff', color: '#334155', fontWeight: 700, fontSize: '13px', cursor: 'pointer' }}
        >
          RESET
        </button>
        <button
          type="button"
          onClick={onProceed}
          style={{ flex: 1, padding: '10px 20px', borderRadius: '8px', border: 'none', backgroundColor: '#1e1b4b', color: '#ffffff', fontWeight: 700, fontSize: '13px', cursor: 'pointer', textAlign: 'center' }}
        >
          PROCEED
        </button>
      </div>
    </div>
  );
};
