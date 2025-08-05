import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { Product } from "@/types";
import { STORAGE_KEYS } from "@/utils/format";

export type ProductsContextType = {
  products: Product[];
  addProduct: (p: Omit<Product, "id">) => void;
  updateProduct: (id: string, p: Omit<Product, "id">) => void;
  deleteProduct: (id: string) => void;
  whatsappNumber: string;
  setWhatsAppNumber: (num: string) => void;
  isSkuAvailable: (sku: string, excludeId?: string) => boolean;
};

const ProductsContext = createContext<ProductsContextType | undefined>(undefined);

const seedProducts: Product[] = [
  {
    id: crypto.randomUUID(),
    sku: "SKU-NEBULA-01",
    name: "Camiseta Nebula",
    description: "Tecido premium com estampa galáctica.",
    price: 129.9,
    imageUrl: "https://images.unsplash.com/photo-1548883354-7622d03aca29?q=80&w=1200&auto=format&fit=crop",
  },
  {
    id: crypto.randomUUID(),
    sku: "SKU-AURORA-02",
    name: "Tênis Aurora",
    description: "Conforto máximo com visual futurista.",
    price: 399.0,
    imageUrl: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=1200&auto=format&fit=crop",
  },
  {
    id: crypto.randomUUID(),
    sku: "SKU-ORION-03",
    name: "Mochila Orion",
    description: "Resistente e espaçosa para o dia a dia.",
    price: 249.5,
    imageUrl: "https://images.unsplash.com/photo-1520256862855-398228c41684?q=80&w=1200&auto=format&fit=crop",
  },
  {
    id: crypto.randomUUID(),
    sku: "SKU-COSMOS-04",
    name: "Relógio Cosmos",
    description: "Design minimalista com precisão.",
    price: 549.9,
    imageUrl: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1200&auto=format&fit=crop",
  },
  {
    id: crypto.randomUUID(),
    sku: "SKU-PULSAR-05",
    name: "Fone Pulsar",
    description: "Som imersivo e cancelamento de ruído.",
    price: 699.0,
    imageUrl: "https://images.unsplash.com/photo-1518441902113-c1d3f4f2f1ff?q=80&w=1200&auto=format&fit=crop",
  },
  {
    id: crypto.randomUUID(),
    sku: "SKU-NOVA-06",
    name: "Jaqueta Nova",
    description: "Impermeável com corte contemporâneo.",
    price: 459.0,
    imageUrl: "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?q=80&w=1200&auto=format&fit=crop",
  },
];

export const ProductsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [whatsappNumber, setWhatsAppNumberState] = useState<string>("");

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEYS.products);
    const parsed: Product[] | null = stored ? JSON.parse(stored) : null;
    if (parsed && Array.isArray(parsed) && parsed.length > 0) {
      setProducts(parsed);
    } else {
      setProducts(seedProducts);
      localStorage.setItem(STORAGE_KEYS.products, JSON.stringify(seedProducts));
    }

    const w = localStorage.getItem(STORAGE_KEYS.whatsapp);
    setWhatsAppNumberState(w || "");
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.products, JSON.stringify(products));
  }, [products]);

  const setWhatsAppNumber = (num: string) => {
    setWhatsAppNumberState(num);
    localStorage.setItem(STORAGE_KEYS.whatsapp, num);
  };

  const isSkuAvailable = (sku: string, excludeId?: string) => {
    const found = products.find(p => p.sku.toLowerCase() === sku.toLowerCase());
    if (!found) return true;
    if (excludeId && found.id === excludeId) return true;
    return false;
  };

  const addProduct = (p: Omit<Product, "id">) => {
    if (!isSkuAvailable(p.sku)) throw new Error("SKU já existente.");
    setProducts(prev => [{ id: crypto.randomUUID(), ...p }, ...prev]);
  };

  const updateProduct = (id: string, p: Omit<Product, "id">) => {
    if (!isSkuAvailable(p.sku, id)) throw new Error("SKU já existente.");
    setProducts(prev => prev.map(pr => (pr.id === id ? { id, ...p } : pr)));
  };

  const deleteProduct = (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  const value = useMemo(
    () => ({ products, addProduct, updateProduct, deleteProduct, whatsappNumber, setWhatsAppNumber, isSkuAvailable }),
    [products, whatsappNumber]
  );

  return <ProductsContext.Provider value={value}>{children}</ProductsContext.Provider>;
};

export const useProducts = () => {
  const ctx = useContext(ProductsContext);
  if (!ctx) throw new Error("useProducts must be used within ProductsProvider");
  return ctx;
};
