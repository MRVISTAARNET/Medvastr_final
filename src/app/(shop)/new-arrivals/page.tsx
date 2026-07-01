"use client";
import { useContext, useEffect } from "react";
import { AppContext } from "@/context/AppContext";
import ProductCard from "@/components/ProductCard";

export default function NewArrivalsPage() {
  useEffect(() => {
    document.title = "New Arrivals | Medvastr";
  }, []);

  const ctx = useContext(AppContext);
  if (!ctx) return null;

  const { collections, products } = ctx;

  // Get New Arrivals collection
  const newArrivalsCollection = collections.find((c: any) => c.collectionType === "NEW_ARRIVALS");

  // Get recently added products (from last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const newArrivals = products.filter((p: any) => {
    const createdDate = new Date(p.createdAt);
    const isRecentlyAdded = createdDate > thirtyDaysAgo;
    const hasNewBadge = (p.badge || "").toLowerCase().includes("new");
    return isRecentlyAdded || hasNewBadge;
  });

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold mb-2">New Arrivals</h1>
          <p className="text-slate-300">Check out our latest additions</p>
        </div>
      </div>

      {/* Banner if exists */}
      {newArrivalsCollection?.imageUrl && (
        <div className="w-full h-64 bg-gradient-to-r from-purple-500 to-pink-500 relative overflow-hidden">
          <img
            src={newArrivalsCollection.imageUrl}
            alt="New Arrivals Banner"
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Products Grid */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {newArrivals.map((product: any) => (
            <ProductCard key={product.id} p={product} />
          ))}
        </div>

        {newArrivals.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No new arrivals yet</p>
          </div>
        )}
      </div>
    </div>
  );
}
