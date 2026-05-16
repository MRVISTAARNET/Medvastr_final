export const B = {
  name: "Medvastr",
  phone1: "8976488911",
  phone2: "9920314164",
  landline: "022 46089785",
  email: "medvastr@gmail.com",
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

export const fmt = (n: number) => "₹ " + n.toLocaleString("en-IN");
