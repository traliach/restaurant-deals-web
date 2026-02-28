import { createContext, useCallback, useContext, useEffect, useState } from "react";

export type CartItem = {
  dealId: string;
  title: string;
  restaurantName: string;
  price: number;
  qty: number;
};

type CartContextValue = {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "qty">) => void;
  removeItem: (dealId: string) => void;
  decrementItem: (dealId: string) => void;
  clearCart: () => void;
  total: number;
  count: number;
};

const CartContext = createContext<CartContextValue | null>(null);

const CART_KEY = "restaurant_deals_cart";

function loadCart(): CartItem[] {
  try {
    const raw = localStorage.getItem(CART_KEY);
    return raw ? (JSON.parse(raw) as CartItem[]) : [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  // Rehydrate from localStorage on first render.
  const [items, setItems] = useState<CartItem[]>(loadCart);

  const addItem = useCallback((item: Omit<CartItem, "qty">) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.dealId === item.dealId);
      if (existing) {
        // Increment quantity if already in cart.
        return prev.map((i) =>
          i.dealId === item.dealId ? { ...i, qty: i.qty + 1 } : i
        );
      }
      return [...prev, { ...item, qty: 1 }];
    });
  }, []);

  const removeItem = useCallback((dealId: string) => {
    setItems((prev) => prev.filter((i) => i.dealId !== dealId));
  }, []);

  // Decrease qty by 1 — removes item when qty reaches 0.
  const decrementItem = useCallback((dealId: string) => {
    setItems((prev) =>
      prev
        .map((i) => (i.dealId === dealId ? { ...i, qty: i.qty - 1 } : i))
        .filter((i) => i.qty > 0)
    );
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  // Sync to localStorage whenever items change.
  useEffect(() => {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
  }, [items]);

  const total = items.reduce((sum, i) => sum + i.price * i.qty, 0);
  const count = items.reduce((sum, i) => sum + i.qty, 0);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, decrementItem, clearCart, total, count }}>
      {children}
    </CartContext.Provider>
  );
}

// Global cart state access.
export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
