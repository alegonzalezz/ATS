import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { 
  Settings2, 
  Bell, 
  Database, 
  Trash2, 
  Download, 
  Upload,
  AlertTriangle,
  User
} from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import type { Candidate } from '@/types';

interface SettingsProps {
  candidates: Candidate[];
  onImportData: (data: Candidate[]) => void;
  onClearData: () => void;
}

export function Settings({ candidates, onImportData, onClearData }: SettingsProps) {
  const [showClearDialog, setShowClearDialog] = useState(false);
  const [notifications, setNotifications] = useState({
    email: true,
    browser: false,
    sync: true,
    changes: true,
  });

  const handleExport = () => {
    const dataStr = JSON.stringify(candidates, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `talenttrack-backup-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const data = JSON.parse(event.target?.result as string);
          onImportData(data);
        } catch (error) {
          console.error('Error importing data:', error);
          alert('Error al importar los datos. Asegúrate de que el archivo sea válido.');
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Settings2 className="h-6 w-6" />
          Configuración
        </h2>
        <p className="text-gray-600 mt-1">
          Personaliza tu experiencia y gestiona tus datos.
        </p>
      </div>

      {/* User Profile */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Perfil de Usuario
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Nombre</Label>
              <Input placeholder="Tu nombre" defaultValue="Usuario" />
            </div>
            <div>
              <Label>Email</Label>
              <Input type="email" placeholder="tu@email.com" />
            </div>
          </div>
          <Button>Guardar cambios</Button>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notificaciones
          </CardTitle>
          <CardDescription>
            Configura cómo quieres recibir las notificaciones.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h4 className="font-medium text-gray-900">Notificaciones por email</h4>
              <p className="text-sm text-gray-600">
                Recibe resúmenes semanales por correo
              </p>
            </div>
            <Switch
              checked={notifications.email}
              onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, email: checked }))}
            />
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h4 className="font-medium text-gray-900">Notificaciones del navegador</h4>
              <p className="text-sm text-gray-600">
                Recibe notificaciones en tiempo real
              </p>
            </div>
            <Switch
              checked={notifications.browser}
              onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, browser: checked }))}
            />
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h4 className="font-medium text-gray-900">Alertas de sincronización</h4>
              <p className="text-sm text-gray-600">
                Notifica cuando se completa una sincronización con LinkedIn
              </p>
            </div>
            <Switch
              checked={notifications.sync}
              onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, sync: checked }))}
            />
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h4 className="font-medium text-gray-900">Cambios en candidatos</h4>
              <p className="text-sm text-gray-600">
                Notifica cuando un candidato cambia de trabajo o estado
              </p>
            </div>
            <Switch
              checked={notifications.changes}
              onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, changes: checked }))}
            />
          </div>
        </CardContent>
      </Card>

      {/* Data Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Gestión de Datos
          </CardTitle>
          <CardDescription>
            Exporta, importa o elimina tus datos.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                  <Download className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Exportar datos</h4>
                  <p className="text-sm text-gray-600">
                    {candidates.length} candidatos
                  </p>
                </div>
              </div>
              <Button onClick={handleExport} variant="outline" className="w-full">
                Descargar JSON
              </Button>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                  <Upload className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Importar datos</h4>
                  <p className="text-sm text-gray-600">
                    Desde archivo JSON
                  </p>
                </div>
              </div>
              <Input
                type="file"
                accept=".json"
                onChange={handleImport}
                className="hidden"
                id="import-data"
              />
              <Label htmlFor="import-data" className="cursor-pointer">
                <Button variant="outline" className="w-full" asChild>
                  <span>Seleccionar archivo</span>
                </Button>
              </Label>
            </div>
          </div>

          <div className="p-4 border border-red-200 rounded-lg bg-red-50">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <Trash2 className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <h4 className="font-medium text-red-900">Zona de peligro</h4>
                <p className="text-sm text-red-700">
                  Estas acciones no se pueden deshacer
                </p>
              </div>
            </div>
            <Button 
              variant="destructive" 
              onClick={() => setShowClearDialog(true)}
              className="w-full md:w-auto"
            >
              Eliminar todos los datos
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* About */}
      <Card>
        <CardHeader>
          <CardTitle>Acerca de TalentTrack</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm text-gray-600">
            <p><strong>Versión:</strong> 1.0.0</p>
            <p><strong>Desarrollado con:</strong> React, TypeScript, Tailwind CSS</p>
            <p>
              TalentTrack es una aplicación de gestión de candidatos que te permite 
              organizar CVs, perfiles de LinkedIn y hacer seguimiento de tus candidatos.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Clear Data Dialog */}
      <Dialog open={showClearDialog} onOpenChange={setShowClearDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              Eliminar todos los datos
            </DialogTitle>
            <DialogDescription>
              Esta acción eliminará permanentemente todos los candidatos, notas y configuraciones. 
              Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowClearDialog(false)}>
              Cancelar
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => {
                onClearData();
                setShowClearDialog(false);
              }}
            >
              Sí, eliminar todo
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
