import { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useCart } from "@/context/CartContext";
import { useProducts } from "@/context/ProductsContext";

const CartFromUrl = () => {
  const { items } = useParams<{ items: string }>();
  const navigate = useNavigate();
  const { clear, add, setCartOpen } = useCart();
  const { products } = useProducts();
  const hasProcessedUrl = useRef(false);

  useEffect(() => {
    if (!items || hasProcessedUrl.current) {
      return;
    }
    
    if (products.length === 0) {
      return;
    }

    hasProcessedUrl.current = true;
    clear();

    const parts = items.split(",");
    for (const part of parts) {
      const [sku, qtyStr] = part.split(":");
      const qty = Math.max(1, Number(qtyStr || 1));
      const product = products.find((p) => p.sku === sku);
      if (product) {
        add(product.sku, qty);
      }
    }

    setCartOpen(true);
    navigate("/", { replace: true });

  }, [items, products, clear, add, navigate, setCartOpen]);

  return null;
};

export default CartFromUrl;