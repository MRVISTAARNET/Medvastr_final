export interface AdminStats {
  revenue: number;
  orders: number;
  customers: number;
  products: number;
  pendingOrders: number;
  avgOrder: number;
  growth: number;
  ratingAvg: number;
}

export interface AdminRevenue { m: string; v: number; }
export interface AdminTopProduct { name: string; sales: number; revenue: number; emoji: string; }
export interface AdminOrder { id: number; num: string; customer: string; email: string; items: number; total: number; status: string; date: string; city: string; payment: string; }
export interface AdminProduct { id: number; name: string; type: string; price: number; badge: string; rating: number; reviews: number; active: boolean; emoji: string; stock: number; }
export interface AdminCustomer { id: number; name: string; email: string; phone: string; orders: number; spent: number; city: string; joined: string; role: string; }
export interface AdminPromo { id: number; code: string; discount: number; type: string; minOrder: number; uses: number; maxUses: number; active: boolean; expiry: string; }
export interface AdminReview { id: number; product: string; customer: string; rating: number; text: string; date: string; status: string; }

export const INITIAL_ADMIN_DATA: {
  stats: AdminStats;
  monthlyRevenue: AdminRevenue[];
  topProducts: AdminTopProduct[];
  orders: AdminOrder[];
  products: AdminProduct[];
  customers: AdminCustomer[];
  promos: AdminPromo[];
  reviews: AdminReview[];
} = {
  stats: { 
    revenue: 0, 
    orders: 0, 
    customers: 0, 
    products: 0, 
    pendingOrders: 0, 
    avgOrder: 0, 
    growth: 0, 
    ratingAvg: 0 
  },
  monthlyRevenue: [],
  topProducts: [],
  orders: [],
  products: [],
  customers: [],
  promos: [],
  reviews: []
};

export const fmt = (n: number) => '₹ ' + Number(n || 0).toLocaleString('en-IN');
export const fmtNum = (n: number) => Number(n || 0).toLocaleString('en-IN');
export const fmtDate = (d: string | Date) => { 
  if (!d) return '—'; 
  return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }); 
};
