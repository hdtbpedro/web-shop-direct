import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter, SheetDescription } from "@/components/ui/sheet";
import { Button, buttonVariants } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";
import { useProducts } from "@/context/ProductsContext";
import { formatCurrency, onlyDigits } from "@/utils/format";
import { cn } from "@/lib/utils";

const CartSheet = () => {
  const { items, add, decrement, remove, clear, total, isCartOpen, setCartOpen } = useCart();
  const { products, whatsappNumber } = useProducts();

  const entries = Object.entries(items);
  const itemCount = entries.length;

const buildWhatsAppLink = () => {
    const lines: string[] = ["Olá! Quero finalizar minha compra:"]; 
    for (const [sku, qty] of entries) {
      const p = products.find(pr => pr.sku === sku);
      if (p) {
        lines.push(`• ${p.name} (SKU: ${p.sku}) — ${qty}x ${formatCurrency(p.price)}`);
      }
    }
    lines.push(`Total: ${formatCurrency(total)}`);
    
    const cartUrl = buildCartUrl();
    lines.push(`\nLink do Carrinho: ${cartUrl}`);

    const msg = encodeURIComponent(lines.join("\n"));
    const num = onlyDigits(whatsappNumber);
    return `https://wa.me/${num}?text=${msg}`;
};

  const buildCartUrl = () => {
    const segments = entries
      .map(([sku, qty]) => {
        return `${sku}:${qty}`;
      })
      .join(",");
   return `${window.location.origin}/carrinho/${segments}`;
  };

  

  return (
    <Sheet open={isCartOpen} onOpenChange={setCartOpen}>
      <SheetContent className="flex flex-col">
        <SheetHeader>
          <SheetTitle>Seu Carrinho</SheetTitle>
          <SheetDescription>Revise os itens antes de finalizar.</SheetDescription>
        </SheetHeader>
        <div 
            className={cn("space-y-4 overflow-x-hidden", {
                "overflow-y-auto max-h-[50vh]": itemCount > 3,
            })}
        >
        {entries.length === 0 && <p className="text-sm text-muted-foreground p-4">Seu carrinho está vazio.</p>}
        {entries.map(([sku, qty]) => {
          const p = products.find(pr => pr.sku === sku);
          if (!p) return null;
          return (
             <div key={sku} className="flex items-center gap-3 border rounded-md p-3">
               <img src={p.imageUrls[0]} alt={p.name} className="h-14 w-14 object-cover rounded shrink-0" />
               <div className="flex-1">
                 <div className="font-medium">{p.name}</div>
                 <div className="text-xs text-muted-foreground">ID: {p.id}</div>
                 <div className="text-sm">{formatCurrency(p.price)} • Qtd: {qty}</div>
               </div>
               <div className="flex items-center gap-2 shrink-0">
                 <Button variant="secondary" size="sm" onClick={() => decrement(sku)}>-</Button>
                 <Button variant="secondary" size="sm" onClick={() => add(sku)}>+</Button>
                 <Button variant="destructive" size="sm" onClick={() => remove(sku)}>Remover</Button>
               </div>
             </div>
          );
        })}
        </div>
        <div className="mt-6 flex items-center justify-between border-t pt-4 shrink-0">
        <span className="text-sm text-muted-foreground">Total</span>
        <span className="font-semibold">{formatCurrency(total)}</span>
        </div>
          <SheetFooter className="mt-4 flex gap-0 justify-end shrink-0">
          <Button variant="outline" onClick={clear} disabled={entries.length === 0}>Limpar</Button>
          
          <Button
            disabled={entries.length === 0 || !whatsappNumber}
            onClick={() => {
              if (whatsappNumber) {
                window.open(buildWhatsAppLink(), "_blank");
              }
            }}
          >
            Finalizar Compra
          </Button>
        </SheetFooter>
        {!whatsappNumber && (
        <p className="text-xs text-muted-foreground mt-2 shrink-0">Configure o número de WhatsApp na área Admin para finalizar a compra.</p>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default CartSheet;