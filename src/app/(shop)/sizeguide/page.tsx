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
        background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%)',
        borderRadius: '24px',
        padding: '48px 40px',
        marginBottom: '40px',
        color: 'white',
        textAlign: 'center',
        boxShadow: '0 12px 36px rgba(15, 23, 42, 0.12)'
      }}>
        <h1 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.5rem)', fontWeight: 900, margin: '0 0 12px', letterSpacing: '-0.02em' }}>
          Medvarn Size Guide
        </h1>
        <p style={{ fontSize: '16px', color: 'rgba(255, 255, 255, 0.8)', maxWidth: '640px', margin: '0 auto', lineHeight: 1.6 }}>
          Find your perfect fit for medical scrubs and workwear. All measurements are tailored for maximum comfort and flexibility.
        </p>
      </div>

      {/* Segmented Control Tabs */}
      <div style={{ display: 'flex', justifyItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '36px' }}>
        <button
          onClick={() => setActiveTab('ladies')}
          style={{
            padding: '12px 32px',
            borderRadius: '12px',
            border: 'none',
            fontSize: '15px',
            fontWeight: 800,
            cursor: 'pointer',
            transition: 'all 0.25s ease',
            background: activeTab === 'ladies' ? '#800020' : '#f1f5f9',
            color: activeTab === 'ladies' ? 'white' : '#64748b',
            boxShadow: activeTab === 'ladies' ? '0 4px 14px rgba(128, 0, 32, 0.25)' : 'none'
          }}
        >
          👩‍⚕️ Ladies Size Chart
        </button>
        <button
          onClick={() => setActiveTab('mens')}
          style={{
            padding: '12px 32px',
            borderRadius: '12px',
            border: 'none',
            fontSize: '15px',
            fontWeight: 800,
            cursor: 'pointer',
            transition: 'all 0.25s ease',
            background: activeTab === 'mens' ? '#184e68' : '#f1f5f9',
            color: activeTab === 'mens' ? 'white' : '#64748b',
            boxShadow: activeTab === 'mens' ? '0 4px 14px rgba(24, 78, 104, 0.25)' : 'none'
          }}
        >
          👨‍⚕️ Men's Size Chart
        </button>
      </div>

      {/* LADIES SIZE CHART TAB */}
      {activeTab === 'ladies' && (
        <div style={{ background: 'white', borderRadius: '20px', overflow: 'hidden', border: '1.5px solid #800020', boxShadow: '0 8px 24px rgba(128, 0, 32, 0.08)' }}>
          {/* Header Banner */}
          <div style={{ background: '#800020', color: 'white', textTransform: 'uppercase', padding: '16px 24px', textAlign: 'center', fontSize: '18px', fontWeight: 900, letterSpacing: '1px' }}>
            LADIES TOP & BOTTOM READY SIZE CHART
          </div>

          <div style={{ padding: '24px' }}>
            {/* 1. TOP MEASUREMENT */}
            <div style={{ marginBottom: '36px' }}>
              <div style={{ background: '#9e1b32', color: 'white', padding: '10px 16px', fontWeight: 800, fontSize: '15px', borderRadius: '6px', marginBottom: '12px' }}>
                1. TOP MEASUREMENT (Redy Top)
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center' }}>
                  <thead>
                    <tr style={{ background: '#800020', color: 'white' }}>
                      {['Size (Saiz)', 'Fit To (Chest)', 'Ready Chest', 'Top Length (TL)', 'Unit'].map((h, i) => (
                        <th key={i} style={{ padding: '12px 16px', fontSize: '13px', fontWeight: 800, border: '1px solid rgba(255,255,255,0.2)' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {ladiesTopData.map((row, idx) => (
                      <tr key={idx} style={{ background: idx % 2 === 0 ? '#ffffff' : '#fff5f7' }}>
                        {row.map((cell, cIdx) => (
                          <td key={cIdx} style={{ padding: '12px 16px', fontSize: '14px', fontWeight: cIdx === 0 ? 800 : 500, color: '#334155', border: '1px solid #f1f5f9' }}>{cell}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 2. BOTTOM MEASUREMENT */}
            <div>
              <div style={{ background: '#9e1b32', color: 'white', padding: '10px 16px', fontWeight: 800, fontSize: '15px', borderRadius: '6px', marginBottom: '12px' }}>
                2. BOTTOM / PANT MEASUREMENT
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center' }}>
                  <thead>
                    <tr style={{ background: '#800020', color: 'white' }}>
                      {['Size (Saiz)', 'Pant Length (PL)', 'Waist (W)', 'Ready Elastic', 'Unit'].map((h, i) => (
                        <th key={i} style={{ padding: '12px 16px', fontSize: '13px', fontWeight: 800, border: '1px solid rgba(255,255,255,0.2)' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {ladiesBottomData.map((row, idx) => (
                      <tr key={idx} style={{ background: idx % 2 === 0 ? '#ffffff' : '#fff5f7' }}>
                        {row.map((cell, cIdx) => (
                          <td key={cIdx} style={{ padding: '12px 16px', fontSize: '14px', fontWeight: cIdx === 0 ? 800 : 500, color: '#334155', border: '1px solid #f1f5f9' }}>{cell}</td>
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
        <div style={{ background: 'white', borderRadius: '20px', overflow: 'hidden', border: '1.5px solid #184e68', boxShadow: '0 8px 24px rgba(24, 78, 104, 0.08)' }}>
          {/* Header Banner */}
          <div style={{ background: '#184e68', color: 'white', textTransform: 'uppercase', padding: '16px 24px', textAlign: 'center', fontSize: '18px', fontWeight: 900, letterSpacing: '1px' }}>
            MEN'S APPAREL SIZE CHART
          </div>

          <div style={{ padding: '24px' }}>
            {/* 1. MEN'S TOP SIZE CHART */}
            <div style={{ marginBottom: '36px' }}>
              <div style={{ color: '#184e68', fontWeight: 800, fontSize: '16px', marginBottom: '12px', paddingLeft: '4px' }}>
                1. Men's Top Size Chart
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center' }}>
                  <thead>
                    <tr style={{ background: '#184e68', color: 'white' }}>
                      {['Size', 'Top Length (in)', 'Chest Ready (in)', 'Fit To Body (in)'].map((h, i) => (
                        <th key={i} style={{ padding: '12px 16px', fontSize: '13px', fontWeight: 800, border: '1px solid rgba(255,255,255,0.2)' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {mensTopData.map((row, idx) => (
                      <tr key={idx} style={{ background: idx % 2 === 0 ? '#ffffff' : '#f0f7fa' }}>
                        {row.map((cell, cIdx) => (
                          <td key={cIdx} style={{ padding: '12px 16px', fontSize: '14px', fontWeight: cIdx === 0 ? 800 : 500, color: '#334155', border: '1px solid #f1f5f9' }}>{cell}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 2. MEN'S PANT SIZE CHART */}
            <div>
              <div style={{ color: '#184e68', fontWeight: 800, fontSize: '16px', marginBottom: '12px', paddingLeft: '4px' }}>
                2. Men's Pant Size Chart
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center' }}>
                  <thead>
                    <tr style={{ background: '#184e68', color: 'white' }}>
                      {['Size', 'Pant Length (in)', 'Elastic Waist (in)', 'Fit To / Hip (in)'].map((h, i) => (
                        <th key={i} style={{ padding: '12px 16px', fontSize: '13px', fontWeight: 800, border: '1px solid rgba(255,255,255,0.2)' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {mensBottomData.map((row, idx) => (
                      <tr key={idx} style={{ background: idx % 2 === 0 ? '#ffffff' : '#f0f7fa' }}>
                        {row.map((cell, cIdx) => (
                          <td key={cIdx} style={{ padding: '12px 16px', fontSize: '14px', fontWeight: cIdx === 0 ? 800 : 500, color: '#334155', border: '1px solid #f1f5f9' }}>{cell}</td>
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
