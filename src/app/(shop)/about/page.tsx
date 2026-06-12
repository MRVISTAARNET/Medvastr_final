"use client";

import React from "react";

const COLORS = {
  navy: "#1a1a3a",
  teal: "#008080",
  wine: "#4b0082",
  lightGray: "#f8fafc",
  border: "#e2e8f0",
  text: "#334155",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* 1. HERO HEADER SECTION */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto border-2 border-dashed border-navy/20 p-8 md:p-12 relative">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <h1 className="text-5xl md:text-7xl font-black text-navy leading-tight">
              About Us : <br />
              <span className="text-teal">Caring for Those Who Care for Others</span>
            </h1>
            <div className="space-y-6 text-lg text-text border-l-2 border-dotted border-navy/30 pl-8">
              <p>
                Since 2012, we have been a trusted partner for top hospitals, supplying high-quality linen and uniforms.
              </p>
              <p>
                Over the years, we watched healthcare heroes working exhausting shifts in stiff, uncomfortable scrubs. We knew they deserved better.
              </p>
              <p>
                That is why we created <strong>Medvastr</strong>—a brand dedicated to changing medical apparel for the better.
              </p>
              <p>
                We meet the needs of modern hospitals by offering premium medical scrubs and eco-friendly green linen products.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 2. PROMISES SECTION */}
      <section className="py-16 bg-lightGray px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-navy text-center mb-16">Our Three Simple Promises</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <PromiseCard
              title="Comfort That Lasts"
              desc="We use a special, soft fabric blend with a little bit of stretch. It breathes well, keeps you dry, and feels lightweight even during a long 12-hour shift."
            />
            <PromiseCard
              title="Made to Endure"
              desc="Hospital uniform washing is tough. Our uniforms use high-quality dyes and strong stitching so they stay bright, professional, and looking like new—even after multiple washes."
            />
            <PromiseCard
              title="A Complete Solution"
              desc="We don't just sell scrubs. We supply entire hospitals with everything they need, from classic nursing uniforms to patient clothes and bed linens."
            />
          </div>
        </div>
      </section>

      {/* 3. PRODUCT FEATURE: FLEXI FIT V SCRUBS */}
      <section className="py-24 px-4 max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 items-start">
          {/* Image Side */}
          <div className="space-y-8">
            <ImageBox label="SCRUBS_HERO_IMAGE (800x1000)" height="h-[600px]" />
            <div className="border border-dashed border-teal/40 p-4 rounded-xl">
              <h3 className="text-2xl font-bold text-navy mb-4">Size Chart : Mens & Womens</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left border-collapse border border-slate-200">
                  <thead className="bg-navy text-white">
                    <tr>
                      <th className="p-2 border">Size</th>
                      <th className="p-2 border">Chest</th>
                      <th className="p-2 border">Shoulder</th>
                      <th className="p-2 border">Length</th>
                    </tr>
                  </thead>
                  <tbody>
                    {['XS', 'S', 'M', 'L', 'XL', '2XL'].map(s => (
                      <tr key={s} className="hover:bg-teal/5">
                        <td className="p-2 border font-bold">{s}</td>
                        <td className="p-2 border">Standard</td>
                        <td className="p-2 border">Standard</td>
                        <td className="p-2 border">Standard</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-slate-400 mt-2 italic">* Refer to catalog for precise CM measurements.</p>
            </div>
          </div>

          {/* Details Side */}
          <div className="space-y-8">
            <div className="border-b-4 border-teal w-20 mb-6"></div>
            <h2 className="text-5xl font-black text-navy uppercase italic">Flexi Fit V Scrubs</h2>
            <ul className="space-y-6 text-lg text-text">
              <li className="flex gap-4">
                <span className="text-teal text-2xl">•</span>
                <p>Engineered specifically to withstand the rigorous demands of a 12-hour shift, utilizing a proprietary, high-performance fabric matrix.</p>
              </li>
              <li className="flex gap-4">
                <span className="text-teal text-2xl">•</span>
                <p>Crafted from <strong>98% Poly-Viscose (PV) and 2% Lycra</strong>, with an optimal fabric weight of <strong>180 GSM</strong>.</p>
              </li>
            </ul>
            <div className="bg-navy text-white p-8 rounded-3xl">
              <h4 className="font-bold mb-4 uppercase tracking-widest text-teal">Color Options :</h4>
              <div className="flex gap-6 items-center">
                <ColorDot color="#1a1a3a" name="Navy" />
                <ColorDot color="#93c5fd" name="Light Blue" />
                <ColorDot color="#4b0082" name="Maroon" />
                <ColorDot color="#2d1b33" name="Wine" />
              </div>
            </div>
            <ImageBox label="SCRUBS_MODELS_LIFESTYLE (1200x800)" height="h-[400px]" />
          </div>
        </div>
      </section>

      {/* 4. PRODUCT FEATURE: T-SHIRTS */}
      <section className="py-24 bg-navy text-white px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
            <div>
              <h2 className="text-5xl font-black mb-8 italic">Premium Cotton <br />Crew T-Shirts</h2>
              <div className="overflow-hidden rounded-2xl">
                <ImageBox label="TSHIRT_FLAT_LAY (800x600)" height="h-[300px]" dark />
              </div>
            </div>
            <div className="border border-white/20 rounded-2xl overflow-hidden">
              <div className="bg-white/10 p-4 font-bold text-center border-b border-white/20">PRODUCT SPECIFICATIONS</div>
              <div className="grid grid-cols-2">
                <div className="p-4 border-r border-b border-white/20 font-bold bg-white/5">FEATURE</div>
                <div className="p-4 border-b border-white/20 font-bold bg-white/5">TECHNICAL DETAILS</div>
                <div className="p-4 border-r border-white/20">Material</div>
                <div className="p-4 uppercase text-teal font-bold">100% Long-Staple Cotton</div>
                <div className="p-4 border-r border-t border-white/20">Fabric</div>
                <div className="p-4 border-t border-white/20">Optimized mid-weight knit for seamless layering.</div>
              </div>
            </div>
          </div>
          <ImageBox label="TSHIRT_GROUP_LIFESTYLE (1400x800)" height="h-[500px]" dark />
        </div>
      </section>

      {/* 5. PRODUCT FEATURE: COMPRESSION */}
      <section className="py-24 px-4 max-w-6xl mx-auto">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <ImageBox label="COMPRESSION_FLAT (600x600)" height="h-[500px]" />
          <div className="space-y-8">
            <h2 className="text-4xl font-black text-navy uppercase italic">Full Sleeves <br />Compression Underscrub</h2>
            <p className="text-lg text-text">This premium compression underscrub combines the natural thermoregulation of long-staple cotton with the strategic elasticity of Lycra®. It acts as a second skin—minimizing muscle fatigue.</p>
            <div className="border-2 border-navy rounded-2xl overflow-hidden">
              <table className="w-full text-left">
                <tbody>
                  <tr className="border-b">
                    <td className="p-4 bg-navy text-white font-bold w-1/3">Material Blend</td>
                    <td className="p-4 text-navy font-bold italic">Long-Staple Combed Cotton + Premium Lycra</td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-4 bg-navy text-white font-bold">Compression</td>
                    <td className="p-4 text-navy">Mild-to-Moderate (Optimized for 12-hour wear)</td>
                  </tr>
                  <tr>
                    <td className="p-4 bg-navy text-white font-bold">Sleeve</td>
                    <td className="p-4 text-navy font-bold uppercase tracking-tight text-xl">Full-Length Tapered</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* 6. SURGICAL & SPECIAL RANGE */}
      <section className="py-24 bg-lightGray px-4">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12">
          <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100">
            <div className="flex gap-6 mb-8">
              <ImageBox label="SURGICAL_SHOT_1" height="h-[200px]" width="w-1/2" />
              <ImageBox label="SURGICAL_SHOT_2" height="h-[200px]" width="w-1/2" />
            </div>
            <h3 className="text-3xl font-black text-teal uppercase mb-4 italic">Surgical OT Gowns & Caps</h3>
            <p className="text-text mb-6">Meticulously engineered to provide an impermeable shield against fluids and pathogens while offering maximum breathability.</p>
            <div className="bg-teal/5 p-4 rounded-xl space-y-2 border border-teal/10">
              <div className="flex justify-between"><span>OT Gown:</span><span className="font-bold">100% Cotton, 135 GSM</span></div>
              <div className="flex justify-between"><span>Surgical Cap:</span><span className="font-bold">100% Cotton, 135 GSM</span></div>
            </div>
          </div>

          <div className="space-y-8">
            <div className="bg-navy text-white p-8 rounded-3xl shadow-xl">
              <h3 className="text-2xl font-bold mb-4 italic underline decoration-teal">Maternity Gown</h3>
              <div className="grid grid-cols-2 gap-4 text-sm opacity-80">
                <div>Material: Poly Cotton</div>
                <div>Access: IV/Nursing/Epidural</div>
                <div>Color: Dark Maroon</div>
                <div>Size: Free Size</div>
              </div>
            </div>
            <div className="bg-white p-8 rounded-3xl border border-navy/10 shadow-xl">
              <h3 className="text-2xl font-bold text-navy mb-4 italic">Patient Dress</h3>
              <div className="space-y-4">
                <div className="border-l-4 border-teal pl-4">
                  <h4 className="font-bold text-sm uppercase">General Ward</h4>
                  <p className="text-xs text-text">Two-piece top-and-trouser sets. Easy-tie soft-snap closures.</p>
                </div>
                <div className="border-l-4 border-wine pl-4">
                  <h4 className="font-bold text-sm uppercase">Pediatric Collection</h4>
                  <p className="text-xs text-text">Ultra-soft, vibrant, and distraction printed garments. 100% Cotton.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CALL TO ACTION */}
      <section className="py-24 text-center px-4">
        <h2 className="text-5xl font-black text-navy mb-8 italic">Experience the Difference.</h2>
        <p className="text-xl text-text max-w-2xl mx-auto mb-12">
          Join thousands of healthcare professionals who have switched to Medvastr for better comfort, better performance, and better care.
        </p>
        <button className="bg-teal hover:bg-navy text-white px-12 py-5 rounded-full text-xl font-bold transition-all shadow-2xl hover:-translate-y-1">
          Explore Catalog
        </button>
      </section>
    </div>
  );
}

