import { useParams, useNavigate } from 'react-router-dom';
import { useCandidate } from '@/hooks/useCandidate';
import { CandidateDetail } from '@/components/CandidateDetail';
import { Button } from '@/components/ui/button';
import { useRecruiters } from '@/hooks/useRecruiters';
import { SkillsService } from '@/services/skills.service';
import { toast } from 'sonner';

export function CandidateDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { candidate, isLoading, refetch, availableSkills, addNote, addComment, updateComment, deleteComment, updateSkills, simulateLinkedInSync } = useCandidate(id);
  const { recruiters, currentRecruiter, currentRecruiterId, selectRecruiter } = useRecruiters();

  const handleBack = () => {
    navigate('/ATS/Candidatos');
  };

  const handleEdit = () => {
    toast.info('Función de edicióncoming soon');
  };

  const handleAddNote = (content: string) => {
    addNote(content);
    toast.success('Nota agregada');
  };

  const handleSyncLinkedIn = () => {
    toast.promise(simulateLinkedInSync(), {
      loading: 'Sincronizando...',
      success: 'Perfil actualizado',
      error: 'Error al sincronizar',
    });
  };

  const handleAddComment = (content: string, recruiterId: string) => {
    const recruiterName = currentRecruiter?.name || 'Usuario';
    toast.promise(
      addComment(content, recruiterId, recruiterName).then(() => {
        toast.success('Comentario agregado');
      }),
      {
        loading: 'Agregando comentario...',
        success: 'Comentario agregado',
        error: 'Error al agregar comentario',
      }
    );
  };

  const handleUpdateComment = (commentId: string, content: string) => {
    toast.promise(
      updateComment(commentId, content).then(() => {
        toast.success('Comentario actualizado');
      }),
      {
        loading: 'Actualizando...',
        success: 'Comentario actualizado',
        error: 'Error al actualizar',
      }
    );
  };

  const handleDeleteComment = (commentId: string) => {
    toast.promise(
      deleteComment(commentId).then(() => {
        toast.success('Comentario eliminado');
      }),
      {
        loading: 'Eliminando...',
        success: 'Comentario eliminado',
        error: 'Error al eliminar',
      }
    );
  };

  const handleCreateSkill = async (name: string) => {
    try {
      const newSkill = await SkillsService.create({ name });
      toast.success(`Habilidad "${name}" creada`);
      return newSkill;
    } catch (error: unknown) {
      const err = error as { message?: string };
      if (err.message?.includes('already exists')) {
        const existingSkills = await SkillsService.list(name);
        if (existingSkills.length > 0) {
          return existingSkills[0];
        }
      }
      throw error;
    }
  };

  const handleUpdateSkills = async (skills: string[]) => {
    try {
      if (!candidate) return;

      const currentSkills = candidate.skills;
      const skillsToAdd = skills.filter(s => !currentSkills.includes(s));
      const skillsToRemove = currentSkills.filter(s => !skills.includes(s));

      for (const skillName of skillsToAdd) {
        try {
          const existingSkills = await SkillsService.list(skillName);
          let skillId: string;
          
          if (existingSkills.length > 0) {
            skillId = existingSkills[0].id;
          } else {
            const newSkill = await SkillsService.create({ name: skillName });
            skillId = newSkill.id;
          }
          
          await SkillsService.addSkillToApplicant(candidate.id, skillId);
        } catch (err) {
          console.error(`Error adding skill "${skillName}":`, err);
        }
      }

      for (const skillName of skillsToRemove) {
        try {
          const existingSkills = await SkillsService.list(skillName);
          if (existingSkills.length > 0) {
            await SkillsService.removeSkillFromApplicant(candidate.id, existingSkills[0].id);
          }
        } catch (err) {
          console.error(`Error removing skill "${skillName}":`, err);
        }
      }

      updateSkills(skills);
      toast.success('Habilidades actualizadas');
      refetch();
    } catch (err) {
      console.error('Error updating skills:', err);
      toast.error('Error al actualizar habilidades');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando candidato...</p>
        </div>
      </div>
    );
  }

  if (!candidate) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Candidato no encontrado</p>
        <Button onClick={handleBack} className="mt-4">
          Volver a la lista
        </Button>
      </div>
    );
  }

  return (
    <CandidateDetail
      candidate={candidate}
      onBack={handleBack}
      onEdit={handleEdit}
      onAddNote={handleAddNote}
      onSyncLinkedIn={handleSyncLinkedIn}
      onAddComment={handleAddComment}
      onUpdateComment={handleUpdateComment}
      onDeleteComment={handleDeleteComment}
      availableSkills={availableSkills}
      onCreateSkill={handleCreateSkill}
      onUpdateSkills={handleUpdateSkills}
      recruiters={recruiters}
      currentRecruiterId={currentRecruiterId}
      onRecruiterChange={selectRecruiter}
    />
  );
}
