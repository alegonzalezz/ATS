import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Save, Briefcase } from 'lucide-react';
import type { 
  JobDescription, 
  CreateJobDescriptionDTO, 
  JobStatus 
} from '@/services/job-description.service';
import type { Client } from '@/services/client.service';

interface JobDescriptionFormProps {
  job?: JobDescription | null;
  clients: Client[];
  clientsLoading?: boolean;
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: CreateJobDescriptionDTO) => void;
}

const statusOptions: { value: JobStatus; label: string }[] = [
  { value: 'OPEN', label: 'Abierta' },
  { value: 'CLOSED', label: 'Cerrada' },
  { value: 'FILLED', label: 'Completada' }
];

function getInitialFormData(job?: JobDescription | null): CreateJobDescriptionDTO {
  if (job) {
    return {
      title: job.title || '',
      description: job.description || '',
      client_id: job.client_id || '',
      min_salary: job.min_salary,
      max_salary: job.max_salary,
      currency: job.currency || 'USD',
      location: job.location || '',
      status: job.status || 'OPEN'
    };
  }
  return {
    title: '',
    description: '',
    client_id: '',
    currency: 'USD',
    status: 'OPEN'
  };
}

export function JobDescriptionForm({
  job,
  clients,
  clientsLoading,
  isOpen,
  onClose,
  onSave
}: JobDescriptionFormProps) {
  const isEditing = !!job;
  const [clientSearch, setClientSearch] = useState('');

  const [formData, setFormData] = useState<CreateJobDescriptionDTO>(() => 
    getInitialFormData(job)
  );

  const filteredClients = clients.filter(client =>
    (client.name?.toLowerCase() || '').includes(clientSearch.toLowerCase()) ||
    (client.description?.toLowerCase() || '').includes(clientSearch.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5" />
            {isEditing ? 'Editar Oferta' : 'Nueva Oferta'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">
              Título <span className="text-red-500">*</span>
            </Label>
            <Input
              id="title"
              required
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Ej: Senior Python Developer"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="client_id">
              Cliente <span className="text-red-500">*</span>
            </Label>
            {clientsLoading ? (
              <div className="text-sm text-gray-500 bg-gray-50 p-3 rounded-md flex items-center gap-2">
                <div className="animate-spin h-4 w-4 border-2 border-gray-400 border-t-transparent rounded-full"></div>
                Cargando clientes...
              </div>
            ) : clients.length === 0 ? (
              <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
                No hay clientes disponibles. <a href="#/clients" className="underline">Crea un cliente primero</a>.
              </div>
            ) : (
              <Select
                value={formData.client_id}
                onValueChange={(value) => setFormData(prev => ({ ...prev, client_id: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un cliente" />
                </SelectTrigger>
                <SelectContent className="max-h-[300px]">
                  <div className="p-2 sticky top-0 bg-white border-b">
                    <Input
                      placeholder="Buscar cliente..."
                      value={clientSearch}
                      onChange={(e) => setClientSearch(e.target.value)}
                      className="h-8 text-sm"
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                  <div className="max-h-[200px] overflow-y-auto">
                    {filteredClients.length === 0 ? (
                      <div className="px-2 py-3 text-sm text-gray-500 text-center">
                        No se encontraron clientes
                      </div>
                    ) : (
                      filteredClients.map((client) => (
                        <SelectItem key={client.id} value={client.id}>
                          {client.name}
                        </SelectItem>
                      ))
                    )}
                  </div>
                </SelectContent>
              </Select>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              value={formData.description || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Descripción de la posición..."
              rows={4}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="min_salary">Salario Mínimo</Label>
              <Input
                id="min_salary"
                type="number"
                value={formData.min_salary || ''}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  min_salary: e.target.value ? Number(e.target.value) : undefined 
                }))}
                placeholder="50000"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="max_salary">Salario Máximo</Label>
              <Input
                id="max_salary"
                type="number"
                value={formData.max_salary || ''}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  max_salary: e.target.value ? Number(e.target.value) : undefined 
                }))}
                placeholder="80000"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Estado</Label>
            <Select
              value={formData.status || 'OPEN'}
              onValueChange={(value) => setFormData(prev => ({ 
                ...prev, 
                status: value as JobStatus 
              }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Ubicación</Label>
            <Input
              id="location"
              value={formData.location || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
              placeholder="Ej: Remote, Buenos Aires"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" className="gap-2">
              <Save className="h-4 w-4" />
              {isEditing ? 'Guardar Cambios' : 'Crear Oferta'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
