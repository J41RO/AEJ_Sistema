export interface Categoria {
  id: string;
  nombre: string;
  descripcion?: string;
  activo: boolean;
  created_at: string;
}

export interface Marca {
  id: string;
  nombre: string;
  descripcion?: string;
  activo: boolean;
  created_at: string;
}

export interface Proveedor {
  id: string;
  nit: string;
  razon_social: string;
  nombre_comercial?: string;
  contacto_nombre?: string;
  contacto_email?: string;
  contacto_telefono?: string;
  direccion?: string;
  ciudad?: string;
  pais?: string;
  sitio_web?: string;
  observaciones?: string;
  activo: boolean;
  created_at: string;
}

export interface Producto {
  id: string;
  sku: string;
  nombre: string;
  descripcion?: string;
  categoria_id: string;
  marca_id: string;
  proveedor_id?: string;
  precio_compra: number;
  precio_venta: number;
  stock_actual: number;
  stock_minimo: number;
  aplica_iva: boolean;
  porcentaje_iva: number;
  activo: boolean;
  created_at: string;
}

export interface Cliente {
  id: string;
  tipo_documento: 'CC' | 'NIT' | 'CE' | 'TI';
  documento: string;
  nombre: string;
  apellido?: string;
  razon_social?: string;
  email?: string;
  telefono?: string;
  direccion?: string;
  ciudad?: string;
  aceptacion_tratamiento_datos: boolean;
  fecha_aceptacion_datos?: string;
  canal_aceptacion: 'WEB' | 'FISICO' | 'TELEFONO';
  clasificacion: 'NUEVO' | 'OCASIONAL' | 'FRECUENTE' | 'VIP';
  total_compras: number;
  total_gastado: number;
  activo: boolean;
  created_at: string;
}

export interface VentaItem {
  id: string;
  producto_id: string;
  cantidad: number;
  precio_unitario: number;
  descuento_item: number;
  subtotal_item: number;
  iva_item: number;
  total_item: number;
}

export interface Venta {
  id: string;
  numero_venta: string;
  cliente_id?: string;
  usuario_id: string;
  fecha_hora: string;
  items: VentaItem[];
  subtotal: number;
  descuento_porcentaje: number;
  descuento_valor: number;
  iva_valor: number;
  total: number;
  metodo_pago: 'EFECTIVO' | 'TARJETA' | 'TRANSFERENCIA' | 'MIXTO';
  valor_recibido?: number;
  cambio?: number;
  estado: 'ABIERTA' | 'PAGADA' | 'ANULADA';
  notas?: string;
  created_at: string;
  deleted_at?: string;
  deleted_by?: string;
  delete_reason?: string;
}

export interface Factura {
  id: string;
  numero_factura: string;
  venta_id: string;
  cliente_id?: string;
  fecha_emision: string;
  fecha_vencimiento: string;
  subtotal: number;
  iva_valor: number;
  total: number;
  estado: 'EMITIDA' | 'PAGADA' | 'ANULADA' | 'VENCIDA';
  observaciones?: string;
  usuario_id: string;
  created_at: string;
  anulada_at?: string;
  anulada_by?: string;
  anulacion_motivo?: string;
}

export interface MovimientoInventario {
  id: string;
  producto_id: string;
  tipo: 'ENTRADA' | 'SALIDA' | 'AJUSTE';
  cantidad: number;
  stock_anterior: number;
  stock_nuevo: number;
  motivo: string;
  observaciones?: string;
  usuario_id: string;
  created_at: string;
}

export interface ConfiguracionEmpresa {
  id: string;
  razon_social: string;
  nit: string;
  direccion: string;
  ciudad: string;
  telefono: string;
  email: string;
  sitio_web?: string;
  logo_url?: string;
  eslogan?: string;
  regimen_tributario: string;
  actividad_economica: string;
  updated_at: string;
  updated_by: string;
}

