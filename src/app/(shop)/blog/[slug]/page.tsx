import type { Metadata } from "next";
import { SITE_URL } from "@/lib/api";
import { serverFetchPage } from "@/lib/server-api";
import JsonLd from "@/components/JsonLd";
import BlogPostClient from "./BlogPostClient";

export const revalidate = 300;

type PageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await serverFetchPage<any>(`/blog/posts/${encodeURIComponent(slug)}`, 300);
  if (!post) return { title: "Blog" };
  return {
    title: post.seoTitle || post.title,
    description: post.seoDescription || post.excerpt,
    alternates: { canonical: `${SITE_URL}/blog/${slug}` },
    openGraph: {
      title: post.title,
      description: post.excerpt,
      images: post.featuredImage ? [{ url: post.featuredImage }] : [],
      type: "article",
    },
  };
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = await serverFetchPage<any>(`/blog/posts/${encodeURIComponent(slug)}`, 300);
  const related = post
    ? await serverFetchPage<any[]>(`/blog/posts/${encodeURIComponent(slug)}/related`, 300)
    : [];

  const jsonLd = post
    ? {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        headline: post.title,
        description: post.excerpt,
        image: post.featuredImage,
        datePublished: post.publishedAt,
        author: { "@type": "Person", name: post.authorName || "Medvastr" },
      }
    : null;

  return (
    <>
      {jsonLd && <JsonLd data={jsonLd} />}
      <BlogPostClient initialPost={post} initialRelated={related || []} />
    </>
  );
}
