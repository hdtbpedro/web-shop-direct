import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Product } from "@/types";
import { useCart } from "@/context/CartContext";
import { formatCurrency } from "@/utils/format";

const ProductCard = ({ product }: { product: Product }) => {
  const { add } = useCart();
  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <div className="aspect-[4/3] w-full overflow-hidden rounded-md">
          <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover" />
        </div>
        <CardTitle className="mt-2 text-lg">{product.name}</CardTitle>
        <CardDescription>SKU: {product.sku}</CardDescription>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground flex-1">
        {product.description}
      </CardContent>
      <CardFooter className="flex items-center justify-between">
        <div className="font-semibold">{formatCurrency(product.price)}</div>
        <Button onClick={() => add(product.sku)}>Adicionar ao Carrinho</Button>
      </CardFooter>
    </Card>
  );
};

export default ProductCard;
