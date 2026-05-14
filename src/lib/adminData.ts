export interface MockStats {
  revenue: number;
  orders: number;
  customers: number;
  products: number;
  pendingOrders: number;
  avgOrder: number;
  growth: number;
  ratingAvg: number;
}

export interface MockRevenue { m: string; v: number; }
export interface MockTopProduct { name: string; sales: number; revenue: number; emoji: string; }
export interface MockOrder { id: number; num: string; customer: string; email: string; items: number; total: number; status: string; date: string; city: string; payment: string; }
export interface MockProduct { id: number; name: string; type: string; price: number; badge: string; rating: number; reviews: number; active: boolean; emoji: string; stock: number; }
export interface MockCustomer { id: number; name: string; email: string; phone: string; orders: number; spent: number; city: string; joined: string; role: string; }
export interface MockPromo { id: number; code: string; discount: number; type: string; minOrder: number; uses: number; maxUses: number; active: boolean; expiry: string; }
export interface MockReview { id: number; product: string; customer: string; rating: number; text: string; date: string; status: string; }

export const MOCK_ADMIN: {
  stats: MockStats;
  monthlyRevenue: MockRevenue[];
  topProducts: MockTopProduct[];
  orders: MockOrder[];
  products: MockProduct[];
  customers: MockCustomer[];
  promos: MockPromo[];
  reviews: MockReview[];
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
