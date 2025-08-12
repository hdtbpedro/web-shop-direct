import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Product } from "@/types";
import { useCart } from "@/context/CartContext";
import { formatCurrency } from "@/utils/format";

const ProductCard = ({ product }: { product: Product }) => {
  const { add } = useCart();
  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <div className="aspect-[4/3] w-full overflow-hidden rounded-md">
          {product.imageUrls.length === 1 ? (
            <img src={product.imageUrls[0]} alt={product.name} className="h-full w-full object-cover" />
          ) : (
            <Carousel className="w-full">
              <CarouselContent>
                {product.imageUrls.map((imageUrl, index) => (
                  <CarouselItem key={index}>
                    <img src={imageUrl} alt={`${product.name} - ${index + 1}`} className="h-full w-full object-cover" />
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="left-2" />
              <CarouselNext className="right-2" />
            </Carousel>
          )}
        </div>
        <CardTitle className="mt-2 text-lg">{product.name}</CardTitle>
        <CardDescription>ID: {product.id}</CardDescription>
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
