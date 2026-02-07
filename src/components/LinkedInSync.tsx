import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import type { LinkedInSyncConfig } from '@/types';
import { 
  Linkedin, 
  RefreshCw, 
  Calendar, 
  CheckCircle2, 
  AlertCircle,
  Clock,
  Users,
  TrendingUp,
  Settings
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

interface LinkedInSyncProps {
  config: LinkedInSyncConfig;
  onUpdateConfig: (updates: Partial<LinkedInSyncConfig>) => void;
  onSync: () => Promise<void>;
  syncStatus: { status: string; message: string };
  candidatesWithLinkedIn: number;
  recentChanges: number;
}

export function LinkedInSync({ 
  config, 
  onUpdateConfig, 
  onSync, 
  syncStatus,
  candidatesWithLinkedIn,
  recentChanges
}: LinkedInSyncProps) {
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncProgress, setSyncProgress] = useState(0);

  const handleSync = async () => {
    setIsSyncing(true);
    setSyncProgress(0);
    
    // Simulate progress
    const interval = setInterval(() => {
      setSyncProgress(prev => {
        if (prev >= 90) {
          clearInterval(interval);
          return 90;
        }
        return prev + 10;
      });
    }, 500);

    try {
      await onSync();
      setSyncProgress(100);
    } catch (error) {
      console.error('Sync error:', error);
    } finally {
      setTimeout(() => {
        setIsSyncing(false);
        setSyncProgress(0);
      }, 1000);
    }
  };

  const getStatusIcon = () => {
    switch (syncStatus.status) {
      case 'ok':
        return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      case 'due':
        return <AlertCircle className="h-5 w-5 text-orange-600" />;
      case 'pending':
        return <Clock className="h-5 w-5 text-blue-600" />;
      default:
        return <Settings className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusColor = () => {
    switch (syncStatus.status) {
      case 'ok':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'due':
        return 'bg-orange-50 border-orange-200 text-orange-800';
      case 'pending':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Linkedin className="h-6 w-6 text-blue-600" />
          Sincronización con LinkedIn
        </h2>
        <p className="text-gray-600 mt-1">
          Mantén los perfiles de tus candidatos actualizados automáticamente.
        </p>
      </div>

      {/* Status Card */}
      <Card className={getStatusColor()}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm">
                {getStatusIcon()}
              </div>
              <div>
                <h3 className="font-semibold">Estado de sincronización</h3>
                <p className="text-sm opacity-90">{syncStatus.message}</p>
              </div>
            </div>
            <Button 
              onClick={handleSync} 
              disabled={isSyncing || candidatesWithLinkedIn === 0}
              className="gap-2 bg-white text-gray-900 hover:bg-gray-100"
            >
              <RefreshCw className={`h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
              {isSyncing ? 'Sincronizando...' : 'Sincronizar ahora'}
            </Button>
          </div>
          
          {isSyncing && (
            <div className="mt-4">
              <Progress value={syncProgress} className="h-2" />
              <p className="text-sm mt-2 text-center">{syncProgress}% completado</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Perfiles vinculados</p>
                <p className="text-2xl font-bold">{candidatesWithLinkedIn}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Cambios detectados</p>
                <p className="text-2xl font-bold">{recentChanges}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center">
                <Calendar className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Última sincronización</p>
                <p className="text-lg font-bold">
                  {config.lastSync 
                    ? format(parseISO(config.lastSync), 'dd MMM yyyy', { locale: es })
                    : 'Nunca'
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Configuración
          </CardTitle>
          <CardDescription>
            Configura la sincronización automática de perfiles de LinkedIn.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Enable/Disable Sync */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h4 className="font-medium text-gray-900">Sincronización automática</h4>
              <p className="text-sm text-gray-600">
                Actualiza automáticamente los perfiles de LinkedIn
              </p>
            </div>
            <Switch
              checked={config.enabled}
              onCheckedChange={(checked) => onUpdateConfig({ enabled: checked })}
            />
          </div>

          {/* Frequency */}
          {config.enabled && (
            <div className="space-y-3">
              <Label>Frecuencia de sincronización</Label>
              <Select
                value={config.frequency}
                onValueChange={(value) => onUpdateConfig({ frequency: value as 'weekly' | 'monthly' })}
              >
                <SelectTrigger className="w-full md:w-64">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weekly">Semanal</SelectItem>
                  <SelectItem value="monthly">Mensual</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-gray-600">
                {config.frequency === 'weekly' 
                  ? 'Los perfiles se actualizarán cada semana' 
                  : 'Los perfiles se actualizarán cada mes'}
              </p>
            </div>
          )}

          {/* Next Sync */}
          {config.enabled && config.nextSync && (
            <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg">
              <Calendar className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Próxima sincronización programada</p>
                <p className="font-medium text-blue-900">
                  {format(parseISO(config.nextSync), 'EEEE, dd MMMM yyyy', { locale: es })}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
              <Linkedin className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">¿Qué se sincroniza?</h4>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  Cambios en el puesto actual
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  Cambios de empresa
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  Estado "Open to Work"
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  Actualizaciones en el perfil
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
