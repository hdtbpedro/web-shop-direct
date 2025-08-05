import { useEffect, useMemo, useState } from "react";
import { useProducts } from "@/context/ProductsContext";
import { STORAGE_KEYS, onlyDigits } from "@/utils/format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Product } from "@/types";

const Admin = () => {
  const { products, addProduct, updateProduct, deleteProduct, whatsappNumber, setWhatsAppNumber, isSkuAvailable } = useProducts();
  const [logged, setLogged] = useState(false);

  // Seed default credentials if none
  useEffect(() => {
    const creds = localStorage.getItem(STORAGE_KEYS.adminCredentials);
    if (!creds) {
      localStorage.setItem(STORAGE_KEYS.adminCredentials, JSON.stringify({ username: "admin", password: "admin123" }));
    }
    const session = localStorage.getItem(STORAGE_KEYS.adminSession);
    setLogged(session === "true");
  }, []);

  const handleLogin = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const username = String(data.get("username") || "");
    const password = String(data.get("password") || "");
    const creds = JSON.parse(localStorage.getItem(STORAGE_KEYS.adminCredentials) || "{}");
    if (creds.username === username && creds.password === password) {
      localStorage.setItem(STORAGE_KEYS.adminSession, "true");
      setLogged(true);
    } else {
      alert("Credenciais inválidas");
    }
  };

  const logout = () => {
    localStorage.removeItem(STORAGE_KEYS.adminSession);
    setLogged(false);
  };

  if (!logged) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-sm">
          <CardHeader>
            <CardTitle>Acesso Administrativo</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Usuário</Label>
                <Input id="username" name="username" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input id="password" name="password" type="password" required />
              </div>
              <Button className="w-full" type="submit">Entrar</Button>
              <p className="text-xs text-muted-foreground">Padrão: admin / admin123</p>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen container mx-auto py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Painel Administrativo</h1>
        <Button variant="outline" onClick={logout}>Sair</Button>
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
  const [creating, setCreating] = useState<Omit<Product, "id">>({ name: "", description: "", imageUrl: "", price: 0, sku: "" });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editing, setEditing] = useState<Omit<Product, "id">>({ name: "", description: "", imageUrl: "", price: 0, sku: "" });

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

  const onCreateImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const dataUrl = await processImageFile(f);
    setCreating((v) => ({ ...v, imageUrl: dataUrl }));
  };

  const onEditImageChange = async (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const dataUrl = await processImageFile(f);
    setEditing((v) => ({ ...v, imageUrl: dataUrl }));
  };

  const submitAdd = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      if (!isSkuAvailable(creating.sku)) return alert("SKU já existe");
      if (!creating.imageUrl) return alert("Envie uma imagem do produto");
      onAdd({ ...creating, price: Number(creating.price) });
      setCreating({ name: "", description: "", imageUrl: "", price: 0, sku: "" });
    } catch (err: any) {
      alert(err?.message || "Erro ao adicionar");
    }
  };

  const startEdit = (p: Product) => {
    setEditingId(p.id);
    setEditing({ name: p.name, description: p.description, imageUrl: p.imageUrl, price: p.price, sku: p.sku });
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
              <Label htmlFor="imageFile">Imagem (PNG, JPG ou HEIC)</Label>
              <Input id="imageFile" type="file" accept="image/png,image/jpeg,image/heic,image/heif" onChange={onCreateImageChange} required />
              {creating.imageUrl && (
                <div className="mt-2">
                  <img src={creating.imageUrl} alt="Prévia" className="h-24 w-24 object-cover rounded" />
                </div>
              )}
            </div>
            <div className="md:col-span-2 flex justify-end">
              <Button type="submit" disabled={!creating.imageUrl}>Adicionar</Button>
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
                    <div className="flex items-center gap-2">
                      <img src={p.imageUrl} alt={p.name} className="h-12 w-12 object-cover rounded" />
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
