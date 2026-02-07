import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle2, 
  XCircle, 
  ExternalLink, 
  Database,
  Key,
  FileSpreadsheet,
  LogOut,
  TestTube
} from 'lucide-react';
import { useGoogleSheets } from '@/hooks/useGoogleSheets';
import { toast } from 'sonner';

export function GoogleSheetsSettings() {
  const {
    config,
    setConfig,
    isAuthenticated,
    initiateAuth,
    logout,
    testConnection,
  } = useGoogleSheets();

  const [apiKey, setApiKey] = useState(config.apiKey || '');
  const [spreadsheetId, setSpreadsheetId] = useState(config.spreadsheetId || '');
  const [sheetName, setSheetName] = useState(config.sheetName || 'Sheet1');
  const [clientId, setClientId] = useState('');
  const [isTesting, setIsTesting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'none' | 'success' | 'error'>('none');

  // Load saved config
  useEffect(() => {
    setApiKey(config.apiKey || '');
    setSpreadsheetId(config.spreadsheetId || '');
    setSheetName(config.sheetName || 'Sheet1');
  }, [config]);

  const handleSaveConfig = () => {
    setConfig({
      apiKey: apiKey || undefined,
      spreadsheetId: spreadsheetId || undefined,
      sheetName: sheetName || 'Sheet1',
    });
    toast.success('Configuración guardada');
  };

  const handleTestConnection = async () => {
    if (!spreadsheetId) {
      toast.error('Spreadsheet ID es requerido');
      return;
    }

    setIsTesting(true);
    setConnectionStatus('none');

    try {
      const success = await testConnection();
      setConnectionStatus(success ? 'success' : 'error');
      if (success) {
        toast.success('Conexión exitosa con Google Sheets');
      } else {
        toast.error('No se pudo conectar con Google Sheets');
      }
    } catch {
      setConnectionStatus('error');
      toast.error('Error al probar conexión');
    } finally {
      setIsTesting(false);
    }
  };

  const handleAuth = () => {
    if (!clientId) {
      toast.error('Client ID es requerido para autenticación OAuth');
      return;
    }
    initiateAuth(clientId);
  };

  const extractSpreadsheetId = (url: string) => {
    // Extract ID from Google Sheets URL
    const match = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
    if (match) {
      setSpreadsheetId(match[1]);
      toast.success('ID extraído de la URL');
    } else {
      toast.error('URL no válida');
    }
  };

  return (
    <div className="space-y-6">
      {/* Configuration Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Configuración de Google Sheets
          </CardTitle>
          <CardDescription>
            Conecta tu aplicación con Google Sheets para sincronizar datos.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Spreadsheet ID */}
          <div className="space-y-2">
            <Label htmlFor="spreadsheet-id">Spreadsheet ID</Label>
            <div className="flex gap-2">
              <Input
                id="spreadsheet-id"
                placeholder="1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms"
                value={spreadsheetId}
                onChange={(e) => setSpreadsheetId(e.target.value)}
                className="flex-1"
              />
            </div>
            <p className="text-sm text-gray-500">
              ID de la hoja de cálculo o{' '}
              <button
                onClick={() => {
                  const url = prompt('Pega la URL de tu Google Sheet:');
                  if (url) extractSpreadsheetId(url);
                }}
                className="text-blue-600 hover:underline"
              >
                extraer desde URL
              </button>
            </p>
          </div>

          {/* Sheet Name */}
          <div className="space-y-2">
            <Label htmlFor="sheet-name">Nombre de la hoja</Label>
            <Input
              id="sheet-name"
              placeholder="Sheet1"
              value={sheetName}
              onChange={(e) => setSheetName(e.target.value)}
            />
          </div>

          {/* API Key (Optional - for read-only public sheets) */}
          <div className="space-y-2">
            <Label htmlFor="api-key" className="flex items-center gap-2">
              <Key className="h-4 w-4" />
              API Key (opcional)
            </Label>
            <Input
              id="api-key"
              type="password"
              placeholder="AIzaSyDdI0hCZtE6vySjMm-WEfRq3CPzqKqqsHI"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
            />
            <p className="text-sm text-gray-500">
              Necesaria solo para hojas públicas con acceso de solo lectura.{' '}
              <a
                href="https://console.cloud.google.com/apis/credentials"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline inline-flex items-center gap-1"
              >
                Obtener API Key <ExternalLink className="h-3 w-3" />
              </a>
            </p>
          </div>

          {/* Test Connection */}
          <div className="flex items-center gap-2">
            <Button
              onClick={handleTestConnection}
              disabled={isTesting || !spreadsheetId}
              variant="outline"
              className="flex items-center gap-2"
            >
              <TestTube className="h-4 w-4" />
              {isTesting ? 'Probando...' : 'Probar conexión'}
            </Button>
            {connectionStatus === 'success' && (
              <Badge variant="default" className="bg-green-100 text-green-800">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                Conectado
              </Badge>
            )}
            {connectionStatus === 'error' && (
              <Badge variant="destructive">
                <XCircle className="h-3 w-3 mr-1" />
                Error
              </Badge>
            )}
          </div>

          <Button onClick={handleSaveConfig} className="w-full">
            Guardar configuración
          </Button>
        </CardContent>
      </Card>

      {/* OAuth Authentication Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" />
            Autenticación OAuth
          </CardTitle>
          <CardDescription>
            Requerida para operaciones de escritura (crear, editar, eliminar).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isAuthenticated ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2 p-4 bg-green-50 rounded-lg">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <span className="text-green-800">Autenticado con Google Sheets</span>
              </div>
              <Button onClick={logout} variant="outline" className="w-full flex items-center gap-2">
                <LogOut className="h-4 w-4" />
                Cerrar sesión
              </Button>
            </div>
          ) : (
            <>
              <div className="space-y-2">
                <Label htmlFor="client-id">OAuth Client ID</Label>
                <Input
                  id="client-id"
                  placeholder="123456789-abc123.apps.googleusercontent.com"
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                />
                <p className="text-sm text-gray-500">
                  Client ID de OAuth 2.0.{' '}
                  <a
                    href="https://console.cloud.google.com/apis/credentials"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline inline-flex items-center gap-1"
                  >
                    Configurar en Google Cloud Console <ExternalLink className="h-3 w-3" />
                  </a>
                </p>
              </div>
              <Button 
                onClick={handleAuth} 
                className="w-full"
                disabled={!clientId}
              >
                Iniciar sesión con Google
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      {/* Instructions Card */}
      <Card>
        <CardHeader>
          <CardTitle>Instrucciones de configuración</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-gray-600">
          <ol className="list-decimal list-inside space-y-2">
            <li>
              Ve a la{' '}
              <a
                href="https://console.cloud.google.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                Google Cloud Console
              </a>{' '}
              y crea un nuevo proyecto.
            </li>
            <li>Habilita la API de Google Sheets en &quot;APIs &amp; Services&quot; &gt; &quot;Library&quot;.</li>
            <li>
              Para solo lectura: Crea una API Key en &quot;Credentials&quot;.
            </li>
            <li>
              Para escritura: Crea credenciales OAuth 2.0 (Client ID para Web) y
              agrega tu dominio en &quot;Authorized JavaScript origins&quot;.
            </li>
            <li>Comparte tu Google Sheet con el email del servicio (si aplica).</li>
            <li>Copia el Spreadsheet ID de la URL de tu hoja.</li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}
