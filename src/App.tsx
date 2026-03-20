import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { Dashboard } from '@/components/Dashboard';
import { CandidateListPage } from '@/pages/CandidateListPage';
import { CandidateDetailPage } from '@/pages/CandidateDetailPage';
import { SkillsPage } from '@/pages/SkillsPage';
import { RecruitersPage } from '@/pages/RecruitersPage';
import { Clients } from '@/components/Clients';
import { JobsLayout } from '@/components/JobsLayout';
import { LinkedInSync } from '@/components/LinkedInSync';
import { AdvancedSearch } from '@/components/AdvancedSearch';
import { Settings } from '@/components/Settings';
import { GoogleSheetsDemo } from '@/components/GoogleSheetsDemo';
import { useCandidates } from '@/hooks/useCandidates';
import { useLinkedInSync } from '@/hooks/useLinkedInSync';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';

function AppContent() {
  const location = useLocation();
  
  const {
    candidates,
    getStats,
    bulkSyncLinkedIn,
  } = useCandidates();

  const {
    config: syncConfig,
    updateConfig: updateSyncConfig,
    recordSync,
    getSyncStatus,
  } = useLinkedInSync();

  const stats = getStats();
  const syncStatus = getSyncStatus();

  const handleViewCandidate = (id: string) => {
    window.location.href = `/ATS/Candidatos/${id}`;
  };

  const handleSyncLinkedIn = async () => {
    toast.promise(bulkSyncLinkedIn(), {
      loading: 'Sincronizando con LinkedIn...',
      success: () => {
        recordSync();
        return 'Sincronización completada';
      },
      error: 'Error en la sincronización',
    });
  };

  return (
    <Layout currentPath={location.pathname}>
      <Routes>
        <Route path="/" element={<Navigate to="/ATS" replace />} />
        
        <Route path="/ATS" element={
          <Dashboard
            stats={stats}
            recentCandidates={candidates.slice(0, 5)}
            onViewCandidate={handleViewCandidate}
            onViewAllCandidates={() => window.location.href = '/ATS/Candidatos'}
            onSyncLinkedIn={handleSyncLinkedIn}
            syncStatus={syncStatus}
          />
        } />

        <Route path="/ATS/Candidatos" element={<CandidateListPage />} />
        <Route path="/ATS/Candidatos/:id" element={<CandidateDetailPage />} />

        <Route path="/ATS/Habilidades" element={<SkillsPage />} />
        <Route path="/ATS/Reclutadores" element={<RecruitersPage />} />
        <Route path="/ATS/Clientes" element={<Clients />} />
        <Route path="/ATS/Ofertas" element={<JobsLayout />} />
        <Route path="/ATS/Busqueda-Avanzada" element={
          <AdvancedSearch
            candidates={candidates}
            allSkills={[]}
            allTags={[]}
            filters={{ query: '', status: [], skills: [], location: '', experience: 'any', openToWork: null, tags: [], source: [] }}
            onFiltersChange={() => {}}
            onViewCandidate={handleViewCandidate}
          />
        } />
        <Route path="/ATS/Sincronizacion-LinkedIn" element={
          <LinkedInSync
            config={syncConfig}
            onUpdateConfig={updateSyncConfig}
            onSync={handleSyncLinkedIn}
            syncStatus={syncStatus}
            candidatesWithLinkedIn={candidates.filter(c => c.linkedin).length}
            recentChanges={stats.recentChanges}
          />
        } />
        <Route path="/ATS/Google-Sheets" element={<GoogleSheetsDemo />} />
        <Route path="/ATS/Configuracion" element={
          <Settings
            candidates={candidates}
            onImportData={() => toast.success('Datos importados')}
            onClearData={() => {
              localStorage.clear();
              window.location.reload();
            }}
          />
        } />

        <Route path="*" element={<Navigate to="/ATS" replace />} />
      </Routes>

      <Toaster position="top-right" richColors />
    </Layout>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;
