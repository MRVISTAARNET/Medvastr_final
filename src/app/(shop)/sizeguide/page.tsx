import React from 'react';

export default function SizeGuidePage() {
  const S = {
    wrap: { maxWidth: '1400px', margin: '0 auto', padding: '64px 24px', fontFamily: 'inherit' },
    hero: { background: 'linear-gradient(135deg,#0f172a 0%,#1e3a5f 100%)', borderRadius: '20px', padding: '48px 40px', marginBottom: '40px', color: 'white', position: 'relative' as const, overflow: 'hidden' },
    heroTitle: { fontSize: 'clamp(1.6rem,4vw,2.4rem)', fontWeight: 800, marginBottom: '10px' },
    heroSub: { fontSize: '16px', color: 'rgba(255,255,255,0.75)' },
    card: { background: 'white', borderRadius: '16px', padding: '32px', boxShadow: '0 2px 16px rgba(0,0,0,0.05)', border: '1px solid #f1f5f9', marginBottom: '32px' },
    cardHead: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px', borderBottom: '2px solid #f1f5f9', paddingBottom: '16px' },
    h2: { fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', margin: 0 },
    iconBox: { width: '48px', height: '48px', borderRadius: '12px', background: '#ecfdf5', color: '#059669', display: 'flex', alignItems: 'center', justifyItems: 'center', fontSize: '24px', flexShrink: 0 },
    tableWrap: { overflowX: 'auto' as const, marginBottom: '24px' },
    table: { width: '100%', borderCollapse: 'collapse' as const, minWidth: '400px' },
    th: { background: '#f8fafc', padding: '14px 16px', textAlign: 'left' as const, fontWeight: 700, color: '#475569', fontSize: '13px', borderBottom: '2px solid #e2e8f0', whiteSpace: 'nowrap' as const },
    td: { padding: '14px 16px', textAlign: 'left' as const, color: '#0f172a', fontSize: '14px', borderBottom: '1px solid #f1f5f9', fontWeight: 500 },
    tdBold: { padding: '14px 16px', textAlign: 'left' as const, color: '#059669', fontSize: '14px', borderBottom: '1px solid #f1f5f9', fontWeight: 800 },
    note: { background: '#fefce8', border: '1.5px solid #fde047', borderRadius: '10px', padding: '14px 18px', fontSize: '13px', color: '#713f12', fontWeight: 500, display: 'inline-block' },
    imgPlaceholder: { width: '100%', height: '300px', background: '#e2e8f0', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '32px', color: '#94a3b8', fontSize: '18px', fontWeight: 600, border: '2px dashed #cbd5e1' },
    toggleWrap: { display: 'flex', background: '#f1f5f9', borderRadius: '12px', padding: '4px', displayInline: 'block', width: 'max-content', marginBottom: '24px' },
    toggleBtnActive: { background: 'white', color: '#0f172a', fontWeight: 700, padding: '8px 24px', borderRadius: '8px', border: 'none', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', fontSize: '14px' },
    toggleBtnInactive: { background: 'transparent', color: '#64748b', fontWeight: 600, padding: '8px 24px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '14px' },
  };

  const womenTopsIn = [
    ['XS', '29-31', '14.5', '24.5'],
    ['S', '31-33', '15', '25'],
    ['M', '33-35', '15.5', '26'],
    ['L', '35-37', '16', '27'],
    ['XL', '37-39', '16.5', '28'],
    ['2XL', '39-41', '17', '28.5'],
  ];

  const womenTopsCm = [
    ['XS', '74-79', '37.00', '62.50'],
    ['S', '79-84', '38.00', '63.50'],
    ['M', '84-89', '39.50', '66.00'],
    ['L', '89-94', '40.50', '68.50'],
    ['XL', '94-99', '42.00', '71.00'],
    ['2XL', '99-104', '43.00', '72.50'],
  ];

  const womenBottomsIn = [
    ['XS', '25-28', '33-35', '37'],
    ['S', '28-30', '35-37', '38'],
    ['M', '30-32', '37-39', '38'],
    ['L', '32-34', '39-41', '39'],
    ['XL', '34-36', '41-43', '39'],
    ['2XL', '36-38', '43-45', '40'],
  ];

  const womenBottomsCm = [
    ['XS', '64-69', '84-89', '94'],
    ['S', '69-76', '89-94', '96.5'],
    ['M', '76-81', '94-99', '96.5'],
    ['L', '81-86', '99-104', '99'],
    ['XL', '86-91', '104-109', '99'],
    ['2XL', '91-96', '109-114', '101.5'],
  ];

  const menTopsIn = [
    ['XS', '35-37', '18.75', '27.5'],
    ['S', '37-39', '19.25', '28'],
    ['M', '39-41', '19.75', '28.5'],
    ['L', '41-43', '20.25', '29'],
    ['XL', '43-45', '20.75', '29.5'],
    ['2XL', '45-47', '21.25', '30'],
  ];

  const menTopsCm = [
    ['XS', '89-94', '47.50', '70'],
    ['S', '94-99', '49.00', '71'],
    ['M', '99-104', '50.00', '72.50'],
    ['L', '104-109', '51.50', '74.00'],
    ['XL', '109-114', '53.00', '75.00'],
    ['2XL', '114-119', '54.00', '76.00'],
  ];

  const menBottomsIn = [
    ['XS', '27-28', '33-35', '39'],
    ['S', '28-30', '33-35', '39'],
    ['M', '30-32', '35-37', '40'],
    ['L', '32-34', '37-39', '41'],
    ['XL', '34-36', '39-41', '41'],
    ['2XL', '36-38', '41-43', '42'],
  ];

  const menBottomsCm = [
    ['XS', '69-72', '79-84', '99'],
    ['S', '72-76', '84-89', '99'],
    ['M', '76-81', '89-94', '101.5'],
    ['L', '81-86', '94-99', '104'],
    ['XL', '86-91', '99-104', '104'],
    ['2XL', '91-96', '104-109', '107'],
  ];

  const TableBlock = ({ title, head, data }: { title: string, head: string[], data: string[][] }) => (
    <div style={S.tableWrap}>
      <div style={{ fontWeight: 800, color: '#1e293b', marginBottom: '12px', fontSize: '15px' }}>{title}</div>
      <table style={S.table}>
        <thead>
          <tr>
            {head.map(h => <th key={h} style={S.th}>{h}</th>)}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={i} style={{ background: i % 2 === 0 ? 'white' : '#f8fafc' }}>
              {row.map((cell, j) => (
                <td key={j} style={j === 0 ? S.tdBold : S.td}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div style={S.wrap}>
      {/* Banner Placeholder */}
      <div style={{ width: '100%', height: '320px', background: 'linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 100%)', borderRadius: '24px', marginBottom: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', fontWeight: 700, fontSize: '18px', border: '2px dashed #94a3b8', position: 'relative', overflow: 'hidden' }}>
        <img style={{ display: 'none' }} src="YOUR_BANNER_IMAGE_PATH_HERE.jpg" alt="Size Guide Banner" />
        <div>Replace this div with your <code style={{ background: 'white', padding: '4px 8px', borderRadius: '6px' }}>&lt;img&gt;</code> tag</div>
      </div>

      <div style={S.hero}>
        <div style={{ position: 'absolute', top: 0, right: 0, opacity: 0.1, fontSize: '160px', transform: 'translate(20%, -30%)' }}>📏</div>
        <div style={S.heroTitle}>Size Guide</div>
        <p style={S.heroSub}>Find the perfect fit. Measurements provided below are body measurements, not garment measurements.</p>
        <div style={{ ...S.note, marginTop: '24px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: 'white' }}>
          💡 <strong style={{ color: '#a7f3d0' }}>Pro Tip:</strong> For most surgical gowns and generic PPE, we use a universal "Free Size" that comfortably fits most body types.
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '32px' }}>

        {/* WOMEN'S */}
        <div style={S.card}>
          <div style={S.cardHead}>
            <div style={{ ...S.iconBox, background: '#eff6ff', color: '#3b82f6' }}><span style={{ transform: 'translateX(2px)' }}>👩‍⚕️</span></div>
            <h2 style={S.h2}>Women's Sizing</h2>
          </div>

          <div style={{ padding: '0 2px' }}>
            <TableBlock title="Tops (Inches)" head={['Size', 'Chest', 'Shoulder', 'Length']} data={womenTopsIn} />
            <TableBlock title="Tops (CM)" head={['Size', 'Chest', 'Shoulder', 'Length']} data={womenTopsCm} />

            <div style={{ height: '32px' }} />

            <TableBlock title="Bottoms (Inches)" head={['Size', 'Waist', 'Hip', 'Length']} data={womenBottomsIn} />
            <TableBlock title="Bottoms (CM)" head={['Size', 'Waist', 'Hip', 'Length']} data={womenBottomsCm} />
          </div>
        </div>

        {/* MEN'S */}
        <div style={S.card}>
          <div style={S.cardHead}>
            <div style={{ ...S.iconBox, background: '#f5f3ff', color: '#8b5cf6' }}><span style={{ transform: 'translateX(2px)' }}>👨‍⚕️</span></div>
            <h2 style={S.h2}>Men's Sizing</h2>
          </div>

          <div style={{ padding: '0 2px' }}>
            <TableBlock title="Tops (Inches)" head={['Size', 'Chest', 'Shoulder', 'Length']} data={menTopsIn} />
            <TableBlock title="Tops (CM)" head={['Size', 'Chest', 'Shoulder', 'Length']} data={menTopsCm} />

            <div style={{ height: '32px' }} />

            <TableBlock title="Bottoms (Inches)" head={['Size', 'Waist', 'Hip', 'Length']} data={menBottomsIn} />
            <TableBlock title="Bottoms (CM)" head={['Size', 'Waist', 'Hip', 'Length']} data={menBottomsCm} />
          </div>
        </div>

      </div>
    </div>
  );
}
