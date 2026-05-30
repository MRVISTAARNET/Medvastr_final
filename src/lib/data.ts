export const B = {
  name: "Medvastr",
  phone1: "8976488911",
  phone2: "9920314164",
  landline: "022 46089785",
  email: "info@medvastr.com",
  addr: "F 81-B, Express Zone, Malad East, Mumbai – 400063",
  ig: "https://www.instagram.com/medvastr/",
  fb: "https://www.facebook.com/medvastr/",
  li: "https://www.linkedin.com/company/medvastr/",
};

export const COLS = [
  { n: "Dark Blue", h: "#1a2b4a" },
  { n: "Light Blue", h: "#add8e6" },
  { n: "Maroon", h: "#800000" },
  { n: "Wine", h: "#722f37" },
];

export const SIZES = ["XS", "S", "M", "L", "XL", "2XL", "3XL"];

export const cn = (h: string) => COLS.find((c) => c.h === h)?.n || "Default";

export interface Product {
  id: number;
  name: string;
  short: string;
  fab: string | null;
  type: string;
  gen: string;
  price: number;
  origPrice?: number;
  rating: number;
  rev: number;
  badge: string;
  clrs: string[];
  emo: string;
  bg: string;
  desc: string;
  fabD: string;
  stretch: string;
  pockets: number;
  care: string;
  wt: string;
  fit: string;
  imgs: string[];
  catId?: number;
  sku?: string;
  styleId?: string;
  brand?: string;
  sizes?: string[];
  barcode?: string;
  stock?: number;
  sold?: number;
  returned?: number;
}

export const PRODUCTS: Product[] = [];


export const SLIDES = [
  {
    img: "/Last_Day_Website_Home_page_Desktop_Banner.webp",
    ey: "Limited Time Offer",
    h: "Premium Scrubs for",
    em: " Professionals",
    p: "Engineered for 12-hour shifts. Lab-tested durability. 200+ washes guaranteed.",
    c1: "Shop Now",
    c2: "Learn More",
  },
  {
    img: "/Frame_427318647_b55627fb-fb8e-4269-ad82-14a24ef28647.webp",
    ey: "Supply List 2026",
    h: "Premium Hospital",
    em: " Linen",
    p: "High-quality, durable and lab-tested linen designed for demanding healthcare environments.",
    c1: "Explore Linen",
    c2: "View All",
  },
  /* {
    img: "/Steth_Landing_Page_Banner_Desktop_1.webp",
    ey: "Diagnostic Excellence",
    h: "6sense Stethoscopes",
    em: " Precision",
    p: "Unmatched acoustic clarity. 30-day free trial. Trusted by 10,000+ doctors.",
    c1: "Shop Stethoscope",
    c2: "View Features",
  }, */
];

export const REVIEWS: any[] = [];

export const PROMOS: Record<string, number> = {
  MEDVASTR10: 0.1,
  FIRSTORDER: 0.15,
  DOCTOR20: 0.2,
  BULK50: 0.5,
};

export const fmt = (n: number) => "₹ " + Number(n || 0).toLocaleString("en-IN");
export const fmtNum = (n: number) => Number(n || 0).toLocaleString("en-IN");
export const fmtDate = (d: string | Date) => {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
};

// Common Admin Interfaces
export interface AdminStats {
  revenue: number; orders: number; customers: number; products: number;
  pendingOrders: number; avgOrder: number; growth: number; ratingAvg: number;
}
export interface AdminOrder { id: number; num: string; customer: string; email: string; items: number; total: number; status: string; date: string; city: string; payment: string; }
export interface AdminPromo { id: number; code: string; discount: number; type: string; minOrder: number; uses: number; maxUses: number; active: boolean; expiry: string; }
export interface AdminRevenue { m: string; v: number; }
export interface AdminTopProduct { name: string; sales: number; revenue: number; emoji: string; }
export interface AdminCustomer { id: number; name: string; email: string; phone: string; orders: number; spent: number; city: string; joined: string; role: string; }
export interface AdminReview { id: number; product: string; customer: string; rating: number; text: string; date: string; status: string; }

export const INITIAL_ADMIN_DATA: {
  stats: AdminStats;
  monthlyRevenue: AdminRevenue[];
  topProducts: AdminTopProduct[];
  orders: AdminOrder[];
  products: any[];
  customers: AdminCustomer[];
  promos: AdminPromo[];
  reviews: AdminReview[];
} = {
  stats: { revenue: 0, orders: 0, customers: 0, products: 0, pendingOrders: 0, avgOrder: 0, growth: 0, ratingAvg: 0 },
  monthlyRevenue: [],
  topProducts: [],
  orders: [],
  products: [],
  customers: [],
  promos: [],
  reviews: []
};
