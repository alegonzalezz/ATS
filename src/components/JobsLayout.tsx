import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Spinner } from '@/components/ui/spinner';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Briefcase,
  Search,
  Building2,
  MapPin,
  Plus,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { JobApplications } from './JobApplications';
import { JobDescriptionService, type JobDescription } from '@/services/job-description.service';
import { ClientService, type Client } from '@/services/client.service';
import { toast } from 'sonner';

const statusConfig: Record<string, { label: string; color: string }> = {
  OPEN: { label: 'Abierta', color: 'bg-green-100 text-green-800 border-green-200' },
  CLOSED: { label: 'Cerrada', color: 'bg-red-100 text-red-800 border-red-200' },
  FILLED: { label: 'Completada', color: 'bg-blue-100 text-blue-800 border-blue-200' },
};

export function JobsLayout() {
  const [jobs, setJobs] = useState<JobDescription[]>([]);
  const [clients, setClients] = useState<Record<string, Client>>({});
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [jobsData, clientsData] = await Promise.all([
        JobDescriptionService.list(),
        ClientService.list(),
      ]);

      // Sort jobs: OPEN first, then by created_at
      const sortedJobs = jobsData.sort((a, b) => {
        if (a.status === 'OPEN' && b.status !== 'OPEN') return -1;
        if (a.status !== 'OPEN' && b.status === 'OPEN') return 1;
        return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
      });

      setJobs(sortedJobs);

      // Create clients map
      const clientMap: Record<string, Client> = {};
      clientsData.forEach((client) => {
        clientMap[client.id] = client;
      });
      setClients(clientMap);

      // Select first open job by default if none selected
      if (!selectedJobId && sortedJobs.length > 0) {
        const firstOpen = sortedJobs.find((j) => j.status === 'OPEN');
        setSelectedJobId(firstOpen?.id || sortedJobs[0].id);
      }
    } catch (error) {
      console.error('Error loading jobs:', error);
      toast.error('Error al cargar las ofertas');
    } finally {
      setLoading(false);
    }
  };

  const filteredJobs = jobs.filter(
    (job) =>
      !searchQuery ||
      job.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      clients[job.client_id]?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex h-[calc(100vh-4rem)] -m-6">
      {/* Left Sidebar - Job List */}
      <div className="w-80 border-r border-gray-200 bg-white flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <h2 className="font-semibold text-gray-900 flex items-center gap-2 mb-3">
            <Briefcase className="h-5 w-5" />
            Ofertas de Trabajo
          </h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar oferta..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9"
            />
          </div>
        </div>

        {/* Job List */}
        <ScrollArea className="flex-1">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Spinner className="h-6 w-6" />
            </div>
          ) : filteredJobs.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              <Briefcase className="h-8 w-8 mx-auto mb-2 text-gray-300" />
              <p className="text-sm">No se encontraron ofertas</p>
            </div>
          ) : (
            <div className="p-2 space-y-1">
              {filteredJobs.map((job) => {
                const client = clients[job.client_id];
                const isSelected = selectedJobId === job.id;
                return (
                  <button
                    key={job.id}
                    onClick={() => setSelectedJobId(job.id)}
                    className={cn(
                      'w-full text-left p-3 rounded-lg transition-all',
                      isSelected
                        ? 'bg-blue-50 border border-blue-200'
                        : 'hover:bg-gray-50 border border-transparent'
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-gray-900 truncate">
                          {job.title}
                        </p>
                        <p className="text-xs text-gray-600 flex items-center gap-1 mt-0.5">
                          <Building2 className="h-3 w-3" />
                          <span className="truncate">{client?.name || 'Sin cliente'}</span>
                        </p>
                        {job.location && (
                          <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                            <MapPin className="h-3 w-3" />
                            <span className="truncate">{job.location}</span>
                          </p>
                        )}
                      </div>
                      <Badge
                        variant="outline"
                        className={cn(
                          'text-xs shrink-0',
                          statusConfig[job.status].color
                        )}
                      >
                        {statusConfig[job.status].label}
                      </Badge>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </ScrollArea>

        {/* Footer */}
        <div className="p-3 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            {jobs.filter((j) => j.status === 'OPEN').length} de {jobs.length} abiertas
          </p>
        </div>
      </div>

      {/* Main Content - Applications */}
      <div className="flex-1 overflow-auto bg-gray-50">
        {selectedJobId ? (
          <div className="p-6">
            <JobApplications
              jobId={selectedJobId}
              onBack={undefined}
            />
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <Card className="max-w-md mx-4">
              <CardContent className="p-8 text-center">
                <Briefcase className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Selecciona una oferta
                </h3>
                <p className="text-gray-600 mb-4">
                  Elige una oferta de trabajo del panel izquierdo para ver sus aplicaciones
                </p>
                <Button onClick={() => {}} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Crear Nueva Oferta
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
