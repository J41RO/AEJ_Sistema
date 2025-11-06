import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  ShoppingCart, 
  Users, 
  Package, 
  AlertTriangle,
  Eye,
  Calendar,
  BarChart3
} from 'lucide-react';
import { User, hasPermission } from '@/lib/auth';
import { db } from '@/lib/database';

interface DashboardProps {
  user: User;
  onNavigate: (page: string) => void;
}

interface DashboardMetrics {
  ventasHoy: {
    total: number;
    cantidad: number;
    promedio: number;
  };
  totalProductos: number;
  totalClientes: number;
  productosStockBajo: number;
  alertas: Array<{
    id: string;
    nombre: string;
    sku: string;
    stock_actual: number;
    stock_minimo: number;
  }>;
}

export default function Dashboard({ user, onNavigate }: DashboardProps) {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadMetrics = () => {
      try {
        const dashboardMetrics = db.getDashboardMetrics();
        setMetrics(dashboardMetrics);
      } catch (error) {
        console.error('Error loading metrics:', error);
      } finally {
        setLoading(false);
      }
    };

    loadMetrics();
    // Actualizar métricas cada 30 segundos
    const interval = setInterval(loadMetrics, 30000);
    return () => clearInterval(interval);
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getRoleWelcomeMessage = (rol: string) => {
    const messages = {
      SUPERUSUARIO: 'Control total del sistema desde Estados Unidos',
      ADMIN: 'Gestión completa del sistema en Colombia',
      VENDEDOR: 'Listo para procesar ventas y atender clientes',
      ALMACEN: 'Control de inventario y gestión de productos',
      CONTADOR: 'Reportes financieros y análisis contable'
    };
    return messages[rol as keyof typeof messages] || 'Bienvenido al sistema';
  };

  const getQuickActions = () => {
    const actions = [];
    
    if (hasPermission(user, 'ventas.write')) {
      actions.push({
        title: 'Nueva Venta',
        description: 'Procesar una venta en el POS',
        icon: <ShoppingCart className="w-5 h-5" />,
        action: () => onNavigate('pos'),
        color: 'bg-green-500 hover:bg-green-600'
      });
    }
    
    if (hasPermission(user, 'productos.write')) {
      actions.push({
        title: 'Nuevo Producto',
        description: 'Agregar producto al inventario',
        icon: <Package className="w-5 h-5" />,
        action: () => onNavigate('products'),
        color: 'bg-blue-500 hover:bg-blue-600'
      });
    }
    
    if (hasPermission(user, 'clientes.write')) {
      actions.push({
        title: 'Nuevo Cliente',
        description: 'Registrar un nuevo cliente',
        icon: <Users className="w-5 h-5" />,
        action: () => onNavigate('clients'),
        color: 'bg-purple-500 hover:bg-purple-600'
      });
    }
    
    if (hasPermission(user, 'reportes.read')) {
      actions.push({
        title: 'Ver Reportes',
        description: 'Consultar reportes y estadísticas',
        icon: <BarChart3 className="w-5 h-5" />,
        action: () => onNavigate('reports'),
        color: 'bg-orange-500 hover:bg-orange-600'
      });
    }
    
    return actions;
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-2">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">
            ¡Hola, {user.nombre_completo.split(' ')[0]}! 👋
          </h1>
          <Badge variant="outline" className="text-sm">
            {new Date().toLocaleDateString('es-CO', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </Badge>
        </div>
        <p className="text-gray-600">{getRoleWelcomeMessage(user.rol)}</p>
      </div>

      {/* Métricas principales */}
      {hasPermission(user, 'dashboard.read') && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ventas Hoy</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(metrics?.ventasHoy?.total || 0)}
              </div>
              <p className="text-xs text-muted-foreground">
                {metrics?.ventasHoy?.cantidad || 0} transacciones
              </p>
              <div className="flex items-center mt-2">
                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-xs text-green-600">+12% vs ayer</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Productos</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics?.totalProductos || 0}</div>
              <p className="text-xs text-muted-foreground">
                {metrics?.productosStockBajo || 0} con stock bajo
              </p>
              {metrics && metrics.productosStockBajo > 0 && (
                <div className="flex items-center mt-2">
                  <AlertTriangle className="h-4 w-4 text-orange-500 mr-1" />
                  <span className="text-xs text-orange-600">Requieren atención</span>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Clientes</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics?.totalClientes || 0}</div>
              <p className="text-xs text-muted-foreground">Clientes registrados</p>
              <div className="flex items-center mt-2">
                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-xs text-green-600">+5 este mes</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ticket Promedio</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(metrics?.ventasHoy?.promedio || 0)}
              </div>
              <p className="text-xs text-muted-foreground">Por transacción</p>
              <div className="flex items-center mt-2">
                <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                <span className="text-xs text-red-600">-3% vs ayer</span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Acciones rápidas */}
        <Card>
          <CardHeader>
            <CardTitle>Acciones Rápidas</CardTitle>
            <CardDescription>
              Accesos directos según tu rol en el sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {getQuickActions().map((action, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className={`h-20 flex flex-col items-center justify-center space-y-2 ${action.color} text-white border-0`}
                  onClick={action.action}
                >
                  {action.icon}
                  <div className="text-center">
                    <div className="text-sm font-medium">{action.title}</div>
                    <div className="text-xs opacity-90">{action.description}</div>
                  </div>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Alertas de inventario */}
        {hasPermission(user, 'inventario.read') && metrics?.alertas && metrics.alertas.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <AlertTriangle className="w-5 h-5 text-orange-500 mr-2" />
                Alertas de Inventario
              </CardTitle>
              <CardDescription>
                Productos que requieren atención inmediata
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {metrics.alertas.slice(0, 3).map((producto) => (
                  <div key={producto.id} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-200">
                    <div className="flex-1">
                      <p className="font-medium text-sm">{producto.nombre}</p>
                      <p className="text-xs text-gray-600">SKU: {producto.sku}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-orange-600">
                        Stock: {producto.stock_actual}
                      </p>
                      <p className="text-xs text-gray-500">
                        Mín: {producto.stock_minimo}
                      </p>
                    </div>
                  </div>
                ))}
                {metrics.alertas.length > 3 && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    onClick={() => onNavigate('inventory')}
                  >
                    Ver todas las alertas ({metrics.alertas.length})
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Información del sistema */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Estado del Sistema</CardTitle>
            <CardDescription>
              Información general y cumplimiento legal
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Cumplimiento Legal</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Ley 1581 (Habeas Data)</span>
                    <Badge variant="default" className="bg-green-100 text-green-800">
                      Activo
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">DIAN Facturación</span>
                    <Badge variant="secondary">
                      Configurado
                    </Badge>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Sistema</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Versión</span>
                    <span className="text-sm font-medium">2.0 MVP</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Ambiente</span>
                    <Badge variant="outline">
                      Local
                    </Badge>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Ubicación</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Tu ubicación</span>
                    <Badge variant="outline">
                      {user.ubicacion}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Zona horaria</span>
                    <span className="text-sm font-medium">COT (UTC-5)</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}