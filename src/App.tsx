import React, { useState, useEffect } from 'react';
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Layout from '@/components/Layout';
import Login from '@/pages/Login';
import Dashboard from '@/pages/Dashboard';
import POS from '@/pages/POS';
import Products from '@/pages/Products';
import Clients from '@/pages/Clients';
import Inventory from '@/pages/Inventory';
import Reports from '@/pages/Reports';
import Users from '@/pages/Users';
import Suppliers from '@/pages/Suppliers';
import Billing from '@/pages/Billing';
import Configuration from '@/pages/Configuration';
import { authAPI, tokenManager, User } from '@/lib/api';
import { DEFAULT_PERMISSIONS_BY_ROLE } from '@/lib/permissions';
import { toast } from 'sonner';

const queryClient = new QueryClient();

const App = () => {
  const [user, setUser] = useState<User | null>(null);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [loading, setLoading] = useState(true);

  // Check for existing token on app load
  useEffect(() => {
    const checkAuth = async () => {
      if (tokenManager.isValid()) {
        try {
          const userData = await authAPI.getCurrentUser();

          // Add permissions based on role if not present
          if (!userData.permissions || userData.permissions.length === 0) {
            userData.permissions = DEFAULT_PERMISSIONS_BY_ROLE[userData.rol] || [];
          }

          // Ensure activo is set to true if undefined
          if (userData.activo === undefined) {
            userData.activo = true;
          }

          setUser(userData);
        } catch (error) {
          console.error('Failed to get user data:', error);
          tokenManager.remove();
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const handleLogin = async (username: string, password: string) => {
    try {
      const { access_token } = await authAPI.login(username, password);
      tokenManager.set(access_token);

      const userData = await authAPI.getCurrentUser();

      // Add permissions based on role if not present
      if (!userData.permissions || userData.permissions.length === 0) {
        userData.permissions = DEFAULT_PERMISSIONS_BY_ROLE[userData.rol] || [];
      }

      // Ensure activo is set to true if undefined
      if (userData.activo === undefined) {
        userData.activo = true;
      }

      setUser(userData);

      toast.success(`¡Bienvenido ${userData.nombre_completo}!`);
    } catch (error: any) {
      console.error('Login error:', error);
      const errorMessage = error.response?.data?.detail || 'Error al iniciar sesión';
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const handleLogout = () => {
    authAPI.logout();
    setUser(null);
    setCurrentPage('dashboard');
    toast.info('Sesión cerrada correctamente');
  };

  const renderPage = () => {
    if (!user) return null;

    switch (currentPage) {
      case 'dashboard':
        return <Dashboard user={user} />;
      case 'pos':
        return <POS user={user} />;
      case 'products':
        return <Products user={user} />;
      case 'clients':
        return <Clients user={user} />;
      case 'inventory':
        return <Inventory user={user} />;
      case 'reports':
        return <Reports user={user} />;
      case 'users':
        return <Users user={user} />;
      case 'suppliers':
        return <Suppliers user={user} />;
      case 'billing':
        return <Billing user={user} />;
      case 'settings':
        return <Configuration user={user} />;
      default:
        return <Dashboard user={user} />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4 animate-pulse">
            <span className="text-white font-bold text-2xl">A</span>
          </div>
          <p className="text-gray-600">Cargando sistema...</p>
        </div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster position="top-right" />
        {!user ? (
          <Login onLogin={handleLogin} />
        ) : (
          <Layout
            user={user}
            onLogout={handleLogout}
            currentPage={currentPage}
            onNavigate={setCurrentPage}
          >
            {renderPage()}
          </Layout>
        )}
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;