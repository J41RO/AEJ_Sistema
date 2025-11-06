import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Users, 
  Package, 
  Download,
  Calendar,
  Filter,
  Eye,
  FileText,
  PieChart
} from 'lucide-react';
import { User, hasPermission } from '@/lib/auth';
import { db, Venta, Producto, Cliente } from '@/lib/database';

interface ReportsProps {
  user: User;
}

interface VentasReporte {
  fecha: string;
  total: number;
  cantidad: number;
  promedio: number;
}

interface ProductoVendido {
  producto: Producto;
  cantidadVendida: number;
  totalVentas: number;
  margen: number;
}

interface ClienteReporte {
  cliente: Cliente;
  totalCompras: number;
  totalGastado: number;
  ultimaCompra: string;
}

export default function Reports({ user }: ReportsProps) {
  const [ventas, setVentas] = useState<Venta[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [tipoReporte, setTipoReporte] = useState('ventas');
  
  useEffect(() => {
    loadData();
    
    // Establecer fechas por defecto (último mes)
    const hoy = new Date();
    const hace30Dias = new Date();
    hace30Dias.setDate(hoy.getDate() - 30);
    
    setFechaInicio(hace30Dias.toISOString().split('T')[0]);
    setFechaFin(hoy.toISOString().split('T')[0]);
  }, []);

  const loadData = () => {
    setVentas(db.getVentas().filter(v => v.estado === 'PAGADA'));
    setProductos(db.getProductos());
    setClientes(db.getClientes());
  };

  const filtrarVentasPorFecha = () => {
    if (!fechaInicio || !fechaFin) return ventas;
    
    return ventas.filter(venta => {
      const fechaVenta = venta.created_at.split('T')[0];
      return fechaVenta >= fechaInicio && fechaVenta <= fechaFin;
    });
  };

  const generarReporteVentas = (): VentasReporte[] => {
    const ventasFiltradas = filtrarVentasPorFecha();
    const ventasPorFecha: { [key: string]: Venta[] } = {};
    
    ventasFiltradas.forEach(venta => {
      const fecha = venta.created_at.split('T')[0];
      if (!ventasPorFecha[fecha]) {
        ventasPorFecha[fecha] = [];
      }
      ventasPorFecha[fecha].push(venta);
    });
    
    return Object.entries(ventasPorFecha)
      .map(([fecha, ventasDelDia]) => ({
        fecha,
        total: ventasDelDia.reduce((sum, v) => sum + v.total, 0),
        cantidad: ventasDelDia.length,
        promedio: ventasDelDia.reduce((sum, v) => sum + v.total, 0) / ventasDelDia.length
      }))
      .sort((a, b) => a.fecha.localeCompare(b.fecha));
  };

  const generarReporteProductos = (): ProductoVendido[] => {
    const ventasFiltradas = filtrarVentasPorFecha();
    const productosVendidos: { [key: string]: { cantidad: number; total: number } } = {};
    
    ventasFiltradas.forEach(venta => {
      venta.items.forEach(item => {
        if (!productosVendidos[item.producto_id]) {
          productosVendidos[item.producto_id] = { cantidad: 0, total: 0 };
        }
        productosVendidos[item.producto_id].cantidad += item.cantidad;
        productosVendidos[item.producto_id].total += item.total_item;
      });
    });
    
    const productosConVentas = Object.entries(productosVendidos)
      .map(([productoId, datos]) => {
        const producto = productos.find(p => p.id === productoId);
        if (!producto) return null;
        
        const margen = producto.precio_venta > 0 ? 
          ((producto.precio_venta - producto.precio_compra) / producto.precio_venta * 100) : 0;
        
        return {
          producto,
          cantidadVendida: datos.cantidad,
          totalVentas: datos.total,
          margen
        };
      })
      .filter((item): item is ProductoVendido => item !== null);
    
    return productosConVentas.sort((a, b) => b.cantidadVendida - a.cantidadVendida);
  };

  const generarReporteClientes = (): ClienteReporte[] => {
    const ventasFiltradas = filtrarVentasPorFecha();
    const clientesData: { [key: string]: { compras: number; gastado: number; ultimaCompra: string } } = {};
    
    ventasFiltradas.forEach(venta => {
      if (venta.cliente_id) {
        if (!clientesData[venta.cliente_id]) {
          clientesData[venta.cliente_id] = { compras: 0, gastado: 0, ultimaCompra: '' };
        }
        clientesData[venta.cliente_id].compras += 1;
        clientesData[venta.cliente_id].gastado += venta.total;
        
        if (!clientesData[venta.cliente_id].ultimaCompra || 
            venta.created_at > clientesData[venta.cliente_id].ultimaCompra) {
          clientesData[venta.cliente_id].ultimaCompra = venta.created_at;
        }
      }
    });
    
    const clientesConCompras = Object.entries(clientesData)
      .map(([clienteId, datos]) => {
        const cliente = clientes.find(c => c.id === clienteId);
        if (!cliente) return null;
        
        return {
          cliente,
          totalCompras: datos.compras,
          totalGastado: datos.gastado,
          ultimaCompra: datos.ultimaCompra
        };
      })
      .filter((item): item is ClienteReporte => item !== null);
    
    return clientesConCompras.sort((a, b) => b.totalGastado - a.totalGastado);
  };

  const calcularMetricasGenerales = () => {
    const ventasFiltradas = filtrarVentasPorFecha();
    
    const totalVentas = ventasFiltradas.reduce((sum, v) => sum + v.total, 0);
    const totalTransacciones = ventasFiltradas.length;
    const ticketPromedio = totalTransacciones > 0 ? totalVentas / totalTransacciones : 0;
    
    const totalCosto = ventasFiltradas.reduce((sum, venta) => {
      return sum + venta.items.reduce((itemSum, item) => {
        const producto = productos.find(p => p.id === item.producto_id);
        return itemSum + (producto ? producto.precio_compra * item.cantidad : 0);
      }, 0);
    }, 0);
    
    const utilidadBruta = totalVentas - totalCosto;
    const margenUtilidad = totalVentas > 0 ? (utilidadBruta / totalVentas * 100) : 0;
    
    return {
      totalVentas,
      totalTransacciones,
      ticketPromedio,
      utilidadBruta,
      margenUtilidad,
      totalCosto
    };
  };

  const exportarReporte = (tipo: string) => {
    // Simulación de exportación
    const data = {
      ventas: generarReporteVentas(),
      productos: generarReporteProductos(),
      clientes: generarReporteClientes(),
      metricas: calcularMetricasGenerales()
    };
    
    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `reporte_${tipo}_${fechaInicio}_${fechaFin}.json`;
    link.click();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-CO');
  };

  const reporteVentas = generarReporteVentas();
  const reporteProductos = generarReporteProductos();
  const reporteClientes = generarReporteClientes();
  const metricas = calcularMetricasGenerales();

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reportes y Analytics</h1>
          <p className="text-gray-600">Análisis detallado de ventas, productos y clientes</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => exportarReporte('completo')}>
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="w-5 h-5 mr-2" />
            Filtros de Reporte
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fechaInicio">Fecha Inicio</Label>
              <Input
                id="fechaInicio"
                type="date"
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fechaFin">Fecha Fin</Label>
              <Input
                id="fechaFin"
                type="date"
                value={fechaFin}
                onChange={(e) => setFechaFin(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tipoReporte">Tipo de Reporte</Label>
              <Select value={tipoReporte} onValueChange={setTipoReporte}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ventas">Reporte de Ventas</SelectItem>
                  <SelectItem value="productos">Productos Más Vendidos</SelectItem>
                  <SelectItem value="clientes">Mejores Clientes</SelectItem>
                  <SelectItem value="inventario">Estado de Inventario</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Métricas generales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Ventas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(metricas.totalVentas)}
            </div>
            <p className="text-xs text-muted-foreground">
              {metricas.totalTransacciones} transacciones
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Ticket Promedio</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(metricas.ticketPromedio)}
            </div>
            <p className="text-xs text-muted-foreground">Por transacción</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Utilidad Bruta</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {formatCurrency(metricas.utilidadBruta)}
            </div>
            <p className="text-xs text-muted-foreground">
              Margen: {metricas.margenUtilidad.toFixed(1)}%
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Costo Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {formatCurrency(metricas.totalCosto)}
            </div>
            <p className="text-xs text-muted-foreground">Costo de mercancía</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="ventas" className="space-y-4">
        <TabsList>
          <TabsTrigger value="ventas">Ventas por Período</TabsTrigger>
          <TabsTrigger value="productos">Productos Más Vendidos</TabsTrigger>
          <TabsTrigger value="clientes">Mejores Clientes</TabsTrigger>
          <TabsTrigger value="inventario">Estado Inventario</TabsTrigger>
        </TabsList>

        <TabsContent value="ventas" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="w-5 h-5 mr-2" />
                Ventas por Día
              </CardTitle>
              <CardDescription>
                Análisis de ventas del {formatDate(fechaInicio)} al {formatDate(fechaFin)}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {reporteVentas.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No hay ventas en el período seleccionado</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {reporteVentas.map((dia) => (
                      <div key={dia.fecha} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{formatDate(dia.fecha)}</p>
                          <p className="text-sm text-gray-600">
                            {dia.cantidad} transacciones
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold">{formatCurrency(dia.total)}</p>
                          <p className="text-sm text-gray-600">
                            Promedio: {formatCurrency(dia.promedio)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="productos" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Package className="w-5 h-5 mr-2" />
                Productos Más Vendidos
              </CardTitle>
              <CardDescription>
                Ranking de productos por cantidad vendida
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {reporteProductos.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No hay productos vendidos en el período</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {reporteProductos.slice(0, 10).map((item, index) => (
                      <div key={item.producto.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <Badge variant="outline" className="text-xs">
                            #{index + 1}
                          </Badge>
                          <div>
                            <p className="font-medium">{item.producto.nombre}</p>
                            <p className="text-sm text-gray-600">SKU: {item.producto.sku}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold">{item.cantidadVendida} unidades</p>
                          <p className="text-sm text-gray-600">
                            {formatCurrency(item.totalVentas)}
                          </p>
                          <p className="text-xs text-green-600">
                            Margen: {item.margen.toFixed(1)}%
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="clientes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="w-5 h-5 mr-2" />
                Mejores Clientes
              </CardTitle>
              <CardDescription>
                Clientes con mayor volumen de compras
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {reporteClientes.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No hay datos de clientes en el período</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {reporteClientes.slice(0, 10).map((item, index) => (
                      <div key={item.cliente.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <Badge variant="outline" className="text-xs">
                            #{index + 1}
                          </Badge>
                          <div>
                            <p className="font-medium">
                              {item.cliente.nombre} {item.cliente.apellido}
                            </p>
                            <p className="text-sm text-gray-600">
                              {item.cliente.documento}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold">{formatCurrency(item.totalGastado)}</p>
                          <p className="text-sm text-gray-600">
                            {item.totalCompras} compras
                          </p>
                          <p className="text-xs text-gray-500">
                            Última: {formatDate(item.ultimaCompra)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="inventario" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Package className="w-5 h-5 mr-2" />
                Estado Actual del Inventario
              </CardTitle>
              <CardDescription>
                Resumen del inventario por categorías
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <p className="text-2xl font-bold text-blue-600">
                      {productos.filter(p => p.activo).length}
                    </p>
                    <p className="text-sm text-gray-600">Productos Activos</p>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <p className="text-2xl font-bold text-green-600">
                      {productos.filter(p => p.activo && p.stock_actual > p.stock_minimo).length}
                    </p>
                    <p className="text-sm text-gray-600">Con Stock OK</p>
                  </div>
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <p className="text-2xl font-bold text-orange-600">
                      {productos.filter(p => p.activo && p.stock_actual <= p.stock_minimo).length}
                    </p>
                    <p className="text-sm text-gray-600">Con Alertas</p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  {productos
                    .filter(p => p.activo)
                    .sort((a, b) => (a.stock_actual / Math.max(a.stock_minimo, 1)) - (b.stock_actual / Math.max(b.stock_minimo, 1)))
                    .slice(0, 15)
                    .map((producto) => {
                      const porcentajeStock = (producto.stock_actual / Math.max(producto.stock_minimo, 1)) * 100;
                      const valorTotal = producto.stock_actual * producto.precio_compra;
                      
                      return (
                        <div key={producto.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex-1">
                            <p className="font-medium">{producto.nombre}</p>
                            <p className="text-sm text-gray-600">SKU: {producto.sku}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold">
                              {producto.stock_actual} / {producto.stock_minimo}
                            </p>
                            <p className="text-sm text-gray-600">
                              Valor: {formatCurrency(valorTotal)}
                            </p>
                            <div className={`text-xs px-2 py-1 rounded ${
                              porcentajeStock >= 100 ? 'bg-green-100 text-green-800' :
                              porcentajeStock >= 50 ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {porcentajeStock.toFixed(0)}% del mínimo
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}