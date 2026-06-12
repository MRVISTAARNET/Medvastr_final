"use client";
import { useContext } from "react";
import { AppContext } from "@/context/AppContext";
import Link from "next/link";

export default function CollectionsPage() {
  const ctx = useContext(AppContext);
  if (!ctx) return null;

  const { collections } = ctx;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50 to-teal-50">
      {/* Header Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-emerald-800 to-teal-700 text-white py-20 px-4">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: "radial-gradient(circle at 20% 50%, rgba(255,255,255,0.2) 0%, transparent 50%)",
          }}></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-4 leading-tight">
            🏪 Shop By Collection
          </h1>
          <p className="text-xl md:text-2xl text-emerald-50 max-w-2xl mx-auto">
            Explore our carefully curated collections of premium medical apparel
          </p>
        </div>
      </div>

      {/* Collections Grid */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        {collections.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-7xl mb-4">📦</div>
            <p className="text-2xl font-bold text-slate-900 mb-2">No collections yet</p>
            <p className="text-slate-600">Collections will be available soon</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {collections.map((collection: any) => (
              <Link
                key={collection.id}
                href={`/collections/${collection.slug}`}
                className="group cursor-pointer"
              >
                <div className="relative overflow-hidden rounded-2xl mb-4 h-72 bg-gradient-to-br from-slate-200 to-slate-300 shadow-lg transition-all duration-300 group-hover:shadow-2xl group-hover:scale-105">
                  {collection.imageUrl ? (
                    <img
                      src={collection.imageUrl}
                      alt={collection.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-emerald-400 via-teal-400 to-cyan-500">
                      <span className="text-6xl">📦</span>
                    </div>
                  )}

                  {/* Overlay */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex flex-col items-center justify-center gap-3">
                    <span className="text-white font-bold text-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      View Collection
                    </span>
                    <div className="w-10 h-10 rounded-full bg-white/20 group-hover:bg-white/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <span className="text-white text-xl">→</span>
                    </div>
                  </div>
                </div>

                {/* Collection Info */}
                <div className="p-4 bg-white rounded-xl shadow-md transition-all duration-300 group-hover:shadow-lg">
                  <h3 className="text-2xl font-bold text-slate-900 group-hover:text-emerald-600 transition mb-2">
                    {collection.name}
                  </h3>

                  <div className="flex items-center gap-2 mb-3">
                    <span className="inline-block bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-sm font-semibold">
                      📦 {collection.productCount || 0} products
                    </span>
                  </div>

                  {collection.description && (
                    <p className="text-slate-600 text-sm line-clamp-2 leading-relaxed">
                      {collection.description}
                    </p>
                  )}

                  <div className="mt-4 pt-3 border-t border-slate-200 flex items-center gap-1 text-emerald-600 font-semibold text-sm group-hover:gap-2 transition-all">
                    Explore
                    <span>→</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
