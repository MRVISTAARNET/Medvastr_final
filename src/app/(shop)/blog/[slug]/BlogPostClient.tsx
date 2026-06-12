"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { API_BASE } from "@/lib/api";
import GenericPage from "@/components/GenericPage";

export default function BlogPostClient({
  initialPost,
  initialRelated = [],
}: {
  initialPost?: any;
  initialRelated?: any[];
}) {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<any>(initialPost || null);
  const [related, setRelated] = useState<any[]>(initialRelated);

  useEffect(() => {
    if (initialPost || !slug) return;
    fetch(`${API_BASE}/blog/posts/${slug}`)
      .then((r) => r.json())
      .then(setPost)
      .catch(() => setPost(null));
    fetch(`${API_BASE}/blog/posts/${slug}/related`)
      .then((r) => r.json())
      .then(setRelated)
      .catch(() => setRelated([]));
  }, [slug, initialPost]);

  if (!post) {
    return (
      <GenericPage title="Blog">
        <p style={{ textAlign: "center", padding: 60 }}>Loading…</p>
      </GenericPage>
    );
  }

  return (
    <GenericPage title={post.title} desc={post.excerpt || ""}>
      <article style={{ maxWidth: 760, margin: "0 auto", padding: "20px 0 60px" }}>
        {post.featuredImage && (
          <img src={post.featuredImage} alt="" style={{ width: "100%", borderRadius: 12, marginBottom: 24 }} />
        )}
        <div style={{ fontSize: 13, color: "var(--lt)", marginBottom: 16 }}>
          {post.authorName && <span>{post.authorName}</span>}
          {post.publishedAt && <span> · {new Date(post.publishedAt).toLocaleDateString()}</span>}
        </div>
        <div style={{ lineHeight: 1.8, fontSize: 16 }} dangerouslySetInnerHTML={{ __html: post.content }} />
        {related.length > 0 && (
          <section style={{ marginTop: 48 }}>
            <h3 style={{ fontFamily: "var(--serif)", marginBottom: 16 }}>Related Articles</h3>
            <div style={{ display: "grid", gap: 12 }}>
              {related.map((r) => (
                <Link key={r.id} href={`/blog/${r.slug}`} style={{ color: "var(--t)", fontWeight: 600 }}>
                  {r.title} →
                </Link>
              ))}
            </div>
          </section>
        )}
      </article>
    </GenericPage>
  );
}
