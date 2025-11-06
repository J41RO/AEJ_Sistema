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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Package, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle, 
  Plus, 
  Minus,
  Search,
  FileText,
  Calculator,
  History,
  Edit,
  Eye
} from 'lucide-react';
import { User, hasPermission } from '@/lib/auth';
import { db, Producto, MovimientoInventario } from '@/lib/database';

interface InventoryProps {
  user: User;
}

interface AjusteInventario {
  producto_id: string;
  tipo: 'ENTRADA' | 'SALIDA' | 'AJUSTE';
  cantidad: number;
  motivo: string;
  observaciones?: string;
}

export default function Inventory({ user }: InventoryProps) {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [movimientos, setMovimientos] = useState<MovimientoInventario[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredProductos, setFilteredProductos] = useState<Producto[]>([]);
  const [selectedProducto, setSelectedProducto] = useState<Producto | null>(null);
  const [showAjusteDialog, setShowAjusteDialog] = useState(false);
  const [showKardexDialog, setShowKardexDialog] = useState(false);
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  
  const [ajusteForm, setAjusteForm] = useState<AjusteInventario>({
    producto_id: '',
    tipo: 'AJUSTE',
    cantidad: 0,
    motivo: '',
    observaciones: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [productos, searchQuery]);

  const loadData = () => {
    setProductos(db.getProductos());
    setMovimientos(db.getMovimientosInventario());
  };

  const filterProducts = () => {
    let filtered = productos.filter(p => p.activo);
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(p => 
        p.nombre.toLowerCase().includes(query) ||
        p.sku.toLowerCase().includes(query)
      );
    }
    
    setFilteredProductos(filtered);
  };

  const handleAjusteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!hasPermission(user, 'inventario.write')) {
      showAlert('error', 'No tienes permisos para realizar ajustes de inventario');
      return;
    }

    if (!ajusteForm.producto_id || ajusteForm.cantidad <= 0) {
      showAlert('error', 'Selecciona un producto y cantidad válida');
      return;
    }

    try {
      const producto = productos.find(p => p.id === ajusteForm.producto_id);
      if (!producto) return;

      let nuevoStock = producto.stock_actual;
      
      switch (ajusteForm.tipo) {
        case 'ENTRADA':
          nuevoStock += ajusteForm.cantidad;
          break;
        case 'SALIDA':
          nuevoStock -= ajusteForm.cantidad;
          if (nuevoStock < 0) {
            showAlert('error', 'No se puede realizar salida mayor al stock disponible');
            return;
          }
          break;
        case 'AJUSTE':
          nuevoStock = ajusteForm.cantidad;
          break;
      }

      // Actualizar stock del producto
      db.updateProducto(producto.id, { stock_actual: nuevoStock });

      // Registrar movimiento
      db.createMovimientoInventario({
        producto_id: ajusteForm.producto_id,
        tipo: ajusteForm.tipo,
        cantidad: ajusteForm.cantidad,
        stock_anterior: producto.stock_actual,
        stock_nuevo: nuevoStock,
        motivo: ajusteForm.motivo,
        observaciones: ajusteForm.observaciones,
        usuario_id: user.id
      });

      showAlert('success', `Ajuste de inventario realizado exitosamente`);
      loadData();
      setShowAjusteDialog(false);
      resetAjusteForm();
    } catch (error) {
      showAlert('error', 'Error al realizar el ajuste de inventario');
    }
  };

  const resetAjusteForm = () => {
    setAjusteForm({
      producto_id: '',
      tipo: 'AJUSTE',
      cantidad: 0,
      motivo: '',
      observaciones: ''
    });
  };

  const showKardex = (producto: Producto) => {
    setSelectedProducto(producto);
    setShowKardexDialog(true);
  };

  const getMovimientosProducto = (productoId: string) => {
    return movimientos
      .filter(m => m.producto_id === productoId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
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

  const getStockStatus = (producto: Producto) => {
    if (producto.stock_actual === 0) {
      return { 
        label: 'Agotado', 
        color: 'bg-red-100 text-red-800 border-red-200',
        icon: <AlertTriangle className="w-3 h-3" />
      };
    } else if (producto.stock_actual <= producto.stock_minimo) {
      return { 
        label: 'Stock Bajo', 
        color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        icon: <AlertTriangle className="w-3 h-3" />
      };
    } else {
      return { 
        label: 'Stock OK', 
        color: 'bg-green-100 text-green-800 border-green-200',
        icon: <CheckCircle className="w-3 h-3" />
      };
    }
  };

  const getTipoMovimientoIcon = (tipo: string) => {
    switch (tipo) {
      case 'ENTRADA':
        return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'SALIDA':
        return <TrendingDown className="w-4 h-4 text-red-600" />;
      case 'AJUSTE':
        return <Edit className="w-4 h-4 text-blue-600" />;
      default:
        return <FileText className="w-4 h-4 text-gray-600" />;
    }
  };

  const calcularValorInventario = () => {
    return productos
      .filter(p => p.activo)
      .reduce((total, p) => total + (p.stock_actual * p.precio_compra), 0);
  };

  const getProductosConAlertas = () => {
    return productos.filter(p => p.activo && (p.stock_actual === 0 || p.stock_actual <= p.stock_minimo));
  };

  const categorias = db.getCategorias();
  const getCategoriaName = (id: string) => categorias.find(c => c.id === id)?.nombre || 'Sin categoría';

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Inventario</h1>
          <p className="text-gray-600">Control completo de stock, movimientos y valorización</p>
        </div>
        {hasPermission(user, 'inventario.write') && (
          <Dialog open={showAjusteDialog} onOpenChange={setShowAjusteDialog}>
            <DialogTrigger asChild>
              <Button onClick={resetAjusteForm}>
                <Plus className="w-4 h-4 mr-2" />
                Ajuste de Inventario
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Ajuste de Inventario</DialogTitle>
                <DialogDescription>
                  Registra entradas, salidas o ajustes de stock
                </DialogDescription>
              </DialogHeader>
              
              <form onSubmit={handleAjusteSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="producto">Producto *</Label>
                  <Select value={ajusteForm.producto_id} onValueChange={(value) => setAjusteForm({...ajusteForm, producto_id: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar producto" />
                    </SelectTrigger>
                    <SelectContent>
                      {productos.filter(p => p.activo).map((producto) => (
                        <SelectItem key={producto.id} value={producto.id}>
                          {producto.nombre} - Stock: {producto.stock_actual}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tipo">Tipo de Movimiento *</Label>
                  <Select 
                    value={ajusteForm.tipo} 
                    onValueChange={(value: 'ENTRADA' | 'SALIDA' | 'AJUSTE') => setAjusteForm({...ajusteForm, tipo: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ENTRADA">Entrada (Agregar stock)</SelectItem>
                      <SelectItem value="SALIDA">Salida (Reducir stock)</SelectItem>
                      <SelectItem value="AJUSTE">Ajuste (Establecer cantidad exacta)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cantidad">
                    {ajusteForm.tipo === 'AJUSTE' ? 'Cantidad Final *' : 'Cantidad *'}
                  </Label>
                  <Input
                    id="cantidad"
                    type="number"
                    min="0"
                    value={ajusteForm.cantidad}
                    onChange={(e) => setAjusteForm({...ajusteForm, cantidad: Number(e.target.value)})}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="motivo">Motivo *</Label>
                  <Select value={ajusteForm.motivo} onValueChange={(value) => setAjusteForm({...ajusteForm, motivo: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar motivo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Compra">Compra de mercancía</SelectItem>
                      <SelectItem value="Devolucion">Devolución de cliente</SelectItem>
                      <SelectItem value="Ajuste_inventario">Ajuste por inventario físico</SelectItem>
                      <SelectItem value="Producto_dañado">Producto dañado</SelectItem>
                      <SelectItem value="Producto_vencido">Producto vencido</SelectItem>
                      <SelectItem value="Correccion_sistema">Corrección del sistema</SelectItem>
                      <SelectItem value="Otro">Otro motivo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="observaciones">Observaciones</Label>
                  <Textarea
                    id="observaciones"
                    value={ajusteForm.observaciones}
                    onChange={(e) => setAjusteForm({...ajusteForm, observaciones: e.target.value})}
                    rows={3}
                  />
                </div>

                <div className="flex justify-end space-x-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setShowAjusteDialog(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit">
                    Registrar Ajuste
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

      {/* Métricas de inventario */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Valor Total Inventario</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {formatCurrency(calcularValorInventario())}
            </div>
            <p className="text-xs text-muted-foreground">Valorizado a precio de compra</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Productos Activos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{productos.filter(p => p.activo).length}</div>
            <p className="text-xs text-muted-foreground">En catálogo</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Alertas de Stock</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {getProductosConAlertas().length}
            </div>
            <p className="text-xs text-muted-foreground">Requieren atención</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Movimientos Hoy</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {movimientos.filter(m => m.created_at.startsWith(new Date().toISOString().split('T')[0])).length}
            </div>
            <p className="text-xs text-muted-foreground">Registrados hoy</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="productos" className="space-y-4">
        <TabsList>
          <TabsTrigger value="productos">Stock Actual</TabsTrigger>
          <TabsTrigger value="alertas">Alertas</TabsTrigger>
          <TabsTrigger value="movimientos">Movimientos</TabsTrigger>
        </TabsList>

        <TabsContent value="productos" className="space-y-4">
          {/* Búsqueda */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Search className="w-5 h-5 mr-2" />
                Buscar Productos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Input
                placeholder="Buscar por nombre o SKU..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </CardContent>
          </Card>

          {/* Lista de productos */}
          <Card>
            <CardHeader>
              <CardTitle>Stock Actual ({filteredProductos.length} productos)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredProductos.map((producto) => {
                  const stockStatus = getStockStatus(producto);
                  const valorTotal = producto.stock_actual * producto.precio_compra;
                  
                  return (
                    <div key={producto.id} className="border rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center space-x-3">
                            <h3 className="font-semibold">{producto.nombre}</h3>
                            <Badge variant="outline" className="text-xs">
                              {producto.sku}
                            </Badge>
                            <Badge className={`text-xs ${stockStatus.color}`}>
                              {stockStatus.icon}
                              <span className="ml-1">{stockStatus.label}</span>
                            </Badge>
                          </div>
                          
                          <div className="flex items-center space-x-6 text-sm text-gray-600">
                            <span>Categoría: <strong>{getCategoriaName(producto.categoria_id)}</strong></span>
                            <span>Stock Mínimo: <strong>{producto.stock_minimo}</strong></span>
                            <span>Precio: <strong>{formatCurrency(producto.precio_compra)}</strong></span>
                          </div>
                        </div>
                        
                        <div className="text-right space-y-2">
                          <div className="text-2xl font-bold">
                            {producto.stock_actual}
                          </div>
                          <div className="text-sm text-gray-600">
                            Valor: {formatCurrency(valorTotal)}
                          </div>
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => showKardex(producto)}
                            >
                              <History className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alertas" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <AlertTriangle className="w-5 h-5 text-orange-500 mr-2" />
                Productos con Alertas ({getProductosConAlertas().length})
              </CardTitle>
              <CardDescription>
                Productos agotados o con stock por debajo del mínimo
              </CardDescription>
            </CardHeader>
            <CardContent>
              {getProductosConAlertas().length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-500" />
                  <p>¡Excelente! No hay alertas de inventario</p>
                  <p className="text-sm">Todos los productos tienen stock suficiente</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {getProductosConAlertas().map((producto) => {
                    const stockStatus = getStockStatus(producto);
                    
                    return (
                      <div key={producto.id} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-200">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <h4 className="font-medium">{producto.nombre}</h4>
                            <Badge className={`text-xs ${stockStatus.color}`}>
                              {stockStatus.label}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600">SKU: {producto.sku}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-orange-600">
                            {producto.stock_actual}
                          </p>
                          <p className="text-xs text-gray-500">
                            Mín: {producto.stock_minimo}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="movimientos" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <History className="w-5 h-5 mr-2" />
                Últimos Movimientos de Inventario
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {movimientos.slice(0, 20).map((movimiento) => {
                  const producto = productos.find(p => p.id === movimiento.producto_id);
                  if (!producto) return null;
                  
                  return (
                    <div key={movimiento.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        {getTipoMovimientoIcon(movimiento.tipo)}
                        <div>
                          <p className="font-medium">{producto.nombre}</p>
                          <p className="text-sm text-gray-600">{movimiento.motivo}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">
                          {movimiento.tipo === 'ENTRADA' ? '+' : '-'}{movimiento.cantidad}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(movimiento.created_at).toLocaleDateString('es-CO')}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialog Kardex */}
      <Dialog open={showKardexDialog} onOpenChange={setShowKardexDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Kardex - {selectedProducto?.nombre}
            </DialogTitle>
            <DialogDescription>
              Historial completo de movimientos del producto
            </DialogDescription>
          </DialogHeader>
          
          {selectedProducto && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm text-gray-600">Stock Actual</p>
                  <p className="text-2xl font-bold">{selectedProducto.stock_actual}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Stock Mínimo</p>
                  <p className="text-lg font-medium">{selectedProducto.stock_minimo}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Valor Total</p>
                  <p className="text-lg font-medium">
                    {formatCurrency(selectedProducto.stock_actual * selectedProducto.precio_compra)}
                  </p>
                </div>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium">Movimientos</h4>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {getMovimientosProducto(selectedProducto.id).map((movimiento) => (
                    <div key={movimiento.id} className="flex items-center justify-between p-3 border rounded">
                      <div className="flex items-center space-x-3">
                        {getTipoMovimientoIcon(movimiento.tipo)}
                        <div>
                          <p className="font-medium">{movimiento.tipo}</p>
                          <p className="text-sm text-gray-600">{movimiento.motivo}</p>
                          {movimiento.observaciones && (
                            <p className="text-xs text-gray-500">{movimiento.observaciones}</p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">
                          {movimiento.tipo === 'ENTRADA' ? '+' : '-'}{movimiento.cantidad}
                        </p>
                        <p className="text-sm text-gray-600">
                          {movimiento.stock_anterior} → {movimiento.stock_nuevo}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(movimiento.created_at).toLocaleString('es-CO')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}