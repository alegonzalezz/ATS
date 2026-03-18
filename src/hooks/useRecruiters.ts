import { useState, useEffect, useCallback } from 'react';
import { RecruiterService, type Recruiter } from '@/services/recruiter.service';

const STORAGE_KEY = 'talenttrack_current_recruiter_id';

export function useRecruiters() {
  const [recruiters, setRecruiters] = useState<Recruiter[]>([]);
  const [currentRecruiterId, setCurrentRecruiterId] = useState<string | null>(() => {
    return localStorage.getItem(STORAGE_KEY);
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadRecruiters = async () => {
      try {
        setIsLoading(true);
        const data = await RecruiterService.list(false);
        const activeRecruiters = data.filter(r => r.is_active !== false);
        setRecruiters(activeRecruiters);
        
        if (!currentRecruiterId && activeRecruiters.length > 0) {
          setCurrentRecruiterId(activeRecruiters[0].id);
        } else if (currentRecruiterId && !activeRecruiters.some(r => r.id === currentRecruiterId)) {
          setCurrentRecruiterId(activeRecruiters[0]?.id || null);
        }
      } catch (error) {
        console.error('Error loading recruiters:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadRecruiters();
  }, []);

  useEffect(() => {
    if (currentRecruiterId) {
      localStorage.setItem(STORAGE_KEY, currentRecruiterId);
    }
  }, [currentRecruiterId]);

  const selectRecruiter = useCallback((id: string) => {
    setCurrentRecruiterId(id);
  }, []);

  const currentRecruiter = recruiters.find(r => r.id === currentRecruiterId) || null;

  return {
    recruiters,
    currentRecruiter,
    currentRecruiterId,
    selectRecruiter,
    isLoading,
  };
}
