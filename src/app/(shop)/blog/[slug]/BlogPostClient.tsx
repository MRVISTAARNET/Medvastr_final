"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { API_BASE } from "@/lib/api";
import GenericPage from "@/components/GenericPage";

// Simple Markdown → HTML converter (no package needed)
function renderMarkdown(md: string): string {
  if (!md) return "";
  let html = md.trim();

  // Headings
  html = html.replace(/^### (.+)$/gm, "<h3>$1</h3>");
  html = html.replace(/^## (.+)$/gm, "<h2>$1</h2>");
  html = html.replace(/^# (.+)$/gm, "<h1>$1</h1>");

  // Bold and italic
  html = html.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/\*(.+?)\*/g, "<em>$1</em>");

  // Unordered list items
  html = html.replace(/^\* (.+)$/gm, "<li>$1</li>");
  html = html.replace(/^- (.+)$/gm, "<li>$1</li>");
  html = html.replace(/(<li>.*<\/li>\n?)+/g, (m) => `<ul class="article-ul">${m}</ul>`);

  // Blockquotes
  html = html.replace(/^> (.+)$/gm, "<blockquote>$1</blockquote>");

  // Links
  html = html.replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');

  // Paragraphs: divide by double newlines for proper editorial structure
  const paragraphs = html.split(/\n\s*\n/);
  return paragraphs
    .map((p) => {
      const trimmed = p.trim();
      if (!trimmed) return "";
      if (trimmed.startsWith("<h") || trimmed.startsWith("<ul") || trimmed.startsWith("<ol") || trimmed.startsWith("<blockquote")) {
        return trimmed;
      }
      return `<p>${trimmed.replace(/\n/g, "<br/>")}</p>`;
    })
    .join("");
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
        <p style={{ textAlign: "center", padding: 60 }}>Loading article…</p>
      </GenericPage>
    );
  }

  // Detect if content is Markdown or already HTML
  const isMarkdown = post.content && !post.content.trim().startsWith("<");
  const contentHtml = isMarkdown ? renderMarkdown(post.content) : post.content;

  return (
    <GenericPage title={post.title} desc={post.excerpt || ""}>
      <article style={{ maxWidth: 820, margin: "0 auto", padding: "20px 0 60px" }}>
        {post.featuredImage && (
          <div style={{ borderRadius: 16, overflow: "hidden", marginBottom: 32, boxShadow: "0 8px 30px rgba(0,0,0,0.08)" }}>
            <img src={post.featuredImage} alt={post.title} style={{ width: "100%", maxHeight: "480px", objectFit: "cover", display: "block" }} />
          </div>
        )}
        <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 14, color: "#64748b", marginBottom: 28, paddingBottom: 16, borderBottom: "1px solid #e2e8f0" }}>
          <span style={{ background: "#f0faf8", color: "#008080", fontWeight: 700, padding: "4px 12px", borderRadius: 20, fontSize: 12, textTransform: "uppercase" }}>
            {post.categoryName || "Healthcare Guide"}
          </span>
          <span>By <strong>{post.authorName || "Medvarn Editorial Team"}</strong></span>
          {post.publishedAt && <span>• {new Date(post.publishedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>}
        </div>
        <div
          className="blog-content-body"
          dangerouslySetInnerHTML={{ __html: contentHtml }}
        />
        <style>{`
          .blog-content-body { font-family: var(--font-inter), system-ui, sans-serif; color: #334155; font-size: 16.5px; line-height: 1.85; }
          .blog-content-body p { margin-bottom: 22px; color: #334155; line-height: 1.85; }
          
          /* Editorial Drop-Cap First Letter */
          .blog-content-body p:first-of-type::first-letter {
            font-size: 3.6rem;
            font-weight: 900;
            float: left;
            line-height: 0.8;
            margin-right: 12px;
            margin-top: 4px;
            color: #008080;
          }
          .blog-content-body p:first-of-type {
            font-size: 1.15rem;
            line-height: 1.85;
            color: #0f172a;
            font-weight: 500;
            margin-bottom: 24px;
          }

          .blog-content-body h1 { font-size: 28px; font-weight: 800; margin: 40px 0 18px; color: #0f2044; border-bottom: 2px solid #f1f5f9; padding-bottom: 10px; }
          .blog-content-body h2 { font-size: 22px; font-weight: 800; margin: 36px 0 16px; color: #0f2044; border-left: 4px solid #008080; padding-left: 14px; }
          .blog-content-body h3 { font-size: 18px; font-weight: 700; margin: 28px 0 12px; color: #0f2044; }
          .blog-content-body ul, .blog-content-body ol { padding-left: 24px; margin: 20px 0; }
          .blog-content-body li { margin-bottom: 10px; line-height: 1.8; color: #334155; }
          .blog-content-body strong { font-weight: 700; color: #0f2044; }
          .blog-content-body em { font-style: italic; color: #1e293b; }
          .blog-content-body a { color: #008080; text-decoration: underline; font-weight: 600; }
          .blog-content-body blockquote { background: #f0faf8; border-left: 4px solid #008080; padding: 18px 24px; border-radius: 0 12px 12px 0; margin: 28px 0; font-style: italic; font-size: 1.05rem; color: #0f2044; }
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

