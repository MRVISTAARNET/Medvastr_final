"use client";

import React, { useEffect, useState } from "react";
import { useApp } from "@/context/AppContext";
import { fmt, fmtDate } from "@/lib/data";
import Link from "next/link";
import { apiJson, getToken } from "@/lib/api";
import { logError } from "@/lib/logger";

export default function AccountPage() {
  const { user, isHydrated, setIsAuthOpen, toast } = useApp();
  const [activeTab, setActiveTab] = useState("profile");
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<any[]>([]);
  const [addresses, setAddresses] = useState<any[]>([]);

  // Profile forms
  const [profileForm, setProfileForm] = useState({ firstName: "", lastName: "", phone: "" });
  const [pwdForm, setPwdForm] = useState({ oldPassword: "", newPassword: "" });
  const [addressForm, setAddressForm] = useState({ fullName: "", phone: "", addressLine1: "", addressLine2: "", city: "", state: "", pincode: "", type: "HOME" });
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  useEffect(() => {
    document.title = "My Account | Medvastr";
    if (user) {
      setProfileForm({ firstName: user.firstName, lastName: user.lastName, phone: user.phone || "" });
      fetchData();
    } else {
      if (isHydrated) setLoading(false);
    }
  }, [user, isHydrated]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = getToken();
      if (!token) return;
      const oRes = await apiJson<{ content: any[] }>("/orders");
      if (oRes.success) setOrders(oRes.data?.content || []);
      
      const aRes = await apiJson<any[]>("/users/me/addresses");
      if (aRes.success && Array.isArray(aRes.data)) setAddresses(aRes.data);
    } catch (e) {
      logError("account-fetch", e);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await apiJson("/users/me", { method: "PUT", body: JSON.stringify(profileForm) });
      if (res.success) toast("Profile updated!", "ok");
      else toast("Failed to update profile", "bad");
    } catch { toast("Error updating profile", "bad"); }
  };

  const updatePwd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await apiJson("/users/me/password", { method: "PUT", body: JSON.stringify(pwdForm) });
      if (res.success) {
        toast("Password changed successfully", "ok");
        setPwdForm({ oldPassword: "", newPassword: "" });
      } else {
        toast("Failed to change password", "bad");
      }
    } catch { toast("Error changing password", "bad"); }
  };

  const addAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await apiJson("/users/me/addresses", { method: "POST", body: JSON.stringify(addressForm) });
      if (res.success) {
        toast("Address added!", "ok");
        setShowAddAddress(false);
        fetchData();
      } else toast("Failed to add address", "bad");
    } catch { toast("Error adding address", "bad"); }
  };

  const deleteAddress = async (id: number) => {
    try {
      const res = await apiJson(`/users/me/addresses/${id}`, { method: "DELETE" });
      if (res.success) {
        toast("Address deleted", "ok");
        fetchData();
      }
    } catch {}
  };

  if (!isHydrated || loading) return <div className="page sec">Loading Dashboard...</div>;

  if (!user) {
    return (
      <div className="page sec" style={{ textAlign: "center", padding: "100px 0" }}>
        <h2>Sign in required</h2>
        <p>Please sign in to view your account dashboard.</p>
        <button className="btn-p" style={{ marginTop: 20 }} onClick={() => setIsAuthOpen(true)}>Sign In</button>
      </div>
    );
  }

  return (
    <div className="page" style={{ background: "#f8fafc", minHeight: "80vh" }}>
      <div className="sec">
        <h1 style={{ fontFamily: "var(--serif)", marginBottom: 40, color: "#0f172a" }}>My Account</h1>

        <div style={{ display: "flex", gap: "40px", alignItems: "flex-start", flexWrap: "wrap" }}>
          
          {/* SIDEBAR */}
          <div style={{ width: "250px", background: "white", padding: "20px", borderRadius: "16px", boxShadow: "0 4px 20px rgba(0,0,0,0.03)" }}>
            <div style={{ paddingBottom: "20px", borderBottom: "1px solid #e2e8f0", marginBottom: "20px" }}>
              <div style={{ fontSize: "18px", fontWeight: 800, color: "#0f172a" }}>{user.firstName} {user.lastName}</div>
              <div style={{ fontSize: "13px", color: "#64748b" }}>{user.email}</div>
            </div>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "10px" }}>
              {[
                { id: "profile", label: "Profile Details", icon: "👤" },
                { id: "security", label: "Security", icon: "🔒" },
                { id: "addresses", label: "Saved Addresses", icon: "📍" },
                { id: "orders", label: "Order History", icon: "📦" }
              ].map(t => (
                <li key={t.id}>
                  <button 
                    onClick={() => setActiveTab(t.id)}
                    style={{
                      width: "100%", textAlign: "left", padding: "12px 16px", borderRadius: "10px", border: "none", cursor: "pointer",
                      background: activeTab === t.id ? "#0f172a" : "transparent",
                      color: activeTab === t.id ? "white" : "#64748b",
                      fontWeight: activeTab === t.id ? 700 : 500,
                      fontSize: "14px", display: "flex", alignItems: "center", gap: "10px"
                    }}
                  >
                    <span>{t.icon}</span> {t.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* MAIN CONTENT */}
          <div style={{ flex: 1, minWidth: "300px", background: "white", padding: "40px", borderRadius: "16px", boxShadow: "0 4px 20px rgba(0,0,0,0.03)" }}>
            
            {activeTab === "profile" && (
              <div>
                <h2 style={{ fontSize: "20px", marginBottom: "24px" }}>Profile Details</h2>
                <form onSubmit={updateProfile} style={{ display: "flex", flexDirection: "column", gap: "20px", maxWidth: "400px" }}>
                  <div className="input-group">
                    <label>First Name</label>
                    <input className="co-input-field" value={profileForm.firstName} onChange={e => setProfileForm({...profileForm, firstName: e.target.value})} required />
                  </div>
                  <div className="input-group">
                    <label>Last Name</label>
                    <input className="co-input-field" value={profileForm.lastName} onChange={e => setProfileForm({...profileForm, lastName: e.target.value})} required />
                  </div>
                  <div className="input-group">
                    <label>Phone Number</label>
                    <input className="co-input-field" value={profileForm.phone} onChange={e => setProfileForm({...profileForm, phone: e.target.value})} />
                  </div>
                  <button type="submit" className="pdp-buy-btn" style={{ marginTop: "10px" }}>Save Changes</button>
                </form>
              </div>
            )}

            {activeTab === "security" && (
              <div>
                <h2 style={{ fontSize: "20px", marginBottom: "24px" }}>Change Password</h2>
                <form onSubmit={updatePwd} style={{ display: "flex", flexDirection: "column", gap: "20px", maxWidth: "400px" }}>
                  <div className="input-group">
                    <label>Current Password</label>
                    <div style={{ position: 'relative' }}>
                      <input type={showOldPassword ? "text" : "password"} className="co-input-field" style={{ paddingRight: '40px' }} value={pwdForm.oldPassword} onChange={e => setPwdForm({...pwdForm, oldPassword: e.target.value})} required />
                      <button
                        type="button"
                        onClick={() => setShowOldPassword(!showOldPassword)}
                        style={{
                          position: 'absolute',
                          right: '12px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          fontSize: '16px',
                          padding: 0,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          opacity: showOldPassword ? 1 : 0.4,
                          transition: 'opacity 0.2s',
                          color: '#888',
                          zIndex: 10
                        }}
                      >
                        👁️
                      </button>
                    </div>
                  </div>
                  <div className="input-group">
                    <label>New Password</label>
                    <div style={{ position: 'relative' }}>
                      <input type={showNewPassword ? "text" : "password"} className="co-input-field" style={{ paddingRight: '40px' }} value={pwdForm.newPassword} onChange={e => setPwdForm({...pwdForm, newPassword: e.target.value})} required minLength={6} />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        style={{
                          position: 'absolute',
                          right: '12px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          fontSize: '16px',
                          padding: 0,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          opacity: showNewPassword ? 1 : 0.4,
                          transition: 'opacity 0.2s',
                          color: '#888',
                          zIndex: 10
                        }}
                      >
                        👁️
                      </button>
                    </div>
                  </div>
                  <button type="submit" className="pdp-buy-btn" style={{ marginTop: "10px" }}>Update Password</button>
                </form>
              </div>
            )}

            {activeTab === "addresses" && (
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
                  <h2 style={{ fontSize: "20px", margin: 0 }}>Saved Addresses</h2>
                  <button onClick={() => setShowAddAddress(!showAddAddress)} className="pdp-heart-btn" style={{ height: "40px", padding: "0 20px" }}>+ Add New</button>
                </div>
                
                {showAddAddress && (
                  <form onSubmit={addAddress} style={{ background: "#f8fafc", padding: "20px", borderRadius: "12px", marginBottom: "30px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
                    <input className="co-input-field" placeholder="Full Name" required value={addressForm.fullName} onChange={e => setAddressForm({...addressForm, fullName: e.target.value})} />
                    <input className="co-input-field" placeholder="Phone" required value={addressForm.phone} onChange={e => setAddressForm({...addressForm, phone: e.target.value})} />
                    <input className="co-input-field" placeholder="Address Line 1" required style={{ gridColumn: "1 / -1" }} value={addressForm.addressLine1} onChange={e => setAddressForm({...addressForm, addressLine1: e.target.value})} />
                    <input className="co-input-field" placeholder="City" required value={addressForm.city} onChange={e => setAddressForm({...addressForm, city: e.target.value})} />
                    <input className="co-input-field" placeholder="State" required value={addressForm.state} onChange={e => setAddressForm({...addressForm, state: e.target.value})} />
                    <input className="co-input-field" placeholder="Pincode" required value={addressForm.pincode} onChange={e => setAddressForm({...addressForm, pincode: e.target.value})} />
                    <select className="co-input-field" value={addressForm.type} onChange={e => setAddressForm({...addressForm, type: e.target.value})}>
                      <option value="HOME">Home</option>
                      <option value="WORK">Work</option>
                    </select>
                    <button type="submit" className="pdp-buy-btn" style={{ gridColumn: "1 / -1" }}>Save Address</button>
                  </form>
                )}

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                  {addresses.length === 0 ? <p style={{ color: "#64748b" }}>No addresses saved yet.</p> : addresses.map(a => (
                    <div key={a.id} style={{ border: "1px solid #e2e8f0", padding: "20px", borderRadius: "12px", position: "relative" }}>
                      <div style={{ fontWeight: 700, marginBottom: "8px" }}>{a.fullName} <span style={{ background: "#f1f5f9", fontSize: "10px", padding: "2px 6px", borderRadius: "4px" }}>{a.type}</span></div>
                      <div style={{ fontSize: "14px", color: "#475569", lineHeight: "1.5" }}>
                        {a.addressLine1}, {a.city}, {a.state} {a.pincode}<br/>
                        Phone: {a.phone}
                      </div>
                      <button onClick={() => deleteAddress(a.id)} style={{ position: "absolute", top: "10px", right: "10px", background: "none", border: "none", color: "#ef4444", cursor: "pointer", fontSize: "16px" }}>🗑</button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "orders" && (
              <div>
                <h2 style={{ fontSize: "20px", marginBottom: "24px" }}>Order History</h2>
                {orders.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "40px", background: "#f8fafc", borderRadius: "12px" }}>
                    <div style={{ fontSize: "40px", marginBottom: "10px" }}>📦</div>
                    <p>You haven't placed any orders yet.</p>
                    <Link href="/products" className="btn-p" style={{ marginTop: "10px", display: "inline-block" }}>Shop Now</Link>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                    {orders.map((o) => (
                      <div key={o.id} style={{ border: "1px solid #e2e8f0", borderRadius: "12px", padding: "24px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px", flexWrap: "wrap", gap: "15px" }}>
                          <div><div style={{ fontSize: "12px", color: "#64748b", textTransform: "uppercase", fontWeight: 700 }}>Order ID</div><div style={{ fontWeight: 800, color: "#008080" }}>{o.orderNumber}</div></div>
                          <div><div style={{ fontSize: "12px", color: "#64748b", textTransform: "uppercase", fontWeight: 700 }}>Date</div><div style={{ fontWeight: 600 }}>{fmtDate(o.createdAt)}</div></div>
                          <div><div style={{ fontSize: "12px", color: "#64748b", textTransform: "uppercase", fontWeight: 700 }}>Total</div><div style={{ fontWeight: 800 }}>{fmt(o.totalAmount)}</div></div>
                          <div><div style={{ fontSize: "12px", color: "#64748b", textTransform: "uppercase", fontWeight: 700 }}>Status</div>
                            <span style={{ display: "inline-block", padding: "4px 10px", borderRadius: "20px", fontSize: "12px", fontWeight: 700, background: o.status === "DELIVERED" ? "#dcfce7" : "#fef3c7", color: o.status === "DELIVERED" ? "#166534" : "#92400e" }}>{o.status}</span>
                          </div>
                          <Link href={`/track?order=${o.orderNumber}`} className="pdp-buy-btn" style={{ height: "36px", padding: "0 20px", fontSize: "13px" }}>Track</Link>
                        </div>
                        <div style={{ borderTop: "1px solid #e2e8f0", paddingTop: "15px", display: "flex", gap: "10px", overflowX: "auto" }}>
                          {o.items?.map((item: any, idx: number) => (
                            <div key={idx} style={{ display: "flex", alignItems: "center", gap: "10px", background: "#f8fafc", padding: "8px 12px", borderRadius: "8px", minWidth: "200px" }}>
                              <img src={item.imageUrl || "https://via.placeholder.com/40"} alt="" style={{ width: "40px", height: "40px", borderRadius: "6px", objectFit: "cover" }} />
                              <div>
                                <div style={{ fontSize: "13px", fontWeight: 700 }}>{item.quantity}x {item.productName}</div>
                                <div style={{ fontSize: "11px", color: "#64748b" }}>{item.size} / {item.colorName}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

          </div>
        </div>
      </div>
      <style jsx>{`
        .input-group label { display: block; font-size: 12px; font-weight: 700; color: #64748b; text-transform: uppercase; margin-bottom: 8px; }
      `}</style>
    </div>
  );
}
