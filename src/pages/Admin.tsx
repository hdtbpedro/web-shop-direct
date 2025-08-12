import { useEffect, useMemo, useState } from "react";
import { useProducts } from "@/context/ProductsContext";
import { STORAGE_KEYS, onlyDigits } from "@/utils/format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { X, Plus } from "lucide-react";
import { Product } from "@/types";

const Admin = () => {
  const { products, addProduct, updateProduct, deleteProduct, whatsappNumber, setWhatsAppNumber, isSkuAvailable } = useProducts();

  return (
    <div className="min-h-screen container mx-auto py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Gerenciar Produtos</h1>
      </div>

      <Tabs defaultValue="produtos">
        <TabsList>
          <TabsTrigger value="produtos">Produtos</TabsTrigger>
          <TabsTrigger value="config">Configurações</TabsTrigger>
        </TabsList>
        <TabsContent value="produtos" className="mt-6">
          <ProductManager products={products} onAdd={addProduct} onUpdate={updateProduct} onDelete={deleteProduct} isSkuAvailable={isSkuAvailable} />
        </TabsContent>
        <TabsContent value="config" className="mt-6">
          <ConfigManager whatsappNumber={whatsappNumber} setWhatsAppNumber={setWhatsAppNumber} />
          <CredentialsManager />
        </TabsContent>
      </Tabs>
    </div>
  );
};

