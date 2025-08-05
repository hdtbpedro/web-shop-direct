import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useCart } from "@/context/CartContext";
import { useProducts } from "@/context/ProductsContext";

const CartFromUrl = () => {
  const { items } = useParams<{ items: string }>();
  const navigate = useNavigate();
  const { clear, add } = useCart();
  const { products } = useProducts();

  useEffect(() => {
    if (!items || products.length === 0) return;

    // Reset cart and rebuild from URL
    clear();

    const parts = items.split(",");
    for (const part of parts) {
      const [id, qtyStr] = part.split(":");
      const qty = Math.max(1, Number(qtyStr || 1));
      const product = products.find((p) => String(p.id) === id);
      if (product) {
        // Cart is keyed by SKU internally; map ID -> SKU here
        add(product.sku, qty);
      }
    }

    // After applying, go back to home (catalog)
    navigate("/", { replace: true });
  }, [items, products, clear, add, navigate]);

  return null;
};

export default CartFromUrl;
