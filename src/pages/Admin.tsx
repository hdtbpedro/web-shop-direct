import React, { useState, useContext } from 'react';
import { ProductsContext } from '../context/ProductsContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Trash2, Edit, Plus, X, Settings } from 'lucide-react';
import { Product } from '../types';

export default function Admin() {
  const { products, addProduct, updateProduct, deleteProduct, whatsappNumber, setWhatsappNumber } = useContext(ProductsContext);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    description: '',
    sku: '',
    imageUrls: [] as string[]
  });
  const [tempWhatsapp, setTempWhatsapp] = useState(whatsappNumber);

  const resetForm = () => {
    setFormData({
      name: '',
      price: '',
      description: '',
      sku: '',
      imageUrls: []
    });
    setEditingProduct(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.price || !formData.sku || formData.imageUrls.length === 0) {
      alert('Por favor, preencha todos os campos obrigatórios e adicione pelo menos uma imagem.');
      return;
    }

    // Check for duplicate SKU
    const existingSku = products.find(p => p.sku === formData.sku && p.id !== editingProduct?.id);
    if (existingSku) {
      alert('SKU já existe. Por favor, use um SKU único.');
      return;
    }

    const productData = {
      name: formData.name,
      price: parseFloat(formData.price),
      description: formData.description,
      sku: formData.sku,
      imageUrls: formData.imageUrls
    };

    if (editingProduct) {
      updateProduct(editingProduct.id, productData);
    } else {
      addProduct(productData);
    }

    resetForm();
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      price: product.price.toString(),
      description: product.description,
      sku: product.sku,
      imageUrls: [...product.imageUrls]
    });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const result = e.target?.result as string;
          setFormData(prev => ({
            ...prev,
            imageUrls: [...prev.imageUrls, result]
          }));
        };
        reader.readAsDataURL(file);
      }
    });
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      imageUrls: prev.imageUrls.filter((_, i) => i !== index)
    }));
  };

  const saveWhatsappConfig = () => {
    setWhatsappNumber(tempWhatsapp);
    alert('Configuração do WhatsApp salva!');
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center gap-2 mb-6">
        <Settings className="w-6 h-6" />
        <h1 className="text-3xl font-bold">Painel Administrativo</h1>
      </div>

      <Tabs defaultValue="products" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="products">Produtos</TabsTrigger>
          <TabsTrigger value="config">Configurações</TabsTrigger>
        </TabsList>

        <TabsContent value="products" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{editingProduct ? 'Editar Produto' : 'Adicionar Produto'}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Nome do Produto *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="price">Preço (R$) *</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="sku">SKU *</Label>
                  <Input
                    id="sku"
                    value={formData.sku}
                    onChange={(e) => setFormData(prev => ({ ...prev, sku: e.target.value }))}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="images">Imagens do Produto *</Label>
                  <Input
                    id="images"
                    type="file"
                    multiple
                    accept="image/*,.heic"
                    onChange={handleImageUpload}
                    className="mb-2"
                  />
                  {formData.imageUrls.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
                      {formData.imageUrls.map((url, index) => (
                        <div key={index} className="relative">
                          <img
                            src={url}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-20 object-cover rounded border"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            className="absolute -top-2 -right-2 w-6 h-6 p-0"
                            onClick={() => removeImage(index)}
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button type="submit">
                    {editingProduct ? 'Atualizar' : 'Adicionar'} Produto
                  </Button>
                  {editingProduct && (
                    <Button type="button" variant="outline" onClick={resetForm}>
                      Cancelar
                    </Button>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Produtos Cadastrados ({products.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {products.length === 0 ? (
                <p className="text-gray-500 text-center py-8">Nenhum produto cadastrado ainda.</p>
              ) : (
                <div className="space-y-4">
                  {products.map((product) => (
                    <div key={product.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        {product.imageUrls.length > 0 && (
                          <img
                            src={product.imageUrls[0]}
                            alt={product.name}
                            className="w-16 h-16 object-cover rounded"
                          />
                        )}
                        <div>
                          <h3 className="font-semibold">{product.name}</h3>
                          <p className="text-sm text-gray-600">SKU: {product.sku}</p>
                          <p className="text-sm font-medium">R$ {product.price.toFixed(2)}</p>
                          {product.imageUrls.length > 1 && (
                            <p className="text-xs text-blue-600">+{product.imageUrls.length - 1} fotos</p>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(product)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => {
                            if (confirm('Tem certeza que deseja excluir este produto?')) {
                              deleteProduct(product.id);
                            }
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="config">
          <Card>
            <CardHeader>
              <CardTitle>Configurações do WhatsApp</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="whatsapp">Número do WhatsApp (com código do país)</Label>
                <Input
                  id="whatsapp"
                  placeholder="Ex: 5511999999999"
                  value={tempWhatsapp}
                  onChange={(e) => setTempWhatsapp(e.target.value)}
                />
                <p className="text-sm text-gray-600 mt-1">
                  Formato: código do país + DDD + número (sem espaços ou símbolos)
                </p>
              </div>
              <Button onClick={saveWhatsappConfig}>
                Salvar Configuração
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}