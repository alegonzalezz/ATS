/**
 * Services Index
 * Export all API services
 */

export { apiClient, ApiError } from '@/api/client';
export { API_CONFIG } from '@/api/config';
export type { ApiResponse, ListResponse } from '@/api/types';

export {
  RecruiterService,
  type Recruiter,
  type CreateRecruiterDTO,
  type UpdateRecruiterDTO,
} from './recruiter.service';

export {
  ClientService,
  type Client,
  type CreateClientDTO,
  type UpdateClientDTO,
} from './client.service';

export {
  ApplicantService,
  type Applicant,
  type CreateApplicantDTO,
  type UpdateApplicantDTO,
} from './applicant.service';

export {
  JobDescriptionService,
  type JobDescription,
  type JobStatus,
  type CreateJobDescriptionDTO,
  type UpdateJobDescriptionDTO,
  type JobSearchFilters,
} from './job-description.service';

export {
  ApplicationService,
  type Application,
  type ApplicationWithDetails,
  type ApplicationStatus,
  type CreateApplicationDTO,
  type UpdateApplicationDTO,
  type ApplicationSearchFilters,
} from './application.service';