const ProductManager = ({ products, onAdd, onUpdate, onDelete, isSkuAvailable }:{
  products: Product[];
  onAdd: (p: Omit<Product, "id">) => void;
  onUpdate: (id: string, p: Omit<Product, "id">) => void;
  onDelete: (id: string) => void;
  isSkuAvailable: (sku: string, excludeId?: string) => boolean;
}) => {
  const [creating, setCreating] = useState<Omit<Product, "id">>({ name: "", description: "", imageUrls: [], price: 0, sku: "" });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editing, setEditing] = useState<Omit<Product, "id">>({ name: "", description: "", imageUrls: [], price: 0, sku: "" });

  const fileToDataURL = (blob: Blob): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });

  const processImageFile = async (file: File): Promise<string> => {
    const type = file.type || "";
    const isHeic = type === "image/heic" || type === "image/heif" || /\.heic$/i.test(file.name) || /\.heif$/i.test(file.name);
    if (isHeic) {
      try {
        const mod = await import("heic2any");
        const heic2any = (mod as any).default || (mod as any);
        const converted = await heic2any({ blob: file, toType: "image/jpeg", quality: 0.9 });
        const blob = Array.isArray(converted) ? converted[0] : converted;
        return await fileToDataURL(blob as Blob);
      } catch (e) {
        alert("Falha ao converter imagem HEIC. Tente PNG ou JPG.");
        throw e;
      }
    }
    return await fileToDataURL(file);
  };

  const onCreateImagesChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    
    const dataUrls: string[] = [];
    for (const file of files) {
      try {
        const dataUrl = await processImageFile(file);
        dataUrls.push(dataUrl);
      } catch (error) {
        console.error("Erro ao processar imagem:", error);
      }
    }
    
    setCreating((v) => ({ ...v, imageUrls: [...v.imageUrls, ...dataUrls] }));
  };

  const onEditImagesChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    
    const dataUrls: string[] = [];
    for (const file of files) {
      try {
        const dataUrl = await processImageFile(file);
        dataUrls.push(dataUrl);
      } catch (error) {
        console.error("Erro ao processar imagem:", error);
      }
    }
    
    setEditing((v) => ({ ...v, imageUrls: [...v.imageUrls, ...dataUrls] }));
  };

  const removeCreateImage = (index: number) => {
    setCreating((v) => ({ ...v, imageUrls: v.imageUrls.filter((_, i) => i !== index) }));
  };

  const removeEditImage = (index: number) => {
    setEditing((v) => ({ ...v, imageUrls: v.imageUrls.filter((_, i) => i !== index) }));
  };

  const submitAdd = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      if (!isSkuAvailable(creating.sku)) return alert("SKU já existe");
      if (creating.imageUrls.length === 0) return alert("Envie pelo menos uma imagem do produto");
      onAdd({ ...creating, price: Number(creating.price) });
      setCreating({ name: "", description: "", imageUrls: [], price: 0, sku: "" });
    } catch (err: any) {
      alert(err?.message || "Erro ao adicionar");
    }
  };

  const startEdit = (p: Product) => {
    setEditingId(p.id);
    setEditing({ name: p.name, description: p.description, imageUrls: [...p.imageUrls], price: p.price, sku: p.sku });
  };

  const saveEdit = () => {
    if (!editingId) return;
    if (!isSkuAvailable(editing.sku, editingId)) return alert("SKU já existe");
    onUpdate(editingId, { ...editing, price: Number(editing.price) });
    setEditingId(null);
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Adicionar Produto</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={submitAdd} className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome</Label>
              <Input id="name" value={creating.name} onChange={e => setCreating(v => ({ ...v, name: e.target.value }))} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sku">SKU</Label>
              <Input id="sku" value={creating.sku} onChange={e => setCreating(v => ({ ...v, sku: e.target.value }))} required />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="description">Descrição</Label>
              <Input id="description" value={creating.description} onChange={e => setCreating(v => ({ ...v, description: e.target.value }))} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="imageFiles">Imagens (PNG, JPG ou HEIC) - Múltiplas seleções permitidas</Label>
              <Input id="imageFiles" type="file" accept="image/png,image/jpeg,image/heic,image/heif" multiple onChange={onCreateImagesChange} />
              {creating.imageUrls.length > 0 && (
                <div className="mt-2">
                  <div className="grid grid-cols-4 gap-2">
                    {creating.imageUrls.map((imageUrl, index) => (
                      <div key={index} className="relative">
                        <img src={imageUrl} alt={`Prévia ${index + 1}`} className="h-24 w-24 object-cover rounded" />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                          onClick={() => removeCreateImage(index)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="price">Preço (R$)</Label>
              <Input id="price" type="number" step="0.01" value={creating.price} onChange={e => setCreating(v => ({ ...v, price: Number(e.target.value) }))} required />
            </div>
            <div className="md:col-span-2 flex justify-end">
              <Button type="submit" disabled={creating.imageUrls.length === 0}>Adicionar</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Produtos</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Imagem</TableHead>
                <TableHead>Nome</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Preço</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map(p => (
                <TableRow key={p.id}>
                  <TableCell>
                    <div className="flex items-center gap-2 flex-col">
                      {editingId === p.id ? (
                        <div className="space-y-2">
                          <div className="grid grid-cols-3 gap-1">
                            {editing.imageUrls.map((imageUrl, index) => (
                              <div key={index} className="relative">
                                <img src={imageUrl} alt={`${p.name} ${index + 1}`} className="h-12 w-12 object-cover rounded" />
                                <Button
                                  type="button"
                                  variant="destructive"
                                  size="sm"
                                  className="absolute -top-1 -right-1 h-4 w-4 rounded-full p-0"
                                  onClick={() => removeEditImage(index)}
                                >
                                  <X className="h-2 w-2" />
                                </Button>
                              </div>
                            ))}
                          </div>
                          <Input type="file" accept="image/png,image/jpeg,image/heic,image/heif" multiple onChange={onEditImagesChange} />
                        </div>
                      ) : (
                        p.imageUrls.length === 1 ? (
                          <img src={p.imageUrls[0]} alt={p.name} className="h-12 w-12 object-cover rounded" />
                        ) : (
                          <div className="w-12 h-12">
                            <Carousel className="w-full h-full">
                              <CarouselContent>
                                {p.imageUrls.map((imageUrl, index) => (
                                  <CarouselItem key={index}>
                                    <img src={imageUrl} alt={`${p.name} - ${index + 1}`} className="h-12 w-12 object-cover rounded" />
                                  </CarouselItem>
                                ))}
                              </CarouselContent>
                            </Carousel>
                          </div>
                        )
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {editingId === p.id ? (
                      <Input value={editing.name} onChange={e => setEditing(v => ({ ...v, name: e.target.value }))} />
                    ) : (
                      p.name
                    )}
                  </TableCell>
                  <TableCell>
                    {editingId === p.id ? (
                      <Input value={editing.sku} onChange={e => setEditing(v => ({ ...v, sku: e.target.value }))} />
                    ) : (
                      p.sku
                    )}
                  </TableCell>
                  <TableCell>
                    {editingId === p.id ? (
                      <Input type="number" step="0.01" value={editing.price} onChange={e => setEditing(v => ({ ...v, price: Number(e.target.value) }))} />
                    ) : (
                      new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(p.price)
                    )}
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    {editingId === p.id ? (
                      <>
                        <Button size="sm" onClick={saveEdit}>Salvar</Button>
                        <Button size="sm" variant="secondary" onClick={() => setEditingId(null)}>Cancelar</Button>
                      </>
                    ) : (
                      <>
                        <Button size="sm" variant="secondary" onClick={() => startEdit(p)}>Editar</Button>
                        <Button size="sm" variant="destructive" onClick={() => onDelete(p.id)}>Excluir</Button>
                      </>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

const ConfigManager = ({ whatsappNumber, setWhatsAppNumber }:{ whatsappNumber: string; setWhatsAppNumber: (v: string) => void }) => {
  const [num, setNum] = useState(whatsappNumber);

  const save = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setWhatsAppNumber(num);
    alert("Número de WhatsApp salvo");
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>WhatsApp</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={save} className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="wa">Número (somente dígitos, c/ DDI+DDD. Ex: 5511999999999)</Label>
            <Input id="wa" value={num} onChange={e => setNum(onlyDigits(e.target.value))} placeholder="5511999999999" />
          </div>
          <div className="md:col-span-2 flex justify-end">
            <Button type="submit">Salvar</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

const CredentialsManager = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    const creds = JSON.parse(localStorage.getItem(STORAGE_KEYS.adminCredentials) || "{}");
    setUsername(creds.username || "admin");
    setPassword(creds.password || "admin123");
  }, []);

  const save = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    localStorage.setItem(STORAGE_KEYS.adminCredentials, JSON.stringify({ username, password }));
    alert("Credenciais atualizadas");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Credenciais de Acesso (Opcional)</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={save} className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="user">Usuário</Label>
            <Input id="user" value={username} onChange={e => setUsername(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="pass">Senha</Label>
            <Input id="pass" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
          </div>
          <div className="md:col-span-2 flex justify-end">
            <Button type="submit">Salvar</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
                      {editingId === p.id && (
                        <Input type="file" accept="image/png,image/jpeg,image/heic,image/heif" onChange={(e) => onEditImageChange(p.id, e)} />
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {editingId === p.id ? (
                      <Input value={editing.name} onChange={e => setEditing(v => ({ ...v, name: e.target.value }))} />
                    ) : (
                      p.name
                    )}
                  </TableCell>
                  <TableCell>
                    {editingId === p.id ? (
                      <Input value={editing.sku} onChange={e => setEditing(v => ({ ...v, sku: e.target.value }))} />
                    ) : (
                      p.sku
                    )}
                  </TableCell>
                  <TableCell>
                    {editingId === p.id ? (
                      <Input type="number" step="0.01" value={editing.price} onChange={e => setEditing(v => ({ ...v, price: Number(e.target.value) }))} />
                    ) : (
                      new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(p.price)
                    )}
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    {editingId === p.id ? (
                      <>
                        <Button size="sm" onClick={saveEdit}>Salvar</Button>
                        <Button size="sm" variant="secondary" onClick={() => setEditingId(null)}>Cancelar</Button>
                      </>
                    ) : (
                      <>
                        <Button size="sm" variant="secondary" onClick={() => startEdit(p)}>Editar</Button>
                        <Button size="sm" variant="destructive" onClick={() => onDelete(p.id)}>Excluir</Button>
                      </>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

const ConfigManager = ({ whatsappNumber, setWhatsAppNumber }:{ whatsappNumber: string; setWhatsAppNumber: (v: string) => void }) => {
  const [num, setNum] = useState(whatsappNumber);

  const save = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setWhatsAppNumber(num);
    alert("Número de WhatsApp salvo");
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>WhatsApp</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={save} className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="wa">Número (somente dígitos, c/ DDI+DDD. Ex: 5511999999999)</Label>
            <Input id="wa" value={num} onChange={e => setNum(onlyDigits(e.target.value))} placeholder="5511999999999" />
          </div>
          <div className="md:col-span-2 flex justify-end">
            <Button type="submit">Salvar</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

const CredentialsManager = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    const creds = JSON.parse(localStorage.getItem(STORAGE_KEYS.adminCredentials) || "{}");
    setUsername(creds.username || "admin");
    setPassword(creds.password || "admin123");
  }, []);

  const save = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    localStorage.setItem(STORAGE_KEYS.adminCredentials, JSON.stringify({ username, password }));
    alert("Credenciais atualizadas");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Credenciais de Acesso</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={save} className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="user">Usuário</Label>
            <Input id="user" value={username} onChange={e => setUsername(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="pass">Senha</Label>
            <Input id="pass" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
          </div>
          <div className="md:col-span-2 flex justify-end">
            <Button type="submit">Salvar</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default Admin;
