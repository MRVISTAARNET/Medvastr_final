'use client';

import React from 'react';
import { EmbroideryCustomizationState } from '@/types/embroidery';

interface EmbroideryCardProps {
  isEmbroiderySelected: boolean | null;
  onToggleAddEmbroidery: (add: boolean) => void;
  customization: EmbroideryCustomizationState | null;
  onOpenModal: () => void;
  onDeleteEmbroidery: () => void;
  hasError?: boolean;
}

export const EmbroideryCard: React.FC<EmbroideryCardProps> = ({
  isEmbroiderySelected,
  onToggleAddEmbroidery,
  customization,
  onOpenModal,
  onDeleteEmbroidery,
  hasError = false,
}) => {
  const isCustomized = isEmbroiderySelected === true && customization && (customization.line1 || customization.selectedIconId || customization.customLogoUrl);

  return (
    <div id="pdp-embroidery-section" style={{ width: '100%', margin: '16px 0', fontFamily: 'var(--sans), sans-serif', userSelect: 'none' }}>
      {/* Validation Error Message */}
      {hasError && (
        <div style={{ color: '#e11d48', fontSize: '13px', fontWeight: 600, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          ⚠️ Please select an embroidery option (Add Embroidery or Skip for Now)
        </div>
      )}

      {/* Embroidery Card Wrapper */}
      <div
        style={{
          borderRadius: '16px',
          overflow: 'hidden',
          boxShadow: '0 2px 10px rgba(0,0,0,0.04)',
          border: hasError ? '2px solid #e11d48' : '1.5px solid #cbd5e1',
          backgroundColor: '#ffffff',
          transition: 'border 0.2s',
        }}
      >
        {/* Dark Navy Branding Header (Exact Screenshot Style) */}
        <div
          onClick={onOpenModal}
          style={{
            backgroundColor: '#1b1b4d',
            color: '#ffffff',
            padding: '16px 20px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            borderRadius: '14px 14px 0 0',
          }}
        >
          {/* Pencil Icon Circle */}
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '50%',
            backgroundColor: 'rgba(255, 255, 255, 0.18)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            fontSize: '20px'
          }}>
            ✏️
          </div>

          <div style={{ flex: 1 }}>
            <h3 style={{ fontWeight: 800, fontSize: '18px', color: '#ffffff', margin: 0, lineHeight: '1.2' }}>
              Custom Embroidery
            </h3>
            <p style={{ fontSize: '13.5px', color: 'rgba(255, 255, 255, 0.8)', fontWeight: 500, margin: '3px 0 0 0', lineHeight: '1.2' }}>
              Starting at ₹99 personalise your scrubs
            </p>
          </div>
        </div>

        {/* Content Area */}
        {!isCustomized ? (
          <div style={{ backgroundColor: '#ffffff', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {/* Option 1: Add Embroidery */}
            <div
              onClick={() => {
                onToggleAddEmbroidery(true);
                onOpenModal();
              }}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px',
                padding: '12px 14px',
                borderRadius: '10px',
                cursor: 'pointer',
                backgroundColor: isEmbroiderySelected === true ? '#f0fdf4' : 'transparent',
                border: isEmbroiderySelected === true ? '1.5px solid #16a34a' : '1.5px solid transparent',
                transition: 'all 0.2s',
              }}
            >
              <input
                type="radio"
                id="showEmb"
                name="embroidery"
                checked={isEmbroiderySelected === true}
                onChange={() => {
                  onToggleAddEmbroidery(true);
                  onOpenModal();
                }}
                style={{ marginTop: '3px', width: '18px', height: '18px', accentColor: '#1b1b4d', cursor: 'pointer', flexShrink: 0 }}
              />
              <label htmlFor="showEmb" style={{ cursor: 'pointer', flex: 1, display: 'block' }}>
                <strong style={{ display: 'block', color: '#1b1b4d', fontSize: '16px', fontWeight: 800, lineHeight: '1.3' }}>
                  Add Embroidery
                </strong>
                <span style={{ display: 'block', fontSize: '13px', color: '#64748b', marginTop: '3px', fontWeight: 500, lineHeight: '1.4' }}>
                  Make it yours - name, hospital logo, or icon
                </span>
              </label>
            </div>

            {/* Option 2: Skip for Now */}
            <div
              onClick={() => onToggleAddEmbroidery(false)}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px',
                padding: '12px 14px',
                borderRadius: '10px',
                cursor: 'pointer',
                backgroundColor: isEmbroiderySelected === false ? '#f8fafc' : 'transparent',
                border: isEmbroiderySelected === false ? '1.5px solid #cbd5e1' : '1.5px solid transparent',
                transition: 'all 0.2s',
              }}
            >
              <input
                type="radio"
                id="dontShowEmbroidery"
                name="embroidery"
                checked={isEmbroiderySelected === false}
                onChange={() => onToggleAddEmbroidery(false)}
                style={{ marginTop: '3px', width: '18px', height: '18px', accentColor: '#1b1b4d', cursor: 'pointer', flexShrink: 0 }}
              />
              <label htmlFor="dontShowEmbroidery" style={{ cursor: 'pointer', flex: 1, display: 'block' }}>
                <strong style={{ display: 'block', color: '#1b1b4d', fontSize: '16px', fontWeight: 800, lineHeight: '1.3' }}>
                  Skip for Now
                </strong>
                <span style={{ display: 'block', fontSize: '13px', color: '#64748b', marginTop: '3px', fontWeight: 500, lineHeight: '1.4' }}>
                  and risk misplacing your scrubs
                </span>
              </label>
            </div>
          </div>
        ) : (
          /* Configured Summary View */
          <div style={{ backgroundColor: '#F0F4F8', padding: '16px', borderTop: '1px solid #E2E8F0' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #CBD5E1', paddingBottom: '12px', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '16px' }}>✨</span>
                <span style={{ fontWeight: 700, color: '#1b1b4d', fontSize: '15px' }}>
                  Custom Embroidery Configured
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontWeight: 700, color: '#0f172a', fontSize: '16px' }}>
                  ₹{customization.totalEmbroideryPrice}
                </span>

                <button
                  onClick={onOpenModal}
                  style={{ fontSize: '12px', fontWeight: 700, color: '#1b1b4d', backgroundColor: '#ffffff', border: '1px solid #CBD5E1', padding: '4px 10px', borderRadius: '4px', cursor: 'pointer' }}
                >
                  EDIT
                </button>

                <button
                  onClick={onDeleteEmbroidery}
                  style={{ color: '#94a3b8', background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px', padding: '4px' }}
                  title="Remove Embroidery"
                >
                  🗑️
                </button>
              </div>
            </div>

            {/* Customization Details Breakdown */}
            <div style={{ background: 'white', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Option:</span>
                <strong style={{ textTransform: 'capitalize' }}>{customization.selectedOption} Embroidery</strong>
              </div>

              {customization.line1 && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>Text Line 1:</span>
                  <strong>{customization.line1}</strong>
                </div>
              )}

              {customization.line2 && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>Text Line 2:</span>
                  <strong>{customization.line2}</strong>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Font & Color:</span>
                <span style={{ textTransform: 'capitalize' }}>{customization.fontStyle} | {customization.textColor}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Support subtext below box */}
      <div style={{ marginTop: '14px', fontSize: '13px', color: '#64748b', lineHeight: '1.5', textAlign: 'left', padding: '0 4px' }}>
        For any other customizations please contact our customer support on{' '}
        <a
          href="https://wa.me/918976488911?text=Hi!%20I%20have%20a%20question%20about%20Medvarn%20customization."
          target="_blank"
          rel="noopener noreferrer"
          style={{ fontWeight: 800, color: '#0f172a', textDecoration: 'none' }}
        >
          WhatsApp
        </a>{' '}
        or mail us at{' '}
        <a
          href="mailto:info@medvarn.com"
          style={{ fontWeight: 800, color: '#0f172a', textDecoration: 'none' }}
        >
          info@medvarn.com
        </a>.
      </div>
    </div>
  );
};
