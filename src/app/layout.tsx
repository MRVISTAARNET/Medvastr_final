import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Plus_Jakarta_Sans, Inter } from "next/font/google";
import "./globals.css";
import { SITE_URL } from "@/lib/api";
import Script from "next/script";
import JsonLd from "@/components/JsonLd";

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-inter",
});

const serif = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-serif",
});

const sans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-sans",
});

const siteTitle = "Medvastr | Premium Medical Apparel & Professional Scrubs";
const siteDescription =
  "Medvastr offers world-class medical scrubs, surgical wear, and hospital linen for healthcare professionals. Superior comfort, performance fabrics, and modern fits designed in India.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: siteTitle,
    template: "%s | Medvastr",
  },
  description: siteDescription,
  keywords: [
    "medical scrubs",
    "scrubs India",
    "doctors apparel",
    "nurse uniform",
    "premium scrubs",
    "Medvastr",
    "surgical gowns",
    "hospital linen",
  ],
  authors: [{ name: "Medvastr" }],
  creator: "Medvastr",
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: SITE_URL,
    siteName: "Medvastr",
    title: siteTitle,
    description: siteDescription,
  },
  twitter: {
    card: "summary_large_image",
    title: siteTitle,
    description: siteDescription,
  },
  alternates: {
    canonical: SITE_URL,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION || "",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#008080",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Medvastr",
    "url": SITE_URL,
    "logo": `${SITE_URL}/logo.png`,
    "sameAs": [
      "https://www.instagram.com/medvastr/",
      "https://www.facebook.com/medvastr/",
      "https://www.linkedin.com/company/medvastr/"
    ],
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+91-8976488911",
      "contactType": "customer service",
      "areaServed": "IN",
      "availableLanguage": "en"
    }
  };

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Medvastr",
    "url": SITE_URL,
    "potentialAction": {
      "@type": "SearchAction",
      "target": `${SITE_URL}/products?search={search_term_string}`,
      "query-input": "required name=search_term_string"
    }
  };

  return (
    <html lang="en" className={`${serif.variable} ${sans.variable} ${inter.variable}`}>
      <body style={{ fontFamily: "var(--font-sans)" }}>
        <JsonLd data={organizationSchema as any} />
        <JsonLd data={websiteSchema as any} />
        {children}
        <Script
          strategy="afterInteractive"
          src="https://www.googletagmanager.com/gtag/js?id=G-6W495VS5P5"
        />
        <Script
          id="google-analytics"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-6W495VS5P5', {
                page_path: window.location.pathname,
              });
            `,
          }}
        />
      </body>
    </html>
  );
}
