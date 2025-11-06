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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Users as UsersIcon, 
  Shield,
  CheckCircle,
  AlertTriangle,
  Eye,
  RotateCcw,
  Settings,
  UserCheck,
  UserX
} from 'lucide-react';
import { User, getUsers, createUser, updateUser, deleteUser, restoreUser, isSuperUser } from '@/lib/auth';
import { ALL_PERMISSIONS, DEFAULT_PERMISSIONS_BY_ROLE, getPermissionsByModule } from '@/lib/permissions';

interface UsersProps {
  user: User;
}

export default function Users({ user }: UsersProps) {
  const [usuarios, setUsuarios] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredUsuarios, setFilteredUsuarios] = useState<User[]>([]);
  const [showDialog, setShowDialog] = useState(false);
  const [showPermissionsDialog, setShowPermissionsDialog] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [selectedUserForPermissions, setSelectedUserForPermissions] = useState<User | null>(null);
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [showDeleted, setShowDeleted] = useState(false);
  
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    nombre_completo: '',
    email: '',
    rol: 'VENDEDOR' as 'SUPERUSUARIO' | 'ADMIN' | 'VENDEDOR' | 'ALMACEN' | 'CONTADOR',
    ubicacion: 'COLOMBIA' as 'EEUU' | 'COLOMBIA',
    activo: true
  });

  const [userPermissions, setUserPermissions] = useState<string[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [usuarios, searchQuery, showDeleted]);

  const loadData = () => {
    setUsuarios(getUsers());
  };

  const filterUsers = () => {
    let filtered = showDeleted 
      ? usuarios.filter(u => u.deleted_at)
      : usuarios.filter(u => !u.deleted_at);
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(u => 
        u.nombre_completo.toLowerCase().includes(query) ||
        u.username.toLowerCase().includes(query) ||
        u.email.toLowerCase().includes(query) ||
        u.rol.toLowerCase().includes(query)
      );
    }
    
    setFilteredUsuarios(filtered);
  };

  const resetForm = () => {
    setFormData({
      username: '',
      password: '',
      nombre_completo: '',
      email: '',
      rol: 'VENDEDOR',
      ubicacion: 'COLOMBIA',
      activo: true
    });
    setEditingUser(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isSuperUser(user)) {
      showAlert('error', 'Solo el SUPERUSUARIO puede gestionar usuarios');
      return;
    }

    // Validar usuario único
    const existingUser = usuarios.find(u => 
      u.username === formData.username && 
      (!editingUser || u.id !== editingUser.id) &&
      !u.deleted_at
    );
    
    if (existingUser) {
      showAlert('error', 'Ya existe un usuario con este nombre de usuario');
      return;
    }

    try {
      const userData = {
        ...formData,
        permissions: DEFAULT_PERMISSIONS_BY_ROLE[formData.rol] || []
      };

      if (editingUser) {
        updateUser(editingUser.id, userData);
        showAlert('success', 'Usuario actualizado exitosamente');
      } else {
        createUser(userData);
        showAlert('success', 'Usuario creado exitosamente');
      }
      
      loadData();
      setShowDialog(false);
      resetForm();
    } catch (error) {
      showAlert('error', 'Error al guardar el usuario');
    }
  };

  const handleEdit = (usuario: User) => {
    setEditingUser(usuario);
    setFormData({
      username: usuario.username,
      password: '', // No mostrar password por seguridad
      nombre_completo: usuario.nombre_completo,
      email: usuario.email,
      rol: usuario.rol,
      ubicacion: usuario.ubicacion,
      activo: usuario.activo
    });
    setShowDialog(true);
  };

  const handleDelete = (usuario: User) => {
    if (!isSuperUser(user)) {
      showAlert('error', 'Solo el SUPERUSUARIO puede eliminar usuarios');
      return;
    }

    if (usuario.id === user.id) {
      showAlert('error', 'No puedes eliminar tu propio usuario');
      return;
    }

    if (confirm(`¿Estás seguro de eliminar al usuario ${usuario.nombre_completo}?`)) {
      deleteUser(usuario.id);
      showAlert('success', 'Usuario eliminado exitosamente');
      loadData();
    }
  };

  const handleRestore = (usuario: User) => {
    if (!isSuperUser(user)) {
      showAlert('error', 'Solo el SUPERUSUARIO puede restaurar usuarios');
      return;
    }

    restoreUser(usuario.id);
    showAlert('success', 'Usuario restaurado exitosamente');
    loadData();
  };

  const handleManagePermissions = (usuario: User) => {
    setSelectedUserForPermissions(usuario);
    setUserPermissions([...usuario.permissions]);
    setShowPermissionsDialog(true);
  };

  const handlePermissionChange = (permission: string, checked: boolean) => {
    if (checked) {
      setUserPermissions([...userPermissions, permission]);
    } else {
      setUserPermissions(userPermissions.filter(p => p !== permission));
    }
  };

  const handleSavePermissions = () => {
    if (!selectedUserForPermissions) return;
    
    updateUser(selectedUserForPermissions.id, { permissions: userPermissions });
    showAlert('success', 'Permisos actualizados exitosamente');
    loadData();
    setShowPermissionsDialog(false);
  };

  const showAlert = (type: 'success' | 'error', message: string) => {
    setAlert({ type, message });
    setTimeout(() => setAlert(null), 5000);
  };

  const getRoleBadgeColor = (rol: string) => {
    const colors = {
      SUPERUSUARIO: 'bg-purple-100 text-purple-800 border-purple-200',
      ADMIN: 'bg-red-100 text-red-800 border-red-200',
      VENDEDOR: 'bg-green-100 text-green-800 border-green-200',
      ALMACEN: 'bg-blue-100 text-blue-800 border-blue-200',
      CONTADOR: 'bg-orange-100 text-orange-800 border-orange-200'
    };
    return colors[rol as keyof typeof colors] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getUbicacionFlag = (ubicacion: string) => {
    return ubicacion === 'EEUU' ? '🇺🇸' : '🇨🇴';
  };

  const permissionsByModule = getPermissionsByModule(ALL_PERMISSIONS.map(p => `${p.module}.${p.action}`));

  if (!isSuperUser(user)) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <Shield className="w-16 h-16 mx-auto mb-4 text-red-500" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Acceso Restringido</h2>
          <p className="text-gray-600 mb-6">Solo el SUPERUSUARIO puede acceder a la gestión de usuarios.</p>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 max-w-md mx-auto">
            <p className="text-sm text-red-800">
              <strong>Permisos requeridos:</strong> Rol SUPERUSUARIO con permisos de gestión de usuarios.
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
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Usuarios</h1>
          <p className="text-gray-600">Administra usuarios del sistema y sus permisos</p>
        </div>
        <div className="flex space-x-2">
          <Dialog open={showDialog} onOpenChange={setShowDialog}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="w-4 h-4 mr-2" />
                Nuevo Usuario
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}
                </DialogTitle>
                <DialogDescription>
                  {editingUser ? 'Modifica los datos del usuario' : 'Crea un nuevo usuario del sistema'}
                </DialogDescription>
              </DialogHeader>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="username">Nombre de Usuario *</Label>
                    <Input
                      id="username"
                      value={formData.username}
                      onChange={(e) => setFormData({...formData, username: e.target.value})}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="password">
                      {editingUser ? 'Nueva Contraseña (opcional)' : 'Contraseña *'}
                    </Label>
                    <Input
                      id="password"
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({...formData, password: e.target.value})}
                      required={!editingUser}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="nombre_completo">Nombre Completo *</Label>
                  <Input
                    id="nombre_completo"
                    value={formData.nombre_completo}
                    onChange={(e) => setFormData({...formData, nombre_completo: e.target.value})}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Correo Electrónico *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="rol">Rol *</Label>
                    <Select 
                      value={formData.rol} 
                      onValueChange={(value: 'SUPERUSUARIO' | 'ADMIN' | 'VENDEDOR' | 'ALMACEN' | 'CONTADOR') => setFormData({...formData, rol: value})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="SUPERUSUARIO">SUPERUSUARIO</SelectItem>
                        <SelectItem value="ADMIN">ADMIN</SelectItem>
                        <SelectItem value="VENDEDOR">VENDEDOR</SelectItem>
                        <SelectItem value="ALMACEN">ALMACÉN</SelectItem>
                        <SelectItem value="CONTADOR">CONTADOR</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="ubicacion">Ubicación *</Label>
                    <Select 
                      value={formData.ubicacion} 
                      onValueChange={(value: 'EEUU' | 'COLOMBIA') => setFormData({...formData, ubicacion: value})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="COLOMBIA">🇨🇴 Colombia</SelectItem>
                        <SelectItem value="EEUU">🇺🇸 Estados Unidos</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="activo"
                    checked={formData.activo}
                    onCheckedChange={(checked) => setFormData({...formData, activo: !!checked})}
                  />
                  <Label htmlFor="activo">Usuario activo</Label>
                </div>

                <div className="flex justify-end space-x-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setShowDialog(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit">
                    {editingUser ? 'Actualizar' : 'Crear'} Usuario
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
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

      <Tabs defaultValue="active" className="space-y-4">
        <TabsList>
          <TabsTrigger value="active" onClick={() => setShowDeleted(false)}>
            Usuarios Activos ({usuarios.filter(u => !u.deleted_at).length})
          </TabsTrigger>
          <TabsTrigger value="deleted" onClick={() => setShowDeleted(true)}>
            Papelera ({usuarios.filter(u => u.deleted_at).length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          {/* Búsqueda */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Search className="w-5 h-5 mr-2" />
                Buscar Usuarios
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Input
                placeholder="Buscar por nombre, usuario, email o rol..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </CardContent>
          </Card>

          {/* Lista de usuarios */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center">
                  <UsersIcon className="w-5 h-5 mr-2" />
                  Usuarios Activos ({filteredUsuarios.length})
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredUsuarios.map((usuario) => (
                  <div key={usuario.id} className="border rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center space-x-3">
                          <h3 className="font-semibold text-lg">{usuario.nombre_completo}</h3>
                          <Badge variant="outline" className="text-xs">
                            @{usuario.username}
                          </Badge>
                          <Badge className={`text-xs ${getRoleBadgeColor(usuario.rol)}`}>
                            {usuario.rol}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {getUbicacionFlag(usuario.ubicacion)} {usuario.ubicacion}
                          </Badge>
                          {!usuario.activo && (
                            <Badge variant="secondary" className="text-xs">
                              <UserX className="w-3 h-3 mr-1" />
                              Inactivo
                            </Badge>
                          )}
                          {usuario.activo && (
                            <Badge variant="default" className="text-xs bg-green-100 text-green-800">
                              <UserCheck className="w-3 h-3 mr-1" />
                              Activo
                            </Badge>
                          )}
                        </div>
                        
                        <div className="flex items-center space-x-6 text-sm text-gray-600">
                          <span>📧 {usuario.email}</span>
                          <span>Permisos: <strong>{usuario.permissions.length}</strong></span>
                          {usuario.last_login && (
                            <span>Último acceso: <strong>{new Date(usuario.last_login).toLocaleDateString('es-CO')}</strong></span>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleManagePermissions(usuario)}
                        >
                          <Settings className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(usuario)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        {usuario.id !== user.id && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDelete(usuario)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="deleted" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Trash2 className="w-5 h-5 mr-2" />
                Usuarios Eliminados
              </CardTitle>
              <CardDescription>
                Usuarios que han sido eliminados del sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              {filteredUsuarios.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Trash2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No hay usuarios eliminados</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredUsuarios.map((usuario) => (
                    <div key={usuario.id} className="border rounded-lg p-4 bg-red-50 border-red-200">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center space-x-3">
                            <h3 className="font-semibold text-lg text-gray-700">{usuario.nombre_completo}</h3>
                            <Badge variant="outline" className="text-xs">
                              @{usuario.username}
                            </Badge>
                            <Badge className={`text-xs ${getRoleBadgeColor(usuario.rol)}`}>
                              {usuario.rol}
                            </Badge>
                            <Badge variant="secondary" className="text-xs bg-red-100 text-red-800">
                              Eliminado
                            </Badge>
                          </div>
                          
                          <div className="flex items-center space-x-6 text-sm text-gray-600">
                            <span>📧 {usuario.email}</span>
                            {usuario.deleted_at && (
                              <span>Eliminado: <strong>{new Date(usuario.deleted_at).toLocaleDateString('es-CO')}</strong></span>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleRestore(usuario)}
                            className="text-green-600 hover:text-green-700"
                          >
                            <RotateCcw className="w-4 h-4 mr-1" />
                            Restaurar
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialog de permisos */}
      <Dialog open={showPermissionsDialog} onOpenChange={setShowPermissionsDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Gestionar Permisos - {selectedUserForPermissions?.nombre_completo}
            </DialogTitle>
            <DialogDescription>
              Configura los permisos específicos para este usuario
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {Object.entries(permissionsByModule).map(([module, actions]) => (
              <Card key={module}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg capitalize">{module}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {actions.map((action) => {
                      const permission = `${module}.${action}`;
                      const permissionData = ALL_PERMISSIONS.find(p => `${p.module}.${p.action}` === permission);
                      
                      return (
                        <div key={permission} className="flex items-center space-x-2">
                          <Checkbox
                            id={permission}
                            checked={userPermissions.includes(permission)}
                            onCheckedChange={(checked) => handlePermissionChange(permission, !!checked)}
                          />
                          <Label htmlFor={permission} className="text-sm">
                            <span className="font-medium">{permissionData?.label}</span>
                            <br />
                            <span className="text-xs text-gray-500">{permissionData?.description}</span>
                          </Label>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={() => setShowPermissionsDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSavePermissions}>
              Guardar Permisos
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}