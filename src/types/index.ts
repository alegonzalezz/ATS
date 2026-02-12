export interface Candidate {
  id: string;
  name: string;
  last_name: string;
  fullName: string;
  email: string;
  phone?: string;
  location?: string;
  linkedin?: string;
  currentRole?: string;
  currentCompany?: string;
  experience: Experience[];
  education: Education[];
  skills: string[];
  languages: Language[];
  summary?: string;
  status: CandidateStatus;
  tags: string[];
  source: 'cv' | 'linkedin' | 'manual';
  cvFileName?: string;
  cvContent?: string;
  profileImage?: string;
  openToWork: boolean;
  createdAt: string;
  updatedAt: string;
  lastLinkedInSync?: string;
  changeHistory: ChangeRecord[];
  notes: Note[];
}

export interface Experience {
  id: string;
  title: string;
  company: string;
  location?: string;
  startDate: string;
  endDate?: string;
  current: boolean;
  description?: string;
}

export interface Education {
  id: string;
  institution: string;
  degree: string;
  field?: string;
  startDate: string;
  endDate?: string;
}

export interface Language {
  name: string;
  level: 'Básico' | 'Intermedio' | 'Avanzado' | 'Nativo';
}

export type CandidateStatus =
  | 'nuevo'
  | 'en_revision'
  | 'entrevista'
  | 'oferta'
  | 'contratado'
  | 'rechazado'
  | 'archivado';

export interface ChangeRecord {
  id: string;
  date: string;
  type: 'job_change' | 'status_update' | 'profile_update' | 'open_to_work' | 'other';
  description: string;
  oldValue?: string;
  newValue?: string;
}

export interface Note {
  id: string;
  content: string;
  createdAt: string;
  createdBy: string;
}

export interface SearchFilters {
  query: string;
  status: CandidateStatus[];
  skills: string[];
  location: string;
  experience: 'any' | '0-2' | '2-5' | '5-10' | '10+';
  openToWork: boolean | null;
  tags: string[];
  source: ('cv' | 'linkedin' | 'manual')[];
}

export interface DashboardStats {
  totalCandidates: number;
  newThisWeek: number;
  newThisMonth: number;
  openToWorkCount: number;
  byStatus: Record<CandidateStatus, number>;
  bySource: Record<string, number>;
  topSkills: { name: string; count: number }[];
  recentChanges: number;
}

export interface LinkedInSyncConfig {
  enabled: boolean;
  frequency: 'weekly' | 'monthly';
  lastSync: string | null;
  nextSync: string | null;
}