export interface ConfiguracionImpuestos {
  id: string;
  iva_general: number;
  iva_productos: number;
  retencion_fuente: number;
  retencion_iva: number;
  retencion_ica: number;
  updated_at: string;
  updated_by: string;
}

export interface ConfiguracionFacturacion {
  id: string;
  prefijo_factura: string;
  numero_inicial: number;
  numero_actual: number;
  resolucion_dian: string;
  fecha_resolucion: string;
  rango_inicial: number;
  rango_final: number;
  fecha_vencimiento: string;
  updated_at: string;
  updated_by: string;
}

class Database {
  private getKey(table: string): string {
    return `aej_pos_${table}`;
  }

  private getAll<T>(table: string): T[] {
    const data = localStorage.getItem(this.getKey(table));
    return data ? JSON.parse(data) : [];
  }

  private setAll<T>(table: string, data: T[]): void {
    localStorage.setItem(this.getKey(table), JSON.stringify(data));
  }

  private generateId(): string {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  }

  // Categorías
  getCategorias(): Categoria[] {
    return this.getAll<Categoria>('categorias');
  }

  createCategoria(data: Omit<Categoria, 'id' | 'created_at'>): Categoria {
    const categoria: Categoria = {
      ...data,
      id: this.generateId(),
      created_at: new Date().toISOString()
    };
    const categorias = this.getCategorias();
    categorias.push(categoria);
    this.setAll('categorias', categorias);
    return categoria;
  }

  // Marcas
  getMarcas(): Marca[] {
    return this.getAll<Marca>('marcas');
  }

  createMarca(data: Omit<Marca, 'id' | 'created_at'>): Marca {
    const marca: Marca = {
      ...data,
      id: this.generateId(),
      created_at: new Date().toISOString()
    };
    const marcas = this.getMarcas();
    marcas.push(marca);
    this.setAll('marcas', marcas);
    return marca;
  }

  // Proveedores
  getProveedores(): Proveedor[] {
    return this.getAll<Proveedor>('proveedores');
  }

  createProveedor(data: Omit<Proveedor, 'id' | 'created_at'>): Proveedor {
    const proveedor: Proveedor = {
      ...data,
      id: this.generateId(),
      created_at: new Date().toISOString()
    };
    const proveedores = this.getProveedores();
    proveedores.push(proveedor);
    this.setAll('proveedores', proveedores);
    return proveedor;
  }

  updateProveedor(id: string, data: Partial<Proveedor>): Proveedor | null {
    const proveedores = this.getProveedores();
    const index = proveedores.findIndex(p => p.id === id);
    if (index !== -1) {
      proveedores[index] = { ...proveedores[index], ...data };
      this.setAll('proveedores', proveedores);
      return proveedores[index];
    }
    return null;
  }

  // Productos
  getProductos(): Producto[] {
    return this.getAll<Producto>('productos');
  }

  createProducto(data: Omit<Producto, 'id' | 'created_at'>): Producto {
    const producto: Producto = {
      ...data,
      id: this.generateId(),
      created_at: new Date().toISOString()
    };
    const productos = this.getProductos();
    productos.push(producto);
    this.setAll('productos', productos);
    return producto;
  }

  updateProducto(id: string, data: Partial<Producto>): Producto | null {
    const productos = this.getProductos();
    const index = productos.findIndex(p => p.id === id);
    if (index !== -1) {
      productos[index] = { ...productos[index], ...data };
      this.setAll('productos', productos);
      return productos[index];
    }
    return null;
  }

  searchProductos(query: string): Producto[] {
    const productos = this.getProductos().filter(p => p.activo);
    if (!query) return productos;
    
    const searchTerm = query.toLowerCase();
    return productos.filter(p => 
      p.nombre.toLowerCase().includes(searchTerm) ||
      p.sku.toLowerCase().includes(searchTerm) ||
      p.descripcion?.toLowerCase().includes(searchTerm)
    );
  }

