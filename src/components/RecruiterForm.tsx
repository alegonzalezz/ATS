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
import { Save, User } from 'lucide-react';
import type { Recruiter, CreateRecruiterDTO } from '@/services/recruiter.service';

interface RecruiterFormProps {
  recruiter?: Recruiter | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: CreateRecruiterDTO) => void;
}

function getInitialFormData(recruiter?: Recruiter | null): CreateRecruiterDTO {
  if (recruiter) {
    return {
      name: recruiter.name || '',
      description: recruiter.description || ''
    };
  }
  return {
    name: '',
    description: ''
  };
}

export function RecruiterForm({
  recruiter,
  isOpen,
  onClose,
  onSave
}: RecruiterFormProps) {
  const isEditing = !!recruiter;

  const [formData, setFormData] = useState<CreateRecruiterDTO>(() => 
    getInitialFormData(recruiter)
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            {isEditing ? 'Editar Reclutador' : 'Nuevo Reclutador'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">
              Nombre <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              required
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Ej: Juan Pérez"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              value={formData.description || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Descripción del reclutador..."
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" className="gap-2">
              <Save className="h-4 w-4" />
              {isEditing ? 'Guardar Cambios' : 'Crear Reclutador'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
