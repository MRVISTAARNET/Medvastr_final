"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { API_BASE } from "@/lib/api";
import GenericPage from "@/components/GenericPage";

export default function BlogPage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE}/blog/posts?size=20`)
      .then((r) => r.json())
      .then((data) => setPosts(data.content || []))
      .catch(() => setPosts([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <GenericPage title="Blog & Resources" desc="Healthcare insights, medical apparel guides, and industry updates.">
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-4">
            <div className="w-10 h-10 border-4 border-slate-300 border-t-teal-600 rounded-full animate-spin"></div>
            <p className="text-slate-600 font-medium">Loading articles…</p>
          </div>
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-7xl mb-6">📰</div>
          <h2 className="text-3xl font-bold text-slate-900 mb-3">Articles coming soon</h2>
          <p className="text-lg text-slate-600">Check back for guides and insights from Medvastr.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Header Section */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
              📚 Our Blog & Resources
            </h1>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Explore healthcare insights, medical apparel guides, and industry updates
            </p>
          </div>

          {/* Blog Posts Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <Link
                key={post.id}
                href={`/blog/${post.slug}`}
                className="group cursor-pointer"
              >
                <article className="h-full flex flex-col bg-white rounded-2xl overflow-hidden border border-slate-200 hover:border-teal-500 shadow-md hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
                  {/* Image */}
                  {post.featuredImage ? (
                    <div className="relative overflow-hidden h-48 bg-gradient-to-br from-slate-200 to-slate-300">
                      <img
                        src={post.featuredImage}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300"></div>
                    </div>
                  ) : (
                    <div className="h-48 bg-gradient-to-br from-teal-500 to-slate-700 flex items-center justify-center">
                      <span className="text-4xl">📰</span>
                    </div>
                  )}

                  {/* Content */}
                  <div className="p-6 flex-1 flex flex-col">
                    {/* Category */}
                    {post.categoryName && (
                      <span className="inline-block w-fit text-xs font-bold text-teal-700 bg-teal-50 px-3 py-1.5 rounded-full mb-4 uppercase tracking-wider">
                        {post.categoryName}
                      </span>
                    )}

                    {/* Title */}
                    <h3 className="text-xl font-bold text-slate-900 mb-3 line-clamp-2 group-hover:text-teal-600 transition">
                      {post.title}
                    </h3>

                    {/* Excerpt */}
                    <p className="text-slate-600 text-sm leading-relaxed line-clamp-3 mb-4 flex-grow">
                      {post.excerpt}
                    </p>

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                      <span className="text-xs text-slate-500 font-medium">
                        {post.author || "Medvastr"}
                      </span>
                      <span className="text-teal-600 font-semibold text-sm group-hover:gap-1 inline-flex items-center gap-0.5 transition">
                        Read More →
                      </span>
                    </div>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        </div>
      )}
    </GenericPage>
  );
}
