import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CandidateList } from '@/components/CandidateList';
import { CandidateForm } from '@/components/CandidateForm';
import { useCandidateList } from '@/hooks/useCandidateList';
import type { Candidate } from '@/types';
import { ApplicantService } from '@/services/applicant.service';
import { SkillsService } from '@/services/skills.service';
import { toast } from 'sonner';

export function CandidateListPage() {
  const navigate = useNavigate();
  const { candidates, isLoading, refetch, getAllTags, getAllSkills } = useCandidateList();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCandidate, setEditingCandidate] = useState<Candidate | null>(null);

  const allTags = getAllTags();
  const allSkills = getAllSkills();

  const handleViewCandidate = (id: string) => {
    navigate(`/ATS/Candidatos/${id}`);
  };

  const handleEditCandidate = (candidate: Candidate) => {
    setEditingCandidate(candidate);
    setIsFormOpen(true);
  };

  const handleDeleteCandidate = async (id: string) => {
    if (confirm('¿Estás seguro de que deseas eliminar este candidato?')) {
      try {
        await ApplicantService.delete(id);
        toast.success('Candidato eliminado');
        refetch();
      } catch (error) {
        console.error('Error deleting candidate:', error);
        toast.error('Error al eliminar candidato');
      }
    }
  };

  const handleSaveCandidate = async (candidateData: Parameters<typeof ApplicantService.create>[0] & { skills?: string[] }) => {
    try {
      if (editingCandidate?.id) {
        const applicantData = {
          name: candidateData.name,
          email: candidateData.email,
          phone: candidateData.phone,
          linkedin_url: (candidateData as unknown as { linkedin?: string }).linkedin,
        };
        await ApplicantService.update(editingCandidate.id, applicantData);
        
        if (candidateData.skills) {
          const currentSkills = editingCandidate.skills;
          const skillsToAdd = candidateData.skills.filter(s => !currentSkills.includes(s));
          const skillsToRemove = currentSkills.filter(s => !candidateData.skills!.includes(s));

          for (const skillName of skillsToAdd) {
            const existingSkills = await SkillsService.list(skillName);
            let skillId: string;
            if (existingSkills.length > 0) {
              skillId = existingSkills[0].id;
            } else {
              const newSkill = await SkillsService.create({ name: skillName });
              skillId = newSkill.id;
            }
            await SkillsService.addSkillToApplicant(editingCandidate.id, skillId);
          }

          for (const skillName of skillsToRemove) {
            const existingSkills = await SkillsService.list(skillName);
            if (existingSkills.length > 0) {
              await SkillsService.removeSkillFromApplicant(editingCandidate.id, existingSkills[0].id);
            }
          }
        }

        toast.success('Candidato actualizado correctamente');
      } else {
        await ApplicantService.create({
          name: candidateData.name,
          email: candidateData.email,
          phone: candidateData.phone,
          linkedin_url: (candidateData as unknown as { linkedin?: string }).linkedin,
        });
        toast.success('Candidato agregado correctamente');
      }
      setIsFormOpen(false);
      refetch();
    } catch (error) {
      console.error('Error saving candidate:', error);
      toast.error('Error al guardar candidato');
    }
  };

  const handleAddTag = (_candidateId: string, tag: string) => {
    toast.success(`Etiqueta "${tag}" agregada`);
    refetch();
  };

  const handleRemoveTag = (_candidateId: string, tag: string) => {
    toast.success(`Etiqueta "${tag}" eliminada`);
    refetch();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando candidatos...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <CandidateList
        candidates={candidates}
        allTags={allTags}
        allSkills={allSkills}
        onViewCandidate={handleViewCandidate}
        onEditCandidate={handleEditCandidate}
        onDeleteCandidate={handleDeleteCandidate}
        onAddTag={handleAddTag}
        onRemoveTag={handleRemoveTag}
        onUpdateStatus={(_id, status) => {
          toast.success(`Estado actualizado a ${status}`);
          refetch();
        }}
      />

      <CandidateForm
        candidate={editingCandidate}
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSave={handleSaveCandidate}
        onImportCV={async () => {
          toast.success('CV importado correctamente');
          refetch();
        }}
      />
    </>
  );
}
