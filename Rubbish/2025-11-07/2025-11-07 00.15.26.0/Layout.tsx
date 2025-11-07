import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Package, 
  Users, 
  FileBarChart, 
  Package2, 
  Receipt,
  Building2,
  Settings,
  UserCog,
  LogOut,
  Menu,
  X,
  Bell,
  Search
} from 'lucide-react';
import { User, hasPermission, isSuperUser } from '@/lib/auth';
import { db } from '@/lib/database';
import BackendStatus from '@/components/BackendStatus';

interface LayoutProps {
  children: React.ReactNode;
  user: User;
  onLogout: () => void;
  currentPage: string;
  onNavigate: (page: string) => void;
}

export default function Layout({ children, user, onLogout, currentPage, onNavigate }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  // Obtener alertas del sistema
  const metrics = db.getDashboardMetrics();
  const alertas = metrics.alertas.length;

  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      permission: 'dashboard.read'
    },
    {
      id: 'pos',
      label: 'Punto de Venta',
      icon: ShoppingCart,
      permission: 'ventas.write'
    },
    {
      id: 'products',
      label: 'Productos',
      icon: Package,
      permission: 'productos.read'
    },
    {
      id: 'clients',
      label: 'Clientes',
      icon: Users,
      permission: 'clientes.read'
    },
    {
      id: 'inventory',
      label: 'Inventario',
      icon: Package2,
      permission: 'inventario.read'
    },
    {
      id: 'suppliers',
      label: 'Proveedores',
      icon: Building2,
      permission: 'proveedores.read'
    },
    {
      id: 'billing',
      label: 'Facturación',
      icon: Receipt,
      permission: 'facturacion.read'
    },
    {
      id: 'reports',
      label: 'Reportes',
      icon: FileBarChart,
      permission: 'reportes.basic'
    },
    {
      id: 'users',
      label: 'Usuarios',
      icon: UserCog,
      permission: 'usuarios.read',
      superUserOnly: true
    },
    {
      id: 'settings',
      label: 'Configuración',
      icon: Settings,
      permission: 'configuracion.read'
    }
  ];

  const filteredMenuItems = menuItems.filter(item => {
    if (item.superUserOnly && !isSuperUser(user)) return false;
    return hasPermission(user, item.permission);
  });

  const getRoleBadgeColor = (rol: string) => {
    const colors = {
      SUPERUSUARIO: 'bg-purple-100 text-purple-800 border-purple-200',
      ADMIN: 'bg-red-100 text-red-800 border-red-200',
      VENDEDOR: 'bg-green-100 text-green-800 border-green-200',
      ALMACEN: 'bg-blue-100 text-blue-800 border-blue-200',
      CONTADOR: 'bg-orange-100 text-orange-800 border-orange-200'
    };
    return colors[rol as keyof typeof colors] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getUbicacionFlag = (ubicacion: string) => {
    return ubicacion === 'EEUU' ? '🇺🇸' : '🇨🇴';
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:inset-0`}>
        <div className="flex items-center justify-between h-16 px-6 border-b">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">A</span>
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">AEJ POS</h1>
              <p className="text-xs text-gray-500">Cosmetic & More</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(false)}
            className="md:hidden"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* User Info */}
        <div className="p-4 border-b bg-gray-50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
              <span className="text-white font-semibold text-sm">
                {user.nombre_completo.split(' ').map(n => n[0]).join('').slice(0, 2)}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user.nombre_completo}
              </p>
              <div className="flex items-center space-x-1 mt-1">
                <Badge className={`text-xs ${getRoleBadgeColor(user.rol)}`}>
                  {user.rol}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {getUbicacionFlag(user.ubicacion)} {user.ubicacion}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-4 space-y-1">
          {filteredMenuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => {
                  onNavigate(item.id);
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  isActive
                    ? 'bg-blue-100 text-blue-700 border border-blue-200'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <Icon className="w-5 h-5 mr-3" />
                {item.label}
                {item.id === 'inventory' && alertas > 0 && (
                  <Badge variant="destructive" className="ml-auto text-xs">
                    {alertas}
                  </Badge>
                )}
              </button>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t">
          <Button
            variant="ghost"
            onClick={onLogout}
            className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <LogOut className="w-5 h-5 mr-3" />
            Cerrar Sesión
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col md:ml-0">
        {/* Top Bar */}
        <header className="h-16 bg-white shadow-sm border-b flex items-center justify-between px-6">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(true)}
              className="md:hidden"
              aria-label="Abrir menú"
            >
              <Menu className="w-5 h-5" />
            </Button>
            
            <div className="hidden sm:flex items-center space-x-2">
              <h2 className="text-xl font-semibold text-gray-900 capitalize">
                {currentPage === 'pos' ? 'Punto de Venta' : 
                 currentPage === 'products' ? 'Productos' :
                 currentPage === 'clients' ? 'Clientes' :
                 currentPage === 'inventory' ? 'Inventario' :
                 currentPage === 'suppliers' ? 'Proveedores' :
                 currentPage === 'billing' ? 'Facturación' :
                 currentPage === 'reports' ? 'Reportes' :
                 currentPage === 'users' ? 'Usuarios' :
                 currentPage === 'settings' ? 'Configuración' :
                 'Dashboard'}
              </h2>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Backend Status Indicator */}
            <BackendStatus />

            {/* Alertas */}
            {alertas > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onNavigate('inventory')}
                className="relative"
              >
                <Bell className="w-4 h-4" />
                <Badge 
                  variant="destructive" 
                  className="absolute -top-2 -right-2 text-xs min-w-[20px] h-5 flex items-center justify-center"
                >
                  {alertas}
                </Badge>
              </Button>
            )}

            {/* User Menu */}
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <span className="hidden sm:inline">
                {new Date().toLocaleDateString('es-CO', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}