  // Clientes
  getClientes(): Cliente[] {
    return this.getAll<Cliente>('clientes');
  }

  createCliente(data: Omit<Cliente, 'id' | 'created_at'>): Cliente {
    const cliente: Cliente = {
      ...data,
      id: this.generateId(),
      created_at: new Date().toISOString()
    };
    const clientes = this.getClientes();
    clientes.push(cliente);
    this.setAll('clientes', clientes);
    return cliente;
  }

  updateCliente(id: string, data: Partial<Cliente>): Cliente | null {
    const clientes = this.getClientes();
    const index = clientes.findIndex(c => c.id === id);
    if (index !== -1) {
      clientes[index] = { ...clientes[index], ...data };
      this.setAll('clientes', clientes);
      return clientes[index];
    }
    return null;
  }

  searchClientes(query: string): Cliente[] {
    const clientes = this.getClientes().filter(c => c.activo);
    if (!query) return clientes;
    
    const searchTerm = query.toLowerCase();
    return clientes.filter(c => 
      c.nombre.toLowerCase().includes(searchTerm) ||
      c.documento.includes(searchTerm) ||
      c.email?.toLowerCase().includes(searchTerm)
    );
  }

  // Ventas
  getVentas(): Venta[] {
    return this.getAll<Venta>('ventas');
  }

  createVenta(data: Omit<Venta, 'id' | 'numero_venta' | 'created_at'>): Venta {
    const ventas = this.getVentas();
    const numero_venta = `V-${String(ventas.length + 1).padStart(6, '0')}`;
    
    const venta: Venta = {
      ...data,
      id: this.generateId(),
      numero_venta,
      created_at: new Date().toISOString()
    };
    
    ventas.push(venta);
    this.setAll('ventas', ventas);
    
    // Actualizar stock de productos y registrar movimientos
    venta.items.forEach(item => {
      const producto = this.getProductos().find(p => p.id === item.producto_id);
      if (producto) {
        const stockAnterior = producto.stock_actual;
        const stockNuevo = producto.stock_actual - item.cantidad;
        
        this.updateProducto(producto.id, {
          stock_actual: stockNuevo
        });
        
        // Registrar movimiento de inventario
        this.createMovimientoInventario({
          producto_id: item.producto_id,
          tipo: 'SALIDA',
          cantidad: item.cantidad,
          stock_anterior: stockAnterior,
          stock_nuevo: stockNuevo,
          motivo: 'Venta',
          observaciones: `Venta ${venta.numero_venta}`,
          usuario_id: data.usuario_id
        });
      }
    });
    
    // Actualizar métricas del cliente
    if (venta.cliente_id) {
      const cliente = this.getClientes().find(c => c.id === venta.cliente_id);
      if (cliente) {
        this.updateCliente(cliente.id, {
          total_compras: cliente.total_compras + 1,
          total_gastado: cliente.total_gastado + venta.total,
          clasificacion: this.calcularClasificacionCliente(cliente.total_compras + 1, cliente.total_gastado + venta.total)
        });
      }
    }
    
    return venta;
  }

  // Eliminar venta (soft delete)
  deleteVenta(id: string, userId: string, reason: string): boolean {
    const ventas = this.getVentas();
    const index = ventas.findIndex(v => v.id === id);
    if (index !== -1) {
      ventas[index].deleted_at = new Date().toISOString();
      ventas[index].deleted_by = userId;
      ventas[index].delete_reason = reason;
      this.setAll('ventas', ventas);
      return true;
    }
    return false;
  }

  // Restaurar venta
  restoreVenta(id: string): boolean {
    const ventas = this.getVentas();
    const index = ventas.findIndex(v => v.id === id);
    if (index !== -1) {
      ventas[index].deleted_at = undefined;
      ventas[index].deleted_by = undefined;
      ventas[index].delete_reason = undefined;
      this.setAll('ventas', ventas);
      return true;
    }
    return false;
  }

