import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';


import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import type { Candidate, CandidateStatus, Experience, Education, Language } from '@/types';
import { getStatusLabel } from '@/lib/utils';
import {
  Save,
  Upload,
  Linkedin,
  User
} from 'lucide-react';

interface CandidateFormProps {
  candidate?: Candidate | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (candidate: Omit<Candidate, 'id' | 'createdAt' | 'updatedAt' | 'changeHistory' | 'notes'>) => void;
  onImportCV?: (file: File, onProgress: (progress: number) => void) => Promise<void>;
}

const statusOptions: CandidateStatus[] = [
  'nuevo', 'en_revision', 'entrevista', 'oferta', 'contratado', 'rechazado', 'archivado'
];

export function CandidateForm({
  candidate,
  isOpen,
  onClose,
  onSave,
  onImportCV
}: CandidateFormProps) {
  const isEditing = !!candidate;
  const [activeTab, setActiveTab] = useState<'manual' | 'cv' | 'linkedin'>('manual');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const [formData, setFormData] = useState<{
    name: string;
    last_name: string;
    fullName: string;
    email: string;
    phone: string;
    location: string;
    linkedin: string;
    status: CandidateStatus;
    english: string;
    openToWork: boolean;
    source: 'cv' | 'linkedin' | 'manual';
    skills: string[];
    languages: Language[];
    experience: Experience[];
    education: Education[];
    tags: string[];
  }>({
    name: '',
    last_name: '',
    fullName: '',
    email: '',
    phone: '',
    location: '',
    linkedin: '',
    status: 'nuevo',
    english: 'intermediate',
    openToWork: false,
    source: 'manual',
    skills: [],
    languages: [],
    experience: [],
    education: [],
    tags: [],
  });

  useEffect(() => {
    if (candidate) {
      setFormData({
        name: candidate.name || '',
        last_name: candidate.last_name || '',
        fullName: candidate.fullName || '',
        email: candidate.email || '',
        phone: candidate.phone || '',
        location: candidate.location || '',
        linkedin: candidate.linkedin || '',
        status: candidate.status || 'nuevo',
        english: 'intermediate',
        openToWork: candidate.openToWork || false,
        source: candidate.source || 'manual',
        skills: candidate.skills ? [...candidate.skills] : [],
        languages: candidate.languages ? [...candidate.languages] : [],
        experience: candidate.experience ? [...candidate.experience] : [],
        education: candidate.education ? [...candidate.education] : [],
        tags: candidate.tags ? [...candidate.tags] : [],
      });
    } else {
      setFormData({
        name: '',
        last_name: '',
        fullName: '',
        email: '',
        phone: '',
        location: '',
        linkedin: '',
        status: 'nuevo',
        english: 'intermediate',
        openToWork: false,
        source: 'manual',
        skills: [],
        languages: [],
        experience: [],
        education: [],
        tags: [],
      });
    }
  }, [candidate, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onImportCV) {
      setIsUploading(true);
      setUploadProgress(0);
      try {
        await onImportCV(file, setUploadProgress);
        onClose();
      } catch (error) {
        console.error('Error uploading CV:', error);
      } finally {
        setIsUploading(false);
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Editar Candidato' : 'Agregar Nuevo Candidato'}
          </DialogTitle>
        </DialogHeader>

        {!isEditing && (
          <div className="flex gap-2 mb-4">
            <Button
              variant={activeTab === 'manual' ? 'default' : 'outline'}
              onClick={() => setActiveTab('manual')}
              className="gap-2"
            >
              <User className="h-4 w-4" />
              Manual
            </Button>
            <Button
              variant={activeTab === 'cv' ? 'default' : 'outline'}
              onClick={() => setActiveTab('cv')}
              className="gap-2"
            >
              <Upload className="h-4 w-4" />
              Cargar CV
            </Button>
            <Button
              variant={activeTab === 'linkedin' ? 'default' : 'outline'}
              onClick={() => setActiveTab('linkedin')}
              className="gap-2"
            >
              <Linkedin className="h-4 w-4" />
              LinkedIn
            </Button>
          </div>
        )}

        {activeTab === 'cv' && !isEditing ? (
          <div className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <Upload className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Cargar archivo CV
              </h3>
              <p className="text-gray-600 mb-4">
                Soporta PDF, DOCX. Máximo 10MB.
              </p>
              <Input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleFileUpload}
                disabled={isUploading}
                className="hidden"
                id="cv-upload"
              />
              <Label htmlFor="cv-upload" className="cursor-pointer">
                <Button disabled={isUploading} asChild>
                  <span>{isUploading ? 'Cargando...' : 'Seleccionar archivo'}</span>
                </Button>
              </Label>
            </div>
            {isUploading && (
              <div className="space-y-2">
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-600 transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <p className="text-sm text-center text-gray-600">{uploadProgress}%</p>
              </div>
            )}
          </div>
        ) : activeTab === 'linkedin' && !isEditing ? (
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <Linkedin className="h-12 w-12 mx-auto mb-4 text-blue-600" />
              <h3 className="text-lg font-medium text-gray-900 mb-2 text-center">
                Importar desde LinkedIn
              </h3>
              <p className="text-gray-600 mb-4 text-center">
                Ingresa la URL del perfil de LinkedIn para importar los datos.
              </p>
              <div className="space-y-4">
                <div>
                  <Label>URL de LinkedIn</Label>
                  <Input
                    placeholder="https://www.linkedin.com/in/..."
                    value={formData.linkedin || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, linkedin: e.target.value }))}
                  />
                </div>
                <Button
                  className="w-full"
                  onClick={() => setActiveTab('manual')}
                  disabled={!formData.linkedin}
                >
                  Continuar
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Información Básica</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Nombre</Label>
                    <Input
                      required
                      value={formData.name || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Juan Pérez"
                    />
                  </div>
                  <div>
                    <Label>Apellido</Label>
                    <Input
                      required
                      value={formData.last_name || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, last_name: e.target.value }))}
                      placeholder="Juan Pérez"
                    />
                  </div>
                  <div>
                    <Label>Email *</Label>
                    <Input
                      required
                      type="email"
                      value={formData.email || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="juan@ejemplo.com"
                    />
                  </div>
                  <div>
                    <Label>Teléfono</Label>
                    <Input
                      value={formData.phone || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="+54 9 11 ..."
                    />
                  </div>
                  <div>
                    <Label>Ubicación</Label>
                    <Input
                      value={formData.location || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                      placeholder="CABA"
                    />
                  </div>
                  <div>
                    <Label>LinkedIn URL</Label>
                    <Input
                      value={formData.linkedin || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, linkedin: e.target.value }))}
                      placeholder="https://linkedin.com/in/..."
                    />
                  </div>
                  <div>
                    <Label>Estado</Label>
                    <Select
                      value={formData.status || 'nuevo'}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, status: value as CandidateStatus }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {statusOptions.map(status => (
                          <SelectItem key={status} value={status}>
                            {getStatusLabel(status)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label>Nivel de Inglés</Label>
                  <Select
                    value={formData.english || 'intermediate'}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, english: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona nivel de inglés" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="basic">Básico</SelectItem>
                      <SelectItem value="intermediate">Intermedio</SelectItem>
                      <SelectItem value="advanced">Avanzado</SelectItem>
                      <SelectItem value="native">Nativo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit" className="gap-2">
                <Save className="h-4 w-4" />
                {isEditing ? 'Guardar Cambios' : 'Crear Candidato'}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
