"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { API_BASE } from "@/lib/api";
import GenericPage from "@/components/GenericPage";

// Simple Markdown → HTML converter (no package needed)
function renderMarkdown(md: string): string {
  if (!md) return "";
  return md
    // Headings
    .replace(/^### (.+)$/gm, "<h3>$1</h3>")
    .replace(/^## (.+)$/gm, "<h2>$1</h2>")
    .replace(/^# (.+)$/gm, "<h1>$1</h1>")
    // Bold and italic
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    // Unordered list items
    .replace(/^\* (.+)$/gm, "<li>$1</li>")
    // Wrap consecutive <li> in <ul>
    .replace(/(<li>.*<\/li>\n?)+/g, (m) => `<ul>${m}</ul>`)
    // Numbered list items
    .replace(/^\d+\. (.+)$/gm, "<li>$1</li>")
    // Links
    .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2">$1</a>')
    // Paragraphs: blank lines between text become <p> breaks
    .replace(/\n\n+/g, "</p><p>")
    // Wrap in <p> if not starting with a block element
    .replace(/^(?!<[hul])(.+)/gm, (m) => m.startsWith("<") ? m : m)
    // Line breaks
    .replace(/\n(?!<)/g, "<br/>");
}

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

  // Detect if content is Markdown or already HTML
  const isMarkdown = post.content && !post.content.trim().startsWith("<");
  const contentHtml = isMarkdown ? renderMarkdown(post.content) : post.content;

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
        <div
          style={{ lineHeight: 1.8, fontSize: 16 }}
          dangerouslySetInnerHTML={{ __html: contentHtml }}
        />
        <style>{`
          article { font-family: var(--sans); }
          article h1 { font-size: 28px; font-weight: 800; margin: 32px 0 12px; color: var(--ink, #1a1a2e); }
          article h2 { font-size: 22px; font-weight: 700; margin: 28px 0 10px; color: var(--ink, #1a1a2e); }
          article h3 { font-size: 18px; font-weight: 700; margin: 20px 0 8px; color: var(--ink, #1a1a2e); }
          article ul { padding-left: 24px; margin: 12px 0; }
          article li { margin-bottom: 6px; line-height: 1.7; }
          article strong { font-weight: 700; }
          article em { font-style: italic; }
          article a { color: #008080; text-decoration: underline; }
          article p { margin-bottom: 16px; }
          article * { font-family: inherit !important; }
        `}</style>
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

