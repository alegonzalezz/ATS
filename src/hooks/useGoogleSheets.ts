import { useState, useEffect, useCallback } from 'react';
import { googleSheetsClient, type SheetsRow, type GoogleSheetsConfig } from '@/lib/googleSheets';
import { toast } from 'sonner';

interface UseGoogleSheetsReturn {
  data: SheetsRow[];
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  config: GoogleSheetsConfig;
  fetchData: () => Promise<void>;
  create: (row: SheetsRow) => Promise<void>;
  createMany: (rows: SheetsRow[]) => Promise<void>;
  update: (rowIndex: number, row: SheetsRow) => Promise<void>;
  remove: (rowIndex: number) => Promise<void>;
  setConfig: (config: GoogleSheetsConfig) => void;
  initiateAuth: (clientId: string, redirectUri?: string) => void;
  logout: () => void;
  testConnection: () => Promise<boolean>;
}

export function useGoogleSheets(): UseGoogleSheetsReturn {
  const [data, setData] = useState<SheetsRow[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [config, setConfigState] = useState<GoogleSheetsConfig>({});

  // Load config on mount
  useEffect(() => {
    googleSheetsClient.loadConfigFromStorage();
    const currentConfig = googleSheetsClient.getConfig();
    setConfigState(currentConfig);
    setIsAuthenticated(!!currentConfig.accessToken);
  }, []);

  // Listen for OAuth callback messages
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'GOOGLE_SHEETS_AUTH') {
        const success = googleSheetsClient.handleOAuthCallback(event.data.hash);
        if (success) {
          setIsAuthenticated(true);
          setConfigState(googleSheetsClient.getConfig());
          toast.success('Autenticación exitosa con Google Sheets');
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  // Check for OAuth callback in URL (for redirect flow)
  useEffect(() => {
    if (window.location.hash.includes('access_token') && window.location.hash.includes('state=google_sheets_auth')) {
      const success = googleSheetsClient.handleOAuthCallback(window.location.hash);
      if (success) {
        setIsAuthenticated(true);
        setConfigState(googleSheetsClient.getConfig());
        toast.success('Autenticación exitosa con Google Sheets');
        // Clean up URL
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }
  }, []);

  const fetchData = useCallback(async () => {
    if (!config.spreadsheetId) {
      setError('Spreadsheet ID no configurado');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const rows = await googleSheetsClient.getAllData();
      setData(rows);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al cargar datos';
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }, [config.spreadsheetId]);

  const create = useCallback(async (row: SheetsRow) => {
    setIsLoading(true);
    try {
      await googleSheetsClient.appendRow(row);
      toast.success('Registro creado exitosamente');
      await fetchData(); // Refresh data
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al crear registro';
      setError(message);
      toast.error(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [fetchData]);

  const createMany = useCallback(async (rows: SheetsRow[]) => {
    setIsLoading(true);
    try {
      await googleSheetsClient.appendRows(rows);
      toast.success(`${rows.length} registros creados exitosamente`);
      await fetchData();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al crear registros';
      setError(message);
      toast.error(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [fetchData]);

  const update = useCallback(async (rowIndex: number, row: SheetsRow) => {
    setIsLoading(true);
    try {
      await googleSheetsClient.updateRow(rowIndex, row);
      toast.success('Registro actualizado exitosamente');
      await fetchData();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al actualizar registro';
      setError(message);
      toast.error(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [fetchData]);

  const remove = useCallback(async (rowIndex: number) => {
    setIsLoading(true);
    try {
      await googleSheetsClient.deleteRow(rowIndex);
      toast.success('Registro eliminado exitosamente');
      await fetchData();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al eliminar registro';
      setError(message);
      toast.error(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [fetchData]);

  const setConfig = useCallback((newConfig: GoogleSheetsConfig) => {
    googleSheetsClient.setConfig(newConfig);
    setConfigState(googleSheetsClient.getConfig());
    if (newConfig.accessToken) {
      setIsAuthenticated(true);
    }
  }, []);

  const initiateAuth = useCallback((clientId: string, redirectUri?: string) => {
    googleSheetsClient.initiateOAuth(clientId, redirectUri);
  }, []);

  const logout = useCallback(() => {
    googleSheetsClient.logout();
    setIsAuthenticated(false);
    setConfigState(googleSheetsClient.getConfig());
    setData([]);
    toast.info('Sesión de Google Sheets cerrada');
  }, []);

  const testConnection = useCallback(async (): Promise<boolean> => {
    try {
      return await googleSheetsClient.testConnection();
    } catch {
      return false;
    }
  }, []);

  return {
    data,
    isLoading,
    isAuthenticated,
    error,
    config,
    fetchData,
    create,
    createMany,
    update,
    remove,
    setConfig,
    initiateAuth,
    logout,
    testConnection,
  };
}
