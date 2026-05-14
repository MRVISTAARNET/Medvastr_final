export const B = {
  name: "Medvastr",
  phone: "9920314164",
  email: "medvastr@gmail.com",
  addr: "LL 001, Gagan Shopping Arcade, Gokuldham, Goregaon East, Mumbai – 400063",
  ig: "https://www.instagram.com/medvastr/",
  fb: "https://www.facebook.com/medvastr/",
  li: "https://www.linkedin.com/company/medvastr/",
};

export const COLS = [
  { n: "Navy Blue", h: "#1a2744" },
  { n: "Black", h: "#1a1a1a" },
  { n: "Wine", h: "#7b1c3c" },
  { n: "Forest Green", h: "#1d6e55" },
  { n: "Heather Grey", h: "#9e9e9e" },
  { n: "Maroon", h: "#7a3535" },
  { n: "Ceil Blue", h: "#7b9db3" },
  { n: "Pastel Lilac", h: "#c4a4b8" },
  { n: "Hot Pink", h: "#e8437a" },
  { n: "Olive", h: "#6b7f6b" },
  { n: "Steel Grey", h: "#607d8b" },
  { n: "Mauve", h: "#b58ca8" },
  { n: "Eucalyptus", h: "#7aab8a" },
  { n: "Charcoal", h: "#3a3a3a" },
  { n: "Galaxy Blue", h: "#2c3e7a" },
  { n: "White", h: "#f0f0f0" },
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
    ey: "New Collection",
    h: "Move Freely in",
    em: " ecoflex™",
    p: "4-way stretch technology designed for the most demanding medical environments.",
    c1: "Explore ecoflex™",
    c2: "All Colours",
  },
  {
    img: "/Steth_Landing_Page_Banner_Desktop_1.webp",
    ey: "Diagnostic Excellence",
    h: "6sense Stethoscopes",
    em: " Precision",
    p: "Unmatched acoustic clarity. 30-day free trial. Trusted by 10,000+ doctors.",
    c1: "Shop Stethoscope",
    c2: "View Features",
  },
];

export const REVIEWS: any[] = [];

export const PROMOS: Record<string, number> = {
  MEDVASTR10: 0.1,
  FIRSTORDER: 0.15,
  DOCTOR20: 0.2,
  BULK50: 0.5,
};

export const fmt = (n: number) => "₹ " + n.toLocaleString("en-IN");
