import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Plus, 
  Search, 
  Edit, 
  Users, 
  Shield,
  CheckCircle,
  AlertTriangle,
  Eye,
  FileText,
  Calendar
} from 'lucide-react';
import { User, hasPermission } from '@/lib/auth';
import { db, Cliente } from '@/lib/database';

interface ClientsProps {
  user: User;
}

export default function Clients({ user }: ClientsProps) {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredClientes, setFilteredClientes] = useState<Cliente[]>([]);
  const [showDialog, setShowDialog] = useState(false);
  const [editingClient, setEditingClient] = useState<Cliente | null>(null);
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  
  const [formData, setFormData] = useState({
    tipo_documento: 'CC' as 'CC' | 'NIT' | 'CE' | 'TI',
    documento: '',
    nombre: '',
    apellido: '',
    razon_social: '',
    email: '',
    telefono: '',
    direccion: '',
    ciudad: '',
    aceptacion_tratamiento_datos: false,
    canal_aceptacion: 'WEB' as 'WEB' | 'FISICO' | 'TELEFONO',
    activo: true
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterClients();
  }, [clientes, searchQuery]);

  const loadData = () => {
    setClientes(db.getClientes());
  };

  const filterClients = () => {
    let filtered = clientes;
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = clientes.filter(c => 
        c.nombre.toLowerCase().includes(query) ||
        c.documento.includes(query) ||
        c.email?.toLowerCase().includes(query) ||
        c.apellido?.toLowerCase().includes(query)
      );
    }
    
    setFilteredClientes(filtered);
  };

  const resetForm = () => {
    setFormData({
      tipo_documento: 'CC',
      documento: '',
      nombre: '',
      apellido: '',
      razon_social: '',
      email: '',
      telefono: '',
      direccion: '',
      ciudad: '',
      aceptacion_tratamiento_datos: false,
      canal_aceptacion: 'WEB',
      activo: true
    });
    setEditingClient(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!hasPermission(user, 'clientes.write')) {
      showAlert('error', 'No tienes permisos para crear/editar clientes');
      return;
    }

    // Validación de consentimiento de datos (LEY 1581)
    if (!formData.aceptacion_tratamiento_datos) {
      showAlert('error', 'Es obligatorio aceptar el tratamiento de datos personales según la Ley 1581 de 2012');
      return;
    }

    // Validar documento único
    const existingClient = clientes.find(c => 
      c.documento === formData.documento && 
      (!editingClient || c.id !== editingClient.id)
    );
    
    if (existingClient) {
      showAlert('error', 'Ya existe un cliente con este número de documento');
      return;
    }

    try {
      const clientData = {
        ...formData,
        fecha_aceptacion_datos: formData.aceptacion_tratamiento_datos ? new Date().toISOString() : undefined,
        clasificacion: 'NUEVO' as const,
        total_compras: 0,
        total_gastado: 0
      };

      if (editingClient) {
        db.updateCliente(editingClient.id, clientData);
        showAlert('success', 'Cliente actualizado exitosamente');
      } else {
        db.createCliente(clientData);
        showAlert('success', 'Cliente creado exitosamente');
      }
      
      loadData();
      setShowDialog(false);
      resetForm();
    } catch (error) {
      showAlert('error', 'Error al guardar el cliente');
    }
  };

  const handleEdit = (cliente: Cliente) => {
    if (!hasPermission(user, 'clientes.write')) {
      showAlert('error', 'No tienes permisos para editar clientes');
      return;
    }
    
    setEditingClient(cliente);
    setFormData({
      tipo_documento: cliente.tipo_documento,
      documento: cliente.documento,
      nombre: cliente.nombre,
      apellido: cliente.apellido || '',
      razon_social: cliente.razon_social || '',
      email: cliente.email || '',
      telefono: cliente.telefono || '',
      direccion: cliente.direccion || '',
      ciudad: cliente.ciudad || '',
      aceptacion_tratamiento_datos: cliente.aceptacion_tratamiento_datos,
      canal_aceptacion: cliente.canal_aceptacion,
      activo: cliente.activo
    });
    setShowDialog(true);
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

  const getClasificacionColor = (clasificacion: string) => {
    const colors = {
      VIP: 'bg-purple-100 text-purple-800 border-purple-200',
      FRECUENTE: 'bg-blue-100 text-blue-800 border-blue-200',
      OCASIONAL: 'bg-green-100 text-green-800 border-green-200',
      NUEVO: 'bg-gray-100 text-gray-800 border-gray-200'
    };
    return colors[clasificacion as keyof typeof colors] || colors.NUEVO;
  };

  const getTipoDocumentoLabel = (tipo: string) => {
    const tipos = {
      CC: 'Cédula de Ciudadanía',
      NIT: 'NIT',
      CE: 'Cédula de Extranjería',
      TI: 'Tarjeta de Identidad'
    };
    return tipos[tipo as keyof typeof tipos] || tipo;
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Clientes</h1>
          <p className="text-gray-600">Administra la base de datos de clientes con cumplimiento Ley 1581</p>
        </div>
        {hasPermission(user, 'clientes.write') && (
          <Dialog open={showDialog} onOpenChange={setShowDialog}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="w-4 h-4 mr-2" />
                Nuevo Cliente
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingClient ? 'Editar Cliente' : 'Nuevo Cliente'}
                </DialogTitle>
                <DialogDescription>
                  {editingClient ? 'Modifica los datos del cliente' : 'Registra un nuevo cliente cumpliendo con la Ley 1581 de 2012'}
                </DialogDescription>
              </DialogHeader>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="tipo_documento">Tipo de Documento *</Label>
                    <Select 
                      value={formData.tipo_documento} 
                      onValueChange={(value: 'CC' | 'NIT' | 'CE' | 'TI') => setFormData({...formData, tipo_documento: value})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="CC">Cédula de Ciudadanía</SelectItem>
                        <SelectItem value="NIT">NIT</SelectItem>
                        <SelectItem value="CE">Cédula de Extranjería</SelectItem>
                        <SelectItem value="TI">Tarjeta de Identidad</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="documento">Número de Documento *</Label>
                    <Input
                      id="documento"
                      value={formData.documento}
                      onChange={(e) => setFormData({...formData, documento: e.target.value})}
                      required
                    />
                  </div>
                </div>

                {formData.tipo_documento === 'NIT' ? (
                  <div className="space-y-2">
                    <Label htmlFor="razon_social">Razón Social *</Label>
                    <Input
                      id="razon_social"
                      value={formData.razon_social}
                      onChange={(e) => setFormData({...formData, razon_social: e.target.value})}
                      required
                    />
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="nombre">Nombres *</Label>
                      <Input
                        id="nombre"
                        value={formData.nombre}
                        onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="apellido">Apellidos</Label>
                      <Input
                        id="apellido"
                        value={formData.apellido}
                        onChange={(e) => setFormData({...formData, apellido: e.target.value})}
                      />
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Correo Electrónico</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="telefono">Teléfono</Label>
                    <Input
                      id="telefono"
                      value={formData.telefono}
                      onChange={(e) => setFormData({...formData, telefono: e.target.value})}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="direccion">Dirección</Label>
                    <Input
                      id="direccion"
                      value={formData.direccion}
                      onChange={(e) => setFormData({...formData, direccion: e.target.value})}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="ciudad">Ciudad</Label>
                    <Input
                      id="ciudad"
                      value={formData.ciudad}
                      onChange={(e) => setFormData({...formData, ciudad: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="canal_aceptacion">Canal de Aceptación</Label>
                  <Select 
                    value={formData.canal_aceptacion} 
                    onValueChange={(value: 'WEB' | 'FISICO' | 'TELEFONO') => setFormData({...formData, canal_aceptacion: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="WEB">Página Web</SelectItem>
                      <SelectItem value="FISICO">Punto Físico</SelectItem>
                      <SelectItem value="TELEFONO">Teléfono</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Consentimiento de datos - LEY 1581 */}
                <div className="border border-blue-200 bg-blue-50 p-4 rounded-lg space-y-3">
                  <div className="flex items-center space-x-2">
                    <Shield className="w-5 h-5 text-blue-600" />
                    <h4 className="font-semibold text-blue-900">Tratamiento de Datos Personales (Ley 1581 de 2012)</h4>
                  </div>
                  
                  <div className="text-sm text-blue-800 space-y-2">
                    <p>
                      <strong>AEJ Cosmetic & More</strong> informa que los datos personales suministrados serán tratados de conformidad con la Ley 1581 de 2012 y sus decretos reglamentarios, para las siguientes finalidades:
                    </p>
                    <ul className="list-disc list-inside space-y-1 ml-4">
                      <li>Gestión comercial y facturación</li>
                      <li>Atención al cliente y soporte técnico</li>
                      <li>Envío de información comercial (opcional)</li>
                      <li>Cumplimiento de obligaciones legales</li>
                    </ul>
                    <p>
                      El titular puede ejercer sus derechos de acceso, rectificación, actualización y supresión contactando a: <strong>datos@aejcosmetic.com</strong>
                    </p>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="aceptacion_datos"
                      checked={formData.aceptacion_tratamiento_datos}
                      onCheckedChange={(checked) => setFormData({...formData, aceptacion_tratamiento_datos: !!checked})}
                    />
                    <Label htmlFor="aceptacion_datos" className="text-sm font-medium text-blue-900">
                      Acepto el tratamiento de mis datos personales según la política descrita *
                    </Label>
                  </div>
                </div>

                <div className="flex justify-end space-x-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setShowDialog(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={!formData.aceptacion_tratamiento_datos}>
                    {editingClient ? 'Actualizar' : 'Crear'} Cliente
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

      {/* Estadísticas de cumplimiento */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Clientes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{clientes.length}</div>
            <p className="text-xs text-muted-foreground">Clientes registrados</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Cumplimiento Ley 1581</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {clientes.filter(c => c.aceptacion_tratamiento_datos).length}
            </div>
            <p className="text-xs text-muted-foreground">Con consentimiento válido</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Clientes Activos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {clientes.filter(c => c.activo).length}
            </div>
            <p className="text-xs text-muted-foreground">Clientes activos</p>
          </CardContent>
        </Card>
      </div>

      {/* Filtros y búsqueda */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Search className="w-5 h-5 mr-2" />
            Buscar Clientes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Input
            placeholder="Buscar por nombre, documento o email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </CardContent>
      </Card>

      {/* Lista de clientes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center">
              <Users className="w-5 h-5 mr-2" />
              Clientes ({filteredClientes.length})
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredClientes.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No se encontraron clientes</p>
              {hasPermission(user, 'clientes.write') && (
                <p className="text-sm">Registra tu primer cliente usando el botón "Nuevo Cliente"</p>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredClientes.map((cliente) => (
                <div key={cliente.id} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center space-x-3">
                        <h3 className="font-semibold text-lg">
                          {cliente.tipo_documento === 'NIT' ? cliente.razon_social : `${cliente.nombre} ${cliente.apellido || ''}`}
                        </h3>
                        <Badge variant="outline" className="text-xs">
                          {cliente.tipo_documento}: {cliente.documento}
                        </Badge>
                        <Badge className={`text-xs ${getClasificacionColor(cliente.clasificacion)}`}>
                          {cliente.clasificacion}
                        </Badge>
                        {cliente.aceptacion_tratamiento_datos && (
                          <Badge variant="default" className="text-xs bg-green-100 text-green-800">
                            <Shield className="w-3 h-3 mr-1" />
                            Ley 1581
                          </Badge>
                        )}
                        {!cliente.activo && (
                          <Badge variant="secondary" className="text-xs">
                            Inactivo
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-6 text-sm text-gray-600">
                        {cliente.email && <span>📧 {cliente.email}</span>}
                        {cliente.telefono && <span>📞 {cliente.telefono}</span>}
                        {cliente.ciudad && <span>📍 {cliente.ciudad}</span>}
                      </div>
                      
                      <div className="flex items-center space-x-6 text-sm text-gray-600">
                        <span>Compras: <strong>{cliente.total_compras}</strong></span>
                        <span>Total gastado: <strong>{formatCurrency(cliente.total_gastado)}</strong></span>
                        {cliente.fecha_aceptacion_datos && (
                          <span>Consentimiento: <strong>{new Date(cliente.fecha_aceptacion_datos).toLocaleDateString('es-CO')}</strong></span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      {hasPermission(user, 'clientes.write') && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(cliente)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}