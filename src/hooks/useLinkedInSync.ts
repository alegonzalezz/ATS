import { useState, useEffect, useCallback } from 'react';
import type { LinkedInSyncConfig } from '@/types';
import { addDays, format } from 'date-fns';

const SYNC_CONFIG_KEY = 'talenttrack_sync_config';

const defaultConfig: LinkedInSyncConfig = {
  enabled: false,
  frequency: 'weekly',
  lastSync: null,
  nextSync: null,
};

export function useLinkedInSync() {
  const [config, setConfig] = useState<LinkedInSyncConfig>(defaultConfig);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem(SYNC_CONFIG_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setConfig(parsed);
      } catch (e) {
        console.error('Error parsing sync config:', e);
      }
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem(SYNC_CONFIG_KEY, JSON.stringify(config));
    }
  }, [config, isLoading]);

  const updateConfig = useCallback((updates: Partial<LinkedInSyncConfig>) => {
    setConfig(prev => {
      const updated = { ...prev, ...updates };
      
      // Recalculate next sync if frequency changes or sync is enabled
      if (updates.frequency || updates.enabled) {
        if (updated.enabled) {
          const days = updated.frequency === 'weekly' ? 7 : 30;
          updated.nextSync = addDays(new Date(), days).toISOString();
        } else {
          updated.nextSync = null;
        }
      }
      
      return updated;
    });
  }, []);

  const recordSync = useCallback(() => {
    setConfig(prev => {
      const now = new Date().toISOString();
      const days = prev.frequency === 'weekly' ? 7 : 30;
      return {
        ...prev,
        lastSync: now,
        nextSync: addDays(new Date(), days).toISOString(),
      };
    });
  }, []);

  const shouldSync = useCallback(() => {
    if (!config.enabled) return false;
    if (!config.nextSync) return true;
    return new Date() >= new Date(config.nextSync);
  }, [config]);

  const getSyncStatus = useCallback(() => {
    if (!config.enabled) {
      return { status: 'disabled', message: 'Sincronización desactivada' } as const;
    }
    
    if (!config.lastSync) {
      return { status: 'pending', message: 'Nunca sincronizado' } as const;
    }
    
    if (shouldSync()) {
      return { status: 'due', message: 'Sincronización pendiente' } as const;
    }
    
    return { 
      status: 'ok', 
      message: `Próxima sincronización: ${format(new Date(config.nextSync!), 'dd/MM/yyyy HH:mm')}` 
    } as const;
  }, [config, shouldSync]);

  return {
    config,
    isLoading,
    updateConfig,
    recordSync,
    shouldSync,
    getSyncStatus,
  };
}
