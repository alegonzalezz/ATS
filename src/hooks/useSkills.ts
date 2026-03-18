import { useState, useEffect, useCallback } from 'react';
import type { Skill } from '@/types';
import { SkillsService } from '@/services/skills.service';

export function useSkills() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load skills from API on mount
  useEffect(() => {
    const loadSkills = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const loadedSkills = await SkillsService.list();
        setSkills(loadedSkills);
      } catch (err) {
        console.error('Error loading skills:', err);
        setError('Failed to load skills');
      } finally {
        setIsLoading(false);
      }
    };

    loadSkills();
  }, []);

  // Search skills with partial matching
  const searchSkills = useCallback(async (searchTerm: string): Promise<Skill[]> => {
    try {
      return await SkillsService.list(searchTerm);
    } catch (err) {
      console.error('Error searching skills:', err);
      return [];
    }
  }, []);

  // Create a new skill
  const createSkill = useCallback(async (name: string): Promise<Skill> => {
    try {
      const newSkill = await SkillsService.create({ name });
      setSkills(prev => [newSkill, ...prev]);
      return newSkill;
    } catch (err) {
      console.error('Error creating skill:', err);
      throw err;
    }
  }, []);

  // Deactivate a skill
  const deactivateSkill = useCallback(async (id: string): Promise<void> => {
    try {
      await SkillsService.deactivate(id);
      setSkills(prev => prev.map(skill =>
        skill.id === id ? { ...skill, deactive_at: new Date().toISOString() } : skill
      ));
    } catch (err) {
      console.error('Error deactivating skill:', err);
      throw err;
    }
  }, []);

  // Reactivate a skill
  const reactivateSkill = useCallback(async (id: string): Promise<void> => {
    try {
      await SkillsService.reactivate(id);
      setSkills(prev => prev.map(skill =>
        skill.id === id ? { ...skill, deactive_at: null } : skill
      ));
    } catch (err) {
      console.error('Error reactivating skill:', err);
      throw err;
    }
  }, []);

  // Get skills for a specific applicant
  const getSkillsForApplicant = useCallback(async (applicantId: string): Promise<Skill[]> => {
    try {
      return await SkillsService.getByApplicantId(applicantId);
    } catch (err) {
      console.error('Error getting skills for applicant:', err);
      return [];
    }
  }, []);

  // Add skill to applicant
  const addSkillToApplicant = useCallback(async (applicantId: string, skillId: string): Promise<void> => {
    try {
      await SkillsService.addSkillToApplicant(applicantId, skillId);
    } catch (err) {
      console.error('Error adding skill to applicant:', err);
      throw err;
    }
  }, []);

  // Remove skill from applicant (deactivate association)
  const removeSkillFromApplicant = useCallback(async (applicantId: string, skillId: string): Promise<void> => {
    try {
      await SkillsService.removeSkillFromApplicant(applicantId, skillId);
    } catch (err) {
      console.error('Error removing skill from applicant:', err);
      throw err;
    }
  }, []);

  // Get active skills only
  const activeSkills = skills.filter(skill => !skill.deactive_at);

  return {
    skills,
    activeSkills,
    isLoading,
    error,
    searchSkills,
    createSkill,
    deactivateSkill,
    reactivateSkill,
    getSkillsForApplicant,
    addSkillToApplicant,
    removeSkillFromApplicant,
  };
}
