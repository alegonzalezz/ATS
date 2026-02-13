import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Edit2, Trash2, Briefcase, Filter, X } from 'lucide-react';
import { JobDescriptionForm } from './JobDescriptionForm';
import { useJobDescriptions } from '@/hooks/useApi';
import { useClients } from '@/hooks/useApi';
import type { 
  JobDescription, 
  CreateJobDescriptionDTO, 
  JobStatus 
} from '@/services/job-description.service';

const statusConfig: Record<JobStatus, { label: string; color: string }> = {
  OPEN: { label: 'Abierta', color: 'bg-green-100 text-green-800 border-green-200' },
  CLOSED: { label: 'Cerrada', color: 'bg-red-100 text-red-800 border-red-200' },
  FILLED: { label: 'Completada', color: 'bg-blue-100 text-blue-800 border-blue-200' }
};

const statusOptions: JobStatus[] = ['OPEN', 'CLOSED', 'FILLED'];

export function JobDescriptions() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<JobDescription | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatuses, setSelectedStatuses] = useState<JobStatus[]>([]);
  
  const { jobs, loading: jobsLoading, fetchJobs, createJob, updateJob, deleteJob } = useJobDescriptions();
  const { clients, loading: clientsLoading, fetchClients } = useClients();

  // Cargar datos al montar el componente
  useEffect(() => {
    fetchJobs();
    fetchClients();
  }, [fetchJobs, fetchClients]);

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = !searchQuery ||
      (job.title?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      (job.description?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      (job.location?.toLowerCase() || '').includes(searchQuery.toLowerCase());

    const matchesStatus = selectedStatuses.length === 0 || selectedStatuses.includes(job.status);

    return matchesSearch && matchesStatus;
  });

  const toggleStatus = (status: JobStatus) => {
    setSelectedStatuses(prev =>
      prev.includes(status)
        ? prev.filter(s => s !== status)
        : [...prev, status]
    );
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedStatuses([]);
  };

  const hasActiveFilters = searchQuery || selectedStatuses.length > 0;

  const getClientName = (clientId: string) => {
    const client = clients.find(c => c.id === clientId);
    return client?.name || 'Cliente desconocido';
  };

  const handleAddNew = () => {
    setEditingJob(null);
    setIsFormOpen(true);
  };

  const handleEdit = (job: JobDescription) => {
    setEditingJob(job);
    setIsFormOpen(true);
  };

  const handleSave = async (data: CreateJobDescriptionDTO) => {
    if (editingJob) {
      await updateJob(editingJob.id, data);
    } else {
      await createJob(data);
    }
    setIsFormOpen(false);
    setEditingJob(null);
  };

  const handleDelete = async (id: string) => {
    if (confirm('¿Estás seguro de que deseas eliminar esta oferta?')) {
      await deleteJob(id);
    }
  };

  const formatSalary = (min?: number, max?: number) => {
    if (!min && !max) return 'No especificado';
    if (min && !max) return `Desde $${min.toLocaleString()}`;
    if (!min && max) return `Hasta $${max.toLocaleString()}`;
    return `$${min?.toLocaleString()} - $${max?.toLocaleString()}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Ofertas de Trabajo</h2>
          <p className="text-gray-600 mt-1">
            {filteredJobs.length} de {jobs.length} ofertas
          </p>
        </div>
        <Button onClick={handleAddNew} className="gap-2">
          <Plus className="h-4 w-4" />
          Nueva Oferta
        </Button>
      </div>

      <Card>
        <CardContent className="p-4 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar por título, descripción o ubicación..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button
              variant="outline"
              onClick={() => setSelectedStatuses(selectedStatuses.length > 0 ? [] : statusOptions)}
              className="gap-2"
            >
              <Filter className="h-4 w-4" />
              Filtros
              {selectedStatuses.length > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {selectedStatuses.length}
                </Badge>
              )}
            </Button>
          </div>

          {/* Status Filters */}
          <div className="flex flex-wrap gap-2">
            {statusOptions.map(status => (
              <button
                key={status}
                onClick={() => toggleStatus(status)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                  selectedStatuses.includes(status)
                    ? statusConfig[status].color
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {statusConfig[status].label}
              </button>
            ))}
          </div>

          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1">
              <X className="h-3 w-3" />
              Limpiar filtros
            </Button>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Briefcase className="h-5 w-5" />
            Lista de Ofertas
          </CardTitle>
        </CardHeader>
        <CardContent>
          {jobsLoading ? (
            <div className="text-center py-8 text-gray-500">
              Cargando ofertas...
            </div>
          ) : filteredJobs.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {hasActiveFilters ? 'No se encontraron ofertas' : 'No hay ofertas registradas'}
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredJobs.map((job) => (
                <div
                  key={job.id}
                  className="py-4 flex items-start justify-between hover:bg-gray-50 px-4 -mx-4 rounded-lg transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h3 className="font-medium text-gray-900">{job.title || 'Sin título'}</h3>
                      <Badge className={statusConfig[job.status].color}>
                        {statusConfig[job.status].label}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{getClientName(job.client_id)}</p>
                    {job.description && (
                      <p className="text-sm text-gray-500 mt-1 line-clamp-2">{job.description}</p>
                    )}
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                      <span>{formatSalary(job.min_salary, job.max_salary)}</span>
                      {job.location && <span>{job.location}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(job)}
                      className="h-8 w-8"
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(job.id)}
                      className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <JobDescriptionForm
        job={editingJob}
        clients={clients}
        clientsLoading={clientsLoading}
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingJob(null);
        }}
        onSave={handleSave}
      />
    </div>
  );
}
