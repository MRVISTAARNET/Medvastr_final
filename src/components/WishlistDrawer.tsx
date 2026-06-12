"use client";

import React from "react";
import { useApp } from "@/context/AppContext";
import { fmt } from "@/lib/data";

interface WishlistDrawerProps {
  open: boolean;
  onClose: () => void;
}

export default function WishlistDrawer({ open, onClose }: WishlistDrawerProps) {
  const { wishlist, toggleWishlist, addToCart, toast, products } = useApp();

  const items = products.filter((p) => wishlist.includes(p.id));

  return (
    <>
      <div className={`drw-bg${open ? " open" : ""}`} onClick={onClose} />
      <div className={`wish-drw${open ? " open" : ""}`}>
        <div className="drw-hd">
          <div>
            <h3>Your Wishlist</h3>
            <div className="drw-hd-s">{items.length} items saved</div>
          </div>
          <button className="drw-x" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="drw-body">
          {items.length === 0 ? (
            <div style={{ textAlign: "center", padding: "80px 20px", color: "var(--lt)" }}>
              <div style={{ fontSize: 60, marginBottom: 15 }}>❤️</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: "var(--ink)", marginBottom: 8 }}>Your wishlist is empty</div>
              <div style={{ fontSize: 13, marginBottom: 20 }}>Save your favorite items to see them here.</div>
              <button className="btn-t" onClick={onClose}>
                Browse Products
              </button>
            </div>
          ) : (
            items.map((p) => (
              <div className="ci" key={p.id}>
                <div className="ci-img" style={{ background: p.bg }}>
                  {p.emo}
                </div>
                <div className="ci-info">
                  <div className="ci-nm">{p.name}</div>
                  <div className="ci-mt">{fmt(p.price)}</div>
                  <div className="ci-row">
                    <button
                      className="btn-p"
                      style={{ height: 32, padding: "0 12px", fontSize: 11 }}
                      onClick={() => {
                        addToCart(p, 0, "M");
                        toast(`${p.short} added to bag!`, "ok");
                      }}
                    >
                      Add to Bag
                    </button>
                    <button className="ci-del" onClick={() => toggleWishlist(p.id)}>
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}
