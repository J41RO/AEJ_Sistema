export interface User {
  id: string;
  username: string;
  password: string;
  nombre_completo: string;
  email: string;
  rol: 'SUPERUSUARIO' | 'ADMIN' | 'VENDEDOR' | 'ALMACEN' | 'CONTADOR';
  ubicacion: 'EEUU' | 'COLOMBIA';
  activo: boolean;
  permissions: string[];
  created_at: string;
  last_login?: string;
  deleted_at?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

import { DEFAULT_PERMISSIONS_BY_ROLE } from './permissions';

// Usuarios demo con permisos por defecto
const DEMO_USERS: User[] = [
  {
    id: '1',
    username: 'superadmin',
    password: 'admin123',
    nombre_completo: 'Super Administrador',
    email: 'superadmin@aejcosmetic.com',
    rol: 'SUPERUSUARIO',
    ubicacion: 'EEUU',
    activo: true,
    permissions: DEFAULT_PERMISSIONS_BY_ROLE.SUPERUSUARIO,
    created_at: new Date().toISOString()
  },
  {
    id: '2',
    username: 'admin',
    password: 'admin123',
    nombre_completo: 'Administrador Colombia',
    email: 'admin@aejcosmetic.com',
    rol: 'ADMIN',
    ubicacion: 'COLOMBIA',
    activo: true,
    permissions: DEFAULT_PERMISSIONS_BY_ROLE.ADMIN,
    created_at: new Date().toISOString()
  },
  {
    id: '3',
    username: 'vendedor1',
    password: 'vendedor123',
    nombre_completo: 'María González Vendedora',
    email: 'maria@aejcosmetic.com',
    rol: 'VENDEDOR',
    ubicacion: 'COLOMBIA',
    activo: true,
    permissions: DEFAULT_PERMISSIONS_BY_ROLE.VENDEDOR,
    created_at: new Date().toISOString()
  },
  {
    id: '4',
    username: 'almacen1',
    password: 'almacen123',
    nombre_completo: 'Carlos Rodríguez Almacén',
    email: 'carlos@aejcosmetic.com',
    rol: 'ALMACEN',
    ubicacion: 'COLOMBIA',
    activo: true,
    permissions: DEFAULT_PERMISSIONS_BY_ROLE.ALMACEN,
    created_at: new Date().toISOString()
  },
  {
    id: '5',
    username: 'contador1',
    password: 'contador123',
    nombre_completo: 'Ana López Contadora',
    email: 'ana@aejcosmetic.com',
    rol: 'CONTADOR',
    ubicacion: 'COLOMBIA',
    activo: true,
    permissions: DEFAULT_PERMISSIONS_BY_ROLE.CONTADOR,
    created_at: new Date().toISOString()
  }
];

// Inicializar usuarios en localStorage si no existen
const initializeUsers = () => {
  const existingUsers = localStorage.getItem('aej_pos_users');
  if (!existingUsers) {
    localStorage.setItem('aej_pos_users', JSON.stringify(DEMO_USERS));
  }
};

// Obtener todos los usuarios
export const getUsers = (): User[] => {
  initializeUsers();
  const users = localStorage.getItem('aej_pos_users');
  return users ? JSON.parse(users) : [];
};

// Crear usuario
export const createUser = (userData: Omit<User, 'id' | 'created_at'>): User => {
  const users = getUsers();
  const newUser: User = {
    ...userData,
    id: Date.now().toString(),
    created_at: new Date().toISOString()
  };
  users.push(newUser);
  localStorage.setItem('aej_pos_users', JSON.stringify(users));
  return newUser;
};

// Actualizar usuario
export const updateUser = (id: string, userData: Partial<User>): User | null => {
  const users = getUsers();
  const index = users.findIndex(u => u.id === id);
  if (index !== -1) {
    users[index] = { ...users[index], ...userData };
    localStorage.setItem('aej_pos_users', JSON.stringify(users));
    return users[index];
  }
  return null;
};

// Eliminar usuario (soft delete)
export const deleteUser = (id: string): boolean => {
  const users = getUsers();
  const index = users.findIndex(u => u.id === id);
  if (index !== -1) {
    users[index].deleted_at = new Date().toISOString();
    users[index].activo = false;
    localStorage.setItem('aej_pos_users', JSON.stringify(users));
    return true;
  }
  return false;
};

// Restaurar usuario
export const restoreUser = (id: string): boolean => {
  const users = getUsers();
  const index = users.findIndex(u => u.id === id);
  if (index !== -1) {
    users[index].deleted_at = undefined;
    users[index].activo = true;
    localStorage.setItem('aej_pos_users', JSON.stringify(users));
    return true;
  }
  return false;
};

// Autenticación
export const login = (username: string, password: string): AuthState | null => {
  const users = getUsers();
  const user = users.find(u => u.username === username && u.password === password && u.activo && !u.deleted_at);
  
  if (user) {
    // Actualizar último login
    updateUser(user.id, { last_login: new Date().toISOString() });
    
    const authState: AuthState = {
      user,
      token: `token_${user.id}_${Date.now()}`,
      isAuthenticated: true
    };
    
    localStorage.setItem('aej_pos_auth', JSON.stringify(authState));
    return authState;
  }
  
  return null;
};

export const logout = (): void => {
  localStorage.removeItem('aej_pos_auth');
};

export const getCurrentAuth = (): AuthState => {
  const auth = localStorage.getItem('aej_pos_auth');
  if (auth) {
    return JSON.parse(auth);
  }
  return { user: null, token: null, isAuthenticated: false };
};

// Verificar permisos específicos
export const hasPermission = (user: User, permission: string): boolean => {
  if (!user || !user.activo || user.deleted_at) return false;
  return user.permissions.includes(permission);
};

// Verificar si es superusuario
export const isSuperUser = (user: User): boolean => {
  return user.rol === 'SUPERUSUARIO';
};

// Verificar múltiples permisos
export const hasAnyPermission = (user: User, permissions: string[]): boolean => {
  return permissions.some(permission => hasPermission(user, permission));
};

// Verificar todos los permisos
export const hasAllPermissions = (user: User, permissions: string[]): boolean => {
  return permissions.every(permission => hasPermission(user, permission));
};