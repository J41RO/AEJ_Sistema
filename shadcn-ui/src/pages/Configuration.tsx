import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { 
  Settings, 
  Building, 
  Calculator, 
  FileText,
  CheckCircle,
  AlertTriangle,
  Shield,
  Save,
  RefreshCw
} from 'lucide-react';
import { User, hasPermission, isSuperUser } from '@/lib/auth';
import { db, ConfiguracionEmpresa, ConfiguracionImpuestos, ConfiguracionFacturacion } from '@/lib/database';

interface ConfigurationProps {
  user: User;
}

export default function Configuration({ user }: ConfigurationProps) {
  const [configEmpresa, setConfigEmpresa] = useState<ConfiguracionEmpresa | null>(null);
  const [configImpuestos, setConfigImpuestos] = useState<ConfiguracionImpuestos | null>(null);
  const [configFacturacion, setConfigFacturacion] = useState<ConfiguracionFacturacion | null>(null);
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const [empresaForm, setEmpresaForm] = useState({
    razon_social: '',
    nit: '',
    direccion: '',
    ciudad: '',
    telefono: '',
    email: '',
    sitio_web: '',
    eslogan: '',
    regimen_tributario: '',
    actividad_economica: ''
  });

  const [impuestosForm, setImpuestosForm] = useState({
    iva_general: 19,
    iva_productos: 19,
    retencion_fuente: 3.5,
    retencion_iva: 15,
    retencion_ica: 1.0
  });

  const [facturacionForm, setFacturacionForm] = useState({
    prefijo_factura: '',
    numero_inicial: 1,
    resolucion_dian: '',
    fecha_resolucion: '',
    rango_inicial: 1,
    rango_final: 10000,
    fecha_vencimiento: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const empresa = db.getConfiguracionEmpresa();
    const impuestos = db.getConfiguracionImpuestos();
    const facturacion = db.getConfiguracionFacturacion();

    setConfigEmpresa(empresa);
    setConfigImpuestos(impuestos);
    setConfigFacturacion(facturacion);

    // Llenar formularios
    setEmpresaForm({
      razon_social: empresa.razon_social,
      nit: empresa.nit,
      direccion: empresa.direccion,
      ciudad: empresa.ciudad,
      telefono: empresa.telefono,
      email: empresa.email,
      sitio_web: empresa.sitio_web || '',
      eslogan: empresa.eslogan || '',
      regimen_tributario: empresa.regimen_tributario,
      actividad_economica: empresa.actividad_economica
    });

    setImpuestosForm({
      iva_general: impuestos.iva_general,
      iva_productos: impuestos.iva_productos,
      retencion_fuente: impuestos.retencion_fuente,
      retencion_iva: impuestos.retencion_iva,
      retencion_ica: impuestos.retencion_ica
    });

    setFacturacionForm({
      prefijo_factura: facturacion.prefijo_factura,
      numero_inicial: facturacion.numero_inicial,
      resolucion_dian: facturacion.resolucion_dian,
      fecha_resolucion: facturacion.fecha_resolucion.split('T')[0],
      rango_inicial: facturacion.rango_inicial,
      rango_final: facturacion.rango_final,
      fecha_vencimiento: facturacion.fecha_vencimiento.split('T')[0]
    });
  };

  const handleSaveEmpresa = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!hasPermission(user, 'configuracion.company')) {
      showAlert('error', 'No tienes permisos para editar la configuración de empresa');
      return;
    }

    setLoading(true);
    try {
      db.updateConfiguracionEmpresa(empresaForm, user.id);
      showAlert('success', 'Configuración de empresa actualizada exitosamente');
      loadData();
    } catch (error) {
      showAlert('error', 'Error al actualizar la configuración de empresa');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveImpuestos = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!hasPermission(user, 'configuracion.taxes')) {
      showAlert('error', 'No tienes permisos para editar la configuración de impuestos');
      return;
    }

    setLoading(true);
    try {
      db.updateConfiguracionImpuestos(impuestosForm, user.id);
      showAlert('success', 'Configuración de impuestos actualizada exitosamente');
      loadData();
    } catch (error) {
      showAlert('error', 'Error al actualizar la configuración de impuestos');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveFacturacion = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isSuperUser(user)) {
      showAlert('error', 'Solo el SUPERUSUARIO puede modificar la configuración de facturación');
      return;
    }

    setLoading(true);
    try {
      const dataToSave = {
        ...facturacionForm,
        fecha_resolucion: new Date(facturacionForm.fecha_resolucion).toISOString(),
        fecha_vencimiento: new Date(facturacionForm.fecha_vencimiento).toISOString()
      };
      
      db.updateConfiguracionFacturacion(dataToSave);
      showAlert('success', 'Configuración de facturación actualizada exitosamente');
      loadData();
    } catch (error) {
      showAlert('error', 'Error al actualizar la configuración de facturación');
    } finally {
      setLoading(false);
    }
  };

  const showAlert = (type: 'success' | 'error', message: string) => {
    setAlert({ type, message });
    setTimeout(() => setAlert(null), 5000);
  };

  if (!hasPermission(user, 'configuracion.read')) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <Shield className="w-16 h-16 mx-auto mb-4 text-red-500" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Acceso Restringido</h2>
          <p className="text-gray-600 mb-6">No tienes permisos para acceder a la configuración del sistema.</p>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 max-w-md mx-auto">
            <p className="text-sm text-red-800">
              <strong>Permisos requeridos:</strong> Configuración del sistema.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Configuración del Sistema</h1>
          <p className="text-gray-600">Administra la configuración general, impuestos y facturación</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={loadData} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Recargar
          </Button>
        </div>
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

      <Tabs defaultValue="empresa" className="space-y-4">
        <TabsList>
          <TabsTrigger value="empresa">Datos de Empresa</TabsTrigger>
          <TabsTrigger value="impuestos">Configuración Tributaria</TabsTrigger>
          <TabsTrigger value="facturacion">Facturación DIAN</TabsTrigger>
        </TabsList>

        <TabsContent value="empresa" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Building className="w-5 h-5 mr-2" />
                Información de la Empresa
              </CardTitle>
              <CardDescription>
                Configura los datos básicos de AEJ Cosmetic & More
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSaveEmpresa} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="razon_social">Razón Social *</Label>
                    <Input
                      id="razon_social"
                      value={empresaForm.razon_social}
                      onChange={(e) => setEmpresaForm({...empresaForm, razon_social: e.target.value})}
                      required
                      disabled={!hasPermission(user, 'configuracion.company')}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="nit">NIT *</Label>
                    <Input
                      id="nit"
                      value={empresaForm.nit}
                      onChange={(e) => setEmpresaForm({...empresaForm, nit: e.target.value})}
                      required
                      disabled={!hasPermission(user, 'configuracion.company')}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="direccion">Dirección *</Label>
                  <Input
                    id="direccion"
                    value={empresaForm.direccion}
                    onChange={(e) => setEmpresaForm({...empresaForm, direccion: e.target.value})}
                    required
                    disabled={!hasPermission(user, 'configuracion.company')}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="ciudad">Ciudad *</Label>
                    <Input
                      id="ciudad"
                      value={empresaForm.ciudad}
                      onChange={(e) => setEmpresaForm({...empresaForm, ciudad: e.target.value})}
                      required
                      disabled={!hasPermission(user, 'configuracion.company')}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="telefono">Teléfono *</Label>
                    <Input
                      id="telefono"
                      value={empresaForm.telefono}
                      onChange={(e) => setEmpresaForm({...empresaForm, telefono: e.target.value})}
                      required
                      disabled={!hasPermission(user, 'configuracion.company')}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Corporativo *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={empresaForm.email}
                      onChange={(e) => setEmpresaForm({...empresaForm, email: e.target.value})}
                      required
                      disabled={!hasPermission(user, 'configuracion.company')}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="sitio_web">Sitio Web</Label>
                    <Input
                      id="sitio_web"
                      type="url"
                      value={empresaForm.sitio_web}
                      onChange={(e) => setEmpresaForm({...empresaForm, sitio_web: e.target.value})}
                      disabled={!hasPermission(user, 'configuracion.company')}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="eslogan">Eslogan</Label>
                  <Input
                    id="eslogan"
                    value={empresaForm.eslogan}
                    onChange={(e) => setEmpresaForm({...empresaForm, eslogan: e.target.value})}
                    placeholder="Tu belleza, nuestra pasión"
                    disabled={!hasPermission(user, 'configuracion.company')}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="regimen_tributario">Régimen Tributario *</Label>
                  <Input
                    id="regimen_tributario"
                    value={empresaForm.regimen_tributario}
                    onChange={(e) => setEmpresaForm({...empresaForm, regimen_tributario: e.target.value})}
                    required
                    disabled={!hasPermission(user, 'configuracion.company')}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="actividad_economica">Actividad Económica *</Label>
                  <Textarea
                    id="actividad_economica"
                    value={empresaForm.actividad_economica}
                    onChange={(e) => setEmpresaForm({...empresaForm, actividad_economica: e.target.value})}
                    rows={2}
                    required
                    disabled={!hasPermission(user, 'configuracion.company')}
                  />
                </div>

                {hasPermission(user, 'configuracion.company') && (
                  <div className="flex justify-end pt-4">
                    <Button type="submit" disabled={loading}>
                      <Save className="w-4 h-4 mr-2" />
                      {loading ? 'Guardando...' : 'Guardar Cambios'}
                    </Button>
                  </div>
                )}
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="impuestos" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calculator className="w-5 h-5 mr-2" />
                Configuración Tributaria
              </CardTitle>
              <CardDescription>
                Configura los porcentajes de impuestos y retenciones
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSaveImpuestos} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="iva_general">IVA General (%)</Label>
                    <Input
                      id="iva_general"
                      type="number"
                      step="0.1"
                      min="0"
                      max="100"
                      value={impuestosForm.iva_general}
                      onChange={(e) => setImpuestosForm({...impuestosForm, iva_general: Number(e.target.value)})}
                      disabled={!hasPermission(user, 'configuracion.taxes')}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="iva_productos">IVA Productos (%)</Label>
                    <Input
                      id="iva_productos"
                      type="number"
                      step="0.1"
                      min="0"
                      max="100"
                      value={impuestosForm.iva_productos}
                      onChange={(e) => setImpuestosForm({...impuestosForm, iva_productos: Number(e.target.value)})}
                      disabled={!hasPermission(user, 'configuracion.taxes')}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="retencion_fuente">Retención en la Fuente (%)</Label>
                    <Input
                      id="retencion_fuente"
                      type="number"
                      step="0.1"
                      min="0"
                      max="100"
                      value={impuestosForm.retencion_fuente}
                      onChange={(e) => setImpuestosForm({...impuestosForm, retencion_fuente: Number(e.target.value)})}
                      disabled={!hasPermission(user, 'configuracion.taxes')}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="retencion_iva">Retención de IVA (%)</Label>
                    <Input
                      id="retencion_iva"
                      type="number"
                      step="0.1"
                      min="0"
                      max="100"
                      value={impuestosForm.retencion_iva}
                      onChange={(e) => setImpuestosForm({...impuestosForm, retencion_iva: Number(e.target.value)})}
                      disabled={!hasPermission(user, 'configuracion.taxes')}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="retencion_ica">Retención de ICA (%)</Label>
                    <Input
                      id="retencion_ica"
                      type="number"
                      step="0.1"
                      min="0"
                      max="100"
                      value={impuestosForm.retencion_ica}
                      onChange={(e) => setImpuestosForm({...impuestosForm, retencion_ica: Number(e.target.value)})}
                      disabled={!hasPermission(user, 'configuracion.taxes')}
                    />
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-900 mb-2">Información Importante</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Los cambios en IVA afectarán nuevos productos y ventas</li>
                    <li>• Las retenciones se aplicarán según la normatividad vigente</li>
                    <li>• Consulta con tu contador antes de modificar estos valores</li>
                  </ul>
                </div>

                {hasPermission(user, 'configuracion.taxes') && (
                  <div className="flex justify-end pt-4">
                    <Button type="submit" disabled={loading}>
                      <Save className="w-4 h-4 mr-2" />
                      {loading ? 'Guardando...' : 'Guardar Configuración'}
                    </Button>
                  </div>
                )}
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="facturacion" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="w-5 h-5 mr-2" />
                Configuración de Facturación DIAN
              </CardTitle>
              <CardDescription>
                Configura los parámetros para facturación electrónica (Solo SUPERUSUARIO)
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!isSuperUser(user) ? (
                <div className="text-center py-8">
                  <Shield className="w-12 h-12 mx-auto mb-4 text-orange-500" />
                  <p className="text-gray-600 mb-4">Solo el SUPERUSUARIO puede modificar la configuración de facturación.</p>
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 max-w-md mx-auto">
                    <p className="text-sm text-orange-800">
                      <strong>Configuración actual:</strong> Solo lectura para tu rol.
                    </p>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSaveFacturacion} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="prefijo_factura">Prefijo de Factura *</Label>
                      <Input
                        id="prefijo_factura"
                        value={facturacionForm.prefijo_factura}
                        onChange={(e) => setFacturacionForm({...facturacionForm, prefijo_factura: e.target.value})}
                        placeholder="AEJ-"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="numero_inicial">Número Inicial *</Label>
                      <Input
                        id="numero_inicial"
                        type="number"
                        min="1"
                        value={facturacionForm.numero_inicial}
                        onChange={(e) => setFacturacionForm({...facturacionForm, numero_inicial: Number(e.target.value)})}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="resolucion_dian">Resolución DIAN *</Label>
                    <Input
                      id="resolucion_dian"
                      value={facturacionForm.resolucion_dian}
                      onChange={(e) => setFacturacionForm({...facturacionForm, resolucion_dian: e.target.value})}
                      placeholder="Resolución 000123 de 2024"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="fecha_resolucion">Fecha de Resolución *</Label>
                    <Input
                      id="fecha_resolucion"
                      type="date"
                      value={facturacionForm.fecha_resolucion}
                      onChange={(e) => setFacturacionForm({...facturacionForm, fecha_resolucion: e.target.value})}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="rango_inicial">Rango Inicial *</Label>
                      <Input
                        id="rango_inicial"
                        type="number"
                        min="1"
                        value={facturacionForm.rango_inicial}
                        onChange={(e) => setFacturacionForm({...facturacionForm, rango_inicial: Number(e.target.value)})}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="rango_final">Rango Final *</Label>
                      <Input
                        id="rango_final"
                        type="number"
                        min="1"
                        value={facturacionForm.rango_final}
                        onChange={(e) => setFacturacionForm({...facturacionForm, rango_final: Number(e.target.value)})}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="fecha_vencimiento">Fecha de Vencimiento *</Label>
                    <Input
                      id="fecha_vencimiento"
                      type="date"
                      value={facturacionForm.fecha_vencimiento}
                      onChange={(e) => setFacturacionForm({...facturacionForm, fecha_vencimiento: e.target.value})}
                      required
                    />
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h4 className="font-semibold text-yellow-900 mb-2">⚠️ Advertencia Importante</h4>
                    <ul className="text-sm text-yellow-800 space-y-1">
                      <li>• Estos datos deben coincidir exactamente con la resolución DIAN</li>
                      <li>• Modificar incorrectamente puede invalidar las facturas</li>
                      <li>• Consulta con tu asesor tributario antes de cambiar</li>
                      <li>• El número actual se actualiza automáticamente con cada factura</li>
                    </ul>
                  </div>

                  <div className="flex justify-end pt-4">
                    <Button type="submit" disabled={loading}>
                      <Save className="w-4 h-4 mr-2" />
                      {loading ? 'Guardando...' : 'Guardar Configuración DIAN'}
                    </Button>
                  </div>
                </form>
              )}

              {/* Información actual */}
              <div className="mt-6 pt-6 border-t">
                <h4 className="font-semibold mb-4">Configuración Actual</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p><strong>Prefijo:</strong> {configFacturacion?.prefijo_factura}</p>
                    <p><strong>Número Actual:</strong> {configFacturacion?.numero_actual}</p>
                    <p><strong>Resolución:</strong> {configFacturacion?.resolucion_dian}</p>
                  </div>
                  <div>
                    <p><strong>Rango:</strong> {configFacturacion?.rango_inicial} - {configFacturacion?.rango_final}</p>
                    <p><strong>Vence:</strong> {configFacturacion?.fecha_vencimiento ? new Date(configFacturacion.fecha_vencimiento).toLocaleDateString('es-CO') : 'N/A'}</p>
                    <p><strong>Última actualización:</strong> {configFacturacion?.updated_at ? new Date(configFacturacion.updated_at).toLocaleDateString('es-CO') : 'N/A'}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}