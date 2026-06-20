"use client";

import React, { createContext, useContext, useReducer, useState, useCallback, useEffect } from "react";
import { Product, cn } from "@/lib/data";
import {
  API_BASE,
  TOKEN_KEY,
  UNAUTHORIZED_EVENT,
  apiJson,
  authHeaders,
  clearToken,
  getToken,
} from "@/lib/api";
import { mapApiProduct, toApiProductRequest, resolveVariantId } from "@/lib/productUtils";

interface CartItem extends Product {
  k: string;
  col: string;
  colNm: string;
  size: string;
  qty: number;
  variantId?: number;
}

interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: string;
}

interface LoginOptions {
  adminOnly?: boolean;
}

interface AppContextType {
  cart: CartItem[];
  wishlist: number[];
  products: Product[];
  categories: any[];
  categoryTree: any[];
  navItems: any[];
  colors: any[];
  sizes: any[];
  banners: any[];
  collections: any[];
  bulkOrderTiers: any[];
  refreshCategories: () => Promise<void>;
  refreshNav: () => Promise<void>;
  refreshProducts: () => Promise<boolean>;
  refreshBanners: () => Promise<void>;
  refreshCollections: () => Promise<void>;
  refreshBulkOrders: () => Promise<void>;
  user: User | null;
  isAuthOpen: boolean;
  setIsAuthOpen: (open: boolean) => void;
  isHydrated: boolean;
  addToCart: (p: Product, ci?: number, sz?: string, qty?: number) => void;
  updateCartQty: (index: number, delta: number) => void;
  removeFromCart: (index: number) => void;
  clearCart: () => void;
  toggleWishlist: (id: number) => void;
  addProduct: (p: Product) => Promise<Product | null>;
  updateProduct: (p: Product) => Promise<void>;
  deleteProduct: (id: number) => Promise<void>;
  login: (email: string, pass: string, options?: LoginOptions) => Promise<boolean>;
  register: (f: string, l: string, e: string, p: string, ph: string) => Promise<boolean>;
  logout: () => void;
  toast: (msg: string, kind?: "ok" | "bad" | "") => void;
  toastMsg: string;
  toastKind: "ok" | "bad" | "";
  requestOtp: (email: string) => Promise<boolean>;
  loginWithOtp: (email: string, otp: string) => Promise<boolean>;
}

export const AppContext = createContext<AppContextType | null>(null);

