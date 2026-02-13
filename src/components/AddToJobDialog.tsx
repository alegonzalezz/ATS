import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Spinner } from '@/components/ui/spinner';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import {
  Briefcase,
  Plus,
  Check,
  Building2,
  MapPin,
  DollarSign,
  Loader2,
} from 'lucide-react';
import {
  ApplicationService,
  type Application,
  type ApplicationStatus,
} from '@/services/application.service';
import { JobDescriptionService, type JobDescription } from '@/services/job-description.service';
import { ClientService, type Client } from '@/services/client.service';

interface AddToJobDialogProps {
  isOpen: boolean;
  onClose: () => void;
  applicantId: string;
  applicantName: string;
}

const statusConfig: Record<ApplicationStatus, { label: string; color: string }> = {
  INICIADO: { label: 'Iniciado', color: 'bg-gray-100 text-gray-800 border-gray-200' },
  APPLIED: { label: 'Aplicado', color: 'bg-blue-100 text-blue-800 border-blue-200' },
  SCREENING: { label: 'Screening', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
  INTERVIEW: { label: 'Entrevista', color: 'bg-purple-100 text-purple-800 border-purple-200' },
  OFFER: { label: 'Oferta', color: 'bg-orange-100 text-orange-800 border-orange-200' },
  HIRED: { label: 'Contratado', color: 'bg-green-100 text-green-800 border-green-200' },
  REJECTED: { label: 'Rechazado', color: 'bg-red-100 text-red-800 border-red-200' },
};

const jobStatusConfig: Record<string, { label: string; color: string }> = {
  OPEN: { label: 'Abierta', color: 'bg-green-100 text-green-800 border-green-200' },
  CLOSED: { label: 'Cerrada', color: 'bg-red-100 text-red-800 border-red-200' },
  FILLED: { label: 'Completada', color: 'bg-blue-100 text-blue-800 border-blue-200' },
};

export function AddToJobDialog({
  isOpen,
  onClose,
  applicantId,
  applicantName,
}: AddToJobDialogProps) {
  const [jobs, setJobs] = useState<JobDescription[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [existingApplications, setExistingApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingJobs, setLoadingJobs] = useState(false);
  const [addingJobId, setAddingJobId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, applicantId]);

  const loadData = async () => {
    setLoading(true);
    setLoadingJobs(true);
    try {
      const [jobsData, clientsData, applicationsData] = await Promise.all([
        JobDescriptionService.list(),
        ClientService.list(),
        ApplicationService.search({ applicant_id: applicantId }),
      ]);
      setJobs(jobsData.filter((job) => job.status === 'OPEN'));
      setClients(clientsData);
      setExistingApplications(applicationsData);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Error al cargar los datos');
    } finally {
      setLoading(false);
      setLoadingJobs(false);
    }
  };

  const getClientName = (clientId: string) => {
    const client = clients.find((c) => c.id === clientId);
    return client?.name || 'Cliente desconocido';
  };

  const isAlreadyApplied = (jobId: string) => {
    return existingApplications.some((app) => app.job_description_id === jobId);
  };

  const getApplicationForJob = (jobId: string) => {
    return existingApplications.find((app) => app.job_description_id === jobId);
  };

  const handleAddToJob = async (jobId: string) => {
    setAddingJobId(jobId);
    try {
      await ApplicationService.create({
        applicant_id: applicantId,
        job_description_id: jobId,
        status: 'INICIADO',
      });
      toast.success('Candidato agregado a la oferta correctamente');
      // Refresh applications list
      const applicationsData = await ApplicationService.search({ applicant_id: applicantId });
      setExistingApplications(applicationsData);
    } catch (error) {
      console.error('Error adding to job:', error);
      toast.error('Error al agregar el candidato a la oferta');
    } finally {
      setAddingJobId(null);
    }
  };

  const formatSalary = (min?: number, max?: number, currency?: string) => {
    if (!min && !max) return 'No especificado';
    const curr = currency || '$';
    if (min && !max) return `Desde ${curr}${min.toLocaleString()}`;
    if (!min && max) return `Hasta ${curr}${max.toLocaleString()}`;
    return `${curr}${min?.toLocaleString()} - ${curr}${max?.toLocaleString()}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5" />
            Agregar a Oferta de Trabajo
          </DialogTitle>
          <DialogDescription>
            Selecciona una oferta para agregar a <strong>{applicantName}</strong>
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Spinner className="h-8 w-8" />
          </div>
        ) : (
          <ScrollArea className="flex-1 -mx-6 px-6">
            <div className="space-y-6 py-4">
              {/* Existing Applications Section */}
              {existingApplications.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-3">
                    Aplicaciones existentes
                  </h3>
                  <div className="space-y-2">
                    {existingApplications.map((app) => {
                      const job = jobs.find((j) => j.id === app.job_description_id);
                      if (!job) return null;
                      return (
                        <Card key={app.id} className="bg-gray-50 border-gray-200">
                          <CardContent className="p-3 flex items-center justify-between">
                            <div>
                              <p className="font-medium text-sm">{job.title}</p>
                              <p className="text-xs text-gray-500">
                                {getClientName(job.client_id)}
                              </p>
                            </div>
                            <Badge className={statusConfig[app.status].color}>
                              {statusConfig[app.status].label}
                            </Badge>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Available Jobs Section */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3">
                  Ofertas disponibles
                </h3>
                {loadingJobs ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                  </div>
                ) : jobs.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
                    <Briefcase className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                    <p>No hay ofertas abiertas disponibles</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {jobs.map((job) => {
                      const alreadyApplied = isAlreadyApplied(job.id);
                      const application = getApplicationForJob(job.id);
                      return (
                        <Card
                          key={job.id}
                          className={`transition-all ${
                            alreadyApplied
                              ? 'bg-gray-50 border-gray-200'
                              : 'hover:shadow-md'
                          }`}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap mb-1">
                                  <h4 className="font-medium text-gray-900">
                                    {job.title}
                                  </h4>
                                  <Badge
                                    className={jobStatusConfig[job.status].color}
                                    variant="outline"
                                  >
                                    {jobStatusConfig[job.status].label}
                                  </Badge>
                                  {alreadyApplied && (
                                    <Badge
                                      className="bg-blue-100 text-blue-800 border-blue-200"
                                      variant="outline"
                                    >
                                      <Check className="h-3 w-3 mr-1" />
                                      Agregado
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-sm text-gray-600 flex items-center gap-1 mb-1">
                                  <Building2 className="h-3.5 w-3.5" />
                                  {getClientName(job.client_id)}
                                </p>
                                <div className="flex items-center gap-4 text-sm text-gray-500">
                                  <span className="flex items-center gap-1">
                                    <DollarSign className="h-3.5 w-3.5" />
                                    {formatSalary(
                                      job.min_salary,
                                      job.max_salary,
                                      job.currency
                                    )}
                                  </span>
                                  {job.location && (
                                    <span className="flex items-center gap-1">
                                      <MapPin className="h-3.5 w-3.5" />
                                      {job.location}
                                    </span>
                                  )}
                                </div>
                                {alreadyApplied && application && (
                                  <p className="text-xs text-gray-500 mt-2">
                                    Estado:{' '}
                                    <span
                                      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                                        statusConfig[application.status].color
                                      }`}
                                    >
                                      {statusConfig[application.status].label}
                                    </span>
                                  </p>
                                )}
                              </div>
                              {!alreadyApplied && (
                                <Button
                                  size="sm"
                                  onClick={() => handleAddToJob(job.id)}
                                  disabled={addingJobId === job.id}
                                  className="shrink-0"
                                >
                                  {addingJobId === job.id ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <>
                                      <Plus className="h-4 w-4 mr-1" />
                                      Agregar
                                    </>
                                  )}
                                </Button>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </ScrollArea>
        )}

        <div className="flex justify-end pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Cerrar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
