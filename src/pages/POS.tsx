import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Search, 
  Plus, 
  Minus, 
  Trash2, 
  ShoppingCart, 
  CreditCard, 
  Banknote, 
  Smartphone,
  Calculator,
  User,
  Receipt,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { User as UserType } from '@/lib/auth';
import { db, Producto, Cliente, VentaItem } from '@/lib/database';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface POSProps {
  user: UserType;
}

interface CartItem extends VentaItem {
  producto: Producto;
}

export default function POS({ user }: POSProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [productos, setProductos] = useState<Producto[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCliente, setSelectedCliente] = useState<string>('');
  const [descuentoPorcentaje, setDescuentoPorcentaje] = useState(0);
  const [metodoPago, setMetodoPago] = useState<'EFECTIVO' | 'TARJETA' | 'TRANSFERENCIA'>('EFECTIVO');
  const [valorRecibido, setValorRecibido] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (searchQuery) {
      const results = db.searchProductos(searchQuery);
      setProductos(results.slice(0, 10)); // Limitar a 10 resultados
    } else {
      setProductos([]);
    }
  }, [searchQuery]);

  const loadData = () => {
    setClientes(db.getClientes().filter(c => c.activo));
  };

  const addToCart = (producto: Producto) => {
    if (producto.stock_actual <= 0) {
      showAlert('error', 'Producto sin stock disponible');
      return;
    }

    const existingItem = cart.find(item => item.producto_id === producto.id);
    
    if (existingItem) {
      if (existingItem.cantidad >= producto.stock_actual) {
        showAlert('error', 'No hay suficiente stock disponible');
        return;
      }
      updateCartItemQuantity(producto.id, existingItem.cantidad + 1);
    } else {
      const newItem: CartItem = {
        id: Date.now().toString(),
        producto_id: producto.id,
        cantidad: 1,
        precio_unitario: producto.precio_venta,
        descuento_item: 0,
        subtotal_item: producto.precio_venta,
        iva_item: producto.aplica_iva ? (producto.precio_venta * producto.porcentaje_iva / 100) : 0,
        total_item: producto.precio_venta + (producto.aplica_iva ? (producto.precio_venta * producto.porcentaje_iva / 100) : 0),
        producto
      };
      setCart([...cart, newItem]);
    }
    
    setSearchQuery('');
    setProductos([]);
  };

  const updateCartItemQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }

    const producto = cart.find(item => item.producto_id === productId)?.producto;
    if (producto && newQuantity > producto.stock_actual) {
      showAlert('error', 'Cantidad excede el stock disponible');
      return;
    }

    setCart(cart.map(item => {
      if (item.producto_id === productId) {
        const subtotal = item.precio_unitario * newQuantity;
        const iva = item.producto.aplica_iva ? (subtotal * item.producto.porcentaje_iva / 100) : 0;
        return {
          ...item,
          cantidad: newQuantity,
          subtotal_item: subtotal,
          iva_item: iva,
          total_item: subtotal + iva
        };
      }
      return item;
    }));
  };

  const removeFromCart = (productId: string) => {
    setCart(cart.filter(item => item.producto_id !== productId));
  };

  const clearCart = () => {
    setCart([]);
    setSelectedCliente('');
    setDescuentoPorcentaje(0);
    setValorRecibido(0);
  };

  const calculateTotals = () => {
    const subtotal = cart.reduce((sum, item) => sum + item.subtotal_item, 0);
    const descuentoValor = subtotal * (descuentoPorcentaje / 100);
    const subtotalConDescuento = subtotal - descuentoValor;
    const ivaTotal = cart.reduce((sum, item) => sum + item.iva_item, 0);
    const total = subtotalConDescuento + ivaTotal;
    
    return {
      subtotal,
      descuentoValor,
      subtotalConDescuento,
      ivaTotal,
      total
    };
  };

  const procesarVenta = async () => {
    if (cart.length === 0) {
      showAlert('error', 'El carrito está vacío');
      return;
    }

    const totals = calculateTotals();
    
    if (metodoPago === 'EFECTIVO' && valorRecibido < totals.total) {
      showAlert('error', 'El valor recibido es menor al total de la venta');
      return;
    }

    setLoading(true);
    
    try {
      const venta = db.createVenta({
        cliente_id: selectedCliente || undefined,
        usuario_id: user.id,
        fecha_hora: new Date().toISOString(),
        items: cart.map(item => ({
          id: item.id,
          producto_id: item.producto_id,
          cantidad: item.cantidad,
          precio_unitario: item.precio_unitario,
          descuento_item: item.descuento_item,
          subtotal_item: item.subtotal_item,
          iva_item: item.iva_item,
          total_item: item.total_item
        })),
        subtotal: totals.subtotal,
        descuento_porcentaje: descuentoPorcentaje,
        descuento_valor: totals.descuentoValor,
        iva_valor: totals.ivaTotal,
        total: totals.total,
        metodo_pago: metodoPago,
        valor_recibido: metodoPago === 'EFECTIVO' ? valorRecibido : totals.total,
        cambio: metodoPago === 'EFECTIVO' ? valorRecibido - totals.total : 0,
        estado: 'PAGADA'
      });

      showAlert('success', `Venta procesada exitosamente. ${venta.numero_venta}`);
      clearCart();
    } catch (error) {
      showAlert('error', 'Error al procesar la venta');
    } finally {
      setLoading(false);
    }
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

  const totals = calculateTotals();

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Punto de Venta</h1>
          <p className="text-gray-600">Procesa ventas de forma rápida y eficiente</p>
        </div>
        <Badge variant="outline" className="text-sm">
          Cajero: {user.nombre_completo}
        </Badge>
      </div>

      {alert && (
        <Alert className={`mb-6 ${alert.type === 'success' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
          {alert.type === 'success' ? (
            <CheckCircle className="h-4 w-4 text-green-600" />
          ) : (
            <AlertCircle className="h-4 w-4 text-red-600" />
          )}
          <AlertDescription className={alert.type === 'success' ? 'text-green-800' : 'text-red-800'}>
            {alert.message}
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Panel izquierdo - Búsqueda de productos */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Search className="w-5 h-5 mr-2" />
                Buscar Productos
              </CardTitle>
              <CardDescription>
                Busca por nombre, SKU o código de barras
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar productos..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              {productos.length > 0 && (
                <div className="mt-4 space-y-2 max-h-96 overflow-y-auto">
                  {productos.map((producto) => (
                    <div
                      key={producto.id}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                      onClick={() => addToCart(producto)}
                    >
                      <div className="flex-1">
                        <p className="font-medium">{producto.nombre}</p>
                        <p className="text-sm text-gray-600">SKU: {producto.sku}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            Stock: {producto.stock_actual}
                          </Badge>
                          {producto.stock_actual <= producto.stock_minimo && (
                            <Badge variant="destructive" className="text-xs">
                              Stock Bajo
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg">{formatCurrency(producto.precio_venta)}</p>
                        <Button size="sm" className="mt-1">
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Panel derecho - Carrito y pago */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center">
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  Carrito
                </span>
                <Badge variant="secondary">
                  {cart.length} items
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {cart.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <ShoppingCart className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>El carrito está vacío</p>
                  <p className="text-sm">Busca y agrega productos</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {cart.map((item) => (
                    <div key={item.id} className="flex items-center space-x-3 p-2 border rounded">
                      <div className="flex-1">
                        <p className="font-medium text-sm">{item.producto.nombre}</p>
                        <p className="text-xs text-gray-600">{formatCurrency(item.precio_unitario)}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateCartItemQuantity(item.producto_id, item.cantidad - 1)}
                        >
                          <Minus className="w-3 h-3" />
                        </Button>
                        <span className="w-8 text-center text-sm">{item.cantidad}</span>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateCartItemQuantity(item.producto_id, item.cantidad + 1)}
                        >
                          <Plus className="w-3 h-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => removeFromCart(item.producto_id)}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {cart.length > 0 && (
            <>
              {/* Cliente */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <User className="w-5 h-5 mr-2" />
                    Cliente
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Select value={selectedCliente} onValueChange={setSelectedCliente}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar cliente (opcional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Venta sin cliente</SelectItem>
                      {clientes.map((cliente) => (
                        <SelectItem key={cliente.id} value={cliente.id}>
                          {cliente.nombre} {cliente.apellido} - {cliente.documento}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>

              {/* Descuento */}
              <Card>
                <CardHeader>
                  <CardTitle>Descuento</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Label htmlFor="descuento">Descuento (%)</Label>
                    <Input
                      id="descuento"
                      type="number"
                      min="0"
                      max="100"
                      value={descuentoPorcentaje}
                      onChange={(e) => setDescuentoPorcentaje(Number(e.target.value))}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Totales */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Calculator className="w-5 h-5 mr-2" />
                    Totales
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>{formatCurrency(totals.subtotal)}</span>
                  </div>
                  {descuentoPorcentaje > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Descuento ({descuentoPorcentaje}%):</span>
                      <span>-{formatCurrency(totals.descuentoValor)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>IVA:</span>
                    <span>{formatCurrency(totals.ivaTotal)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total:</span>
                    <span>{formatCurrency(totals.total)}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Método de pago */}
              <Card>
                <CardHeader>
                  <CardTitle>Método de Pago</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-3 gap-2">
                    <Button
                      variant={metodoPago === 'EFECTIVO' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setMetodoPago('EFECTIVO')}
                    >
                      <Banknote className="w-4 h-4 mr-1" />
                      Efectivo
                    </Button>
                    <Button
                      variant={metodoPago === 'TARJETA' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setMetodoPago('TARJETA')}
                    >
                      <CreditCard className="w-4 h-4 mr-1" />
                      Tarjeta
                    </Button>
                    <Button
                      variant={metodoPago === 'TRANSFERENCIA' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setMetodoPago('TRANSFERENCIA')}
                    >
                      <Smartphone className="w-4 h-4 mr-1" />
                      Transfer.
                    </Button>
                  </div>

                  {metodoPago === 'EFECTIVO' && (
                    <div className="space-y-2">
                      <Label htmlFor="valorRecibido">Valor Recibido</Label>
                      <Input
                        id="valorRecibido"
                        type="number"
                        min="0"
                        value={valorRecibido}
                        onChange={(e) => setValorRecibido(Number(e.target.value))}
                        placeholder="Ingresa el valor recibido"
                      />
                      {valorRecibido > 0 && valorRecibido >= totals.total && (
                        <div className="text-sm text-green-600">
                          Cambio: {formatCurrency(valorRecibido - totals.total)}
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Botones de acción */}
              <div className="space-y-2">
                <Button
                  className="w-full"
                  size="lg"
                  onClick={procesarVenta}
                  disabled={loading}
                >
                  <Receipt className="w-5 h-5 mr-2" />
                  {loading ? 'Procesando...' : 'Procesar Venta'}
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={clearCart}
                  disabled={loading}
                >
                  Limpiar Carrito
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}