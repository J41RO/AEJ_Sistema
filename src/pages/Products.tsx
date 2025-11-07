import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Package, 
  AlertTriangle,
  CheckCircle,
  Eye,
  DollarSign
} from 'lucide-react';
import { User, hasPermission } from '@/lib/auth';
import { db, Producto, Categoria, Marca, Proveedor } from '@/lib/database';

interface ProductsProps {
  user: User;
}

export default function Products({ user }: ProductsProps) {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [marcas, setMarcas] = useState<Marca[]>([]);
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredProductos, setFilteredProductos] = useState<Producto[]>([]);
  const [showDialog, setShowDialog] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Producto | null>(null);
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  
  const [formData, setFormData] = useState({
    sku: '',
    nombre: '',
    descripcion: '',
    categoria_id: '',
    marca_id: '',
    proveedor_id: '',
    precio_compra: 0,
    precio_venta: 0,
    stock_actual: 0,
    stock_minimo: 0,
    aplica_iva: true,
    porcentaje_iva: 19,
    activo: true
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [productos, searchQuery]);

  const loadData = () => {
    setProductos(db.getProductos());
    setCategorias(db.getCategorias().filter(c => c.activo));
    setMarcas(db.getMarcas().filter(m => m.activo));
    setProveedores(db.getProveedores().filter(p => p.activo));
  };

  const filterProducts = () => {
    let filtered = productos;
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = productos.filter(p => 
        p.nombre.toLowerCase().includes(query) ||
        p.sku.toLowerCase().includes(query) ||
        p.descripcion?.toLowerCase().includes(query)
      );
    }
    
    setFilteredProductos(filtered);
  };

  const resetForm = () => {
    setFormData({
      sku: '',
      nombre: '',
      descripcion: '',
      categoria_id: '',
      marca_id: '',
      proveedor_id: '',
      precio_compra: 0,
      precio_venta: 0,
      stock_actual: 0,
      stock_minimo: 0,
      aplica_iva: true,
      porcentaje_iva: 19,
      activo: true
    });
    setEditingProduct(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!hasPermission(user, 'productos.write')) {
      showAlert('error', 'No tienes permisos para crear/editar productos');
      return;
    }

    if (formData.precio_venta <= formData.precio_compra) {
      showAlert('error', 'El precio de venta debe ser mayor al precio de compra');
      return;
    }

    try {
      if (editingProduct) {
        db.updateProducto(editingProduct.id, formData);
        showAlert('success', 'Producto actualizado exitosamente');
      } else {
        // Generar SKU automático si está vacío
        if (!formData.sku) {
          const categoria = categorias.find(c => c.id === formData.categoria_id);
          const marca = marcas.find(m => m.id === formData.marca_id);
          const categPrefix = categoria?.nombre.substring(0, 3).toUpperCase() || 'GEN';
          const marcaPrefix = marca?.nombre.substring(0, 3).toUpperCase() || 'GEN';
          const count = productos.length + 1;
          formData.sku = `${categPrefix}-${marcaPrefix}-${String(count).padStart(3, '0')}`;
        }
        
        db.createProducto(formData);
        showAlert('success', 'Producto creado exitosamente');
      }
      
      loadData();
      setShowDialog(false);
      resetForm();
    } catch (error) {
      showAlert('error', 'Error al guardar el producto');
    }
  };

  const handleEdit = (producto: Producto) => {
    if (!hasPermission(user, 'productos.write')) {
      showAlert('error', 'No tienes permisos para editar productos');
      return;
    }
    
    setEditingProduct(producto);
    setFormData({
      sku: producto.sku,
      nombre: producto.nombre,
      descripcion: producto.descripcion || '',
      categoria_id: producto.categoria_id,
      marca_id: producto.marca_id,
      proveedor_id: producto.proveedor_id || '',
      precio_compra: producto.precio_compra,
      precio_venta: producto.precio_venta,
      stock_actual: producto.stock_actual,
      stock_minimo: producto.stock_minimo,
      aplica_iva: producto.aplica_iva,
      porcentaje_iva: producto.porcentaje_iva,
      activo: producto.activo
    });
    setShowDialog(true);
  };

  const showAlert = (type: 'success' | 'error', message: string) => {
    setAlert({ type, message });
    setTimeout(() => setAlert(null), 5000);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getCategoriaNombre = (id: string) => {
    return categorias.find(c => c.id === id)?.nombre || 'Sin categoría';
  };

  const getMarcaNombre = (id: string) => {
    return marcas.find(m => m.id === id)?.nombre || 'Sin marca';
  };

  const getStockStatus = (producto: Producto) => {
    if (producto.stock_actual === 0) {
      return { label: 'Sin Stock', color: 'bg-red-100 text-red-800 border-red-200' };
    } else if (producto.stock_actual <= producto.stock_minimo) {
      return { label: 'Stock Bajo', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' };
    } else {
      return { label: 'Stock OK', color: 'bg-green-100 text-green-800 border-green-200' };
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Productos</h1>
          <p className="text-gray-600">Administra el catálogo completo de productos</p>
        </div>
        {hasPermission(user, 'productos.write') && (
          <Dialog open={showDialog} onOpenChange={setShowDialog}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="w-4 h-4 mr-2" />
                Nuevo Producto
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingProduct ? 'Editar Producto' : 'Nuevo Producto'}
                </DialogTitle>
                <DialogDescription>
                  {editingProduct ? 'Modifica los datos del producto' : 'Completa la información del nuevo producto'}
                </DialogDescription>
              </DialogHeader>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="sku">SKU (opcional)</Label>
                    <Input
                      id="sku"
                      value={formData.sku}
                      onChange={(e) => setFormData({...formData, sku: e.target.value})}
                      placeholder="Se genera automáticamente"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="nombre">Nombre *</Label>
                    <Input
                      id="nombre"
                      value={formData.nombre}
                      onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="descripcion">Descripción</Label>
                  <Textarea
                    id="descripcion"
                    value={formData.descripcion}
                    onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="categoria">Categoría *</Label>
                    <Select value={formData.categoria_id} onValueChange={(value) => setFormData({...formData, categoria_id: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar" />
                      </SelectTrigger>
                      <SelectContent>
                        {categorias.map((categoria) => (
                          <SelectItem key={categoria.id} value={categoria.id}>
                            {categoria.nombre}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="marca">Marca *</Label>
                    <Select value={formData.marca_id} onValueChange={(value) => setFormData({...formData, marca_id: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar" />
                      </SelectTrigger>
                      <SelectContent>
                        {marcas.map((marca) => (
                          <SelectItem key={marca.id} value={marca.id}>
                            {marca.nombre}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="proveedor">Proveedor</Label>
                    <Select value={formData.proveedor_id} onValueChange={(value) => setFormData({...formData, proveedor_id: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Sin proveedor</SelectItem>
                        {proveedores.map((proveedor) => (
                          <SelectItem key={proveedor.id} value={proveedor.id}>
                            {proveedor.razon_social}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="precio_compra">Precio de Compra *</Label>
                    <Input
                      id="precio_compra"
                      type="number"
                      min="0"
                      step="100"
                      value={formData.precio_compra}
                      onChange={(e) => setFormData({...formData, precio_compra: Number(e.target.value)})}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="precio_venta">Precio de Venta *</Label>
                    <Input
                      id="precio_venta"
                      type="number"
                      min="0"
                      step="100"
                      value={formData.precio_venta}
                      onChange={(e) => setFormData({...formData, precio_venta: Number(e.target.value)})}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="stock_actual">Stock Actual</Label>
                    <Input
                      id="stock_actual"
                      type="number"
                      min="0"
                      value={formData.stock_actual}
                      onChange={(e) => setFormData({...formData, stock_actual: Number(e.target.value)})}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="stock_minimo">Stock Mínimo</Label>
                    <Input
                      id="stock_minimo"
                      type="number"
                      min="0"
                      value={formData.stock_minimo}
                      onChange={(e) => setFormData({...formData, stock_minimo: Number(e.target.value)})}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="aplica_iva"
                      checked={formData.aplica_iva}
                      onCheckedChange={(checked) => setFormData({...formData, aplica_iva: checked})}
                    />
                    <Label htmlFor="aplica_iva">Aplica IVA</Label>
                  </div>

                  {formData.aplica_iva && (
                    <div className="space-y-2">
                      <Label htmlFor="porcentaje_iva">Porcentaje IVA (%)</Label>
                      <Input
                        id="porcentaje_iva"
                        type="number"
                        min="0"
                        max="100"
                        value={formData.porcentaje_iva}
                        onChange={(e) => setFormData({...formData, porcentaje_iva: Number(e.target.value)})}
                      />
                    </div>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="activo"
                    checked={formData.activo}
                    onCheckedChange={(checked) => setFormData({...formData, activo: checked})}
                  />
                  <Label htmlFor="activo">Producto activo</Label>
                </div>

                <div className="flex justify-end space-x-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setShowDialog(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit">
                    {editingProduct ? 'Actualizar' : 'Crear'} Producto
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {alert && (
        <Alert className={`${alert.type === 'success' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
          {alert.type === 'success' ? (
            <CheckCircle className="h-4 w-4 text-green-600" />
          ) : (
            <AlertTriangle className="h-4 w-4 text-red-600" />
          )}
          <AlertDescription className={alert.type === 'success' ? 'text-green-800' : 'text-red-800'}>
            {alert.message}
          </AlertDescription>
        </Alert>
      )}

      {/* Filtros y búsqueda */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Search className="w-5 h-5 mr-2" />
            Buscar Productos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-4">
            <div className="flex-1">
              <Input
                placeholder="Buscar por nombre, SKU o descripción..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de productos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center">
              <Package className="w-5 h-5 mr-2" />
              Productos ({filteredProductos.length})
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredProductos.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No se encontraron productos</p>
              {hasPermission(user, 'productos.write') && (
                <p className="text-sm">Crea tu primer producto usando el botón "Nuevo Producto"</p>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredProductos.map((producto) => {
                const stockStatus = getStockStatus(producto);
                const margen = producto.precio_venta > 0 ? 
                  ((producto.precio_venta - producto.precio_compra) / producto.precio_venta * 100) : 0;
                
                return (
                  <div key={producto.id} className="border rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center space-x-3">
                          <h3 className="font-semibold text-lg">{producto.nombre}</h3>
                          <Badge variant="outline" className="text-xs">
                            {producto.sku}
                          </Badge>
                          <Badge className={`text-xs ${stockStatus.color}`}>
                            {stockStatus.label}
                          </Badge>
                          {!producto.activo && (
                            <Badge variant="secondary" className="text-xs">
                              Inactivo
                            </Badge>
                          )}
                        </div>
                        
                        {producto.descripcion && (
                          <p className="text-gray-600 text-sm">{producto.descripcion}</p>
                        )}
                        
                        <div className="flex items-center space-x-6 text-sm text-gray-600">
                          <span>Categoría: <strong>{getCategoriaNombre(producto.categoria_id)}</strong></span>
                          <span>Marca: <strong>{getMarcaNombre(producto.marca_id)}</strong></span>
                          <span>Stock: <strong>{producto.stock_actual}</strong></span>
                        </div>
                      </div>
                      
                      <div className="text-right space-y-2">
                        <div className="space-y-1">
                          <p className="text-sm text-gray-600">
                            Compra: {formatCurrency(producto.precio_compra)}
                          </p>
                          <p className="text-lg font-bold">
                            Venta: {formatCurrency(producto.precio_venta)}
                          </p>
                          <p className="text-xs text-green-600">
                            Margen: {margen.toFixed(1)}%
                          </p>
                        </div>
                        
                        {hasPermission(user, 'productos.write') && (
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEdit(producto)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}