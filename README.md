# Medvarn — Medical Apparel E-Commerce Platform

Premium scrub suits, surgical wear, and medical uniforms — built for healthcare professionals across India.

## Tech Stack

- **Frontend:** Next.js 16 (App Router), TypeScript, Tailwind CSS
- **Backend:** Spring Boot (Java), deployed on AWS Elastic Beanstalk
- **Database:** MySQL on AWS RDS
- **Storage:** AWS S3 + CloudFront CDN
- **Payments:** Razorpay
- **Logistics:** Shiprocket
- **Hosting:** AWS Amplify (frontend), Elastic Beanstalk (backend)

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Environment Variables

Copy `.env.example` to `.env.local` and fill in your values:

```bash
cp .env.example .env.local
```

## Project Structure

```
src/
├── app/           # Next.js App Router pages
│   ├── (shop)/    # Customer-facing store pages
│   ├── admin/     # Admin dashboard
│   └── api/       # API route handlers
├── components/    # Reusable React components
├── context/       # Global state (cart, wishlist, user)
├── lib/           # Utilities, data helpers, API config
└── types/         # TypeScript type definitions
```

## Features

- Product catalog with color variants & size selection
- Search with instant suggestions
- Cart & wishlist (localStorage persisted)
- Razorpay payment integration
- Order tracking via Shiprocket AWB
- Admin dashboard (product, order, banner management)
- Embroidery customisation tool
- Bulk order inquiry system
- Blog & SEO-optimised pages
