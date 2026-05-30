"use client";

import React, { createContext, useContext, useReducer, useState, useCallback, useEffect } from "react";
import { Product } from "@/lib/data";

interface CartItem extends Product {
  k: string;
  col: string;
  colNm: string;
  size: string;
  qty: number;
}

interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: string;
}

interface AppContextType {
  cart: CartItem[];
  wishlist: number[];
  products: Product[];
  categories: any[];
  user: User | null;
  isAuthOpen: boolean;
  setIsAuthOpen: (open: boolean) => void;
  isHydrated: boolean;
  addToCart: (p: Product, ci?: number, sz?: string) => void;
  updateCartQty: (index: number, delta: number) => void;
  removeFromCart: (index: number) => void;
  clearCart: () => void;
  toggleWishlist: (id: number) => void;
  addProduct: (p: Product) => Promise<Product | null>;
  updateProduct: (p: Product) => Promise<void>;
  deleteProduct: (id: number) => Promise<void>;
  login: (email: string, pass: string) => Promise<boolean>;
  register: (f: string, l: string, e: string, p: string, ph: string) => Promise<boolean>;
  logout: () => void;
  toast: (msg: string, kind?: "ok" | "bad" | "") => void;
  toastMsg: string;
  toastKind: "ok" | "bad" | "";
}

const AppContext = createContext<AppContextType | null>(null);

