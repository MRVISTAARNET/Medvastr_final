declare global {
  interface Window {
    fbq?: (...args: any[]) => void;
  }
}

export const trackMetaEvent = (event: string, data?: Record<string, any>) => {
  if (typeof window !== "undefined" && window.fbq) {
    try {
      if (data) {
        window.fbq("track", event, data);
      } else {
        window.fbq("track", event);
      }
    } catch (e) {
      console.warn("[MetaPixel] Event tracking error:", e);
    }
  }
};

/** Standard Meta Pixel E-Commerce Events */
export const trackViewContent = (product: { id: number; name: string; price: number; categoryName?: string }) => {
  trackMetaEvent("ViewContent", {
    content_name: product.name,
    content_category: product.categoryName || "Medical Apparel",
    content_ids: [String(product.id)],
    content_type: "product",
    value: product.price,
    currency: "INR",
  });
};

export const trackAddToCart = (product: { id: number; name: string; price: number }, qty: number = 1) => {
  trackMetaEvent("AddToCart", {
    content_name: product.name,
    content_ids: [String(product.id)],
    content_type: "product",
    value: product.price * qty,
    currency: "INR",
  });
};

export const trackInitiateCheckout = (numItems: number, totalValue: number) => {
  trackMetaEvent("InitiateCheckout", {
    num_items: numItems,
    value: totalValue,
    currency: "INR",
  });
};

export const trackPurchase = (orderId: string | number, totalValue: number, numItems: number) => {
  trackMetaEvent("Purchase", {
    content_type: "product",
    value: totalValue,
    currency: "INR",
    order_id: String(orderId),
    num_items: numItems,
  });
};

export const trackSearch = (searchQuery: string) => {
  if (searchQuery && searchQuery.trim()) {
    trackMetaEvent("Search", {
      search_string: searchQuery.trim(),
    });
  }
};
