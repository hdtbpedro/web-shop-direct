import React from "react";
import Admin from "@/pages/Admin";
import { ProductsProvider } from "@/context/ProductsContext";
import { CartProvider } from "@/context/CartContext";

const AdminPageWrapper = () => {
  return (
    <ProductsProvider>
      <CartProvider>
        <Admin />
      </CartProvider>
    </ProductsProvider>
  );
};

export default AdminPageWrapper;
