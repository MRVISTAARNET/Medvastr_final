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
    <div style={{ width: '100%', margin: '16px 0', fontFamily: 'sans-serif', userSelect: 'none' }}>
      {/* Embroidery Card Wrapper */}
      <div style={{ borderRadius: '12px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', border: '1px solid #e2e8f0', backgroundColor: '#ffffff' }}>
        {/* Dark Navy Branding Header */}
        <div
          onClick={onOpenModal}
          style={{
            backgroundColor: '#1e1b4b',
            color: '#ffffff',
            padding: '14px 16px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            borderRadius: '12px 12px 0 0',
          }}
        >
          {/* Pencil / Embroidery Icon */}
          <div style={{ width: '38px', height: '38px', borderRadius: '50%', backgroundColor: 'rgba(255, 255, 255, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '20px' }}>
            ✏️
          </div>

          <div style={{ flex: 1 }}>
            <h3 style={{ fontWeight: 700, fontSize: '17px', color: '#ffffff', margin: 0, lineHeight: '1.2' }}>
              Custom Embroidery
            </h3>
            <p style={{ fontSize: '13px', color: '#CBD5E1', fontWeight: 500, margin: '2px 0 0 0', lineHeight: '1.2' }}>
              Starting at ₹99 personalise your scrubs
            </p>
          </div>
        </div>

        {/* Content Area: Not Configured Yet vs Configured */}
        {!isEmbroiderySelected || !customization || (!customization.line1 && !customization.selectedIconId && !customization.customLogoUrl) ? (
          <div style={{ backgroundColor: '#F9F9FB', padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
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
                padding: '10px 12px',
                borderRadius: '8px',
                cursor: 'pointer',
                backgroundColor: isEmbroiderySelected ? '#F0F4F8' : 'transparent',
                transition: 'background 0.2s',
              }}
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
                style={{ marginTop: '3px', width: '18px', height: '18px', accentColor: '#1e1b4b', cursor: 'pointer', flexShrink: 0 }}
              />
              <label htmlFor="showEmb" style={{ cursor: 'pointer', flex: 1, display: 'block' }}>
                <strong style={{ display: 'block', color: '#1e1b4b', fontSize: '15px', fontWeight: 700, lineHeight: '1.3' }}>
                  Add Embroidery
                </strong>
                <span style={{ display: 'block', fontSize: '12px', color: '#554e65', marginTop: '3px', lineHeight: '1.4' }}>
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
                padding: '10px 12px',
                borderRadius: '8px',
                cursor: 'pointer',
                backgroundColor: !isEmbroiderySelected ? '#F3F4F6' : 'transparent',
                transition: 'background 0.2s',
              }}
            >
              <input
                type="radio"
                id="dontShowEmbroidery"
                name="embroidery"
                checked={!isEmbroiderySelected}
                onChange={() => onToggleAddEmbroidery(false)}
                style={{ marginTop: '3px', width: '18px', height: '18px', accentColor: '#1e1b4b', cursor: 'pointer', flexShrink: 0 }}
              />
              <label htmlFor="dontShowEmbroidery" style={{ cursor: 'pointer', flex: 1, display: 'block' }}>
                <strong style={{ display: 'block', color: '#1e1b4b', fontSize: '15px', fontWeight: 700, lineHeight: '1.3' }}>
                  Skip for Now
                </strong>
                <span style={{ display: 'block', fontSize: '12px', color: '#554e65', marginTop: '3px', lineHeight: '1.4' }}>
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
                <span style={{ fontWeight: 700, color: '#1e1b4b', fontSize: '15px' }}>
                  Custom Embroidery Configured
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontWeight: 700, color: '#0f172a', fontSize: '16px' }}>
                  ₹{customization.totalEmbroideryPrice}
                </span>

                <button
                  onClick={onOpenModal}
                  style={{ fontSize: '12px', fontWeight: 700, color: '#1e1b4b', backgroundColor: '#ffffff', border: '1px solid #CBD5E1', padding: '4px 10px', borderRadius: '4px', cursor: 'pointer' }}
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