function cartReducer(state: CartItem[], action: any): CartItem[] {
  switch (action.type) {
    case "SET":
      return action.data;
    case "ADD": {
      const { p, ci, sz } = action;
      const k = `${p.id}-${ci}-${sz}`;
      const existing = state.find((i) => i.k === k);
      if (existing) {
        return state.map((i) => (i.k === k ? { ...i, qty: i.qty + 1 } : i));
      }
      return [
        ...state,
        {
          ...p,
          k,
          col: p.clrs?.[ci] || p.clrs?.[0] || "#000",
          colNm: "Color",
          size: sz,
          qty: 1,
        },
      ];
    }
    case "QTY":
      return state
        .map((i, idx) => (idx === action.index ? { ...i, qty: Math.max(0, i.qty + action.delta) } : i))
        .filter((i) => i.qty > 0);
    case "DEL":
      return state.filter((_, idx) => idx !== action.index);
    case "CLR":
      return [];
    default:
      return state;
  }
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [cart, dispatch] = useReducer(cartReducer, []);
  const [wishlist, setWishlist] = useState<number[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [toastKind, setToastKind] = useState<"ok" | "bad" | "">("");

  const toast = useCallback((msg: string, kind: "ok" | "bad" | "" = "") => {
    setToastMsg(msg);
    setToastKind(kind);
    setTimeout(() => setToastMsg(""), 3200);
  }, []);

  const fetchMe = useCallback(async (token: string) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setUser(data.data);
      } else {
        localStorage.removeItem("token");
      }
    } catch (e) { }
  }, []);

  // 1. Initial Load (RESTORE STATE)
  useEffect(() => {
    const savedCart = localStorage.getItem("mv_cart");
    const savedWish = localStorage.getItem("mv_wish");
    const token = localStorage.getItem("token");

    if (savedCart) {
      try {
        const parsed = JSON.parse(savedCart);
        if (Array.isArray(parsed)) dispatch({ type: "SET", data: parsed });
      } catch (e) { }
    }
    if (savedWish) {
      try {
        const parsed = JSON.parse(savedWish);
        if (Array.isArray(parsed)) setWishlist(parsed);
      } catch (e) { }
    }
    if (token) fetchMe(token);

    // Set hydrated AFTER restoring to avoid overwrite by [] initial state
    setIsHydrated(true);
  }, [fetchMe]);

  // 2. Fetch External Data
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products?size=100`);
        const data = await res.json();
        if (data.success) {
          const mapped: Product[] = data.data.content.map((p: any) => ({
            id: p.id,
            name: p.name,
            short: p.name.split(' ').slice(-2).join(' '),
            fab: p.fabric,
            type: p.type,
            gen: p.gender,
            price: p.price,
            origPrice: p.originalPrice,
            rating: p.rating,
            rev: p.reviewCount,
            badge: p.badge,
            clrs: p.variants?.map((v: any) => v.colorHex).filter((v: any, i: number, a: any[]) => a.indexOf(v) === i) || [],
            emo: p.emoji || '🥼',
            bg: p.bgColor || '#f0f0f0',
            desc: p.description,
            fabD: p.fabricDetail || '',
            stretch: p.stretchType || '',
            pockets: p.pocketCount || 0,
            care: p.careInstructions || '',
            wt: p.weight || '',
            fit: p.fit || '',
            imgs: p.imageUrls || [],
            catId: p.categoryId,
            sku: p.sku || `MV-${p.id}`,
            styleId: p.styleId || '',
            brand: p.brand || 'Medvastr',
            sizes: p.sizes || ['XS', 'S', 'M', 'L', 'XL'],
            barcode: p.barcode || `BC-${p.id}`
          }));
          setProducts(mapped);
        }
      } catch (e) { }
    };

    const fetchCategories = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/categories`);
        const data = await res.json();
        if (data.success) setCategories(data.data);
      } catch (e) { }
    };

    fetchProducts();
    fetchCategories();
  }, []);

  // 3. Sync persistence ONLY after hydration
  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem("mv_cart", JSON.stringify(cart));
    }
  }, [cart, isHydrated]);

  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem("mv_wish", JSON.stringify(wishlist));
    }
  }, [wishlist, isHydrated]);

  const login = async (email: string, pass: string) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password: pass })
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem("token", data.data.token);
        setUser(data.data.user);
        toast("Welcome back!", "ok");
        return true;
      } else toast(data.message, "bad");
    } catch (e) { toast("Connection failed", "bad"); }
    return false;
  };

  const register = async (f: string, l: string, e: string, p: string, ph: string) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName: f, lastName: l, email: e, password: p, phone: ph })
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem("token", data.data.token);
        setUser(data.data.user);
        toast("Registration successful!", "ok");
        return true;
      } else toast(data.message, "bad");
    } catch (e) { toast("Connection failed", "bad"); }
    return false;
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    toast("Logged out successfully");
  };

  const addToCart = useCallback((p: Product, ci = 0, sz = "M") => {
    dispatch({ type: "ADD", p, ci, sz });
    toast("Added to bag!", "ok");
  }, [toast]);

  const updateCartQty = useCallback((index: number, delta: number) => {
    dispatch({ type: "QTY", index, delta });
  }, []);

  const removeFromCart = useCallback((index: number) => {
    dispatch({ type: "DEL", index });
  }, []);

  const clearCart = useCallback(() => {
    dispatch({ type: "CLR" });
  }, []);

  const toggleWishlist = useCallback((id: number) => {
    setWishlist(prev => {
      const isWished = prev.includes(id);
      toast(isWished ? "Removed from wishlist" : "Saved to wishlist ❤️", isWished ? "" : "ok");
      return isWished ? prev.filter(x => x !== id) : [...prev, id];
    });
  }, [toast]);

  const addProduct = async (p: Product) => {
    try {
      const token = localStorage.getItem("adm_token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify(p)
      });
      const data = await res.json();
      if (data.success) {
        const saved = { ...p, id: data.data.id };
        setProducts(prev => [saved, ...prev]);
        return saved;
      }
    } catch (e) { }
    return null;
  };

  const updateProduct = async (p: Product) => {
    try {
      const token = localStorage.getItem("adm_token");
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products/${p.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify(p)
      });
      setProducts(prev => prev.map(x => x.id === p.id ? p : x));
    } catch (e) { }
  };

  const deleteProduct = async (id: number) => {
    try {
      const token = localStorage.getItem("adm_token");
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      setProducts(prev => prev.filter(x => x.id !== id));
    } catch (e) { }
  };

  return (
    <AppContext.Provider
      value={{
        cart, wishlist, products, categories, user, isAuthOpen, setIsAuthOpen, isHydrated,
        addToCart, updateCartQty, removeFromCart, clearCart, toggleWishlist,
        addProduct, updateProduct, deleteProduct, login, register, logout,
        toast, toastMsg, toastKind,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within AppProvider");
  return context;
}
