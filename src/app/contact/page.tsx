"use client";

import GenericPage from "@/components/GenericPage";
import { B } from "@/lib/data";

export default function ContactPage() {
  const socials = [
    ["📸", "Instagram", B.ig],
    ["f", "Facebook", B.fb],
    ["in", "LinkedIn", B.li],
    ["▶", "YouTube", B.yt],
  ];

  return (
    <GenericPage title="Contact Us" desc="We're here to help you 24/7.">
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 60 }}>
        <div>
          <h3 style={{ fontSize: 18, marginBottom: 24 }}>Get in touch</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {[
              { ico: "📞", l: "Phone", v: B.phone, href: `tel:${B.phone}` },
              { ico: "✉️", l: "Email", v: B.email, href: `mailto:${B.email}` },
              { ico: "📍", l: "Address", v: B.addr },
            ].map((i) => (
              <div key={i.l} style={{ display: "flex", gap: 14 }}>
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: "50%",
                    background: "var(--warm)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 20,
                  }}
                >
                  {i.ico}
                </div>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "var(--lt)", textTransform: "uppercase", letterSpacing: 1 }}>{i.l}</div>
                  {i.href ? (
                    <a href={i.href} style={{ fontSize: 15, fontWeight: 700, color: "var(--ink)" }}>
                      {i.v}
                    </a>
                  ) : (
                    <div style={{ fontSize: 15, fontWeight: 700, color: "var(--ink)" }}>{i.v}</div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 40 }}>
            <h3 style={{ fontSize: 18, marginBottom: 20 }}>Follow @medvastr</h3>
            <div style={{ display: "flex", gap: 14 }}>
              {socials.map(([ico, nm, url]) => (
                <a
                  key={nm}
                  href={url}
                  target="_blank"
                  rel="noopener"
                  style={{ textAlign: "center", display: "block" }}
                >
                  <div
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: "50%",
                      background: "var(--cool)",
                      border: "1.5px solid var(--bdr)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 20,
                      marginBottom: 6,
                    }}
                  >
                    {ico}
                  </div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "var(--lt)" }}>{nm}</div>
                </a>
              ))}
            </div>
          </div>
        </div>

        <div>
          <h3 style={{ fontSize: 18, marginBottom: 24 }}>Send us a message</h3>
          <form style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <input className="price-inp" placeholder="Your Name" style={{ height: 48 }} />
            <input className="price-inp" placeholder="Email Address" type="email" style={{ height: 48 }} />
            <select className="price-inp" style={{ height: 48, appearance: "auto" }}>
              <option>Bulk Order Inquiry</option>
              <option>Shipping & Returns</option>
              <option>Product Feedback</option>
              <option>Other</option>
            </select>
            <textarea
              className="price-inp"
              placeholder="How can we help?"
              style={{ height: 140, padding: "15px 20px", resize: "none" }}
            ></textarea>
            <button className="btn-p" style={{ height: 52, justifyContent: "center" }}>
              Send Message
            </button>
          </form>
        </div>
      </div>
    </GenericPage>
  );
}
