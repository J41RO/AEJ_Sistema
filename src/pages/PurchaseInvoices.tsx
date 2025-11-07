import { useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { 
  Upload, 
  FileText, 
  Trash2, 
  Eye, 
  Download, 
  Plus, 
  X,
  Save,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { 
  invoiceAPI, 
  suppliersAPI,
  InvoiceDataExtraction, 
  PurchaseInvoice,
  PurchaseInvoiceItem 
} from '@/lib/api';

interface PurchaseInvoicesProps {
  user: any;
}

export default function PurchaseInvoices({ user }: PurchaseInvoicesProps) {
  const [activeTab, setActiveTab] = useState<'new' | 'history'>('history');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [invoices, setInvoices] = useState<PurchaseInvoice[]>([]);
  const [selectedInvoice, setSelectedInvoice] = useState<PurchaseInvoice | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  
  // Form state
  const [formData, setFormData] = useState<InvoiceDataExtraction>({
    proveedor: {
      nit: '',
      razon_social: '',
      email: '',
      telefono: '',
      direccion: '',
      ciudad: '',
    },
    factura: {
      numero: '',
      fecha: new Date().toISOString().split('T')[0],
      cufe: '',
      fecha_aceptacion: '',
      firma_digital: '',
    },
    productos: [],
    totales: {
      subtotal: 0,
      iva: 0,
      total: 0,
    },
  });

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'application/pdf': ['.pdf'],
    },
    maxFiles: 1,
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        setUploadedFile(acceptedFiles[0]);
        toast.success('Archivo cargado correctamente');
      }
    },
  });

  useEffect(() => {
    loadInvoices();
    loadSuppliers();
  }, []);

  useEffect(() => {
    calculateTotals();
  }, [formData.productos]);

  const loadInvoices = async () => {
    try {
      const data = await invoiceAPI.list();
      setInvoices(data);
    } catch (error: any) {
      toast.error('Error al cargar facturas: ' + (error.response?.data?.detail || error.message));
    }
  };

  const loadSuppliers = async () => {
    try {
      const data = await suppliersAPI.list();
      setSuppliers(data);
    } catch (error: any) {
      toast.error('Error al cargar proveedores: ' + (error.response?.data?.detail || error.message));
    }
  };

  const handleExtractData = async () => {
    if (!uploadedFile) {
      toast.error('Por favor selecciona un archivo PDF');
      return;
    }

    setIsUploading(true);
    try {
      const result = await invoiceAPI.upload(uploadedFile);
      toast.info('PDF cargado. Por favor ingresa los datos manualmente.');
      // For now, we just notify the user to enter data manually
      // In production, you would parse the PDF and populate the form
    } catch (error: any) {
      toast.error('Error al cargar PDF: ' + (error.response?.data?.detail || error.message));
    } finally {
      setIsUploading(false);
    }
  };

  const handleSupplierNitChange = (nit: string) => {
    setFormData({
      ...formData,
      proveedor: { ...formData.proveedor, nit },
    });

    // Auto-complete if supplier exists
    const existingSupplier = suppliers.find(s => s.nit === nit);
    if (existingSupplier) {
      setFormData({
        ...formData,
        proveedor: {
          nit: existingSupplier.nit,
          razon_social: existingSupplier.razon_social,
          email: existingSupplier.email || '',
          telefono: existingSupplier.telefono || '',
          direccion: existingSupplier.direccion || '',
          ciudad: existingSupplier.ciudad || '',
        },
      });
      toast.success('Proveedor encontrado');
    }
  };

  const addProduct = () => {
    setFormData({
      ...formData,
      productos: [
        ...formData.productos,
        {
          referencia: '',
          nombre: '',
          cantidad: 1,
          precio_unitario: 0,
          total: 0,
        },
      ],
    });
  };

  const removeProduct = (index: number) => {
    const newProducts = formData.productos.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      productos: newProducts,
    });
  };

  const updateProduct = (index: number, field: string, value: any) => {
    const newProducts = [...formData.productos];
    newProducts[index] = {
      ...newProducts[index],
      [field]: value,
    };

    // Calculate total for this product
    if (field === 'cantidad' || field === 'precio_unitario') {
      newProducts[index].total = newProducts[index].cantidad * newProducts[index].precio_unitario;
    }

    setFormData({
      ...formData,
      productos: newProducts,
    });
  };

  const calculateTotals = () => {
    const subtotal = formData.productos.reduce((sum, p) => sum + p.total, 0);
    const iva = subtotal * 0.19; // 19% IVA
    const total = subtotal + iva;

    setFormData({
      ...formData,
      totales: {
        subtotal,
        iva,
        total,
      },
    });
  };

  const handleProcessInvoice = async () => {
    // Validation
    if (!formData.proveedor.nit || !formData.proveedor.razon_social) {
      toast.error('Por favor completa los datos del proveedor');
      return;
    }

    if (!formData.factura.numero || !formData.factura.fecha) {
      toast.error('Por favor completa los datos de la factura');
      return;
    }

    if (formData.productos.length === 0) {
      toast.error('Por favor agrega al menos un producto');
      return;
    }

    // Check all products have required fields
    const invalidProduct = formData.productos.find(
      p => !p.referencia || !p.nombre || p.cantidad <= 0 || p.precio_unitario <= 0
    );
    if (invalidProduct) {
      toast.error('Por favor completa todos los campos de los productos');
      return;
    }

    setIsProcessing(true);
    try {
      await invoiceAPI.process(formData, uploadedFile || undefined);
      toast.success('Factura procesada correctamente');
      
      // Reset form
      resetForm();
      
      // Reload invoices
      await loadInvoices();
      
      // Switch to history tab
      setActiveTab('history');
    } catch (error: any) {
      toast.error('Error al procesar factura: ' + (error.response?.data?.detail || error.message));
    } finally {
      setIsProcessing(false);
    }
  };

  const resetForm = () => {
    setFormData({
      proveedor: {
        nit: '',
        razon_social: '',
        email: '',
        telefono: '',
        direccion: '',
        ciudad: '',
      },
      factura: {
        numero: '',
        fecha: new Date().toISOString().split('T')[0],
        cufe: '',
        fecha_aceptacion: '',
        firma_digital: '',
      },
      productos: [],
      totales: {
        subtotal: 0,
        iva: 0,
        total: 0,
      },
    });
    setUploadedFile(null);
  };

  const handleViewInvoice = async (invoice: PurchaseInvoice) => {
    try {
      const fullInvoice = await invoiceAPI.get(invoice.id);
      setSelectedInvoice(fullInvoice);
      setShowDetailModal(true);
    } catch (error: any) {
      toast.error('Error al cargar factura: ' + (error.response?.data?.detail || error.message));
    }
  };

  const handleDeleteInvoice = async (id: number) => {
    if (!confirm('¿Estás seguro de eliminar esta factura?')) {
      return;
    }

    try {
      await invoiceAPI.delete(id);
      toast.success('Factura eliminada correctamente');
      await loadInvoices();
    } catch (error: any) {
      toast.error('Error al eliminar factura: ' + (error.response?.data?.detail || error.message));
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: any = {
      PROCESADA: 'default',
      PENDIENTE: 'secondary',
      CANCELADA: 'destructive',
    };

    return (
      <Badge variant={variants[status] || 'default'}>
        {status}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Facturas de Compra</h1>
        <div className="flex gap-2">
          <Button
            variant={activeTab === 'history' ? 'default' : 'outline'}
            onClick={() => setActiveTab('history')}
          >
            <FileText className="mr-2 h-4 w-4" />
            Historial
          </Button>
          <Button
            variant={activeTab === 'new' ? 'default' : 'outline'}
            onClick={() => setActiveTab('new')}
          >
            <Plus className="mr-2 h-4 w-4" />
            Nueva Factura
          </Button>
        </div>
      </div>

      {activeTab === 'new' && (
        <div className="space-y-6">
          {/* Upload Section */}
          <Card>
            <CardHeader>
              <CardTitle>1. Cargar Factura PDF</CardTitle>
              <CardDescription>
                Arrastra y suelta el archivo PDF o haz clic para seleccionar
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                  isDragActive ? 'border-primary bg-primary/5' : 'border-gray-300 hover:border-primary'
                }`}
              >
                <input {...getInputProps()} />
                <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                {uploadedFile ? (
                  <div>
                    <p className="text-sm font-medium">{uploadedFile.name}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {(uploadedFile.size / 1024).toFixed(2)} KB
                    </p>
                  </div>
                ) : (
                  <p className="text-sm text-gray-600">
                    {isDragActive
                      ? 'Suelta el archivo aquí'
                      : 'Arrastra un archivo PDF o haz clic para seleccionar'}
                  </p>
                )}
              </div>
              {uploadedFile && (
                <div className="mt-4 flex gap-2">
                  <Button onClick={handleExtractData} disabled={isUploading}>
                    {isUploading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Cargando...
                      </>
                    ) : (
                      <>
                        <FileText className="mr-2 h-4 w-4" />
                        Cargar PDF
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setUploadedFile(null)}
                  >
                    <X className="mr-2 h-4 w-4" />
                    Remover
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Form Section */}
          <Card>
            <CardHeader>
              <CardTitle>2. Datos de la Factura</CardTitle>
              <CardDescription>
                Revisa y completa la información extraída
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Supplier Info */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Datos del Proveedor</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="nit">NIT *</Label>
                    <Input
                      id="nit"
                      value={formData.proveedor.nit}
                      onChange={(e) => handleSupplierNitChange(e.target.value)}
                      placeholder="900.479.120-7"
                    />
                  </div>
                  <div>
                    <Label htmlFor="razon_social">Razón Social *</Label>
                    <Input
                      id="razon_social"
                      value={formData.proveedor.razon_social}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          proveedor: { ...formData.proveedor, razon_social: e.target.value },
                        })
                      }
                      placeholder="DISTRIBUIDORA EL HUECO S.A.S"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.proveedor.email}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          proveedor: { ...formData.proveedor, email: e.target.value },
                        })
                      }
                      placeholder="contacto@proveedor.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="telefono">Teléfono</Label>
                    <Input
                      id="telefono"
                      value={formData.proveedor.telefono}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          proveedor: { ...formData.proveedor, telefono: e.target.value },
                        })
                      }
                      placeholder="3154795581"
                    />
                  </div>
                  <div>
                    <Label htmlFor="direccion">Dirección</Label>
                    <Input
                      id="direccion"
                      value={formData.proveedor.direccion}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          proveedor: { ...formData.proveedor, direccion: e.target.value },
                        })
                      }
                      placeholder="Calle 123 #45-67"
                    />
                  </div>
                  <div>
                    <Label htmlFor="ciudad">Ciudad</Label>
                    <Input
                      id="ciudad"
                      value={formData.proveedor.ciudad}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          proveedor: { ...formData.proveedor, ciudad: e.target.value },
                        })
                      }
                      placeholder="BUCARAMANGA"
                    />
                  </div>
                </div>
              </div>

              {/* Invoice Info */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Datos de la Factura</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="numero_factura">Número de Factura *</Label>
                    <Input
                      id="numero_factura"
                      value={formData.factura.numero}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          factura: { ...formData.factura, numero: e.target.value },
                        })
                      }
                      placeholder="F5C612276"
                    />
                  </div>
                  <div>
                    <Label htmlFor="fecha_emision">Fecha de Emisión *</Label>
                    <Input
                      id="fecha_emision"
                      type="date"
                      value={formData.factura.fecha}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          factura: { ...formData.factura, fecha: e.target.value },
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="cufe">CUFE</Label>
                    <Input
                      id="cufe"
                      value={formData.factura.cufe}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          factura: { ...formData.factura, cufe: e.target.value },
                        })
                      }
                      placeholder="b58736aef9ead8b517c5d606936b38e6..."
                    />
                  </div>
                  <div>
                    <Label htmlFor="fecha_aceptacion">Fecha de Aceptación</Label>
                    <Input
                      id="fecha_aceptacion"
                      type="datetime-local"
                      value={formData.factura.fecha_aceptacion}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          factura: { ...formData.factura, fecha_aceptacion: e.target.value },
                        })
                      }
                    />
                  </div>
                  <div className="col-span-2">
                    <Label htmlFor="firma_digital">Firma Digital</Label>
                    <Textarea
                      id="firma_digital"
                      value={formData.factura.firma_digital}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          factura: { ...formData.factura, firma_digital: e.target.value },
                        })
                      }
                      placeholder="fVXmF0gRFxTfqCl789tPwYjJ0GxM0CeV..."
                      rows={3}
                    />
                  </div>
                </div>
              </div>

              {/* Products Table */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Productos</h3>
                  <Button onClick={addProduct} size="sm">
                    <Plus className="mr-2 h-4 w-4" />
                    Agregar Producto
                  </Button>
                </div>
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Referencia</TableHead>
                        <TableHead>Nombre</TableHead>
                        <TableHead className="w-24">Cantidad</TableHead>
                        <TableHead className="w-32">Precio Unit.</TableHead>
                        <TableHead className="w-32">Subtotal</TableHead>
                        <TableHead className="w-16"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {formData.productos.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center text-gray-500">
                            No hay productos. Haz clic en "Agregar Producto" para comenzar.
                          </TableCell>
                        </TableRow>
                      ) : (
                        formData.productos.map((product, index) => (
                          <TableRow key={index}>
                            <TableCell>
                              <Input
                                value={product.referencia}
                                onChange={(e) => updateProduct(index, 'referencia', e.target.value)}
                                placeholder="30K"
                                className="w-full"
                              />
                            </TableCell>
                            <TableCell>
                              <Input
                                value={product.nombre}
                                onChange={(e) => updateProduct(index, 'nombre', e.target.value)}
                                placeholder="BOLSA DE EMPAQUE 30K PCR"
                                className="w-full"
                              />
                            </TableCell>
                            <TableCell>
                              <Input
                                type="number"
                                min="1"
                                value={product.cantidad}
                                onChange={(e) =>
                                  updateProduct(index, 'cantidad', parseInt(e.target.value) || 0)
                                }
                                className="w-full"
                              />
                            </TableCell>
                            <TableCell>
                              <Input
                                type="number"
                                min="0"
                                step="0.01"
                                value={product.precio_unitario}
                                onChange={(e) =>
                                  updateProduct(index, 'precio_unitario', parseFloat(e.target.value) || 0)
                                }
                                className="w-full"
                              />
                            </TableCell>
                            <TableCell className="font-medium">
                              ${product.total.toLocaleString('es-CO')}
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeProduct(index)}
                              >
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>

              {/* Totals */}
              <div className="border-t pt-4">
                <div className="flex justify-end">
                  <div className="w-64 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Subtotal:</span>
                      <span className="font-medium">
                        ${formData.totales.subtotal.toLocaleString('es-CO')}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">IVA (19%):</span>
                      <span className="font-medium">
                        ${formData.totales.iva.toLocaleString('es-CO')}
                      </span>
                    </div>
                    <div className="flex justify-between text-lg font-bold border-t pt-2">
                      <span>Total:</span>
                      <span>${formData.totales.total.toLocaleString('es-CO')}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={resetForm}>
                  <X className="mr-2 h-4 w-4" />
                  Cancelar
                </Button>
                <Button onClick={handleProcessInvoice} disabled={isProcessing}>
                  {isProcessing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Procesando...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Procesar Factura
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'history' && (
        <Card>
          <CardHeader>
            <CardTitle>Historial de Facturas</CardTitle>
            <CardDescription>
              Facturas de compra procesadas en el sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Número</TableHead>
                  <TableHead>Proveedor</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-gray-500 py-8">
                      No hay facturas registradas
                    </TableCell>
                  </TableRow>
                ) : (
                  invoices.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell className="font-medium">{invoice.numero_factura}</TableCell>
                      <TableCell>{invoice.supplier?.razon_social || 'N/A'}</TableCell>
                      <TableCell>
                        {new Date(invoice.fecha_emision).toLocaleDateString('es-CO')}
                      </TableCell>
                      <TableCell>${invoice.total.toLocaleString('es-CO')}</TableCell>
                      <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewInvoice(invoice)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {invoice.archivo_pdf && (
                            <Button variant="ghost" size="sm">
                              <Download className="h-4 w-4" />
                            </Button>
                          )}
                          {(user.rol === 'ADMIN' || user.rol === 'SUPERUSUARIO') && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteInvoice(invoice.id)}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Detail Modal */}
      <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalle de Factura</DialogTitle>
            <DialogDescription>
              Información completa de la factura de compra
            </DialogDescription>
          </DialogHeader>
          {selectedInvoice && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-600">Número de Factura</Label>
                  <p className="font-medium">{selectedInvoice.numero_factura}</p>
                </div>
                <div>
                  <Label className="text-gray-600">Estado</Label>
                  <div className="mt-1">{getStatusBadge(selectedInvoice.status)}</div>
                </div>
                <div>
                  <Label className="text-gray-600">Proveedor</Label>
                  <p className="font-medium">{selectedInvoice.supplier?.razon_social}</p>
                  <p className="text-sm text-gray-500">NIT: {selectedInvoice.supplier?.nit}</p>
                </div>
                <div>
                  <Label className="text-gray-600">Fecha de Emisión</Label>
                  <p className="font-medium">
                    {new Date(selectedInvoice.fecha_emision).toLocaleDateString('es-CO')}
                  </p>
                </div>
              </div>

              <div>
                <Label className="text-gray-600">Productos</Label>
                <Table className="mt-2">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Producto</TableHead>
                      <TableHead>Cantidad</TableHead>
                      <TableHead>Precio Unit.</TableHead>
                      <TableHead>Subtotal</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedInvoice.items?.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{item.product?.nombre}</p>
                            <p className="text-sm text-gray-500">Ref: {item.product?.codigo}</p>
                          </div>
                        </TableCell>
                        <TableCell>{item.cantidad}</TableCell>
                        <TableCell>${item.precio_unitario.toLocaleString('es-CO')}</TableCell>
                        <TableCell>${item.subtotal.toLocaleString('es-CO')}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-end">
                  <div className="w-64 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Subtotal:</span>
                      <span className="font-medium">
                        ${selectedInvoice.subtotal.toLocaleString('es-CO')}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">IVA:</span>
                      <span className="font-medium">
                        ${selectedInvoice.iva.toLocaleString('es-CO')}
                      </span>
                    </div>
                    <div className="flex justify-between text-lg font-bold border-t pt-2">
                      <span>Total:</span>
                      <span>${selectedInvoice.total.toLocaleString('es-CO')}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}