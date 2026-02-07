import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  RefreshCw, 
  Trash2, 
  Edit2, 
  Database,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import { useGoogleSheets } from '@/hooks/useGoogleSheets';
import { GoogleSheetsSettings } from './GoogleSheetsSettings';


export function GoogleSheetsDemo() {
  const {
    data,
    isLoading,
    isAuthenticated,
    error,
    config,
    fetchData,
    create,
    update,
    remove,
  } = useGoogleSheets();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [formData, setFormData] = useState<Record<string, string | number | boolean>>({});

  // Get headers from data
  const headers = data.length > 0 ? Object.keys(data[0]) : [];

  const handleOpenForm = (row?: Record<string, string | number | boolean>, index?: number) => {
    if (row && index !== undefined) {
      setFormData(row);
      setEditingIndex(index);
    } else {
      // Create empty form with headers
      const emptyForm: Record<string, string | number | boolean> = {};
      headers.forEach(h => emptyForm[h] = '');
      if (headers.length === 0) {
        // Default fields if no data yet
        emptyForm['Nombre'] = '';
        emptyForm['Email'] = '';
        emptyForm['Teléfono'] = '';
        emptyForm['Estado'] = '';
      }
      setFormData(emptyForm);
      setEditingIndex(null);
    }
    setIsFormOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingIndex !== null) {
        await update(editingIndex, formData);
      } else {
        await create(formData);
      }
      setIsFormOpen(false);
      setFormData({});
      setEditingIndex(null);
    } catch {
      // Error already handled by hook
    }
  };

  const handleDelete = async (index: number) => {
    if (confirm('¿Estás seguro de que deseas eliminar este registro?')) {
      try {
        await remove(index);
      } catch {
        // Error already handled by hook
      }
    }
  };

  const handleRefresh = async () => {
    await fetchData();
  };

  // Show settings if not configured
  if (!config.spreadsheetId) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Database className="h-6 w-6" />
            Google Sheets CRUD
          </h2>
        </div>
        <GoogleSheetsSettings />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Database className="h-6 w-6" />
            Google Sheets CRUD
          </h2>
          <p className="text-gray-600 mt-1">
            Gestiona datos directamente en Google Sheets
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isAuthenticated ? (
            <Badge variant="default" className="bg-green-100 text-green-800">
              <CheckCircle2 className="h-3 w-3 mr-1" />
              Modo escritura
            </Badge>
          ) : (
            <Badge variant="secondary">
              <AlertCircle className="h-3 w-3 mr-1" />
              Solo lectura
            </Badge>
          )}
          <Button
            variant="outline"
            size="icon"
            onClick={handleRefresh}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
          {error}
        </div>
      )}

      {/* Data Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Datos de {config.sheetName || 'Sheet1'}</CardTitle>
            <CardDescription>
              {data.length} registros encontrados
            </CardDescription>
          </div>
          {isAuthenticated && (
            <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => handleOpenForm()}>
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>
                    {editingIndex !== null ? 'Editar registro' : 'Nuevo registro'}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  {Object.entries(formData).map(([key, value]) => (
                    <div key={key} className="space-y-2">
                      <Label htmlFor={key}>{key}</Label>
                      <Input
                        id={key}
                        value={String(value)}
                        onChange={(e) => setFormData({ ...formData, [key]: e.target.value })}
                        placeholder={`Ingresa ${key.toLowerCase()}`}
                      />
                    </div>
                  ))}
                  <div className="flex gap-2">
                    <Button type="submit" className="flex-1">
                      {editingIndex !== null ? 'Actualizar' : 'Crear'}
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setIsFormOpen(false)}
                    >
                      Cancelar
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </CardHeader>
        <CardContent>
          {data.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              {isLoading ? (
                <div className="flex flex-col items-center gap-2">
                  <RefreshCw className="h-8 w-8 animate-spin" />
                  <p>Cargando datos...</p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <Database className="h-12 w-12 text-gray-300" />
                  <p>No hay datos en la hoja</p>
                  <Button variant="outline" onClick={handleRefresh}>
                    Intentar cargar
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    {headers.map((header) => (
                      <TableHead key={header}>{header}</TableHead>
                    ))}
                    {isAuthenticated && <TableHead className="w-24">Acciones</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.map((row, index) => (
                    <TableRow key={index}>
                      {headers.map((header) => (
                        <TableCell key={header}>
                          {String(row[header] || '')}
                        </TableCell>
                      ))}
                      {isAuthenticated && (
                        <TableCell>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleOpenForm(row, index)}
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-red-600"
                              onClick={() => handleDelete(index)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Configuración</CardTitle>
        </CardHeader>
        <CardContent>
          <GoogleSheetsSettings />
        </CardContent>
      </Card>
    </div>
  );
}
