import { useProducts } from "@/context/ProductsContext";
import ProductCard from "@/components/ProductCard";

const ProductGrid = () => {
  const { products } = useProducts();

  if (products.length === 0) {
    return <div>Nenhum produto encontrado.</div>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
};

export default ProductGrid;