  // Facturas
  getFacturas(): Factura[] {
    return this.getAll<Factura>('facturas');
  }

  createFactura(data: Omit<Factura, 'id' | 'numero_factura' | 'created_at'>): Factura {
    const facturas = this.getFacturas();
    const config = this.getConfiguracionFacturacion();
    
    const numero_factura = `${config.prefijo_factura}${String(config.numero_actual).padStart(6, '0')}`;
    
    const factura: Factura = {
      ...data,
      id: this.generateId(),
      numero_factura,
      created_at: new Date().toISOString()
    };
    
    facturas.push(factura);
    this.setAll('facturas', facturas);
    
    // Actualizar número actual en configuración
    this.updateConfiguracionFacturacion({
      numero_actual: config.numero_actual + 1
    });
    
    return factura;
  }

  updateFactura(id: string, data: Partial<Factura>): Factura | null {
    const facturas = this.getFacturas();
    const index = facturas.findIndex(f => f.id === id);
    if (index !== -1) {
      facturas[index] = { ...facturas[index], ...data };
      this.setAll('facturas', facturas);
      return facturas[index];
    }
    return null;
  }

  // Movimientos de Inventario
  getMovimientosInventario(): MovimientoInventario[] {
    return this.getAll<MovimientoInventario>('movimientos_inventario');
  }

  createMovimientoInventario(data: Omit<MovimientoInventario, 'id' | 'created_at'>): MovimientoInventario {
    const movimiento: MovimientoInventario = {
      ...data,
      id: this.generateId(),
      created_at: new Date().toISOString()
    };
    const movimientos = this.getMovimientosInventario();
    movimientos.push(movimiento);
    this.setAll('movimientos_inventario', movimientos);
    return movimiento;
  }

  // Configuración
  getConfiguracionEmpresa(): ConfiguracionEmpresa {
    const config = this.getAll<ConfiguracionEmpresa>('config_empresa');
    return config[0] || {
      id: '1',
      razon_social: 'AEJ Cosmetic & More S.A.S.',
      nit: '900123456-1',
      direccion: 'Calle 123 #45-67',
      ciudad: 'Bogotá D.C.',
      telefono: '+57 1 234 5678',
      email: 'info@aejcosmetic.com',
      sitio_web: 'https://www.aejcosmetic.com',
      eslogan: 'Tu belleza, nuestra pasión',
      regimen_tributario: 'Responsable de IVA',
      actividad_economica: 'Comercio al por menor de productos cosméticos',
      updated_at: new Date().toISOString(),
      updated_by: '1'
    };
  }

  updateConfiguracionEmpresa(data: Partial<ConfiguracionEmpresa>, userId: string): ConfiguracionEmpresa {
    const configs = this.getAll<ConfiguracionEmpresa>('config_empresa');
    const updated = {
      ...this.getConfiguracionEmpresa(),
      ...data,
      updated_at: new Date().toISOString(),
      updated_by: userId
    };
    
    if (configs.length === 0) {
      configs.push(updated);
    } else {
      configs[0] = updated;
    }
    
    this.setAll('config_empresa', configs);
    return updated;
  }

  getConfiguracionImpuestos(): ConfiguracionImpuestos {
    const config = this.getAll<ConfiguracionImpuestos>('config_impuestos');
    return config[0] || {
      id: '1',
      iva_general: 19,
      iva_productos: 19,
      retencion_fuente: 3.5,
      retencion_iva: 15,
      retencion_ica: 1.0,
      updated_at: new Date().toISOString(),
      updated_by: '1'
    };
  }

