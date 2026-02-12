/**
 * Example hook showing how to use API services
 * This demonstrates usage patterns for all services
 */

import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import {
  RecruiterService,
  ClientService,
  ApplicantService,
  JobDescriptionService,
  ApplicationService,
  type Recruiter,
  type Client,
  type Applicant,
  type JobDescription,
  type Application,
  ApiError,
} from '@/services';

/**
 * Hook for managing recruiters
 */
export function useRecruiters() {
  const [recruiters, setRecruiters] = useState<Recruiter[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRecruiters = useCallback(async (includeInactive = false) => {
    setLoading(true);
    setError(null);
    try {
      const data = await RecruiterService.list(includeInactive);
      setRecruiters(data);
      return data;
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Error loading recruiters';
      setError(message);
      toast.error(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const createRecruiter = useCallback(async (name: string, description?: string) => {
    try {
      const recruiter = await RecruiterService.create({ name, description });
      setRecruiters((prev) => [...prev, recruiter]);
      toast.success('Reclutador creado correctamente');
      return recruiter;
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Error creating recruiter';
      toast.error(message);
      throw err;
    }
  }, []);

  const updateRecruiter = useCallback(async (id: string, data: Partial<Recruiter>) => {
    try {
      const recruiter = await RecruiterService.update(id, data);
      setRecruiters((prev) =>
        prev.map((r) => (r.id === id ? recruiter : r))
      );
      toast.success('Reclutador actualizado correctamente');
      return recruiter;
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Error updating recruiter';
      toast.error(message);
      throw err;
    }
  }, []);

  const deleteRecruiter = useCallback(async (id: string) => {
    try {
      await RecruiterService.delete(id);
      setRecruiters((prev) => prev.filter((r) => r.id !== id));
      toast.success('Reclutador eliminado correctamente');
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Error deleting recruiter';
      toast.error(message);
      throw err;
    }
  }, []);

  return {
    recruiters,
    loading,
    error,
    fetchRecruiters,
    createRecruiter,
    updateRecruiter,
    deleteRecruiter,
  };
}

/**
 * Hook for managing clients
 */
export function useClients() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchClients = useCallback(async (includeInactive = false) => {
    setLoading(true);
    setError(null);
    try {
      const data = await ClientService.list(includeInactive);
      setClients(data);
      return data;
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Error loading clients';
      setError(message);
      toast.error(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const createClient = useCallback(async (name: string, description?: string) => {
    try {
      const client = await ClientService.create({ name, description });
      setClients((prev) => [...prev, client]);
      toast.success('Cliente creado correctamente');
      return client;
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Error creating client';
      toast.error(message);
      throw err;
    }
  }, []);

  return {
    clients,
    loading,
    error,
    fetchClients,
    createClient,
  };
}

/**
 * Hook for managing applicants
 */
export function useApplicants() {
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchApplicants = useCallback(async () => {
    setLoading(true);
    try {
      const data = await ApplicantService.list();
      setApplicants(data);
      return data;
    } finally {
      setLoading(false);
    }
  }, []);

  const searchApplicants = useCallback(async (query: string) => {
    setLoading(true);
    try {
      const data = await ApplicantService.search({ name: query });
      setApplicants(data);
      return data;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    applicants,
    loading,
    fetchApplicants,
    searchApplicants,
  };
}

/**
 * Hook for managing job descriptions
 */
export function useJobDescriptions() {
  const [jobs, setJobs] = useState<JobDescription[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    try {
      const data = await JobDescriptionService.list();
      setJobs(data);
      return data;
    } finally {
      setLoading(false);
    }
  }, []);

  const createJob = useCallback(async (job: Parameters<typeof JobDescriptionService.create>[0]) => {
    try {
      const newJob = await JobDescriptionService.create(job);
      setJobs((prev) => [...prev, newJob]);
      toast.success('Oferta creada correctamente');
      return newJob;
    } catch (err) {
      toast.error('Error al crear la oferta');
      throw err;
    }
  }, []);

  return {
    jobs,
    loading,
    fetchJobs,
    createJob,
  };
}

/**
 * Hook for managing applications
 */
export function useApplications() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchApplications = useCallback(async () => {
    setLoading(true);
    try {
      const data = await ApplicationService.list();
      setApplications(data);
      return data;
    } finally {
      setLoading(false);
    }
  }, []);

  const createApplication = useCallback(async (
    applicantId: string,
    jobId: string,
    notes?: string
  ) => {
    try {
      const application = await ApplicationService.create({
        applicant_id: applicantId,
        job_description_id: jobId,
        notes,
      });
      setApplications((prev) => [...prev, application]);
      toast.success('Aplicación creada correctamente');
      return application;
    } catch (err) {
      toast.error('Error al crear la aplicación');
      throw err;
    }
  }, []);

  const updateStatus = useCallback(async (id: string, status: Application['status']) => {
    try {
      const updated = await ApplicationService.update(id, { status });
      setApplications((prev) =>
        prev.map((app) => (app.id === id ? updated : app))
      );
      toast.success('Estado actualizado');
      return updated;
    } catch (err) {
      toast.error('Error al actualizar el estado');
      throw err;
    }
  }, []);

  return {
    applications,
    loading,
    fetchApplications,
    createApplication,
    updateStatus,
  };
}
