import { useState } from 'react';
import { Layout } from '@/components/Layout';
import { Dashboard } from '@/components/Dashboard';
import { CandidateList } from '@/components/CandidateList';
import { CandidateDetail } from '@/components/CandidateDetail';
import { CandidateForm } from '@/components/CandidateForm';
import { Recruiters } from '@/components/Recruiters';
import { Clients } from '@/components/Clients';
import { JobsLayout } from '@/components/JobsLayout';
import { LinkedInSync } from '@/components/LinkedInSync';
import { AdvancedSearch } from '@/components/AdvancedSearch';
import { Settings } from '@/components/Settings';
import { GoogleSheetsDemo } from '@/components/GoogleSheetsDemo';
import { Skills } from '@/components/Skills';
import { useCandidates } from '@/hooks/useCandidates';
import { useRecruiters } from '@/hooks/useRecruiters';
import { SkillsService } from '@/services/skills.service';
import { useLinkedInSync } from '@/hooks/useLinkedInSync';
import type { Candidate, SearchFilters } from '@/types';
import { Button } from '@/components/ui/button';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';

function App() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCandidate, setEditingCandidate] = useState<Candidate | null>(null);
  const [searchFilters, setSearchFilters] = useState<SearchFilters>({
    query: '',
    status: [],
    skills: [],
    location: '',
    experience: 'any',
    openToWork: null,
    tags: [],
    source: [],
  });

  const {
    candidates,
    addCandidate,
    updateCandidate,
    deleteCandidate,
    addNote,
    addComment,
    updateComment,
    deleteComment,
    addTag,
    removeTag,
    getStats,
    getAllTags,
    getAllSkills,
    importFromCV,
    simulateLinkedInSync,
    bulkSyncLinkedIn,
  } = useCandidates();

  const {
    recruiters,
    currentRecruiter,
    currentRecruiterId,
    selectRecruiter,
    isLoading: isLoadingRecruiters,
  } = useRecruiters();

  // Use these variables to avoid unused warnings
  void searchFilters;
  void setSearchFilters;
  void isLoadingRecruiters;

  const {
    config: syncConfig,
    updateConfig: updateSyncConfig,
    recordSync,
    getSyncStatus,
  } = useLinkedInSync();

  const stats = getStats();
  const allTags = getAllTags() || [];
  const allSkills = getAllSkills() || [];
  const syncStatus = getSyncStatus();

  const handleViewCandidate = (id: string) => {
    setSelectedCandidateId(id);
    setCurrentView('candidate-detail');
  };

  const handleBackToList = () => {
    setSelectedCandidateId(null);
    setCurrentView('candidates');
  };

  const handleEditCandidate = (candidate: Candidate) => {
    setEditingCandidate(candidate);
    setIsFormOpen(true);
  };

  const handleSaveCandidate = async (candidateData: Parameters<typeof addCandidate>[0]) => {
    if (editingCandidate?.id) {
      updateCandidate(editingCandidate.id, candidateData);
      toast.success('Candidato actualizado correctamente');
    } else {
      await addCandidate(candidateData);
      toast.success('Candidato agregado correctamente');
    }
    setIsFormOpen(false);
  };

  const handleDeleteCandidate = (id: string) => {
    if (confirm('¿Estás seguro de que deseas eliminar este candidato?')) {
      deleteCandidate(id);
      toast.success('Candidato eliminado');
      if (selectedCandidateId === id) {
        setSelectedCandidateId(null);
        setCurrentView('candidates');
      }
    }
  };

  const handleImportCV = async (file: File, onProgress: (progress: number) => void) => {
    try {
      await importFromCV(file, onProgress);
      toast.success('CV importado correctamente');
    } catch (error) {
      toast.error('Error al importar el CV');
      throw error;
    }
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

  const handleImportData = (data: Candidate[]) => {
    // Merge imported data with existing
    data.forEach(candidate => {
      if (!candidates.find(c => c.id === candidate.id)) {
        addCandidate(candidate);
      }
    });
    toast.success('Datos importados correctamente');
  };

  const handleClearData = () => {
    localStorage.clear();
    window.location.reload();
  };

  const selectedCandidate = candidates.find(c => c.id === selectedCandidateId);

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return (
          <Dashboard
            stats={stats}
            recentCandidates={candidates.slice(0, 5)}
            onViewCandidate={handleViewCandidate}
            onViewAllCandidates={() => setCurrentView('candidates')}
            onSyncLinkedIn={handleSyncLinkedIn}
            syncStatus={syncStatus}
          />
        );

      case 'candidates':
        return (
          <CandidateList
            candidates={candidates}
            allTags={allTags}
            allSkills={allSkills}
            onViewCandidate={handleViewCandidate}
            onEditCandidate={handleEditCandidate}
            onDeleteCandidate={handleDeleteCandidate}
            onAddTag={addTag}
            onRemoveTag={removeTag}
            onUpdateStatus={(id, status) => {
              updateCandidate(id, { status });
              toast.success('Estado actualizado');
            }}
          />
        );

      case 'skills':
        return <Skills />;

      case 'candidate-detail':
        return selectedCandidate ? (
          <CandidateDetail
            candidate={selectedCandidate}
            onBack={handleBackToList}
            onEdit={() => handleEditCandidate(selectedCandidate)}
            onAddNote={(content) => {
              addNote(selectedCandidate.id, content);
              toast.success('Nota agregada');
            }}
            onSyncLinkedIn={() => {
              toast.promise(simulateLinkedInSync(selectedCandidate.id), {
                loading: 'Sincronizando...',
                success: 'Perfil actualizado',
                error: 'Error al sincronizar',
              });
            }}
            onAddComment={(content, recruiterId) => {
              const recruiterName = currentRecruiter?.name || 'Usuario';
              addComment(selectedCandidate.id, recruiterId, recruiterName, content);
              toast.success('Comentario agregado');
            }}
            onUpdateComment={(commentId, content) => {
              updateComment(selectedCandidate.id, commentId, content);
              toast.success('Comentario actualizado');
            }}
            onDeleteComment={(commentId) => {
              deleteComment(selectedCandidate.id, commentId);
              toast.success('Comentario eliminado');
            }}
            availableSkills={allSkills}
            onCreateSkill={async (name) => {
              try {
                const newSkill = await SkillsService.create({ name });
                return newSkill;
              } catch (error: any) {
                if (error.message?.includes('already exists')) {
                  // If skill already exists, search for it and return it
                  const existingSkills = await SkillsService.list(name);
                  if (existingSkills.length > 0) {
                    return existingSkills[0];
                  }
                }
                throw error;
              }
            }}
            onUpdateSkills={async (skills) => {
              try {
                // Get current skills from candidate
                const currentSkills = selectedCandidate.skills;
                
                // Find skills to add (in new list but not in current)
                const skillsToAdd = skills.filter(s => !currentSkills.includes(s));
                
                // Find skills to remove (in current but not in new list)
                const skillsToRemove = currentSkills.filter(s => !skills.includes(s));
                
                // Add new skills
                for (const skillName of skillsToAdd) {
                  try {
                    // Search for existing skill
                    const existingSkills = await SkillsService.list(skillName);
                    let skillId: string;
                    
                    if (existingSkills.length > 0) {
                      skillId = existingSkills[0].id;
                    } else {
                      const newSkill = await SkillsService.create({ name: skillName });
                      skillId = newSkill.id;
                    }
                    
                    await SkillsService.addSkillToApplicant(selectedCandidate.id, skillId);
                  } catch (err) {
                    console.error(`Error adding skill "${skillName}":`, err);
                  }
                }
                
                // Remove old skills
                for (const skillName of skillsToRemove) {
                  try {
                    const existingSkills = await SkillsService.list(skillName);
                    if (existingSkills.length > 0) {
                      await SkillsService.removeSkillFromApplicant(selectedCandidate.id, existingSkills[0].id);
                    }
                  } catch (err) {
                    console.error(`Error removing skill "${skillName}":`, err);
                  }
                }
                
                // Update local state
                updateCandidate(selectedCandidate.id, { skills });
                toast.success('Habilidades actualizadas');
              } catch (err) {
                console.error('Error updating skills:', err);
                toast.error('Error al actualizar habilidades');
              }
            }}
            recruiters={recruiters}
            currentRecruiterId={currentRecruiterId}
            onRecruiterChange={selectRecruiter}
          />
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600">Candidato no encontrado</p>
            <Button onClick={handleBackToList} className="mt-4">
              Volver a la lista
            </Button>
          </div>
        );

      case 'recruiters':
        return <Recruiters />;

      case 'clients':
        return <Clients />;

      case 'jobs':
        return <JobsLayout />;

      case 'search':
        return (
          <AdvancedSearch
            candidates={candidates}
            allSkills={allSkills}
            allTags={allTags}
            filters={searchFilters}
            onFiltersChange={setSearchFilters}
            onViewCandidate={handleViewCandidate}
          />
        );

      case 'sync':
        return (
          <LinkedInSync
            config={syncConfig}
            onUpdateConfig={updateSyncConfig}
            onSync={handleSyncLinkedIn}
            syncStatus={syncStatus}
            candidatesWithLinkedIn={candidates.filter(c => c.linkedin).length}
            recentChanges={stats.recentChanges}
          />
        );

      case 'sheets':
        return <GoogleSheetsDemo />;

      case 'settings':
        return (
          <Settings
            candidates={candidates}
            onImportData={handleImportData}
            onClearData={handleClearData}
          />
        );

      default:
        return <Dashboard
          stats={stats}
          recentCandidates={candidates.slice(0, 5)}
          onViewCandidate={handleViewCandidate}
          onViewAllCandidates={() => setCurrentView('candidates')}
          onSyncLinkedIn={handleSyncLinkedIn}
          syncStatus={syncStatus}
        />;
    }
  };

  return (
    <>
      <Layout currentView={currentView} onViewChange={setCurrentView}>
        {renderContent()}
      </Layout>

      <CandidateForm
        candidate={editingCandidate}
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSave={handleSaveCandidate}
        onImportCV={handleImportCV}
      />

      <Toaster position="top-right" richColors />
    </>
  );
}

export default App;