  updateConfiguracionImpuestos(data: Partial<ConfiguracionImpuestos>, userId: string): ConfiguracionImpuestos {
    const configs = this.getAll<ConfiguracionImpuestos>('config_impuestos');
    const updated = {
      ...this.getConfiguracionImpuestos(),
      ...data,
      updated_at: new Date().toISOString(),
      updated_by: userId
    };
    
    if (configs.length === 0) {
      configs.push(updated);
    } else {
      configs[0] = updated;
    }
    
    this.setAll('config_impuestos', configs);
    return updated;
  }

  getConfiguracionFacturacion(): ConfiguracionFacturacion {
    const config = this.getAll<ConfiguracionFacturacion>('config_facturacion');
    return config[0] || {
      id: '1',
      prefijo_factura: 'AEJ-',
      numero_inicial: 1,
      numero_actual: 1,
      resolucion_dian: 'Resolución 000123 de 2024',
      fecha_resolucion: '2024-01-01',
      rango_inicial: 1,
      rango_final: 10000,
      fecha_vencimiento: '2025-12-31',
      updated_at: new Date().toISOString(),
      updated_by: '1'
    };
  }

  updateConfiguracionFacturacion(data: Partial<ConfiguracionFacturacion>): ConfiguracionFacturacion {
    const configs = this.getAll<ConfiguracionFacturacion>('config_facturacion');
    const updated = {
      ...this.getConfiguracionFacturacion(),
      ...data,
      updated_at: new Date().toISOString(),
      updated_by: '1'
    };
    
    if (configs.length === 0) {
      configs.push(updated);
    } else {
      configs[0] = updated;
    }
    
    this.setAll('config_facturacion', configs);
    return updated;
  }

  private calcularClasificacionCliente(totalCompras: number, totalGastado: number): 'NUEVO' | 'OCASIONAL' | 'FRECUENTE' | 'VIP' {
    if (totalCompras >= 20 && totalGastado >= 2000000) return 'VIP';
    if (totalCompras >= 10 && totalGastado >= 1000000) return 'FRECUENTE';
    if (totalCompras >= 3) return 'OCASIONAL';
    return 'NUEVO';
  }

  // Métricas del dashboard
  getDashboardMetrics() {
    const ventas = this.getVentas().filter(v => v.estado === 'PAGADA' && !v.deleted_at);
    const productos = this.getProductos().filter(p => p.activo);
    const clientes = this.getClientes().filter(c => c.activo);
    
    const hoy = new Date().toISOString().split('T')[0];
    const ventasHoy = ventas.filter(v => v.created_at.startsWith(hoy));
    
    const totalVentasHoy = ventasHoy.reduce((sum, v) => sum + v.total, 0);
    const cantidadVentasHoy = ventasHoy.length;
    
    const productosStockBajo = productos.filter(p => p.stock_actual <= p.stock_minimo);
    
    return {
      ventasHoy: {
        total: totalVentasHoy,
        cantidad: cantidadVentasHoy,
        promedio: cantidadVentasHoy > 0 ? totalVentasHoy / cantidadVentasHoy : 0
      },
      totalProductos: productos.length,
      totalClientes: clientes.length,
      productosStockBajo: productosStockBajo.length,
      alertas: productosStockBajo
    };
  }
}

export const db = new Database();

