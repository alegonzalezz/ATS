import { useState, useEffect, useCallback } from 'react';
import type { Candidate } from '@/types';
import { ApplicantService } from '@/services/applicant.service';
import { SkillsService } from '@/services/skills.service';
import { CommentService } from '@/services/comment.service';
import { useSkills } from '@/hooks/useSkills';

function mapApplicantToCandidate(applicant: {
  id: string;
  name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  linkedin?: string;
  city?: string;
  english?: string;
  created_at?: string;
  updated_at?: string;
  deactive_at?: string | null;
  comments?: Array<{
    id: string;
    recruiter_id: string;
    comment: string;
    created_at: string;
    recruiter?: { id: string; name: string } | null;
  }>;
  skills?: string[];
}): Candidate {
  const mappedComments = (applicant.comments || []).map(c => ({
    id: c.id,
    recruiter_id: c.recruiter_id,
    comment: c.comment,
    created_at: c.created_at,
    recruiter: c.recruiter ? {
      id: c.recruiter.id,
      name: c.recruiter.name,
    } : { id: c.recruiter_id, name: 'Reclutador' },
  }));

  return {
    id: applicant.id,
    name: applicant.name || '',
    last_name: applicant.last_name || '',
    fullName: '',
    email: applicant.email || '',
    phone: applicant.phone,
    location: applicant.city,
    linkedin: applicant.linkedin,
    currentRole: undefined,
    currentCompany: undefined,
    experience: [],
    education: [],
    skills: applicant.skills || [],
    languages: applicant.english ? [{ name: 'Inglés', level: mapEnglishLevel(applicant.english) }] : [],
    summary: undefined,
    status: applicant.deactive_at ? 'archivado' : 'nuevo',
    tags: [],
    source: 'manual',
    cvFileName: undefined,
    cvContent: undefined,
    profileImage: undefined,
    openToWork: !applicant.deactive_at,
    createdAt: applicant.created_at || new Date().toISOString(),
    updatedAt: applicant.updated_at || new Date().toISOString(),
    lastLinkedInSync: undefined,
    changeHistory: [],
    notes: [],
    comments: mappedComments,
  };
}

function mapEnglishLevel(level: string): 'Básico' | 'Intermedio' | 'Avanzado' | 'Nativo' {
  const levelMap: Record<string, 'Básico' | 'Intermedio' | 'Avanzado' | 'Nativo'> = {
    'basic': 'Básico',
    'intermediate': 'Intermedio',
    'advanced': 'Avanzado',
    'native': 'Nativo',
  };
  return levelMap[level?.toLowerCase()] || 'Básico';
}

export function useCandidate(candidateId: string | undefined) {
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { activeSkills } = useSkills();

  const fetchCandidate = useCallback(async () => {
    if (!candidateId) {
      setCandidate(null);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      const applicant = await ApplicantService.getById(candidateId);
      
      let skills: string[] = [];
      try {
        const applicantSkills = await SkillsService.getByApplicantId(candidateId);
        skills = applicantSkills.map(s => s.name);
      } catch (err) {
        console.error('Error loading skills:', err);
      }

      const mappedCandidate = mapApplicantToCandidate({
        ...applicant,
        skills,
      });
      
      setCandidate(mappedCandidate);
    } catch (err) {
      console.error('Error fetching candidate:', err);
      setError(err instanceof Error ? err : new Error('Unknown error'));
      setCandidate(null);
    } finally {
      setIsLoading(false);
    }
  }, [candidateId]);

  useEffect(() => {
    fetchCandidate();
  }, [fetchCandidate]);

  const addNote = useCallback((content: string, createdBy: string = 'Usuario') => {
    if (!candidate) return;
    
    setCandidate(prev => prev ? {
      ...prev,
      notes: [
        {
          id: crypto.randomUUID(),
          content,
          createdAt: new Date().toISOString(),
          createdBy,
        },
        ...prev.notes,
      ],
      updatedAt: new Date().toISOString(),
    } : null);
  }, [candidate]);

  const addComment = useCallback(async (content: string, recruiterId: string, recruiterName: string) => {
    if (!candidate) return null;

    try {
      const newComment = await CommentService.create({
        applicant_id: candidate.id,
        recruiter_id: recruiterId,
        comment: content,
      });

      setCandidate(prev => prev ? {
        ...prev,
        comments: [{
          id: newComment.id,
          recruiter_id: newComment.recruiter_id,
          comment: newComment.comment,
          created_at: newComment.created_at,
          recruiter: { id: recruiterId, name: recruiterName },
        }, ...prev.comments],
        updatedAt: new Date().toISOString(),
      } : null);

      return newComment;
    } catch (err) {
      console.error('Error creating comment:', err);
      return null;
    }
  }, [candidate]);

  const updateComment = useCallback(async (commentId: string, content: string) => {
    if (!candidate) return;

    try {
      await CommentService.update(commentId, { comment: content });

      setCandidate(prev => prev ? {
        ...prev,
        comments: prev.comments.map(c =>
          c.id === commentId ? { ...c, comment: content } : c
        ),
        updatedAt: new Date().toISOString(),
      } : null);
    } catch (err) {
      console.error('Error updating comment:', err);
    }
  }, [candidate]);

  const deleteComment = useCallback(async (commentId: string) => {
    if (!candidate) return;

    try {
      await CommentService.delete(commentId);
    } catch (err) {
      console.error('Error deleting comment:', err);
    }

    setCandidate(prev => prev ? {
      ...prev,
      comments: prev.comments.filter(c => c.id !== commentId),
      updatedAt: new Date().toISOString(),
    } : null);
  }, [candidate]);

  const updateSkills = useCallback(async (skills: string[]) => {
    if (!candidate) return;

    setCandidate(prev => prev ? {
      ...prev,
      skills,
      updatedAt: new Date().toISOString(),
    } : null);
  }, [candidate]);

  const simulateLinkedInSync = useCallback(async () => {
    if (!candidate) return;

    setCandidate(prev => prev ? {
      ...prev,
      lastLinkedInSync: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } : null);
  }, [candidate]);

  return {
    candidate,
    isLoading,
    error,
    refetch: fetchCandidate,
    addNote,
    addComment,
    updateComment,
    deleteComment,
    updateSkills,
    simulateLinkedInSync,
    availableSkills: activeSkills.map(s => s.name).sort(),
  };
}
