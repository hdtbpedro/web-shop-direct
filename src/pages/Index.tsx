// src/pages/Index.tsx
import { Helmet } from "react-helmet-async"; // COMENTE OU REMOVA ESTA LINHA
import Header from "@/components/Header";
import ProductGrid from "@/components/ProductGrid";

const Index = () => {
  return (
    <>
      {/* COMENTE ESTE COMPONENTE */}
      {/* <Helmet>
        <title>Nebula Store</title>
      </Helmet> */}
      <Header />
      <main className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-6">Nossos Produtos</h1>
        <ProductGrid />
      </main>
    </>
  );
};

export default Index;