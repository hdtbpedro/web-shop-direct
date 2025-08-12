export type Product = {
  id: string;
  sku: string; // unique
  name: string;
  description: string;
  price: number; // in BRL
  imageUrls: string[]; // múltiplas imagens
};

export type CartItem = {
  sku: string;
  quantity: number;
};