function cartReducer(state: CartItem[], action: any): CartItem[] {
  switch (action.type) {
    case "SET":
      return action.data;
    case "ADD": {
      const { p, ci, sz, qty = 1 } = action;
      const k = `${p.id}-${ci}-${sz}`;
      const existing = state.find((i) => i.k === k);
      if (existing) {
        return state.map((i) => (i.k === k ? { ...i, qty: i.qty + qty } : i));
      }
      const col = p.clrs?.[ci] || p.clrs?.[0] || "#000";
      return [
        ...state,
        {
          ...p,
          k,
          col,
          colNm: p.clrNms?.[ci] || cn(col),
          size: sz,
          qty,
          variantId: resolveVariantId(p, sz, col),
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

function persistAuth(token: string, authUser: User, options?: LoginOptions): boolean {
  if (options?.adminOnly && authUser.role !== "ADMIN") {
    clearToken();
    return false;
  }
  localStorage.setItem(TOKEN_KEY, token);
  return true;
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [cart, dispatch] = useReducer(cartReducer, []);
  const [wishlist, setWishlist] = useState<number[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [categoryTree, setCategoryTree] = useState<any[]>([]);
  const [navItems, setNavItems] = useState<any[]>([]);
  const [colors, setColors] = useState<any[]>([]);
  const [sizes, setSizes] = useState<any[]>([]);
  const [banners, setBanners] = useState<any[]>([]);
  const [collections, setCollections] = useState<any[]>([]);
  const [bulkOrderTiers, setBulkOrderTiers] = useState<any[]>([]);
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
      const data = await apiJson<User>("/users/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (data.success && data.data) {
        setUser(data.data);
        try {
          const wish = await apiJson<any[]>("/users/me/wishlist", {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (wish.success && Array.isArray(wish.data)) {
            setWishlist(wish.data.map((p: any) => p.id));
          }
        } catch { /* ignore */ }
      } else {
        clearToken();
        setUser(null);
      }
    } catch {
      clearToken();
      setUser(null);
    }
  }, []);

  useEffect(() => {
    const onUnauthorized = () => setUser(null);
    window.addEventListener(UNAUTHORIZED_EVENT, onUnauthorized);
    return () => window.removeEventListener(UNAUTHORIZED_EVENT, onUnauthorized);
  }, []);

  useEffect(() => {
    const savedCart = localStorage.getItem("mv_cart");
    const savedWish = localStorage.getItem("mv_wish");
    const token = getToken();

    if (savedCart) {
      try {
        const parsed = JSON.parse(savedCart);
        if (Array.isArray(parsed)) dispatch({ type: "SET", data: parsed });
      } catch {
        /* ignore corrupt cart */
      }
    }
    if (savedWish) {
      try {
        const parsed = JSON.parse(savedWish);
        if (Array.isArray(parsed)) setWishlist(parsed);
      } catch {
        /* ignore corrupt wishlist */
      }
    }
    if (token) {
      fetchMe(token).finally(() => setIsHydrated(true));
    } else {
      setIsHydrated(true);
    }
  }, [fetchMe]);

  const fetchCategories = useCallback(async () => {
    try {
      const [flat, tree] = await Promise.all([
        apiJson<any[]>("/categories", { skipAuth: true }),
        apiJson<any[]>("/categories?view=tree", { skipAuth: true }),
      ]);
      if (flat.success && flat.data) setCategories(flat.data);
      if (tree.success && tree.data) setCategoryTree(tree.data);
    } catch {
      /* non-blocking */
    }
  }, []);

  const fetchNav = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/nav`);
      const data = await res.json();
      if (Array.isArray(data)) setNavItems(data);
    } catch {
      /* non-blocking */
    }
  }, []);

  const fetchColors = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/colors`);
      const data = await res.json();
      if (Array.isArray(data)) setColors(data);
    } catch {
      /* non-blocking */
    }
  }, []);

  const fetchSizes = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/sizes`);
      const data = await res.json();
      if (Array.isArray(data)) setSizes(data);
    } catch {
      /* non-blocking */
    }
  }, []);

  const fetchProducts = useCallback(async () => {
    try {
      const data = await apiJson<{ content: any[] }>("/products?size=500", { skipAuth: true });
      if (data.success && data.data?.content) {
        setProducts(data.data.content.map((p: any) => mapApiProduct(p)));
        return true;
      }
    } catch {
      /* non-blocking */
    }
    return false;
  }, []);

  const fetchBanners = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/banners`);
      const data = await res.json();
      if (Array.isArray(data)) setBanners(data);
    } catch {
      /* non-blocking */
    }
  }, []);

  const fetchCollections = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/collections`);
      const data = await res.json();
      if (Array.isArray(data)) setCollections(data);
    } catch {
      /* non-blocking */
    }
  }, []);

  const fetchBulkOrderTiers = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/bulk-orders/tiers`);
      const data = await res.json();
      if (Array.isArray(data)) setBulkOrderTiers(data);
    } catch {
      /* non-blocking */
    }
  }, []);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
    fetchNav();
    fetchColors();
    fetchSizes();
    fetchBanners();
    fetchCollections();
    fetchBulkOrderTiers();
  }, [fetchProducts, fetchCategories, fetchNav, fetchColors, fetchSizes, fetchBanners, fetchCollections, fetchBulkOrderTiers]);

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

  const login = async (email: string, pass: string, options?: LoginOptions) => {
    try {
      const data = await apiJson<{ token: string; user: User }>("/auth/login", {
        method: "POST",
        skipAuth: true,
        body: JSON.stringify({ email, password: pass }),
      });
      if (data.success && data.data) {
        if (!persistAuth(data.data.token, data.data.user, options)) {
          toast("Access denied. Admin credentials required.", "bad");
          return false;
        }
        setUser(data.data.user);
        toast("Welcome back!", "ok");
        return true;
      }
      toast(data.message || "Invalid credentials", "bad");
    } catch {
      toast("Connection failed", "bad");
    }
    return false;
  };

  const requestOtp = async (email: string) => {
    try {
      const data = await apiJson<void>("/auth/otp-request", {
        method: "POST",
        skipAuth: true,
        body: JSON.stringify({ email }),
      });
      if (data.success) {
        toast("OTP sent to your email", "ok");
        return true;
      }
      toast(data.message || "Failed to send OTP", "bad");
    } catch {
      toast("Connection failed", "bad");
    }
    return false;
  };

  const loginWithOtp = async (email: string, otpCode: string) => {
    try {
      const data = await apiJson<{ token: string; user: User }>("/auth/otp-login", {
        method: "POST",
        skipAuth: true,
        body: JSON.stringify({ email, otpCode }),
      });
      if (data.success && data.data) {
        localStorage.setItem(TOKEN_KEY, data.data.token);
        setUser(data.data.user);
        toast("Login successful!", "ok");
        return true;
      }
      toast(data.message || "Invalid or expired OTP", "bad");
    } catch {
      toast("Connection failed", "bad");
    }
    return false;
  };

  const register = async (f: string, l: string, e: string, p: string, ph: string) => {
    try {
      const data = await apiJson<{ token: string; user: User }>("/auth/register", {
        method: "POST",
        skipAuth: true,
        body: JSON.stringify({ firstName: f, lastName: l, email: e, password: p, phone: ph }),
      });
      if (data.success && data.data) {
        localStorage.setItem(TOKEN_KEY, data.data.token);
        setUser(data.data.user);
        toast("Registration successful!", "ok");
        return true;
      }
      toast(data.message || "Registration failed", "bad");
    } catch {
      toast("Connection failed", "bad");
    }
    return false;
  };

  const logout = () => {
    clearToken();
    setUser(null);
    toast("Logged out successfully");
  };

  const addToCart = useCallback((p: Product, ci = 0, sz = "M", qty = 1) => {
    dispatch({ type: "ADD", p, ci, sz, qty });
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

  const syncWishlist = useCallback(async () => {
    try {
      const data = await apiJson<any[]>("/users/me/wishlist");
      if (data.success && Array.isArray(data.data)) {
        setWishlist(data.data.map((p: any) => p.id));
      }
    } catch {
      /* guest or offline */
    }
  }, []);

  const toggleWishlist = useCallback(async (id: number) => {
    let wasWished = false;
    setWishlist((prev) => {
      wasWished = prev.includes(id);
      return wasWished ? prev.filter((x) => x !== id) : [...prev, id];
    });
    toast(wasWished ? "Removed from wishlist" : "Saved to wishlist ❤️", wasWished ? "" : "ok");
    if (user) {
      try {
        await apiJson(`/users/me/wishlist/${id}`, { method: "POST" });
      } catch {
        setWishlist((prev) => (wasWished ? [...prev, id] : prev.filter((x) => x !== id)));
      }
    }
  }, [toast, user]);

  const addProduct = async (p: Product) => {
    try {
      const data = await apiJson<any>("/products", {
        method: "POST",
        body: JSON.stringify(toApiProductRequest(p)),
      });
      if (data.success) {
        const saved = mapApiProduct(data.data);
        setProducts((prev) => [saved, ...prev]);
        setTimeout(() => fetchProducts(), 500);
        return saved;
      }
    } catch {
      /* handled by caller */
    }
    return null;
  };

  const updateProduct = async (p: Product) => {
    try {
      const data = await apiJson<any>(`/products/${p.id}`, {
        method: "PUT",
        body: JSON.stringify(toApiProductRequest(p)),
      });
      const updated = data.success
        ? mapApiProduct(data.data)
        : mapApiProduct({ ...p, description: p.desc, imageUrls: p.imgs });
      setProducts((prev) => prev.map((x) => (x.id === p.id ? updated : x)));
    } catch {
      /* non-blocking */
    }
  };

  const deleteProduct = async (id: number) => {
    try {
      await apiJson(`/products/${id}`, { method: "DELETE" });
      setProducts((prev) => prev.filter((x) => x.id !== id));
    } catch {
      /* non-blocking */
    }
  };

  return (
    <AppContext.Provider
      value={{
        cart,
        wishlist,
        products,
        categories,
        categoryTree,
        navItems,
        colors,
        sizes,
        banners,
        collections,
        bulkOrderTiers,
        user,
        isAuthOpen,
        setIsAuthOpen,
        isHydrated,
        addToCart,
        updateCartQty,
        removeFromCart,
        clearCart,
        toggleWishlist,
        addProduct,
        updateProduct,
        deleteProduct,
        login,
        register,
        logout,
        requestOtp,
        loginWithOtp,
        toast,
        toastMsg,
        toastKind,
        refreshCategories: fetchCategories,
        refreshNav: fetchNav,
        refreshProducts: fetchProducts,
        refreshBanners: fetchBanners,
        refreshCollections: fetchCollections,
        refreshBulkOrders: fetchBulkOrderTiers,
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
