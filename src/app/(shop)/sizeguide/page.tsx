"use client";
import React, { useState } from 'react';

export default function SizeGuidePage() {
  React.useEffect(() => {
    document.title = "Size Guide | Medvarn";
  }, []);

  const [activeTab, setActiveTab] = useState<'ladies' | 'mens'>('ladies');

  const ladiesTopData = [
    ['S', '34-35', '38', '25', 'Inches'],
    ['M', '36-37', '40', '26', 'Inches'],
    ['L', '38-39', '42', '26.5', 'Inches'],
    ['XL', '40-41', '44', '27.5', 'Inches'],
    ['2XL', '42-43', '46', '28', 'Inches'],
  ];

  const ladiesBottomData = [
    ['S', '37', '34/36', '26', 'Inches'],
    ['M', '37.5', '36/38', '28', 'Inches'],
    ['L', '38', '38/40', '30', 'Inches'],
    ['XL', '38.5', '40/42', '32', 'Inches'],
    ['2XL', '39', '42/44', '34', 'Inches'],
  ];

  const mensTopData = [
    ['S', '27.0', '42', '38'],
    ['M', '27.5', '44', '40'],
    ['L', '28.0', '46', '42'],
    ['XL', '28.5', '48', '44'],
    ['2XL', '29.5', '50', '46'],
  ];

  const mensBottomData = [
    ['S', '38.0', '26', '34 / 36'],
    ['M', '38.0', '28', '36 / 38'],
    ['L', '38.5', '30', '38 / 40'],
    ['XL', '39.5', '32', '40 / 42'],
    ['2XL', '40.0', '34', '42 / 44'],
  ];

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px 80px', fontFamily: 'var(--sans), sans-serif' }}>
      
      {/* Hero Header */}
      <div style={{
        background: 'linear-gradient(135deg, #0b2545 0%, #134074 100%)',
        borderRadius: '24px',
        padding: '52px 40px',
        marginBottom: '40px',
        color: '#ffffff',
        textAlign: 'center',
        boxShadow: '0 12px 36px rgba(11, 37, 69, 0.18)'
      }}>
        <h1 style={{ fontSize: 'clamp(2rem, 4vw, 2.75rem)', fontWeight: 900, margin: '0 0 14px', color: '#ffffff', letterSpacing: '-0.02em', textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>
          Medvarn Size Guide
        </h1>
        <p style={{ fontSize: '17px', color: '#e2e8f0', maxWidth: '680px', margin: '0 auto', lineHeight: 1.6, fontWeight: 500 }}>
          Find your perfect fit for medical scrubs and workwear. All measurements are tailored for maximum comfort and flexibility.
        </p>
      </div>

      {/* Segmented Control Tabs */}
      <div style={{ display: 'flex', justifyItems: 'center', justifyContent: 'center', gap: '16px', marginBottom: '40px' }}>
        <button
          onClick={() => setActiveTab('ladies')}
          style={{
            padding: '14px 36px',
            borderRadius: '12px',
            border: 'none',
            fontSize: '16px',
            fontWeight: 800,
            cursor: 'pointer',
            transition: 'all 0.25s ease',
            background: activeTab === 'ladies' ? '#700018' : '#f1f5f9',
            color: activeTab === 'ladies' ? '#ffffff' : '#475569',
            boxShadow: activeTab === 'ladies' ? '0 4px 14px rgba(112, 0, 24, 0.3)' : 'none'
          }}
        >
          👩‍⚕️ Ladies Size Chart
        </button>
        <button
          onClick={() => setActiveTab('mens')}
          style={{
            padding: '14px 36px',
            borderRadius: '12px',
            border: 'none',
            fontSize: '16px',
            fontWeight: 800,
            cursor: 'pointer',
            transition: 'all 0.25s ease',
            background: activeTab === 'mens' ? '#0b2545' : '#f1f5f9',
            color: activeTab === 'mens' ? '#ffffff' : '#475569',
            boxShadow: activeTab === 'mens' ? '0 4px 14px rgba(11, 37, 69, 0.3)' : 'none'
          }}
        >
          👨‍⚕️ Men's Size Chart
        </button>
      </div>

      {/* LADIES SIZE CHART TAB */}
      {activeTab === 'ladies' && (
        <div style={{ background: '#ffffff', borderRadius: '20px', overflow: 'hidden', border: '2px solid #700018', boxShadow: '0 8px 24px rgba(112, 0, 24, 0.12)' }}>
          {/* Header Banner */}
          <div style={{ background: '#700018', color: '#ffffff', textTransform: 'uppercase', padding: '18px 24px', textAlign: 'center', fontSize: '19px', fontWeight: 900, letterSpacing: '1px' }}>
            LADIES TOP & BOTTOM READY SIZE CHART
          </div>

          <div style={{ padding: '28px' }}>
            {/* 1. TOP MEASUREMENT */}
            <div style={{ marginBottom: '40px' }}>
              <div style={{ background: '#9e1b32', color: '#ffffff', padding: '12px 18px', fontWeight: 800, fontSize: '16px', borderRadius: '8px', marginBottom: '16px' }}>
                1. TOP MEASUREMENT
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center' }}>
                  <thead>
                    <tr style={{ background: '#700018', color: '#ffffff' }}>
                      {['Size', 'Fit To (Chest)', 'Ready Chest', 'Top Length (TL)', 'Unit'].map((h, i) => (
                        <th key={i} style={{ padding: '14px 18px', fontSize: '14px', fontWeight: 800, border: '1px solid rgba(255,255,255,0.2)' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {ladiesTopData.map((row, idx) => (
                      <tr key={idx} style={{ background: idx % 2 === 0 ? '#ffffff' : '#fff5f7' }}>
                        {row.map((cell, cIdx) => (
                          <td key={cIdx} style={{ padding: '14px 18px', fontSize: '15px', fontWeight: cIdx === 0 ? 800 : 600, color: '#0f172a', border: '1px solid #e2e8f0' }}>{cell}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 2. BOTTOM MEASUREMENT */}
            <div>
              <div style={{ background: '#9e1b32', color: '#ffffff', padding: '12px 18px', fontWeight: 800, fontSize: '16px', borderRadius: '8px', marginBottom: '16px' }}>
                2. BOTTOM / PANT MEASUREMENT
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center' }}>
                  <thead>
                    <tr style={{ background: '#700018', color: '#ffffff' }}>
                      {['Size', 'Pant Length (PL)', 'Waist (W)', 'Ready Elastic', 'Unit'].map((h, i) => (
                        <th key={i} style={{ padding: '14px 18px', fontSize: '14px', fontWeight: 800, border: '1px solid rgba(255,255,255,0.2)' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {ladiesBottomData.map((row, idx) => (
                      <tr key={idx} style={{ background: idx % 2 === 0 ? '#ffffff' : '#fff5f7' }}>
                        {row.map((cell, cIdx) => (
                          <td key={cIdx} style={{ padding: '14px 18px', fontSize: '15px', fontWeight: cIdx === 0 ? 800 : 600, color: '#0f172a', border: '1px solid #e2e8f0' }}>{cell}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MEN'S SIZE CHART TAB */}
      {activeTab === 'mens' && (
        <div style={{ background: '#ffffff', borderRadius: '20px', overflow: 'hidden', border: '2px solid #0b2545', boxShadow: '0 8px 24px rgba(11, 37, 69, 0.12)' }}>
          {/* Header Banner */}
          <div style={{ background: '#0b2545', color: '#ffffff', textTransform: 'uppercase', padding: '18px 24px', textAlign: 'center', fontSize: '19px', fontWeight: 900, letterSpacing: '1px' }}>
            MEN'S APPAREL SIZE CHART
          </div>

          <div style={{ padding: '28px' }}>
            {/* 1. MEN'S TOP SIZE CHART */}
            <div style={{ marginBottom: '40px' }}>
              <div style={{ background: '#134074', color: '#ffffff', padding: '12px 18px', fontWeight: 800, fontSize: '16px', borderRadius: '8px', marginBottom: '16px' }}>
                1. TOP MEASUREMENT
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center' }}>
                  <thead>
                    <tr style={{ background: '#0b2545', color: '#ffffff' }}>
                      {['Size', 'Top Length (in)', 'Ready Chest (in)', 'Fit To Chest (in)'].map((h, i) => (
                        <th key={i} style={{ padding: '14px 18px', fontSize: '14px', fontWeight: 800, border: '1px solid rgba(255,255,255,0.2)' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {mensTopData.map((row, idx) => (
                      <tr key={idx} style={{ background: idx % 2 === 0 ? '#ffffff' : '#f0f7fa' }}>
                        {row.map((cell, cIdx) => (
                          <td key={cIdx} style={{ padding: '14px 18px', fontSize: '15px', fontWeight: cIdx === 0 ? 800 : 600, color: '#0f172a', border: '1px solid #e2e8f0' }}>{cell}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 2. MEN'S PANT SIZE CHART */}
            <div>
              <div style={{ background: '#134074', color: '#ffffff', padding: '12px 18px', fontWeight: 800, fontSize: '16px', borderRadius: '8px', marginBottom: '16px' }}>
                2. BOTTOM / PANT MEASUREMENT
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center' }}>
                  <thead>
                    <tr style={{ background: '#0b2545', color: '#ffffff' }}>
                      {['Size', 'Pant Length (in)', 'Elastic Waist (in)', 'Fit To Waist (in)'].map((h, i) => (
                        <th key={i} style={{ padding: '14px 18px', fontSize: '14px', fontWeight: 800, border: '1px solid rgba(255,255,255,0.2)' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {mensBottomData.map((row, idx) => (
                      <tr key={idx} style={{ background: idx % 2 === 0 ? '#ffffff' : '#f0f7fa' }}>
                        {row.map((cell, cIdx) => (
                          <td key={cIdx} style={{ padding: '14px 18px', fontSize: '15px', fontWeight: cIdx === 0 ? 800 : 600, color: '#0f172a', border: '1px solid #e2e8f0' }}>{cell}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
