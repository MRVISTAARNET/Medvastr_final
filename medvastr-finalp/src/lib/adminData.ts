export const MOCK_ADMIN = {
  stats: { 
    revenue: 2847650, 
    orders: 1284, 
    customers: 892, 
    products: 20, 
    pendingOrders: 34, 
    avgOrder: 2218, 
    growth: 18.4, 
    ratingAvg: 4.8 
  },
  monthlyRevenue: [
    { m: 'Oct', v: 180000 }, { m: 'Nov', v: 240000 }, { m: 'Dec', v: 310000 },
    { m: 'Jan', v: 285000 }, { m: 'Feb', v: 340000 }, { m: 'Mar', v: 420000 },
  ],
  topProducts: [
    { name: "Men's Classic V-Neck Scrub", sales: 284, revenue: 312316, emoji: '🥼' },
    { name: "Women's ecoflex™ V-Neck",   sales: 198, revenue: 474402, emoji: '👩‍⚕️' },
    { name: "6sense All Black Stethoscope", sales: 156, revenue: 364884, emoji: '🩺' },
    { name: "Men's DRIFT Jacket",         sales: 89,  revenue: 311411, emoji: '🧥' },
    { name: "Women's Classic V-Neck Scrub", sales: 212, revenue: 232988, emoji: '👩‍⚕️' },
  ],
  orders: [
    { id: 1, num: 'MVS-2026-001234', customer: 'Dr. Priya Sharma', email: 'priya@aiims.edu', items: 3, total: 7297, status: 'DELIVERED', date: '2026-03-20', city: 'New Delhi', payment: 'UPI' },
    { id: 2, num: 'MVS-2026-001235', customer: 'Dr. Rahul Mehta', email: 'rahul@bombay.hosp', items: 1, total: 2399, status: 'SHIPPED', date: '2026-03-21', city: 'Mumbai', payment: 'Card' },
    { id: 3, num: 'MVS-2026-001236', customer: 'Nurse Anita Rao', email: 'anita@apollo.com', items: 5, total: 5495, status: 'PROCESSING', date: '2026-03-22', city: 'Chennai', payment: 'COD' },
    { id: 4, num: 'MVS-2026-001237', customer: 'Dr. Vikram Singh', email: 'vikram@fortis.in', items: 8, total: 11190, status: 'PENDING', date: '2026-03-23', city: 'Bengaluru', payment: 'Netbanking' },
    { id: 5, num: 'MVS-2026-001238', customer: 'Dr. Meena Iyer', email: 'meena@kmc.edu', items: 2, total: 3498, status: 'DELIVERED', date: '2026-03-24', city: 'Manipal', payment: 'UPI' },
    { id: 6, num: 'MVS-2026-001239', customer: 'Sr. Nurse Fatima', email: 'fatima@max.com', items: 3, total: 3297, status: 'CANCELLED', date: '2026-03-24', city: 'Hyderabad', payment: 'COD' },
    { id: 7, num: 'MVS-2026-001240', customer: 'Dr. Arjun Nair', email: 'arjun@lilavati.com', items: 4, total: 9596, status: 'SHIPPED', date: '2026-03-25', city: 'Mumbai', payment: 'Card' },
    { id: 8, num: 'MVS-2026-001241', customer: 'Dr. Sunita Reddy', email: 'sunita@nims.edu', items: 1, total: 1099, status: 'PROCESSING', date: '2026-03-26', city: 'Hyderabad', payment: 'UPI' },
  ],
  products: [
    { id:1,  name:"Men's Classic V-Neck Scrub",    type:'scrubs',       price:1099, badge:'Bestseller', rating:4.8, reviews:2140, active:true,  emoji:'🥼', stock:234 },
    { id:2,  name:"Women's Classic V-Neck Scrub",  type:'scrubs',       price:1099, badge:'Bestseller', rating:4.8, reviews:1820, active:true,  emoji:'👩‍⚕️', stock:189 },
    { id:3,  name:"Men's Mandarin Collar Scrub",   type:'scrubs',       price:1299, badge:'New',        rating:4.7, reviews:890,  active:true,  emoji:'🥼', stock:156 },
    { id:7,  name:"Men's ecoflex™ V-Neck Scrub",   type:'scrubs',       price:2399, badge:'Premium',    rating:4.8, reviews:1400, active:true,  emoji:'🥼', stock:98  },
    { id:8,  name:"Women's ecoflex™ V-Neck Scrub", type:'scrubs',       price:2399, badge:'Premium',    rating:4.9, reviews:1200, active:true,  emoji:'👩‍⚕️', stock:112 },
    { id:11, name:"6sense All Black Stethoscope",  type:'stethoscope',  price:2339, badge:'10% Off',    rating:4.8, reviews:670,  active:true,  emoji:'🩺', stock:67  },
    { id:13, name:"Men's Chief Lab Coat",          type:'labcoat',      price:1799, badge:'',           rating:4.7, reviews:380,  active:true,  emoji:'🥼', stock:45  },
    { id:15, name:"Men's DRIFT Jacket",            type:'jacket',       price:3499, badge:'New Launch', rating:4.9, reviews:215,  active:true,  emoji:'🧥', stock:34  },
    { id:16, name:"Women's DRIFT Jacket",          type:'jacket',       price:3499, badge:'New Launch', rating:4.9, reviews:178,  active:true,  emoji:'🧥', stock:28  },
    { id:17, name:"Men's Underscrub T-Shirt",      type:'underscrub',   price:649,  badge:'',           rating:4.6, reviews:920,  active:true,  emoji:'👕', stock:302 },
  ],
  customers: [
    { id:1, name:'Dr. Priya Sharma',  email:'priya@aiims.edu',      phone:'9876543210', orders:12, spent:34560, city:'New Delhi',  joined:'2025-06-12', role:'CUSTOMER' },
    { id:2, name:'Dr. Rahul Mehta',   email:'rahul@bombay.hosp',    phone:'9876543211', orders:8,  spent:19200, city:'Mumbai',     joined:'2025-08-22', role:'CUSTOMER' },
    { id:3, name:'Nurse Anita Rao',   email:'anita@apollo.com',     phone:'9876543212', orders:24, spent:52800, city:'Chennai',    joined:'2025-04-10', role:'CUSTOMER' },
    { id:4, name:'Dr. Vikram Singh',  email:'vikram@fortis.in',     phone:'9876543213', orders:6,  spent:67200, city:'Bengaluru',  joined:'2026-01-05', role:'CUSTOMER' },
    { id:5, name:'Dr. Meena Iyer',    email:'meena@kmc.edu',        phone:'9876543214', orders:15, spent:28500, city:'Manipal',    joined:'2025-11-18', role:'CUSTOMER' },
    { id:6, name:'Sr. Nurse Fatima',  email:'fatima@max.com',       phone:'9876543215', orders:3,  spent:4200,  city:'Hyderabad',  joined:'2026-02-28', role:'CUSTOMER' },
    { id:7, name:'Dr. Arjun Nair',    email:'arjun@lilavati.com',   phone:'9876543216', orders:19, spent:41800, city:'Mumbai',     joined:'2025-07-14', role:'CUSTOMER' },
    { id:8, name:'Admin User',        email:'admin@medvastr.com',   phone:'9920314164', orders:0,  spent:0,     city:'Mumbai',     joined:'2024-01-01', role:'ADMIN' },
  ],
  promos: [
    { id:1, code:'MEDVASTR10',  discount:10,  type:'PERCENTAGE', minOrder:0,    uses:1842, maxUses:10000, active:true,  expiry:'2026-12-31' },
    { id:2, code:'FIRSTORDER',  discount:15,  type:'PERCENTAGE', minOrder:0,    uses:934,  maxUses:5000,  active:true,  expiry:'2026-12-31' },
    { id:3, code:'DOCTOR20',    discount:20,  type:'PERCENTAGE', minOrder:1500, uses:562,  maxUses:2000,  active:true,  expiry:'2026-06-30' },
    { id:4, code:'BULK50',      discount:50,  type:'PERCENTAGE', minOrder:5000, uses:124,  maxUses:500,   active:true,  expiry:'2026-12-31' },
    { id:5, code:'FLAT500',     discount:500, type:'FLAT',       minOrder:2000, uses:89,   maxUses:1000,  active:false, expiry:'2026-03-31' },
  ],
  reviews: [
    { id:1, product:"Men's Classic V-Neck", customer:'Dr. Priya Sharma', rating:5, text:"The ecoflex scrubs are incredible. 12-hour shifts and these feel fresh at the end.", date:'2026-03-15', status:'APPROVED' },
    { id:2, product:"6sense Stethoscope",   customer:'Dr. Rahul Mehta',  rating:5, text:"Crystal clear acoustics. Best stethoscope I've used in 10 years of practice.", date:'2026-03-16', status:'APPROVED' },
    { id:3, product:"Women's DRIFT Jacket", customer:'Nurse Anita Rao',  rating:4, text:"Warm and professional. The pockets are really well placed for nursing use.", date:'2026-03-18', status:'PENDING' },
    { id:4, product:"Men's Chief Lab Coat", customer:'Dr. Vikram Singh',  rating:5, text:"Excellent quality. Embroidery looks great. Fits perfectly.", date:'2026-03-20', status:'APPROVED' },
    { id:5, product:"ecoflex™ V-Neck",      customer:'Dr. Meena Iyer',   rating:3, text:"Good fabric but sizing runs a bit large. Otherwise comfortable.", date:'2026-03-22', status:'PENDING' },
  ]
};

export const fmt = (n: number) => '₹ ' + Number(n || 0).toLocaleString('en-IN');
export const fmtNum = (n: number) => Number(n || 0).toLocaleString('en-IN');
export const fmtDate = (d: string | Date) => { 
  if (!d) return '—'; 
  return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }); 
};
