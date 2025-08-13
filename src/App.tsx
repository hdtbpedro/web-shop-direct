import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import { ProductsProvider } from "./context/ProductsContext";
import { CartProvider } from "./context/CartContext";
import { AuthProvider } from "./context/AuthContext";

import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import AdminPageWrapper from "./pages/AdminPageWrapper";
import CartFromUrl from "./pages/CartFromUrl";
import CartSheet from "@/components/CartSheet";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ProductsProvider>
          <CartProvider>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/admin" element={<AdminPageWrapper />} />
              <Route path="/carrinho/:items" element={<CartFromUrl />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
            {/* O CartSheet foi movido para cá para ser renderizado uma única vez */}
            <CartSheet />
          </CartProvider>
        </ProductsProvider>
      </BrowserRouter>
    </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;