function PromiseCard({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="bg-white p-10 rounded-3xl shadow-lg border border-slate-100 hover:shadow-2xl transition-all">
      <h3 className="text-2xl font-black text-navy uppercase mb-4 italic border-b-2 border-teal w-fit">{title}</h3>
      <p className="text-text leading-relaxed italic">{desc}</p>
    </div>
  );
}

function ImageBox({ label, height, width = "w-full", dark = false }: { label: string; height: string; width?: string; dark?: boolean }) {
  return (
    <div className={`${width} ${height} rounded-2xl border-4 border-dashed border-teal/20 ${dark ? 'bg-white/5' : 'bg-slate-50'} flex flex-col items-center justify-center p-8 text-center transition-all hover:bg-teal/5`}>
      <div className={`w-16 h-16 rounded-full ${dark ? 'bg-white/10' : 'bg-navy/5'} flex items-center justify-center mb-4`}>
        <span className="text-2xl">📸</span>
      </div>
      <p className={`font-bold ${dark ? 'text-white/40' : 'text-navy/40'} text-sm uppercase tracking-widest`}>{label}</p>
      <p className={`text-[10px] mt-2 ${dark ? 'text-white/20' : 'text-slate-400'}`}>Upload via S3 then replace this src</p>
    </div>
  );
}

function ColorDot({ color, name }: { color: string; name: string }) {
  return (
    <div className="flex flex-col items-center gap-2 group cursor-default">
      <div
        className="w-10 h-10 rounded-full border-2 border-white/20 shadow-lg group-hover:scale-110 transition-all"
        style={{ backgroundColor: color }}
      />
      <span className="text-[10px] font-bold uppercase tracking-tight text-white/60">{name}</span>
    </div>
  );
}
