import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";
import { useProducts } from "@/context/ProductsContext";
import { formatCurrency, onlyDigits } from "@/utils/format";

const CartSheet = ({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) => {
  const { items, add, decrement, remove, clear, total } = useCart();
  const { products, whatsappNumber } = useProducts();

  const entries = Object.entries(items);

  const buildWhatsAppLink = () => {
    const lines: string[] = ["Olá! Quero finalizar minha compra:"]; 
    for (const [sku, qty] of entries) {
      const p = products.find(pr => pr.sku === sku);
      if (p) {
        lines.push(`• ${p.name} (ID: ${p.id}) — ${qty}x ${formatCurrency(p.price)} = ${formatCurrency(p.price * qty)}`);
      }
    }
    lines.push(`Total: ${formatCurrency(total)}`);
    const msg = encodeURIComponent(lines.join("\n"));
    const num = onlyDigits(whatsappNumber);
    return `https://wa.me/${num}?text=${msg}`;
  };

  const buildCartUrl = () => {
    const segments = entries
      .map(([sku, qty]) => {
        const p = products.find((pr) => pr.sku === sku);
        return p ? `${p.id}:${qty}` : null;
      })
      .filter(Boolean)
      .join(",");
    return `${window.location.origin}/carrinho/${segments}`;
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Seu Carrinho</SheetTitle>
          <SheetDescription>Revise os itens antes de finalizar.</SheetDescription>
        </SheetHeader>
        <div className="mt-6 space-y-4">
          {entries.length === 0 && <p className="text-sm text-muted-foreground">Seu carrinho está vazio.</p>}
          {entries.map(([sku, qty]) => {
            const p = products.find(pr => pr.sku === sku);
            if (!p) return null;
            return (
              <div key={sku} className="flex items-center gap-3 border rounded-md p-3">
                <img src={p.imageUrl} alt={p.name} className="h-14 w-14 object-cover rounded" />
                <div className="flex-1">
                  <div className="font-medium">{p.name}</div>
                  <div className="text-xs text-muted-foreground">ID: {p.id}</div>
                  <div className="text-sm">{formatCurrency(p.price)} • Qtd: {qty}</div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="secondary" size="sm" onClick={() => decrement(sku)}>-</Button>
                  <Button variant="secondary" size="sm" onClick={() => add(sku)}>+</Button>
                  <Button variant="destructive" size="sm" onClick={() => remove(sku)}>Remover</Button>
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-6 flex items-center justify-between border-t pt-4">
          <span className="text-sm text-muted-foreground">Total</span>
          <span className="font-semibold">{formatCurrency(total)}</span>
        </div>
  <SheetFooter className="mt-4 flex gap-2">
          <Button variant="outline" onClick={clear} disabled={entries.length === 0}>Limpar</Button>
          <Button asChild variant="secondary" disabled={entries.length === 0}>
            <a href={buildCartUrl()} target="_blank" rel="noreferrer">Gerar URL do Carrinho</a>
          </Button>
          <Button asChild disabled={entries.length === 0 || !whatsappNumber}>
            <a href={whatsappNumber ? buildWhatsAppLink() : undefined} target="_blank" rel="noreferrer">
              Finalizar Compra no WhatsApp
            </a>
          </Button>
        </SheetFooter>
        {!whatsappNumber && (
          <p className="text-xs text-muted-foreground mt-2">Configure o número de WhatsApp na área Admin para finalizar a compra.</p>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default CartSheet;
