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
  Edit, 
  Trash2, 
  Building2, 
  Star,
  CheckCircle,
  AlertTriangle,
  Eye,
  Phone,
  Mail,
  MapPin,
  Calendar,
  TrendingUp
} from 'lucide-react';
import { User, hasPermission } from '@/lib/auth';
import { db, Proveedor } from '@/lib/database';

interface SuppliersProps {
  user: User;
}

interface ProveedorEvaluacion {
  id: string;
  proveedor_id: string;
  calidad: number;
  precio: number;
  entrega: number;
  servicio: number;
  promedio: number;
  comentarios?: string;
  fecha_evaluacion: string;
  usuario_evaluador: string;
}

export default function Suppliers({ user }: SuppliersProps) {
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredProveedores, setFilteredProveedores] = useState<Proveedor[]>([]);
  const [showDialog, setShowDialog] = useState(false);
  const [showEvaluationDialog, setShowEvaluationDialog] = useState(false);
  const [editingProveedor, setEditingProveedor] = useState<Proveedor | null>(null);
  const [selectedProveedor, setSelectedProveedor] = useState<Proveedor | null>(null);
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  
  const [formData, setFormData] = useState({
    nit: '',
    razon_social: '',
    nombre_comercial: '',
    contacto_nombre: '',
    contacto_telefono: '',
    contacto_email: '',
    direccion: '',
    ciudad: '',
    pais: 'Colombia',
    sitio_web: '',
    observaciones: '',
    activo: true
  });

  const [evaluacionForm, setEvaluacionForm] = useState({
    calidad: 5,
    precio: 5,
    entrega: 5,
    servicio: 5,
    comentarios: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterSuppliers();
  }, [proveedores, searchQuery]);

  const loadData = () => {
    setProveedores(db.getProveedores());
  };

  const filterSuppliers = () => {
    let filtered = proveedores.filter(p => p.activo);
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(p => 
        p.razon_social.toLowerCase().includes(query) ||
        p.nit.includes(query) ||
        p.contacto_email?.toLowerCase().includes(query) ||
        p.ciudad?.toLowerCase().includes(query)
      );
    }
    
    setFilteredProveedores(filtered);
  };

  const resetForm = () => {
    setFormData({
      nit: '',
      razon_social: '',
      nombre_comercial: '',
      contacto_nombre: '',
      contacto_telefono: '',
      contacto_email: '',
      direccion: '',
      ciudad: '',
      pais: 'Colombia',
      sitio_web: '',
      observaciones: '',
      activo: true
    });
    setEditingProveedor(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!hasPermission(user, 'proveedores.write')) {
      showAlert('error', 'No tienes permisos para crear/editar proveedores');
      return;
    }

    // Validar NIT único
    const existingProveedor = proveedores.find(p => 
      p.nit === formData.nit && 
      (!editingProveedor || p.id !== editingProveedor.id)
    );
    
    if (existingProveedor) {
      showAlert('error', 'Ya existe un proveedor con este NIT');
      return;
    }

    try {
      if (editingProveedor) {
        db.updateProveedor(editingProveedor.id, formData);
        showAlert('success', 'Proveedor actualizado exitosamente');
      } else {
        db.createProveedor(formData);
        showAlert('success', 'Proveedor creado exitosamente');
      }
      
      loadData();
      setShowDialog(false);
      resetForm();
    } catch (error) {
      showAlert('error', 'Error al guardar el proveedor');
    }
  };

  const handleEdit = (proveedor: Proveedor) => {
    if (!hasPermission(user, 'proveedores.write')) {
      showAlert('error', 'No tienes permisos para editar proveedores');
      return;
    }
    
    setEditingProveedor(proveedor);
    setFormData({
      nit: proveedor.nit,
      razon_social: proveedor.razon_social,
      nombre_comercial: proveedor.nombre_comercial || '',
      contacto_nombre: proveedor.contacto_nombre || '',
      contacto_telefono: proveedor.contacto_telefono || '',
      contacto_email: proveedor.contacto_email || '',
      direccion: proveedor.direccion || '',
      ciudad: proveedor.ciudad || '',
      pais: proveedor.pais || 'Colombia',
      sitio_web: proveedor.sitio_web || '',
      observaciones: proveedor.observaciones || '',
      activo: proveedor.activo
    });
    setShowDialog(true);
  };

  const handleDelete = (proveedor: Proveedor) => {
    if (!hasPermission(user, 'proveedores.delete')) {
      showAlert('error', 'No tienes permisos para eliminar proveedores');
      return;
    }

    if (confirm(`¿Estás seguro de eliminar al proveedor ${proveedor.razon_social}?`)) {
      db.updateProveedor(proveedor.id, { activo: false });
      showAlert('success', 'Proveedor eliminado exitosamente');
      loadData();
    }
  };

  const handleEvaluate = (proveedor: Proveedor) => {
    if (!hasPermission(user, 'proveedores.evaluate')) {
      showAlert('error', 'No tienes permisos para evaluar proveedores');
      return;
    }
    
    setSelectedProveedor(proveedor);
    setEvaluacionForm({
      calidad: 5,
      precio: 5,
      entrega: 5,
      servicio: 5,
      comentarios: ''
    });
    setShowEvaluationDialog(true);
  };

  const handleSaveEvaluation = () => {
    if (!selectedProveedor) return;
    
    const promedio = (evaluacionForm.calidad + evaluacionForm.precio + evaluacionForm.entrega + evaluacionForm.servicio) / 4;
    
    const evaluacion: ProveedorEvaluacion = {
      id: Date.now().toString(),
      proveedor_id: selectedProveedor.id,
      ...evaluacionForm,
      promedio,
      fecha_evaluacion: new Date().toISOString(),
      usuario_evaluador: user.id
    };
    
    // Guardar evaluación (simulado)
    const evaluaciones = JSON.parse(localStorage.getItem('aej_pos_evaluaciones_proveedores') || '[]');
    evaluaciones.push(evaluacion);
    localStorage.setItem('aej_pos_evaluaciones_proveedores', JSON.stringify(evaluaciones));
    
    showAlert('success', 'Evaluación guardada exitosamente');
    setShowEvaluationDialog(false);
  };

  const getProveedorEvaluaciones = (proveedorId: string): ProveedorEvaluacion[] => {
    const evaluaciones = JSON.parse(localStorage.getItem('aej_pos_evaluaciones_proveedores') || '[]');
    return evaluaciones.filter((e: ProveedorEvaluacion) => e.proveedor_id === proveedorId);
  };

  const getPromedioEvaluacion = (proveedorId: string): number => {
    const evaluaciones = getProveedorEvaluaciones(proveedorId);
    if (evaluaciones.length === 0) return 0;
    return evaluaciones.reduce((sum, e) => sum + e.promedio, 0) / evaluaciones.length;
  };

  const showAlert = (type: 'success' | 'error', message: string) => {
    setAlert({ type, message });
    setTimeout(() => setAlert(null), 5000);
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ));
  };

  const getProductosByProveedor = (proveedorId: string) => {
    return db.getProductos().filter(p => p.proveedor_id === proveedorId && p.activo);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Proveedores</h1>
          <p className="text-gray-600">Administra proveedores, evaluaciones y relaciones comerciales</p>
        </div>
        {hasPermission(user, 'proveedores.write') && (
          <Dialog open={showDialog} onOpenChange={setShowDialog}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="w-4 h-4 mr-2" />
                Nuevo Proveedor
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingProveedor ? 'Editar Proveedor' : 'Nuevo Proveedor'}
                </DialogTitle>
                <DialogDescription>
                  {editingProveedor ? 'Modifica los datos del proveedor' : 'Registra un nuevo proveedor'}
                </DialogDescription>
              </DialogHeader>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="nit">NIT *</Label>
                    <Input
                      id="nit"
                      value={formData.nit}
                      onChange={(e) => setFormData({...formData, nit: e.target.value})}
                      placeholder="123456789-1"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="razon_social">Razón Social *</Label>
                    <Input
                      id="razon_social"
                      value={formData.razon_social}
                      onChange={(e) => setFormData({...formData, razon_social: e.target.value})}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="nombre_comercial">Nombre Comercial</Label>
                  <Input
                    id="nombre_comercial"
                    value={formData.nombre_comercial}
                    onChange={(e) => setFormData({...formData, nombre_comercial: e.target.value})}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="contacto_nombre">Nombre de Contacto</Label>
                    <Input
                      id="contacto_nombre"
                      value={formData.contacto_nombre}
                      onChange={(e) => setFormData({...formData, contacto_nombre: e.target.value})}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="contacto_telefono">Teléfono</Label>
                    <Input
                      id="contacto_telefono"
                      value={formData.contacto_telefono}
                      onChange={(e) => setFormData({...formData, contacto_telefono: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contacto_email">Email de Contacto</Label>
                  <Input
                    id="contacto_email"
                    type="email"
                    value={formData.contacto_email}
                    onChange={(e) => setFormData({...formData, contacto_email: e.target.value})}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="ciudad">Ciudad</Label>
                    <Input
                      id="ciudad"
                      value={formData.ciudad}
                      onChange={(e) => setFormData({...formData, ciudad: e.target.value})}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="pais">País</Label>
                    <Select value={formData.pais} onValueChange={(value) => setFormData({...formData, pais: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Colombia">Colombia</SelectItem>
                        <SelectItem value="Estados Unidos">Estados Unidos</SelectItem>
                        <SelectItem value="México">México</SelectItem>
                        <SelectItem value="Otro">Otro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="direccion">Dirección</Label>
                  <Input
                    id="direccion"
                    value={formData.direccion}
                    onChange={(e) => setFormData({...formData, direccion: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sitio_web">Sitio Web</Label>
                  <Input
                    id="sitio_web"
                    type="url"
                    value={formData.sitio_web}
                    onChange={(e) => setFormData({...formData, sitio_web: e.target.value})}
                    placeholder="https://www.ejemplo.com"
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
                    {editingProveedor ? 'Actualizar' : 'Crear'} Proveedor
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
            <CardTitle className="text-sm font-medium">Total Proveedores</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{proveedores.filter(p => p.activo).length}</div>
            <p className="text-xs text-muted-foreground">Activos</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Evaluados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {proveedores.filter(p => p.activo && getProveedorEvaluaciones(p.id).length > 0).length}
            </div>
            <p className="text-xs text-muted-foreground">Con evaluaciones</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Promedio General</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {(() => {
                const evaluados = proveedores.filter(p => p.activo && getProveedorEvaluaciones(p.id).length > 0);
                if (evaluados.length === 0) return '0.0';
                const promedio = evaluados.reduce((sum, p) => sum + getPromedioEvaluacion(p.id), 0) / evaluados.length;
                return promedio.toFixed(1);
              })()}
            </div>
            <p className="text-xs text-muted-foreground">De 5.0 estrellas</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Productos Suministrados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {db.getProductos().filter(p => p.activo && p.proveedor_id).length}
            </div>
            <p className="text-xs text-muted-foreground">Productos activos</p>
          </CardContent>
        </Card>
      </div>

      {/* Búsqueda */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Search className="w-5 h-5 mr-2" />
            Buscar Proveedores
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Input
            placeholder="Buscar por razón social, NIT, email o ciudad..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </CardContent>
      </Card>

      {/* Lista de proveedores */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center">
              <Building2 className="w-5 h-5 mr-2" />
              Proveedores ({filteredProveedores.length})
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredProveedores.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Building2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No se encontraron proveedores</p>
              {hasPermission(user, 'proveedores.write') && (
                <p className="text-sm">Registra tu primer proveedor usando el botón "Nuevo Proveedor"</p>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredProveedores.map((proveedor) => {
                const evaluaciones = getProveedorEvaluaciones(proveedor.id);
                const promedio = getPromedioEvaluacion(proveedor.id);
                const productos = getProductosByProveedor(proveedor.id);
                
                return (
                  <div key={proveedor.id} className="border rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center space-x-3">
                          <h3 className="font-semibold text-lg">{proveedor.razon_social}</h3>
                          <Badge variant="outline" className="text-xs">
                            {proveedor.nit}
                          </Badge>
                          {proveedor.nombre_comercial && (
                            <Badge variant="secondary" className="text-xs">
                              {proveedor.nombre_comercial}
                            </Badge>
                          )}
                          {evaluaciones.length > 0 && (
                            <div className="flex items-center space-x-1">
                              {renderStars(promedio)}
                              <span className="text-sm text-gray-600">({evaluaciones.length})</span>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex items-center space-x-6 text-sm text-gray-600">
                          {proveedor.contacto_nombre && (
                            <span>👤 {proveedor.contacto_nombre}</span>
                          )}
                          {proveedor.contacto_telefono && (
                            <span className="flex items-center">
                              <Phone className="w-3 h-3 mr-1" />
                              {proveedor.contacto_telefono}
                            </span>
                          )}
                          {proveedor.contacto_email && (
                            <span className="flex items-center">
                              <Mail className="w-3 h-3 mr-1" />
                              {proveedor.contacto_email}
                            </span>
                          )}
                          {proveedor.ciudad && (
                            <span className="flex items-center">
                              <MapPin className="w-3 h-3 mr-1" />
                              {proveedor.ciudad}
                            </span>
                          )}
                        </div>
                        
                        <div className="flex items-center space-x-6 text-sm text-gray-600">
                          <span>Productos: <strong>{productos.length}</strong></span>
                          <span>Evaluaciones: <strong>{evaluaciones.length}</strong></span>
                          <span>Registrado: <strong>{new Date(proveedor.created_at).toLocaleDateString('es-CO')}</strong></span>
                        </div>
                      </div>
                      
                      <div className="flex space-x-2">
                        {hasPermission(user, 'proveedores.evaluate') && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEvaluate(proveedor)}
                          >
                            <Star className="w-4 h-4" />
                          </Button>
                        )}
                        {hasPermission(user, 'proveedores.write') && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(proveedor)}
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
                        {hasPermission(user, 'proveedores.delete') && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDelete(proveedor)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog de evaluación */}
      <Dialog open={showEvaluationDialog} onOpenChange={setShowEvaluationDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              Evaluar Proveedor - {selectedProveedor?.razon_social}
            </DialogTitle>
            <DialogDescription>
              Califica el desempeño del proveedor en diferentes aspectos
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Calidad de Productos (1-10)</Label>
              <Input
                type="number"
                min="1"
                max="10"
                value={evaluacionForm.calidad}
                onChange={(e) => setEvaluacionForm({...evaluacionForm, calidad: Number(e.target.value)})}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Competitividad de Precios (1-10)</Label>
              <Input
                type="number"
                min="1"
                max="10"
                value={evaluacionForm.precio}
                onChange={(e) => setEvaluacionForm({...evaluacionForm, precio: Number(e.target.value)})}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Cumplimiento de Entregas (1-10)</Label>
              <Input
                type="number"
                min="1"
                max="10"
                value={evaluacionForm.entrega}
                onChange={(e) => setEvaluacionForm({...evaluacionForm, entrega: Number(e.target.value)})}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Servicio al Cliente (1-10)</Label>
              <Input
                type="number"
                min="1"
                max="10"
                value={evaluacionForm.servicio}
                onChange={(e) => setEvaluacionForm({...evaluacionForm, servicio: Number(e.target.value)})}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Comentarios</Label>
              <Textarea
                value={evaluacionForm.comentarios}
                onChange={(e) => setEvaluacionForm({...evaluacionForm, comentarios: e.target.value})}
                rows={3}
                placeholder="Observaciones adicionales..."
              />
            </div>
            
            <div className="p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Promedio:</strong> {((evaluacionForm.calidad + evaluacionForm.precio + evaluacionForm.entrega + evaluacionForm.servicio) / 4).toFixed(1)}/10
              </p>
            </div>
          </div>
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={() => setShowEvaluationDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveEvaluation}>
              Guardar Evaluación
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}