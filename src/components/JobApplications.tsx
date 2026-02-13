import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Spinner } from '@/components/ui/spinner';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import {
  Plus,
  Search,
  User,
  Clock,
  MoreVertical,
  Filter,
  Building2,
  MapPin,
  DollarSign,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  ApplicationService,
  type Application,
  type ApplicationStatus,
} from '@/services/application.service';
import { ApplicantService, type Applicant } from '@/services/applicant.service';
import { JobDescriptionService, type JobDescription } from '@/services/job-description.service';
import { ClientService, type Client } from '@/services/client.service';
import { RecruiterService, type Recruiter } from '@/services/recruiter.service';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

interface JobApplicationsProps {
  jobId: string;
  onBack?: () => void;
}

const statusConfig: Record<ApplicationStatus | string, { label: string; color: string }> = {
  INICIADO: { label: 'Iniciado', color: 'bg-gray-100 text-gray-800 border-gray-200' },
  APPLIED: { label: 'Aplicado', color: 'bg-blue-100 text-blue-800 border-blue-200' },
  SCREENING: { label: 'Screening', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
  INTERVIEW: { label: 'Entrevista', color: 'bg-purple-100 text-purple-800 border-purple-200' },
  OFFER: { label: 'Oferta', color: 'bg-orange-100 text-orange-800 border-orange-200' },
  HIRED: { label: 'Contratado', color: 'bg-green-100 text-green-800 border-green-200' },
  REJECTED: { label: 'Rechazado', color: 'bg-red-100 text-red-800 border-red-200' },
};

const getStatusConfig = (status: string | undefined) => {
  return statusConfig[status || ''] || { label: status || 'Desconocido', color: 'bg-gray-100 text-gray-800 border-gray-200' };
};

export function JobApplications({ jobId, onBack }: JobApplicationsProps) {
  const [job, setJob] = useState<JobDescription | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [applicants, setApplicants] = useState<Record<string, Applicant>>({});
  const [recruiters, setRecruiters] = useState<Record<string, Recruiter>>({});
  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<ApplicationStatus | 'all'>('all');

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobId]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [jobData, allApplications, allApplicants, allRecruiters] = await Promise.all([
        JobDescriptionService.getById(jobId),
        ApplicationService.search({ job_id: jobId }),
        ApplicantService.list(),
        RecruiterService.list(),
      ]);

      // Filter applications to ensure they belong to this job
      const filteredApplications = allApplications.filter(app => app.job_description_id === jobId);
      console.log('DEBUG - Job ID:', jobId);
      console.log('DEBUG - Total applications received:', allApplications.length);
      console.log('DEBUG - Filtered for this job:', filteredApplications.length);

      setJob(jobData);
      setApplications(filteredApplications);

      // Create a map of applicants by ID
      const applicantMap: Record<string, Applicant> = {};
      allApplicants.forEach((applicant) => {
        applicantMap[applicant.id] = applicant;
      });
      setApplicants(applicantMap);

      // Create a map of recruiters by ID
      const recruiterMap: Record<string, Recruiter> = {};
      allRecruiters.forEach((recruiter) => {
        recruiterMap[recruiter.id] = recruiter;
      });
      setRecruiters(recruiterMap);

      // Load client info
      if (jobData.client_id) {
        const clientData = await ClientService.getById(jobData.client_id);
        setClient(clientData);
      }
    } catch (error) {
      console.error('Error loading job applications:', error);
      toast.error('Error al cargar las aplicaciones');
    } finally {
      setLoading(false);
    }
  };

  const filteredApplications = applications.filter((app) => {
    const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
    const applicant = applicants[app.applicant_id];
    const matchesSearch =
      !searchQuery ||
      applicant?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      applicant?.last_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      applicant?.email?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const handleUpdateStatus = async (applicationId: number, newStatus: ApplicationStatus) => {
    try {
      await ApplicationService.update(applicationId, { status: newStatus });
      toast.success('Estado actualizado correctamente');
      loadData();
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Error al actualizar el estado');
    }
  };

  const handleAssignRecruiter = async (applicationId: number, recruiterId: string) => {
    try {
      await ApplicationService.assignRecruiter(applicationId, recruiterId);
      toast.success('Recruiter asignado correctamente');
      loadData();
    } catch (error) {
      console.error('Error assigning recruiter:', error);
      toast.error('Error al asignar el recruiter');
    }
  };

  const handleApplicationAdded = () => {
    loadData();
    setShowAddDialog(false);
  };

  const formatSalary = (min?: number, max?: number, currency?: string) => {
    if (!min && !max) return 'No especificado';
    const curr = currency || '$';
    if (min && !max) return `Desde ${curr}${min.toLocaleString()}`;
    if (!min && max) return `Hasta ${curr}${max.toLocaleString()}`;
    return `${curr}${min?.toLocaleString()} - ${curr}${max?.toLocaleString()}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Oferta no encontrada</p>
        {onBack && (
          <Button onClick={onBack} className="mt-4">
            Volver
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{job.title}</h2>
          <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
            <span className="flex items-center gap-1">
              <Building2 className="h-4 w-4" />
              {client?.name || 'Cliente desconocido'}
            </span>
            {job.location && (
              <span className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                {job.location}
              </span>
            )}
            <span className="flex items-center gap-1">
              <DollarSign className="h-4 w-4" />
              {formatSalary(job.min_salary, job.max_salary, job.currency)}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {onBack && (
            <Button variant="outline" onClick={onBack}>
              Volver
            </Button>
          )}
          <Button onClick={() => setShowAddDialog(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Agregar Candidato
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-600">Total Aplicaciones</p>
            <p className="text-2xl font-bold">{applications.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-600">En Proceso</p>
            <p className="text-2xl font-bold">
              {applications.filter((a) => ['INICIADO', 'APPLIED', 'SCREENING', 'INTERVIEW'].includes(a.status)).length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-600">Contratados</p>
            <p className="text-2xl font-bold text-green-600">
              {applications.filter((a) => a.status === 'HIRED').length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-600">Rechazados</p>
            <p className="text-2xl font-bold text-red-600">
              {applications.filter((a) => a.status === 'REJECTED').length}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar candidato..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as ApplicationStatus | 'all')}>
            <SelectTrigger className="w-full sm:w-48">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filtrar por estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los estados</SelectItem>
              {Object.entries(statusConfig).map(([status, config]) => (
                <SelectItem key={status} value={status}>
                  {config.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Applications List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <User className="h-5 w-5" />
            Candidatos ({filteredApplications.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredApplications.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <User className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p>No hay candidatos en esta oferta</p>
              <Button onClick={() => setShowAddDialog(true)} variant="outline" className="mt-4">
                Agregar primer candidato
              </Button>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredApplications.map((application) => {
                const applicant = applicants[application.applicant_id];
                const recruiter = application.recruiter_id ? recruiters[application.recruiter_id] : null;
                return (
                  <ApplicationRow
                    key={application.id}
                    application={application}
                    applicant={applicant}
                    recruiter={recruiter}
                    recruiters={Object.values(recruiters)}
                    onUpdateStatus={(status) => handleUpdateStatus(application.id, status)}
                    onAssignRecruiter={(recruiterId) => handleAssignRecruiter(application.id, recruiterId)}
                  />
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Application Dialog */}
      <AddApplicationDialog
        isOpen={showAddDialog}
        onClose={() => setShowAddDialog(false)}
        jobId={jobId}
        existingApplicantIds={applications.map((a) => a.applicant_id)}
        onSuccess={handleApplicationAdded}
      />
    </div>
  );
}

interface ApplicationRowProps {
  application: Application;
  applicant?: Applicant;
  recruiter?: Recruiter | null;
  recruiters: Recruiter[];
  onUpdateStatus: (status: ApplicationStatus) => void;
  onAssignRecruiter: (recruiterId: string) => void;
}

function ApplicationRow({ application, applicant, recruiter, recruiters, onUpdateStatus, onAssignRecruiter }: ApplicationRowProps) {
  return (
    <div className="py-4 flex items-start justify-between hover:bg-gray-50 px-4 -mx-4 rounded-lg transition-colors">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-medium">
          {applicant?.name?.[0] || applicant?.email?.[0] || '?'}
        </div>
        <div>
          <h4 className="font-medium text-gray-900">
            {applicant?.name} {applicant?.last_name}
          </h4>
          <p className="text-sm text-gray-600">{applicant?.email}</p>
          <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
            <Clock className="h-3 w-3" />
            {application.created_at &&
              format(parseISO(application.created_at), 'dd MMM yyyy', { locale: es })}
          </div>
          {recruiter && (
            <div className="flex items-center gap-1 mt-1 text-xs text-blue-600">
              <span className="font-medium">Recruiter: {recruiter.name}</span>
            </div>
          )}
        </div>
      </div>
      <div className="flex items-center gap-3">
        <Badge className={getStatusConfig(application.status).color}>
          {getStatusConfig(application.status).label}
        </Badge>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem disabled className="text-xs text-gray-500">
              Cambiar estado
            </DropdownMenuItem>
            {Object.entries(statusConfig).map(([status, config]) => (
              <DropdownMenuItem
                key={status}
                onClick={() => onUpdateStatus(status as ApplicationStatus)}
                className={application.status === status ? 'bg-gray-100' : ''}
              >
                <span className={`w-2 h-2 rounded-full mr-2 ${config.color.split(' ')[0]}`} />
                {config.label}
              </DropdownMenuItem>
            ))}
            <DropdownMenuItem disabled className="text-xs text-gray-500 mt-2 border-t pt-2">
              Asignar recruiter
            </DropdownMenuItem>
            {recruiters.map((r) => (
              <DropdownMenuItem
                key={r.id}
                onClick={() => onAssignRecruiter(r.id)}
                className={recruiter?.id === r.id ? 'bg-blue-50' : ''}
              >
                <span className={`w-2 h-2 rounded-full mr-2 ${recruiter?.id === r.id ? 'bg-blue-500' : 'bg-gray-300'}`} />
                {r.name}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

interface AddApplicationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  jobId: string;
  existingApplicantIds: string[];
  onSuccess: () => void;
}

function AddApplicationDialog({
  isOpen,
  onClose,
  jobId,
  existingApplicantIds,
  onSuccess,
}: AddApplicationDialogProps) {
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [addingId, setAddingId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadApplicants();
    }
  }, [isOpen]);

  const loadApplicants = async () => {
    setLoading(true);
    try {
      const data = await ApplicantService.list();
      setApplicants(data);
    } catch (error) {
      console.error('Error loading applicants:', error);
      toast.error('Error al cargar candidatos');
    } finally {
      setLoading(false);
    }
  };

  const filteredApplicants = applicants.filter(
    (applicant) =>
      !existingApplicantIds.includes(applicant.id) &&
      (!searchQuery ||
        applicant.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        applicant.last_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        applicant.email?.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const availableCount = applicants.length - existingApplicantIds.length;

  const handleAdd = async (applicantId: string) => {
    setAddingId(applicantId);
    try {
      await ApplicationService.create({
        applicant_id: applicantId,
        job_description_id: jobId,
        status: 'INICIADO',
      });
      toast.success('Candidato agregado correctamente');
      onSuccess();
    } catch (error) {
      console.error('Error adding applicant:', error);
      toast.error('Error al agregar el candidato');
    } finally {
      setAddingId(null);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Agregar Candidato a la Oferta</DialogTitle>
          <DialogDescription>Selecciona un candidato para agregarlo a esta oferta de trabajo</DialogDescription>
        </DialogHeader>

        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar candidato por nombre o email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <ScrollArea className="flex-1 -mx-6 px-6">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Spinner className="h-6 w-6" />
            </div>
          ) : filteredApplicants.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <User className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p>No se encontraron candidatos disponibles</p>
              <p className="text-sm mt-1">
                {availableCount === 0 
                  ? "Todos los candidatos ya están en esta oferta" 
                  : `Hay ${availableCount} candidatos disponibles que no coinciden con la búsqueda`}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredApplicants.map((applicant) => (
                <div
                  key={applicant.id}
                  className="flex items-center justify-between p-3 rounded-lg border hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-medium">
                      {applicant.name?.[0] || applicant.email?.[0] || '?'}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {applicant.name} {applicant.last_name}
                      </p>
                      <p className="text-sm text-gray-600">{applicant.email}</p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => handleAdd(applicant.id)}
                    disabled={addingId === applicant.id}
                  >
                    {addingId === applicant.id ? (
                      <Spinner className="h-4 w-4" />
                    ) : (
                      <>
                        <Plus className="h-4 w-4 mr-1" />
                        Agregar
                      </>
                    )}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        <div className="flex justify-end pt-4 border-t mt-4">
          <Button variant="outline" onClick={onClose}>
            Cerrar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
