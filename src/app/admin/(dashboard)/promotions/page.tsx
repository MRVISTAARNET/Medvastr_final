"use client";
import { useState, useEffect } from "react";
import { API_BASE } from "@/lib/constants";
import { toast } from "sonner";

export default function PromotionsPage() {
  const [baseFee, setBaseFee] = useState("99");
  const [threshold, setThreshold] = useState("999");
  const [promoDate, setPromoDate] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res1 = await fetch(`${API_BASE}/settings/SHIPPING_BASE_FEE`);
      const d1 = await res1.json();
      if (d1.data) setBaseFee(d1.data);

      const res2 = await fetch(`${API_BASE}/settings/SHIPPING_FREE_THRESHOLD`);
      const d2 = await res2.json();
      if (d2.data) setThreshold(d2.data);

      const res3 = await fetch(`${API_BASE}/settings/SHIPPING_PROMO_FREE_UNTIL`);
      const d3 = await res3.json();
      if (d3.data) setPromoDate(d3.data.split('T')[0]);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSave = async () => {
    const token = localStorage.getItem("medvastr_admin_token");
    if (!token) return toast.error("Unauthorized");
    setLoading(true);

    try {
      const p1 = fetch(`${API_BASE}/settings/SHIPPING_BASE_FEE`, {
        method: "POST", headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ value: baseFee })
      });
      const p2 = fetch(`${API_BASE}/settings/SHIPPING_FREE_THRESHOLD`, {
        method: "POST", headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ value: threshold })
      });
      const p3 = fetch(`${API_BASE}/settings/SHIPPING_PROMO_FREE_UNTIL`, {
        method: "POST", headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ value: promoDate ? `${promoDate}T23:59:59` : "" })
      });

      await Promise.all([p1, p2, p3]);
      toast.success("Promotions saved successfully");
    } catch (e) {
      console.error(e);
      toast.error("Failed to save settings");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Promotions & Shipping</h1>
      <div className="bg-white p-6 rounded-lg shadow-sm border max-w-2xl">
        
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Base Shipping Fee (₹)</label>
          <input 
            type="number" 
            className="w-full border p-2 rounded" 
            value={baseFee} 
            onChange={(e) => setBaseFee(e.target.value)} 
          />
          <p className="text-xs text-gray-500 mt-1">The default shipping cost.</p>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Free Shipping Threshold (₹)</label>
          <input 
            type="number" 
            className="w-full border p-2 rounded" 
            value={threshold} 
            onChange={(e) => setThreshold(e.target.value)} 
          />
          <p className="text-xs text-gray-500 mt-1">Orders above this amount get free shipping unconditionally.</p>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Free Shipping For ALL Until Date</label>
          <input 
            type="date" 
            className="w-full border p-2 rounded" 
            value={promoDate} 
            onChange={(e) => setPromoDate(e.target.value)} 
          />
          <p className="text-xs text-gray-500 mt-1">Leave empty to disable. If set, ALL orders get free shipping until this date.</p>
        </div>

        <button 
          onClick={handleSave} 
          disabled={loading}
          className="bg-black text-white px-6 py-2 rounded font-medium hover:bg-gray-800 disabled:opacity-50"
        >
          {loading ? "Saving..." : "Save Settings"}
        </button>

      </div>
    </div>
  );
}
