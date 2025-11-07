import axios, { AxiosInstance } from 'axios';

// API Configuration - Use environment variable or fallback
const getApiBaseUrl = (): string => {
  // Production: use environment variable (required for Vercel)
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl) {
    return envUrl;
  }

  // Development: auto-detect based on current location
  const currentHost = window.location.hostname;

  // If accessing via network IP, use same IP for backend
  if (currentHost !== 'localhost' && currentHost !== '127.0.0.1') {
    return `http://${currentHost}:8000`;
  }

  // Default to localhost for local development
  return 'http://localhost:8000';
};

const API_BASE_URL = getApiBaseUrl();

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Token management
const TOKEN_KEY = 'aej_pos_token';

export const tokenManager = {
  get: (): string | null => localStorage.getItem(TOKEN_KEY),
  set: (token: string): void => localStorage.setItem(TOKEN_KEY, token),
  remove: (): void => localStorage.removeItem(TOKEN_KEY),
  isValid: (): boolean => {
    const token = tokenManager.get();
    if (!token) return false;
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000 > Date.now();
    } catch {
      return false;
    }
  }
};

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = tokenManager.get();
    if (token && tokenManager.isValid()) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      tokenManager.remove();
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

// Log current API configuration
console.log(`🔗 API Base URL: ${API_BASE_URL}`);

// Types
export interface User {
  id: number;
  username: string;
  email: string;
  nombre_completo: string;
  rol: 'SUPERUSUARIO' | 'ADMIN' | 'VENDEDOR' | 'ALMACEN' | 'CONTADOR';
  ubicacion: 'EEUU' | 'COLOMBIA';
  is_active: boolean;
  activo?: boolean; // Alias for is_active for frontend compatibility
  permissions?: string[]; // Added for permission system
  created_at: string;
}

export interface Product {
  id: number;
  codigo: string;
  nombre: string;
  descripcion?: string;
  categoria: 'MAQUILLAJE' | 'CUIDADO_PIEL' | 'FRAGANCIAS' | 'ACCESORIOS';
  marca?: string;
  precio_compra: number;
  precio_venta: number;
  stock_actual: number;
  stock_minimo: number;
  is_active: boolean;
  created_at: string;
}

export interface Client {
  id: number;
  documento: string;
  tipo_documento: string;
  nombre_completo: string;
  email?: string;
  telefono?: string;
  direccion?: string;
  ciudad?: string;
  departamento?: string;
  fecha_nacimiento?: string;
  genero?: string;
  acepta_marketing: boolean;
  acepta_datos: boolean;
  is_active: boolean;
  created_at: string;
}

export interface Sale {
  id: number;
  numero_venta: string;
  client_id: number;
  user_id: number;
  subtotal: number;
  descuento: number;
  impuestos: number;
  total: number;
  metodo_pago: string;
  status: 'PENDIENTE' | 'COMPLETADA' | 'CANCELADA';
  notas?: string;
  created_at: string;
  client: Client;
  user: User;
  items: SaleItem[];
}

export interface SaleItem {
  id: number;
  product_id: number;
  cantidad: number;
  precio_unitario: number;
  descuento: number;
  subtotal: number;
  product: Product;
}

export interface DashboardAlert {
  tipo: string;
  mensaje: string;
  producto?: string;
  stock?: number;
}

export interface DashboardMetrics {
  total_ventas_hoy: number;
  total_productos: number;
  total_clientes: number;
  stock_bajo: number;
  ventas_mes: number;
  productos_mas_vendidos: Product[];
  alertas: DashboardAlert[];
}

// API Methods
export const authAPI = {
  login: async (username: string, password: string): Promise<{ access_token: string; token_type: string }> => {
    const response = await api.post('/auth/login', { username, password });
    return response.data;
  },

  getCurrentUser: async (): Promise<User> => {
    const response = await api.get('/auth/me');
    const user = response.data;
    // Map is_active to activo for frontend compatibility
    user.activo = user.is_active;
    return user;
  },

  logout: (): void => {
    tokenManager.remove();
  }
};

export const usersAPI = {
  getAll: async (): Promise<User[]> => {
    const response = await api.get('/users');
    return response.data;
  },

  create: async (userData: {
    username: string;
    email: string;
    nombre_completo: string;
    password: string;
    rol: string;
    ubicacion: string;
  }): Promise<User> => {
    const response = await api.post('/users', userData);
    return response.data;
  }
};

export const productsAPI = {
  getAll: async (): Promise<Product[]> => {
    const response = await api.get('/products');
    return response.data;
  },

  getById: async (id: number): Promise<Product> => {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },

  create: async (productData: Omit<Product, 'id' | 'created_at' | 'updated_at'>): Promise<Product> => {
    const response = await api.post('/products', productData);
    return response.data;
  },

  update: async (id: number, productData: Partial<Product>): Promise<Product> => {
    const response = await api.put(`/products/${id}`, productData);
    return response.data;
  }
};

export const clientsAPI = {
  getAll: async (): Promise<Client[]> => {
    const response = await api.get('/clients');
    return response.data;
  },

  create: async (clientData: Omit<Client, 'id' | 'created_at' | 'updated_at'>): Promise<Client> => {
    const response = await api.post('/clients', clientData);
    return response.data;
  }
};

export const salesAPI = {
  getAll: async (): Promise<Sale[]> => {
    const response = await api.get('/sales');
    return response.data;
  },

  create: async (saleData: {
    client_id: number;
    subtotal: number;
    descuento: number;
    impuestos: number;
    total: number;
    metodo_pago: string;
    notas?: string;
    items: Array<{
      product_id: number;
      cantidad: number;
      precio_unitario: number;
      descuento: number;
    }>;
  }): Promise<Sale> => {
    const response = await api.post('/sales', saleData);
    return response.data;
  }
};

export const dashboardAPI = {
  getMetrics: async (): Promise<DashboardMetrics> => {
    const response = await api.get('/dashboard/metrics');
    return response.data;
  }
};

// Health check
export const healthAPI = {
  check: async (): Promise<{ status: string; timestamp: string }> => {
    const response = await api.get('/health');
    return response.data;
  }
};

// Export current API URL for debugging
export const getCurrentApiUrl = (): string => API_BASE_URL;

export default api;