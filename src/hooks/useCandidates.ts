import { useState, useEffect, useCallback } from 'react';
import type { Candidate, SearchFilters, DashboardStats, ChangeRecord } from '@/types';
import { generateId, extractTextFromPDF } from '@/lib/utils';
import { subDays, isAfter, parseISO } from 'date-fns';
import { ApplicantService } from '@/services/applicant.service';

const STORAGE_KEY = 'talenttrack_candidates';

// Function to map Applicant (API) to Candidate (UI)
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
}): Candidate {
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
    skills: [],
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
  };
}

// Helper function to map English level
function mapEnglishLevel(level: string): 'Básico' | 'Intermedio' | 'Avanzado' | 'Nativo' {
  const levelMap: Record<string, 'Básico' | 'Intermedio' | 'Avanzado' | 'Nativo'> = {
    'basic': 'Básico',
    'intermediate': 'Intermedio',
    'advanced': 'Avanzado',
    'native': 'Nativo',
  };
  return levelMap[level?.toLowerCase()] || 'Básico';
}

const defaultFilters: SearchFilters = {
  query: '',
  status: [],
  skills: [],
  location: '',
  experience: 'any',
  openToWork: null,
  tags: [],
  source: [],
};

export function useCandidates() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [filters, setFilters] = useState<SearchFilters>(defaultFilters);
  const [isLoading, setIsLoading] = useState(true);

  // Load candidates from API on mount
  useEffect(() => {
    const loadCandidates = async () => {
      try {
        setIsLoading(true);
        const applicants = await ApplicantService.list();
        const mappedCandidates = applicants.map(mapApplicantToCandidate);
        setCandidates(mappedCandidates);
      } catch (error) {
        console.error('Error loading candidates from API:', error);
        // Fallback to localStorage
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            setCandidates(parsed);
          } catch (e) {
            console.error('Error parsing candidates from localStorage:', e);
          }
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadCandidates();
  }, []);

  // Save candidates to localStorage whenever they change
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(candidates));
    }
  }, [candidates, isLoading]);

  const addCandidate = useCallback(async (candidateData: Omit<Candidate, 'id' | 'createdAt' | 'updatedAt' | 'changeHistory' | 'notes'>) => {
    try {
      // Map Candidate (UI) to Applicant (API) format
      console.log("_addCandidate_ candidateData")
      console.log(candidateData)
      const applicantData = {
        name: candidateData.name,
        last_name: candidateData.last_name,
        email: candidateData.email,
        phone: candidateData.phone,
        linkedin: candidateData.linkedin,
        city: candidateData.location,
        english: (candidateData as any).englishLevel || 'intermediate',
      };


      console.log("_____________ addCandidate")
      console.log(applicantData)
      console.log("_____________")

      // Create applicant in backend
      const createdApplicant = await ApplicantService.create(applicantData);

      // Map response back to Candidate format
      const newCandidate = mapApplicantToCandidate(createdApplicant);

      // Update local state
      setCandidates(prev => [newCandidate, ...prev]);

      return newCandidate;
    } catch (error) {
      console.error('Error creating candidate in API:', error);

      // Fallback: create locally only
      const newCandidate: Candidate = {
        ...candidateData,
        id: generateId(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        changeHistory: [],
        notes: [],
      };
      setCandidates(prev => [newCandidate, ...prev]);
      return newCandidate;
    }
  }, []);

  const updateCandidate = useCallback((id: string, updates: Partial<Candidate>) => {
    setCandidates(prev => prev.map(candidate => {
      if (candidate.id === id) {
        const updated = {
          ...candidate,
          ...updates,
          updatedAt: new Date().toISOString()
        };

        // Track significant changes
        if (updates.currentRole && updates.currentRole !== candidate.currentRole) {
          const changeRecord: ChangeRecord = {
            id: generateId(),
            date: new Date().toISOString(),
            type: 'job_change',
            description: `Cambio de puesto: ${candidate.currentRole || 'N/A'} → ${updates.currentRole}`,
            oldValue: candidate.currentRole,
            newValue: updates.currentRole,
          };
          updated.changeHistory = [changeRecord, ...candidate.changeHistory];
        }

        if (updates.currentCompany && updates.currentCompany !== candidate.currentCompany) {
          const changeRecord: ChangeRecord = {
            id: generateId(),
            date: new Date().toISOString(),
            type: 'job_change',
            description: `Cambio de empresa: ${candidate.currentCompany || 'N/A'} → ${updates.currentCompany}`,
            oldValue: candidate.currentCompany,
            newValue: updates.currentCompany,
          };
          updated.changeHistory = [changeRecord, ...candidate.changeHistory];
        }

        if (updates.openToWork !== undefined && updates.openToWork !== candidate.openToWork) {
          const changeRecord: ChangeRecord = {
            id: generateId(),
            date: new Date().toISOString(),
            type: 'open_to_work',
            description: updates.openToWork ? 'Ahora está abierto a nuevas oportunidades' : 'Ya no está buscando activamente',
            oldValue: String(candidate.openToWork),
            newValue: String(updates.openToWork),
          };
          updated.changeHistory = [changeRecord, ...candidate.changeHistory];
        }

        return updated;
      }
      return candidate;
    }));
  }, []);

  const deleteCandidate = useCallback((id: string) => {
    setCandidates(prev => prev.filter(c => c.id !== id));
  }, []);

  const addNote = useCallback((candidateId: string, content: string, createdBy: string = 'Usuario') => {
    setCandidates(prev => prev.map(candidate => {
      if (candidate.id === candidateId) {
        return {
          ...candidate,
          notes: [
            {
              id: generateId(),
              content,
              createdAt: new Date().toISOString(),
              createdBy,
            },
            ...candidate.notes,
          ],
          updatedAt: new Date().toISOString(),
        };
      }
      return candidate;
    }));
  }, []);

  const addTag = useCallback((candidateId: string, tag: string) => {
    setCandidates(prev => prev.map(candidate => {
      if (candidate.id === candidateId && !candidate.tags.includes(tag)) {
        return {
          ...candidate,
          tags: [...candidate.tags, tag],
          updatedAt: new Date().toISOString(),
        };
      }
      return candidate;
    }));
  }, []);

  const removeTag = useCallback((candidateId: string, tag: string) => {
    setCandidates(prev => prev.map(candidate => {
      if (candidate.id === candidateId) {
        return {
          ...candidate,
          tags: candidate.tags.filter(t => t !== tag),
          updatedAt: new Date().toISOString(),
        };
      }
      return candidate;
    }));
  }, []);

  const filteredCandidates = candidates.filter(candidate => {
    // Text search
    if (filters.query) {
      const query = filters.query.toLowerCase();
      const matchesQuery =
        candidate.fullName.toLowerCase().includes(query) ||
        candidate.email.toLowerCase().includes(query) ||
        candidate.currentRole?.toLowerCase().includes(query) ||
        candidate.currentCompany?.toLowerCase().includes(query) ||
        candidate.skills.some(s => s.toLowerCase().includes(query));
      if (!matchesQuery) return false;
    }

    // Status filter
    if (filters.status.length > 0 && !filters.status.includes(candidate.status)) {
      return false;
    }

    // Skills filter
    if (filters.skills.length > 0) {
      const hasAllSkills = filters.skills.every(skill =>
        candidate.skills.some(s => s.toLowerCase() === skill.toLowerCase())
      );
      if (!hasAllSkills) return false;
    }

    // Location filter
    if (filters.location && !candidate.location?.toLowerCase().includes(filters.location.toLowerCase())) {
      return false;
    }

    // Experience filter
    if (filters.experience !== 'any') {
      const years = calculateTotalExperience(candidate.experience);
      const [min, max] = filters.experience.split('-').map(Number);
      if (max) {
        if (years < min || years > max) return false;
      } else {
        if (years < min) return false;
      }
    }

    // Open to work filter
    if (filters.openToWork !== null && candidate.openToWork !== filters.openToWork) {
      return false;
    }

    // Tags filter
    if (filters.tags.length > 0) {
      const hasAllTags = filters.tags.every(tag => candidate.tags.includes(tag));
      if (!hasAllTags) return false;
    }

    // Source filter
    if (filters.source.length > 0 && !filters.source.includes(candidate.source)) {
      return false;
    }

    return true;
  });

  const getStats = useCallback((): DashboardStats => {
    const now = new Date();
    const weekAgo = subDays(now, 7);
    const monthAgo = subDays(now, 30);

    const byStatus: Record<string, number> = {
      nuevo: 0,
      en_revision: 0,
      entrevista: 0,
      oferta: 0,
      contratado: 0,
      rechazado: 0,
      archivado: 0,
    };

    const bySource: Record<string, number> = {
      cv: 0,
      linkedin: 0,
      manual: 0,
    };

    const skillCounts: Record<string, number> = {};
    let recentChanges = 0;

    candidates.forEach(candidate => {
      byStatus[candidate.status]++;
      bySource[candidate.source]++;

      candidate.skills.forEach(skill => {
        skillCounts[skill] = (skillCounts[skill] || 0) + 1;
      });

      candidate.changeHistory.forEach(change => {
        if (isAfter(parseISO(change.date), weekAgo)) {
          recentChanges++;
        }
      });
    });

    const topSkills = Object.entries(skillCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return {
      totalCandidates: candidates.length,
      newThisWeek: candidates.filter(c => isAfter(parseISO(c.createdAt), weekAgo)).length,
      newThisMonth: candidates.filter(c => isAfter(parseISO(c.createdAt), monthAgo)).length,
      openToWorkCount: candidates.filter(c => c.openToWork).length,
      byStatus: byStatus as Record<'nuevo' | 'en_revision' | 'entrevista' | 'oferta' | 'contratado' | 'rechazado' | 'archivado', number>,
      bySource,
      topSkills,
      recentChanges,
    };
  }, [candidates]);

  const getAllTags = useCallback(() => {
    const tagsSet = new Set<string>();
    candidates.forEach(c => c.tags.forEach(t => tagsSet.add(t)));
    return Array.from(tagsSet).sort();
  }, [candidates]);

  const getAllSkills = useCallback(() => {
    const skillsSet = new Set<string>();
    candidates.forEach(c => c.skills.forEach(s => skillsSet.add(s)));
    return Array.from(skillsSet).sort();
  }, [candidates]);

  const importFromCV = useCallback(async (file: File, onProgress?: (progress: number) => void) => {
    onProgress?.(10);

    try {
      let cvContent = '';

      if (file.type === 'application/pdf') {
        cvContent = await extractTextFromPDF(file);
      } else {
        // For other file types, we'd need additional parsers
        cvContent = `Contenido de ${file.name}`;
      }

      onProgress?.(50);

      // Parse CV content to extract information
      const parsedInfo = parseCVContent(cvContent);

      onProgress?.(80);

      const candidate = addCandidate({
        name: parsedInfo.name || '',
        last_name: parsedInfo.last_name || '',
        fullName: '',
        email: parsedInfo.email || '',
        phone: parsedInfo.phone,
        location: parsedInfo.location,
        currentRole: parsedInfo.currentRole,
        currentCompany: parsedInfo.currentCompany,
        experience: parsedInfo.experience || [],
        education: parsedInfo.education || [],
        skills: parsedInfo.skills || [],
        languages: [],
        summary: parsedInfo.summary,
        status: 'nuevo',
        tags: [],
        source: 'cv',
        cvFileName: file.name,
        cvContent,
        openToWork: false,
      });

      onProgress?.(100);
      return candidate;
    } catch (error) {
      console.error('Error importing CV:', error);
      throw error;
    }
  }, [addCandidate]);

  const simulateLinkedInSync = useCallback(async (candidateId: string) => {
    // Simulate fetching updated data from LinkedIn
    const candidate = candidates.find(c => c.id === candidateId);
    if (!candidate) return;

    // Simulate random changes (in real app, this would call LinkedIn API)
    const updates: Partial<Candidate> = {
      lastLinkedInSync: new Date().toISOString(),
    };

    // Randomly update some fields to simulate changes
    if (Math.random() > 0.7) {
      updates.openToWork = !candidate.openToWork;
    }

    updateCandidate(candidateId, updates);
    return updates;
  }, [candidates, updateCandidate]);

  const bulkSyncLinkedIn = useCallback(async (onProgress?: (current: number, total: number) => void) => {
    const candidatesWithLinkedIn = candidates.filter(c => c.linkedin);

    for (let i = 0; i < candidatesWithLinkedIn.length; i++) {
      await simulateLinkedInSync(candidatesWithLinkedIn[i].id);
      onProgress?.(i + 1, candidatesWithLinkedIn.length);
      // Add small delay to simulate API calls
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }, [candidates, simulateLinkedInSync]);

  return {
    candidates,
    filteredCandidates,
    filters,
    setFilters,
    isLoading,
    addCandidate,
    updateCandidate,
    deleteCandidate,
    addNote,
    addTag,
    removeTag,
    getStats,
    getAllTags,
    getAllSkills,
    importFromCV,
    simulateLinkedInSync,
    bulkSyncLinkedIn,
    resetFilters: () => setFilters(defaultFilters),
  };
}

function calculateTotalExperience(experiences: Candidate['experience']): number {
  let totalMonths = 0;

  experiences.forEach(exp => {
    const start = parseISO(exp.startDate);
    const end = exp.current ? new Date() : (exp.endDate ? parseISO(exp.endDate) : new Date());
    const months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
    totalMonths += Math.max(0, months);
  });

  return Math.floor(totalMonths / 12);
}

function parseCVContent(content: string) {
  const result: Partial<Candidate> = {
    skills: [],
    experience: [],
    education: [],
  };

  // Try to extract email
  const emailMatch = content.match(/[\w.-]+@[\w.-]+\.\w+/);
  if (emailMatch) result.email = emailMatch[0];

  // Try to extract phone
  const phoneMatch = content.match(/[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}/);
  if (phoneMatch) result.phone = phoneMatch[0];

  // Extract skills (common tech skills)
  const commonSkills = [
    'JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'C#', 'Go', 'Rust',
    'React', 'Vue', 'Angular', 'Node.js', 'Express', 'Django', 'Flask',
    'SQL', 'PostgreSQL', 'MongoDB', 'Redis', 'Elasticsearch',
    'AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'Terraform',
    'Git', 'CI/CD', 'Jenkins', 'GitHub Actions',
    'Machine Learning', 'AI', 'Data Science', 'TensorFlow', 'PyTorch',
    'Agile', 'Scrum', 'Kanban', 'Jira',
  ];

  commonSkills.forEach(skill => {
    const regex = new RegExp(`\\b${skill}\\b`, 'i');
    if (regex.test(content)) {
      result.skills!.push(skill);
    }
  });

  return result as Partial<Candidate>;
}
