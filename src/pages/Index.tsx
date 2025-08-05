import Header from "@/components/Header";
import ProductCard from "@/components/ProductCard";
import { ProductsProvider, useProducts } from "@/context/ProductsContext";
import { CartProvider } from "@/context/CartContext";

const Catalog = () => {
  const { products } = useProducts();
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-6">Catálogo de Produtos</h1>
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </main>
    </div>
  );
};

const Index = () => {
  return (
    <ProductsProvider>
      <CartProvider>
        <Catalog />
      </CartProvider>
    </ProductsProvider>
  );
};

export default Index;
