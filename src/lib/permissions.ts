export interface Permission {
  module: string;
  action: string;
  label: string;
  description: string;
}

export const ALL_PERMISSIONS: Permission[] = [
  // Dashboard
  { module: 'dashboard', action: 'read', label: 'Ver Dashboard', description: 'Acceso al panel principal' },
  { module: 'dashboard', action: 'manage_metrics', label: 'Gestionar Métricas', description: 'Configurar métricas del dashboard' },
  
  // Productos
  { module: 'productos', action: 'read', label: 'Ver Productos', description: 'Consultar catálogo de productos' },
  { module: 'productos', action: 'write', label: 'Crear/Editar Productos', description: 'Crear y modificar productos' },
  { module: 'productos', action: 'delete', label: 'Eliminar Productos', description: 'Eliminar productos del sistema' },
  { module: 'productos', action: 'manage_stock', label: 'Gestionar Stock', description: 'Modificar cantidades de inventario' },
  
  // Clientes
  { module: 'clientes', action: 'read', label: 'Ver Clientes', description: 'Consultar base de datos de clientes' },
  { module: 'clientes', action: 'write', label: 'Crear/Editar Clientes', description: 'Registrar y modificar clientes' },
  { module: 'clientes', action: 'delete', label: 'Eliminar Clientes', description: 'Eliminar clientes del sistema' },
  { module: 'clientes', action: 'export', label: 'Exportar Datos', description: 'Exportar información de clientes' },
  
  // POS
  { module: 'ventas', action: 'write', label: 'Usar POS', description: 'Procesar ventas en punto de venta' },
  { module: 'ventas', action: 'cancel', label: 'Anular Ventas', description: 'Cancelar transacciones' },
  { module: 'ventas', action: 'discount', label: 'Aplicar Descuentos', description: 'Otorgar descuentos en ventas' },
  { module: 'ventas', action: 'delete', label: 'Eliminar Ventas', description: 'Enviar ventas a papelera' },
  { module: 'ventas', action: 'restore', label: 'Restaurar Ventas', description: 'Restaurar ventas de papelera' },
  
  // Inventario
  { module: 'inventario', action: 'read', label: 'Ver Inventario', description: 'Consultar estado del inventario' },
  { module: 'inventario', action: 'write', label: 'Ajustar Inventario', description: 'Realizar ajustes de stock' },
  { module: 'inventario', action: 'movements', label: 'Ver Movimientos', description: 'Consultar historial de movimientos' },
  { module: 'inventario', action: 'valuation', label: 'Valorizar Inventario', description: 'Calcular valorización' },
  
  // Reportes
  { module: 'reportes', action: 'basic', label: 'Reportes Básicos', description: 'Ver reportes básicos de ventas' },
  { module: 'reportes', action: 'advanced', label: 'Reportes Avanzados', description: 'Acceso a todos los reportes' },
  { module: 'reportes', action: 'export', label: 'Exportar Reportes', description: 'Exportar reportes a Excel/PDF' },
  { module: 'reportes', action: 'financial', label: 'Reportes Financieros', description: 'Ver análisis financiero' },
  
  // Proveedores
  { module: 'proveedores', action: 'read', label: 'Ver Proveedores', description: 'Consultar lista de proveedores' },
  { module: 'proveedores', action: 'write', label: 'Crear/Editar Proveedores', description: 'Gestionar proveedores' },
  { module: 'proveedores', action: 'delete', label: 'Eliminar Proveedores', description: 'Eliminar proveedores' },
  { module: 'proveedores', action: 'evaluate', label: 'Evaluar Proveedores', description: 'Calificar desempeño' },
  
  // Facturación
  { module: 'facturacion', action: 'read', label: 'Ver Facturas', description: 'Consultar facturas emitidas' },
  { module: 'facturacion', action: 'write', label: 'Crear Facturas', description: 'Generar nuevas facturas' },
  { module: 'facturacion', action: 'cancel', label: 'Anular Facturas', description: 'Anular facturas emitidas' },
  { module: 'facturacion', action: 'reprint', label: 'Reimprimir Facturas', description: 'Reimprimir facturas' },
  
  // Configuración
  { module: 'configuracion', action: 'read', label: 'Ver Configuración', description: 'Consultar configuración del sistema' },
  { module: 'configuracion', action: 'company', label: 'Editar Empresa', description: 'Modificar datos de la empresa' },
  { module: 'configuracion', action: 'taxes', label: 'Editar Impuestos', description: 'Configurar impuestos y retenciones' },
  
  // Usuarios (solo SUPERUSUARIO)
  { module: 'usuarios', action: 'read', label: 'Ver Usuarios', description: 'Consultar lista de usuarios' },
  { module: 'usuarios', action: 'write', label: 'Crear/Editar Usuarios', description: 'Gestionar usuarios del sistema' },
  { module: 'usuarios', action: 'delete', label: 'Eliminar Usuarios', description: 'Eliminar usuarios' },
  { module: 'usuarios', action: 'permissions', label: 'Gestionar Permisos', description: 'Asignar permisos específicos' }
];

export const DEFAULT_PERMISSIONS_BY_ROLE: { [key: string]: string[] } = {
  SUPERUSUARIO: ALL_PERMISSIONS.map(p => `${p.module}.${p.action}`),
  
  ADMIN: [
    'dashboard.read', 'dashboard.manage_metrics',
    'productos.read', 'productos.write', 'productos.delete', 'productos.manage_stock',
    'clientes.read', 'clientes.write', 'clientes.delete', 'clientes.export',
    'ventas.write', 'ventas.cancel', 'ventas.discount', 'ventas.delete', 'ventas.restore',
    'inventario.read', 'inventario.write', 'inventario.movements', 'inventario.valuation',
    'reportes.basic', 'reportes.advanced', 'reportes.export', 'reportes.financial',
    'proveedores.read', 'proveedores.write', 'proveedores.delete', 'proveedores.evaluate',
    'facturacion.read', 'facturacion.write', 'facturacion.cancel', 'facturacion.reprint',
    'configuracion.read', 'configuracion.company', 'configuracion.taxes'
  ],
  
  VENDEDOR: [
    'dashboard.read',
    'productos.read',
    'clientes.read', 'clientes.write',
    'ventas.write', 'ventas.discount',
    'reportes.basic'
  ],
  
  ALMACEN: [
    'dashboard.read',
    'productos.read', 'productos.write', 'productos.manage_stock',
    'inventario.read', 'inventario.write', 'inventario.movements', 'inventario.valuation',
    'proveedores.read', 'proveedores.write', 'proveedores.evaluate',
    'reportes.basic', 'reportes.advanced'
  ],
  
  CONTADOR: [
    'dashboard.read',
    'reportes.basic', 'reportes.advanced', 'reportes.export', 'reportes.financial',
    'facturacion.read', 'facturacion.write', 'facturacion.cancel', 'facturacion.reprint',
    'configuracion.read'
  ]
};

export function getPermissionsByModule(permissions: string[]): { [module: string]: string[] } {
  const grouped: { [module: string]: string[] } = {};
  
  permissions.forEach(permission => {
    const [module, action] = permission.split('.');
    if (!grouped[module]) {
      grouped[module] = [];
    }
    grouped[module].push(action);
  });
  
  return grouped;
}

export function hasSpecificPermission(userPermissions: string[], module: string, action: string): boolean {
  return userPermissions.includes(`${module}.${action}`);
}