import { useState, useEffect, useCallback } from 'react';
import type { Candidate } from '@/types';
import { ApplicantService } from '@/services/applicant.service';
import { SkillsService } from '@/services/skills.service';
import { useSkills } from '@/hooks/useSkills';

const STORAGE_KEY = 'talenttrack_candidates_list';

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

export function useCandidateList() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { activeSkills } = useSkills();

  const fetchCandidates = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const applicants = await ApplicantService.list();
      
      const applicantsWithSkills = await Promise.all(
        applicants.map(async (applicant) => {
          try {
            const skills = await SkillsService.getByApplicantId(applicant.id);
            return {
              ...applicant,
              skills: skills.map(s => s.name),
            };
          } catch (err) {
            console.error(`Error loading skills for applicant ${applicant.id}:`, err);
            return {
              ...applicant,
              skills: [],
            };
          }
        })
      );

      const mappedCandidates = applicantsWithSkills.map(mapApplicantToCandidate);
      setCandidates(mappedCandidates);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(mappedCandidates));
    } catch (err) {
      console.error('Error fetching candidates:', err);
      setError(err instanceof Error ? err : new Error('Unknown error'));
      
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        try {
          setCandidates(JSON.parse(stored));
        } catch (e) {
          console.error('Error parsing stored candidates:', e);
        }
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCandidates();
  }, [fetchCandidates]);

  const getAllTags = useCallback(() => {
    const tagsSet = new Set<string>();
    candidates.forEach(c => c.tags.forEach(t => tagsSet.add(t)));
    return Array.from(tagsSet).sort();
  }, [candidates]);

  const getAllSkills = useCallback(() => {
    const skillsSet = new Set<string>();
    activeSkills.forEach(skill => skillsSet.add(skill.name));
    return Array.from(skillsSet).sort();
  }, [activeSkills]);

  return {
    candidates,
    isLoading,
    error,
    refetch: fetchCandidates,
    getAllTags,
    getAllSkills,
  };
}
