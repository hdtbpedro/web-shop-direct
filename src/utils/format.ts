export const STORAGE_KEYS = {
  products: "products",
  cart: "cart",
  whatsapp: "whatsappNumber",
  adminCredentials: "adminCredentials",
  adminSession: "adminSession",
} as const;

export const formatCurrency = (value: number) =>
  value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export const onlyDigits = (v: string) => v.replace(/\D/g, "");
