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
  Plus, 
  Search, 
  Eye, 
  FileText, 
  Printer,
  CheckCircle,
  AlertTriangle,
  Calendar,
  DollarSign,
  XCircle,
  Download,
  RefreshCw
} from 'lucide-react';
import { User, hasPermission } from '@/lib/auth';
import { db, Factura, Venta, Cliente } from '@/lib/database';

interface BillingProps {
  user: User;
}

export default function Billing({ user }: BillingProps) {
  const [facturas, setFacturas] = useState<Factura[]>([]);
  const [ventas, setVentas] = useState<Venta[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredFacturas, setFilteredFacturas] = useState<Factura[]>([]);
  const [showDialog, setShowDialog] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [selectedFactura, setSelectedFactura] = useState<Factura | null>(null);
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [filterEstado, setFilterEstado] = useState<string>('TODAS');
  
  const [formData, setFormData] = useState({
    venta_id: '',
    cliente_id: '',
    fecha_vencimiento: '',
    observaciones: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterInvoices();
  }, [facturas, searchQuery, filterEstado]);

  const loadData = () => {
    setFacturas(db.getFacturas());
    setVentas(db.getVentas().filter(v => v.estado === 'PAGADA' && !v.deleted_at));
    setClientes(db.getClientes());
  };

  const filterInvoices = () => {
    let filtered = facturas;
    
    if (filterEstado !== 'TODAS') {
      filtered = filtered.filter(f => f.estado === filterEstado);
    }
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(f => 
        f.numero_factura.toLowerCase().includes(query) ||
        getClienteNombre(f.cliente_id).toLowerCase().includes(query) ||
        f.observaciones?.toLowerCase().includes(query)
      );
    }
    
    setFilteredFacturas(filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
  };

  const resetForm = () => {
    setFormData({
      venta_id: '',
      cliente_id: '',
      fecha_vencimiento: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 días
      observaciones: ''
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!hasPermission(user, 'facturacion.write')) {
      showAlert('error', 'No tienes permisos para crear facturas');
      return;
    }

    const venta = ventas.find(v => v.id === formData.venta_id);
    if (!venta) {
      showAlert('error', 'Selecciona una venta válida');
      return;
    }

    // Verificar si ya existe factura para esta venta
    const facturaExistente = facturas.find(f => f.venta_id === formData.venta_id);
    if (facturaExistente) {
      showAlert('error', 'Ya existe una factura para esta venta');
      return;
    }

    try {
      db.createFactura({
        venta_id: formData.venta_id,
        cliente_id: formData.cliente_id || venta.cliente_id,
        fecha_emision: new Date().toISOString(),
        fecha_vencimiento: new Date(formData.fecha_vencimiento).toISOString(),
        subtotal: venta.subtotal,
        iva_valor: venta.iva_valor,
        total: venta.total,
        estado: 'EMITIDA',
        observaciones: formData.observaciones,
        usuario_id: user.id
      });
      
      showAlert('success', 'Factura creada exitosamente');
      loadData();
      setShowDialog(false);
      resetForm();
    } catch (error) {
      showAlert('error', 'Error al crear la factura');
    }
  };

  const handleAnular = (factura: Factura) => {
    if (!hasPermission(user, 'facturacion.cancel')) {
      showAlert('error', 'No tienes permisos para anular facturas');
      return;
    }

    const motivo = prompt('Ingresa el motivo de anulación:');
    if (!motivo) return;

    if (confirm(`¿Estás seguro de anular la factura ${factura.numero_factura}?`)) {
      db.updateFactura(factura.id, {
        estado: 'ANULADA',
        anulada_at: new Date().toISOString(),
        anulada_by: user.id,
        anulacion_motivo: motivo
      });
      showAlert('success', 'Factura anulada exitosamente');
      loadData();
    }
  };

  const handleMarcarPagada = (factura: Factura) => {
    if (!hasPermission(user, 'facturacion.write')) {
      showAlert('error', 'No tienes permisos para modificar facturas');
      return;
    }

    db.updateFactura(factura.id, { estado: 'PAGADA' });
    showAlert('success', 'Factura marcada como pagada');
    loadData();
  };

  const handleView = (factura: Factura) => {
    setSelectedFactura(factura);
    setShowViewDialog(true);
  };

  const handlePrint = (factura: Factura) => {
    if (!hasPermission(user, 'facturacion.reprint')) {
      showAlert('error', 'No tienes permisos para reimprimir facturas');
      return;
    }
    
    // Simulación de impresión
    showAlert('success', `Factura ${factura.numero_factura} enviada a impresión`);
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

  const getEstadoBadgeColor = (estado: string) => {
    const colors = {
      EMITIDA: 'bg-blue-100 text-blue-800 border-blue-200',
      PAGADA: 'bg-green-100 text-green-800 border-green-200',
      ANULADA: 'bg-red-100 text-red-800 border-red-200',
      VENCIDA: 'bg-orange-100 text-orange-800 border-orange-200'
    };
    return colors[estado as keyof typeof colors] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getClienteNombre = (clienteId?: string) => {
    if (!clienteId) return 'Cliente General';
    const cliente = clientes.find(c => c.id === clienteId);
    if (!cliente) return 'Cliente no encontrado';
    return cliente.tipo_documento === 'NIT' ? cliente.razon_social : `${cliente.nombre} ${cliente.apellido || ''}`;
  };

  const getVentaNumero = (ventaId: string) => {
    const venta = ventas.find(v => v.id === ventaId);
    return venta ? venta.numero_venta : 'N/A';
  };

  const ventasSinFactura = ventas.filter(v => !facturas.find(f => f.venta_id === v.id));
  const configEmpresa = db.getConfiguracionEmpresa();

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Facturación Electrónica</h1>
          <p className="text-gray-600">Gestión de facturas, emisión y control tributario</p>
        </div>
        {hasPermission(user, 'facturacion.write') && (
          <Dialog open={showDialog} onOpenChange={setShowDialog}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="w-4 h-4 mr-2" />
                Nueva Factura
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Nueva Factura</DialogTitle>
                <DialogDescription>
                  Genera una nueva factura a partir de una venta
                </DialogDescription>
              </DialogHeader>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="venta_id">Venta *</Label>
                  <Select value={formData.venta_id} onValueChange={(value) => setFormData({...formData, venta_id: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar venta" />
                    </SelectTrigger>
                    <SelectContent>
                      {ventasSinFactura.map((venta) => (
                        <SelectItem key={venta.id} value={venta.id}>
                          {venta.numero_venta} - {formatCurrency(venta.total)} - {getClienteNombre(venta.cliente_id)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cliente_id">Cliente (opcional)</Label>
                  <Select value={formData.cliente_id} onValueChange={(value) => setFormData({...formData, cliente_id: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Usar cliente de la venta" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Usar cliente de la venta</SelectItem>
                      {clientes.filter(c => c.activo).map((cliente) => (
                        <SelectItem key={cliente.id} value={cliente.id}>
                          {getClienteNombre(cliente.id)} - {cliente.documento}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fecha_vencimiento">Fecha de Vencimiento *</Label>
                  <Input
                    id="fecha_vencimiento"
                    type="date"
                    value={formData.fecha_vencimiento}
                    onChange={(e) => setFormData({...formData, fecha_vencimiento: e.target.value})}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="observaciones">Observaciones</Label>
                  <Textarea
                    id="observaciones"
                    value={formData.observaciones}
                    onChange={(e) => setFormData({...formData, observaciones: e.target.value})}
                    rows={3}
                  />
                </div>

                <div className="flex justify-end space-x-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setShowDialog(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit">
                    Crear Factura
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

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Facturas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{facturas.length}</div>
            <p className="text-xs text-muted-foreground">Emitidas</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Facturas Pagadas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {facturas.filter(f => f.estado === 'PAGADA').length}
            </div>
            <p className="text-xs text-muted-foreground">
              {facturas.length > 0 ? Math.round((facturas.filter(f => f.estado === 'PAGADA').length / facturas.length) * 100) : 0}% del total
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pendientes de Pago</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {facturas.filter(f => f.estado === 'EMITIDA').length}
            </div>
            <p className="text-xs text-muted-foreground">Emitidas</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Valor Total Facturado</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {formatCurrency(facturas.reduce((sum, f) => sum + f.total, 0))}
            </div>
            <p className="text-xs text-muted-foreground">Acumulado</p>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Search className="w-5 h-5 mr-2" />
            Buscar y Filtrar Facturas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Buscar</Label>
              <Input
                placeholder="Buscar por número, cliente u observaciones..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Estado</Label>
              <Select value={filterEstado} onValueChange={setFilterEstado}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TODAS">Todas</SelectItem>
                  <SelectItem value="EMITIDA">Emitidas</SelectItem>
                  <SelectItem value="PAGADA">Pagadas</SelectItem>
                  <SelectItem value="ANULADA">Anuladas</SelectItem>
                  <SelectItem value="VENCIDA">Vencidas</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de facturas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center">
              <FileText className="w-5 h-5 mr-2" />
              Facturas ({filteredFacturas.length})
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredFacturas.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No se encontraron facturas</p>
              {hasPermission(user, 'facturacion.write') && (
                <p className="text-sm">Crea tu primera factura usando el botón "Nueva Factura"</p>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredFacturas.map((factura) => (
                <div key={factura.id} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center space-x-3">
                        <h3 className="font-semibold text-lg">{factura.numero_factura}</h3>
                        <Badge className={`text-xs ${getEstadoBadgeColor(factura.estado)}`}>
                          {factura.estado}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {getVentaNumero(factura.venta_id)}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center space-x-6 text-sm text-gray-600">
                        <span>Cliente: <strong>{getClienteNombre(factura.cliente_id)}</strong></span>
                        <span className="flex items-center">
                          <Calendar className="w-3 h-3 mr-1" />
                          Emitida: {new Date(factura.fecha_emision).toLocaleDateString('es-CO')}
                        </span>
                        <span className="flex items-center">
                          <Calendar className="w-3 h-3 mr-1" />
                          Vence: {new Date(factura.fecha_vencimiento).toLocaleDateString('es-CO')}
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-6 text-sm text-gray-600">
                        <span className="flex items-center">
                          <DollarSign className="w-3 h-3 mr-1" />
                          Subtotal: <strong>{formatCurrency(factura.subtotal)}</strong>
                        </span>
                        <span>IVA: <strong>{formatCurrency(factura.iva_valor)}</strong></span>
                        <span>Total: <strong className="text-lg">{formatCurrency(factura.total)}</strong></span>
                      </div>
                      
                      {factura.observaciones && (
                        <p className="text-sm text-gray-600">
                          <strong>Observaciones:</strong> {factura.observaciones}
                        </p>
                      )}
                      
                      {factura.anulacion_motivo && (
                        <p className="text-sm text-red-600">
                          <strong>Motivo anulación:</strong> {factura.anulacion_motivo}
                        </p>
                      )}
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleView(factura)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      
                      {hasPermission(user, 'facturacion.reprint') && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handlePrint(factura)}
                        >
                          <Printer className="w-4 h-4" />
                        </Button>
                      )}
                      
                      {factura.estado === 'EMITIDA' && hasPermission(user, 'facturacion.write') && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleMarcarPagada(factura)}
                          className="text-green-600 hover:text-green-700"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </Button>
                      )}
                      
                      {factura.estado !== 'ANULADA' && hasPermission(user, 'facturacion.cancel') && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleAnular(factura)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <XCircle className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog de visualización */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Factura {selectedFactura?.numero_factura}
            </DialogTitle>
            <DialogDescription>
              Vista previa de la factura electrónica
            </DialogDescription>
          </DialogHeader>
          
          {selectedFactura && (
            <div className="space-y-6 p-6 bg-white border rounded-lg">
              {/* Encabezado empresa */}
              <div className="text-center border-b pb-4">
                <h2 className="text-2xl font-bold">{configEmpresa.razon_social}</h2>
                <p className="text-sm text-gray-600">NIT: {configEmpresa.nit}</p>
                <p className="text-sm text-gray-600">{configEmpresa.direccion}, {configEmpresa.ciudad}</p>
                <p className="text-sm text-gray-600">Tel: {configEmpresa.telefono} | Email: {configEmpresa.email}</p>
                <p className="text-sm text-gray-600">{configEmpresa.regimen_tributario}</p>
              </div>
              
              {/* Información factura */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-2">FACTURA DE VENTA</h3>
                  <p><strong>Número:</strong> {selectedFactura.numero_factura}</p>
                  <p><strong>Fecha Emisión:</strong> {new Date(selectedFactura.fecha_emision).toLocaleDateString('es-CO')}</p>
                  <p><strong>Fecha Vencimiento:</strong> {new Date(selectedFactura.fecha_vencimiento).toLocaleDateString('es-CO')}</p>
                  <p><strong>Estado:</strong> <Badge className={`${getEstadoBadgeColor(selectedFactura.estado)}`}>{selectedFactura.estado}</Badge></p>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-2">CLIENTE</h3>
                  <p><strong>Nombre:</strong> {getClienteNombre(selectedFactura.cliente_id)}</p>
                  {selectedFactura.cliente_id && (() => {
                    const cliente = clientes.find(c => c.id === selectedFactura.cliente_id);
                    return cliente ? (
                      <>
                        <p><strong>Documento:</strong> {cliente.documento}</p>
                        <p><strong>Dirección:</strong> {cliente.direccion || 'N/A'}</p>
                        <p><strong>Teléfono:</strong> {cliente.telefono || 'N/A'}</p>
                        <p><strong>Email:</strong> {cliente.email || 'N/A'}</p>
                      </>
                    ) : null;
                  })()}
                </div>
              </div>
              
              {/* Totales */}
              <div className="border-t pt-4">
                <div className="flex justify-end">
                  <div className="w-64 space-y-2">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span>{formatCurrency(selectedFactura.subtotal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>IVA (19%):</span>
                      <span>{formatCurrency(selectedFactura.iva_valor)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg border-t pt-2">
                      <span>TOTAL:</span>
                      <span>{formatCurrency(selectedFactura.total)}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {selectedFactura.observaciones && (
                <div className="border-t pt-4">
                  <h3 className="font-semibold mb-2">OBSERVACIONES</h3>
                  <p className="text-sm">{selectedFactura.observaciones}</p>
                </div>
              )}
              
              <div className="text-center text-xs text-gray-500 border-t pt-4">
                <p>Factura generada electrónicamente por el Sistema POS AEJ</p>
                <p>Para consultas: {configEmpresa.email} | {configEmpresa.telefono}</p>
              </div>
            </div>
          )}
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={() => setShowViewDialog(false)}>
              Cerrar
            </Button>
            {selectedFactura && hasPermission(user, 'facturacion.reprint') && (
              <Button onClick={() => handlePrint(selectedFactura)}>
                <Printer className="w-4 h-4 mr-2" />
                Imprimir
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}