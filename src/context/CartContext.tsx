import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { STORAGE_KEYS } from "@/utils/format";
import { useProducts } from "@/context/ProductsContext";

export type CartContextType = {
  items: Record<string, number>; // sku -> qty
  add: (sku: string, qty?: number) => void;
  decrement: (sku: string) => void;
  remove: (sku: string) => void;
  clear: () => void;
  count: number;
  total: number;
  isCartOpen: boolean;
  setCartOpen: (open: boolean) => void;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<Record<string, number>>({});
  const { products } = useProducts();
  const [isCartOpen, setCartOpen] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEYS.cart);
    setItems(stored ? JSON.parse(stored) : {});
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.cart, JSON.stringify(items));
  }, [items]);

  const add = (sku: string, qty: number = 1) => {
    setItems(prev => ({ ...prev, [sku]: (prev[sku] || 0) + qty }));
  };

  const decrement = (sku: string) => {
    setItems(prev => {
      const q = (prev[sku] || 0) - 1;
      const next = { ...prev };
      if (q <= 0) delete next[sku];
      else next[sku] = q;
      return next;
    });
  };

  const remove = (sku: string) => {
    setItems(prev => {
      const next = { ...prev };
      delete next[sku];
      return next;
    });
  };

  const clear = () => setItems({});

  const count = useMemo(() => Object.values(items).reduce((a, b) => a + b, 0), [items]);

  const total = useMemo(() => {
    return Object.entries(items).reduce((sum, [sku, qty]) => {
      const p = products.find(pr => pr.sku === sku);
      return p ? sum + p.price * qty : sum;
    }, 0);
  }, [items, products]);

  const value = useMemo(() => ({
    items,
    add,
    decrement,
    remove,
    clear,
    count,
    total,
    isCartOpen,
    setCartOpen
  }), [items, count, total, isCartOpen, setCartOpen]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
};