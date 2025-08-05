import { Link } from "react-router-dom";
import { ShoppingCart } from "lucide-react";
import { useState } from "react";
import { useCart } from "@/context/CartContext";
import CartSheet from "@/components/CartSheet";

const Header = () => {
  const { count } = useCart();
  const [open, setOpen] = useState(false);

  return (
    <header className="w-full border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-30">
      <div className="container mx-auto flex items-center justify-between py-4">
        <Link to="/" className="font-bold text-xl">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">Nebula Store</span>
        </Link>
        <nav className="flex items-center gap-4">
          <Link to="/admin" className="text-sm hover:underline">
            Admin
          </Link>
          <button
            aria-label="Abrir carrinho"
            className="relative inline-flex items-center justify-center rounded-md px-3 py-2 border border-input hover:bg-accent/40 transition-colors"
            onClick={() => setOpen(true)}
          >
            <ShoppingCart className="h-5 w-5" />
            {count > 0 && (
              <span className="absolute -top-2 -right-2 text-xs px-2 py-0.5 rounded-full bg-primary text-primary-foreground">
                {count}
              </span>
            )}
          </button>
        </nav>
      </div>
      <CartSheet open={open} onOpenChange={setOpen} />
    </header>
  );
};

export default Header;
