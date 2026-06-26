"use client";

import React from "react";
import { useApp } from "@/context/AppContext";
import { fmt } from "@/lib/data";
import { getImagesForColor } from "@/lib/productUtils";

import Image from "next/image";

interface WishlistDrawerProps {
  open: boolean;
  onClose: () => void;
}

export default function WishlistDrawer({ open, onClose }: WishlistDrawerProps) {
  const { wishlist, toggleWishlist, addToCart, toast, products } = useApp();

  const items = wishlist.map(vId => {
    const pid = vId.includes('-') ? Number(vId.split('-')[0]) : Number(vId);
    const ci = vId.includes('-') ? Number(vId.split('-')[1]) : 0;
    const p = products.find(prod => prod.id === pid);
    if (!p) return null;
    return { p, ci, vId };
  }).filter(Boolean);

  return (
    <>
      <div className={`drw-bg${open ? " open" : ""}`} onClick={onClose} />
      <div className={`wish-drw${open ? " open" : ""}`}>
        <div className="drw-hd">
          <div>
            <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a' }}>Your Wishlist</h3>
            <div className="drw-hd-s" style={{ fontSize: '13px', color: '#64748b', marginTop: '2px' }}>
              {items.length} items saved for later
            </div>
          </div>
          <button className="drw-x" onClick={onClose} style={{ fontSize: '20px', color: '#94a3b8' }}>
            ✕
          </button>
        </div>

        <div className="drw-body" style={{ padding: '0 20px' }}>
          {items.length === 0 ? (
            <div style={{ textAlign: "center", padding: "100px 20px" }}>
              <div style={{ fontSize: '70px', marginBottom: '24px', opacity: 0.8 }}>❤️</div>
              <div style={{ fontSize: '18px', fontWeight: 800, color: "#0f172a", marginBottom: '8px' }}>Your wishlist is empty</div>
              <div style={{ fontSize: '14px', color: '#64748b', marginBottom: '32px' }}>Save your favorite items to keep track of what you love.</div>
              <button
                className="btn-p"
                onClick={onClose}
                style={{ width: '100%', padding: '14px', borderRadius: '12px', fontSize: '14px', fontWeight: 700 }}
              >
                Browse Products
              </button>
            </div>
          ) : (
            items.map((item) => {
              if (!item) return null;
              const { p, ci, vId } = item;
              const colorImages = getImagesForColor(p, ci);
              const thumb = colorImages?.[0] || p.imgs?.[0];
              const colorName = p.clrNms?.[ci] || "";
              
              return (
                <div key={vId} style={{
                  display: 'flex',
                  gap: '16px',
                  padding: '24px 0',
                  borderBottom: '1px solid #f1f5f9'
                }}>
                  <div style={{
                    width: '85px',
                    height: '110px',
                    position: 'relative',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    background: '#f8fafc',
                    flexShrink: 0
                  }}>
                    {thumb ? (
                      <Image
                        src={thumb}
                        alt={p.name}
                        fill
                        style={{ objectFit: 'cover' }}
                        sizes="85px"
                      />
                    ) : (
                      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>
                        {p.emo || '📦'}
                      </div>
                    )}
                  </div>

                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{
                        fontSize: '15px',
                        fontWeight: 700,
                        color: '#0f172a',
                        lineHeight: 1.3,
                        marginBottom: '4px'
                      }}>
                        {p.name} {colorName && <span style={{ color: '#64748b', fontSize: '13px', fontWeight: 600 }}>({colorName})</span>}
                      </div>
                      <div style={{ fontSize: '14px', fontWeight: 800, color: '#008080' }}>
                        {fmt(p.price)}
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '12px' }}>
                      <button
                        className="btn-p"
                        style={{ height: '36px', padding: "0 16px", fontSize: '12px', fontWeight: 700, borderRadius: '8px', flex: 1 }}
                        onClick={() => {
                          addToCart(p, ci, p.sizes?.[0] || "M");
                          toast(`${p.name} added to bag!`, "ok");
                        }}
                      >
                        Add to Bag
                      </button>
                      <button
                        onClick={() => toggleWishlist(vId)}
                        style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '8px',
                          border: '1.5px solid #f1f5f9',
                          background: '#fff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '14px',
                          cursor: 'pointer'
                        }}
                        title="Remove from Wishlist"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </>
  );
}