// Inicializar datos de demo
export const initializeDemoData = () => {
  // Solo inicializar si no hay datos
  if (db.getCategorias().length === 0) {
    // Categorías
    db.createCategoria({ nombre: 'Cosméticos', descripcion: 'Productos de belleza y cuidado personal', activo: true });
    db.createCategoria({ nombre: 'Cuidado Facial', descripcion: 'Productos para el cuidado del rostro', activo: true });
    db.createCategoria({ nombre: 'Maquillaje', descripcion: 'Productos de maquillaje y coloración', activo: true });
    db.createCategoria({ nombre: 'Cuidado Corporal', descripcion: 'Productos para el cuidado del cuerpo', activo: true });
    
    // Marcas
    db.createMarca({ nombre: 'L\'Oréal', descripcion: 'Marca internacional de cosméticos', activo: true });
    db.createMarca({ nombre: 'Maybelline', descripcion: 'Maquillaje profesional', activo: true });
    db.createMarca({ nombre: 'Nivea', descripcion: 'Cuidado personal', activo: true });
    db.createMarca({ nombre: 'AEJ Cosmetics', descripcion: 'Marca propia', activo: true });
    
    // Proveedores
    db.createProveedor({
      nit: '900123456-1',
      razon_social: 'Distribuidora Belleza SAS',
      nombre_comercial: 'Belleza Total',
      contacto_nombre: 'Juan Pérez',
      contacto_email: 'juan@belleza.com',
      contacto_telefono: '3001234567',
      direccion: 'Calle 50 #25-30',
      ciudad: 'Bogotá',
      pais: 'Colombia',
      activo: true
    });
    
    db.createProveedor({
      nit: '800987654-2',
      razon_social: 'Cosméticos Internacionales LTDA',
      nombre_comercial: 'Cosmo Internacional',
      contacto_nombre: 'María García',
      contacto_email: 'maria@cosmo.com',
      contacto_telefono: '3009876543',
      direccion: 'Carrera 15 #80-45',
      ciudad: 'Medellín',
      pais: 'Colombia',
      activo: true
    });
    
    // Productos
    const categorias = db.getCategorias();
    const marcas = db.getMarcas();
    const proveedores = db.getProveedores();
    
    db.createProducto({
      sku: 'COS-001',
      nombre: 'Crema Facial Hidratante',
      descripcion: 'Crema hidratante para todo tipo de piel',
      categoria_id: categorias[1].id,
      marca_id: marcas[0].id,
      proveedor_id: proveedores[0].id,
      precio_compra: 25000,
      precio_venta: 45000,
      stock_actual: 50,
      stock_minimo: 10,
      aplica_iva: true,
      porcentaje_iva: 19,
      activo: true
    });
    
    db.createProducto({
      sku: 'MAQ-001',
      nombre: 'Base de Maquillaje Líquida',
      descripcion: 'Base líquida de larga duración',
      categoria_id: categorias[2].id,
      marca_id: marcas[1].id,
      proveedor_id: proveedores[0].id,
      precio_compra: 35000,
      precio_venta: 65000,
      stock_actual: 5, // Stock bajo para demo
      stock_minimo: 10,
      aplica_iva: true,
      porcentaje_iva: 19,
      activo: true
    });
    
    db.createProducto({
      sku: 'COR-001',
      nombre: 'Loción Corporal Nivea',
      descripcion: 'Loción hidratante para el cuerpo',
      categoria_id: categorias[3].id,
      marca_id: marcas[2].id,
      proveedor_id: proveedores[1].id,
      precio_compra: 18000,
      precio_venta: 32000,
      stock_actual: 25,
      stock_minimo: 8,
      aplica_iva: true,
      porcentaje_iva: 19,
      activo: true
    });

    // Más productos para demo
    db.createProducto({
      sku: 'LIP-001',
      nombre: 'Labial Mate Maybelline',
      descripcion: 'Labial de larga duración color rojo',
      categoria_id: categorias[2].id,
      marca_id: marcas[1].id,
      proveedor_id: proveedores[0].id,
      precio_compra: 12000,
      precio_venta: 22000,
      stock_actual: 0, // Sin stock para demo
      stock_minimo: 5,
      aplica_iva: true,
      porcentaje_iva: 19,
      activo: true
    });

    db.createProducto({
      sku: 'SER-001',
      nombre: 'Serum Vitamina C',
      descripcion: 'Serum antioxidante con vitamina C',
      categoria_id: categorias[1].id,
      marca_id: marcas[3].id,
      proveedor_id: proveedores[1].id,
      precio_compra: 45000,
      precio_venta: 85000,
      stock_actual: 15,
      stock_minimo: 8,
      aplica_iva: true,
      porcentaje_iva: 19,
      activo: true
    });
    
    // Clientes
    db.createCliente({
      tipo_documento: 'CC',
      documento: '12345678',
      nombre: 'María',
      apellido: 'González',
      email: 'maria.gonzalez@email.com',
      telefono: '3001234567',
      direccion: 'Calle 123 #45-67',
      ciudad: 'Bogotá',
      aceptacion_tratamiento_datos: true,
      fecha_aceptacion_datos: new Date().toISOString(),
      canal_aceptacion: 'WEB',
      clasificacion: 'FRECUENTE',
      total_compras: 5,
      total_gastado: 250000,
      activo: true
    });
    
    db.createCliente({
      tipo_documento: 'CC',
      documento: '87654321',
      nombre: 'Carlos',
      apellido: 'Rodríguez',
      email: 'carlos.rodriguez@email.com',
      telefono: '3009876543',
      direccion: 'Carrera 45 #12-34',
      ciudad: 'Medellín',
      aceptacion_tratamiento_datos: true,
      fecha_aceptacion_datos: new Date().toISOString(),
      canal_aceptacion: 'FISICO',
      clasificacion: 'NUEVO',
      total_compras: 1,
      total_gastado: 45000,
      activo: true
    });

    // Crear algunas ventas de ejemplo
    const productosDemo = db.getProductos();
    const clientesDemo = db.getClientes();
    
    if (productosDemo.length > 0 && clientesDemo.length > 0) {
      // Venta 1 - hace 2 días
      const fecha1 = new Date();
      fecha1.setDate(fecha1.getDate() - 2);
      
      const venta1 = db.createVenta({
        cliente_id: clientesDemo[0].id,
        usuario_id: '3', // vendedor1
        fecha_hora: fecha1.toISOString(),
        items: [{
          id: '1',
          producto_id: productosDemo[0].id,
          cantidad: 2,
          precio_unitario: 45000,
          descuento_item: 0,
          subtotal_item: 90000,
          iva_item: 17100,
          total_item: 107100
        }],
        subtotal: 90000,
        descuento_porcentaje: 0,
        descuento_valor: 0,
        iva_valor: 17100,
        total: 107100,
        metodo_pago: 'EFECTIVO',
        valor_recibido: 110000,
        cambio: 2900,
        estado: 'PAGADA'
      });

      // Crear factura para la venta
      db.createFactura({
        venta_id: venta1.id,
        cliente_id: venta1.cliente_id,
        fecha_emision: venta1.created_at,
        fecha_vencimiento: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 días
        subtotal: venta1.subtotal,
        iva_valor: venta1.iva_valor,
        total: venta1.total,
        estado: 'PAGADA',
        usuario_id: venta1.usuario_id
      });

      // Venta 2 - ayer
      const fecha2 = new Date();
      fecha2.setDate(fecha2.getDate() - 1);
      
      const venta2 = db.createVenta({
        cliente_id: clientesDemo[1].id,
        usuario_id: '3',
        fecha_hora: fecha2.toISOString(),
        items: [{
          id: '2',
          producto_id: productosDemo[2].id,
          cantidad: 1,
          precio_unitario: 32000,
          descuento_item: 0,
          subtotal_item: 32000,
          iva_item: 6080,
          total_item: 38080
        }],
        subtotal: 32000,
        descuento_porcentaje: 0,
        descuento_valor: 0,
        iva_valor: 6080,
        total: 38080,
        metodo_pago: 'TARJETA',
        estado: 'PAGADA'
      });

      // Crear factura para la venta
      db.createFactura({
        venta_id: venta2.id,
        cliente_id: venta2.cliente_id,
        fecha_emision: venta2.created_at,
        fecha_vencimiento: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        subtotal: venta2.subtotal,
        iva_valor: venta2.iva_valor,
        total: venta2.total,
        estado: 'PAGADA',
        usuario_id: venta2.usuario_id
      });
    }
  }
};