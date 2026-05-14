export const MOCK_ADMIN = {
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
