export type Product = {
  id: string;
  sku: string; // unique
  name: string;
  description: string;
  price: number; // in BRL
  imageUrl: string;
};

export type CartItem = {
  sku: string;
  quantity: number;
};
