import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
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
import { generateId, getStatusLabel } from '@/lib/utils';
import { 
  Plus, 
  X, 
  Briefcase, 
  GraduationCap, 
  Languages,
  Trash2,
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

const languageLevels = ['Básico', 'Intermedio', 'Avanzado', 'Nativo'] as const;

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
    fullName: string;
    email: string;
    phone: string;
    location: string;
    linkedinUrl: string;
    currentRole: string;
    currentCompany: string;
    summary: string;
    status: CandidateStatus;
    openToWork: boolean;
    source: 'cv' | 'linkedin' | 'manual';
    skills: string[];
    languages: Language[];
    experience: Experience[];
    education: Education[];
    tags: string[];
  }>({
    fullName: '',
    email: '',
    phone: '',
    location: '',
    linkedinUrl: '',
    currentRole: '',
    currentCompany: '',
    summary: '',
    status: 'nuevo',
    openToWork: false,
    source: 'manual',
    skills: [],
    languages: [],
    experience: [],
    education: [],
    tags: [],
  });

  const [newSkill, setNewSkill] = useState('');
  const [newTag, setNewTag] = useState('');

  useEffect(() => {
    if (candidate) {
      setFormData({
        fullName: candidate.fullName,
        email: candidate.email,
        phone: candidate.phone || '',
        location: candidate.location || '',
        linkedinUrl: candidate.linkedinUrl || '',
        currentRole: candidate.currentRole || '',
        currentCompany: candidate.currentCompany || '',
        summary: candidate.summary || '',
        status: candidate.status,
        openToWork: candidate.openToWork,
        source: candidate.source,
        skills: [...candidate.skills],
        languages: [...candidate.languages],
        experience: [...candidate.experience],
        education: [...candidate.education],
        tags: [...candidate.tags],
      });
    } else {
      setFormData({
        fullName: '',
        email: '',
        phone: '',
        location: '',
        linkedinUrl: '',
        currentRole: '',
        currentCompany: '',
        summary: '',
        status: 'nuevo',
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

  const addSkill = () => {
    if (newSkill.trim() && !formData.skills.includes(newSkill.trim())) {
      setFormData(prev => ({ ...prev, skills: [...prev.skills, newSkill.trim()] }));
      setNewSkill('');
    }
  };

  const removeSkill = (skill: string) => {
    setFormData(prev => ({ ...prev, skills: prev.skills.filter(s => s !== skill) }));
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({ ...prev, tags: [...prev.tags, newTag.trim()] }));
      setNewTag('');
    }
  };

  const removeTag = (tag: string) => {
    setFormData(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tag) }));
  };

  const addExperience = () => {
    const newExp: Experience = {
      id: generateId(),
      title: '',
      company: '',
      startDate: '',
      current: false,
    };
    setFormData(prev => ({ ...prev, experience: [...prev.experience, newExp] }));
  };

  const updateExperience = (id: string, updates: Partial<Experience>) => {
    setFormData(prev => ({
      ...prev,
      experience: prev.experience.map(exp => exp.id === id ? { ...exp, ...updates } : exp)
    }));
  };

  const removeExperience = (id: string) => {
    setFormData(prev => ({
      ...prev,
      experience: prev.experience.filter(exp => exp.id !== id)
    }));
  };

  const addEducation = () => {
    const newEdu: Education = {
      id: generateId(),
      institution: '',
      degree: '',
      startDate: '',
    };
    setFormData(prev => ({ ...prev, education: [...prev.education, newEdu] }));
  };

  const updateEducation = (id: string, updates: Partial<Education>) => {
    setFormData(prev => ({
      ...prev,
      education: prev.education.map(edu => edu.id === id ? { ...edu, ...updates } : edu)
    }));
  };

  const removeEducation = (id: string) => {
    setFormData(prev => ({
      ...prev,
      education: prev.education.filter(edu => edu.id !== id)
    }));
  };

  const addLanguage = () => {
    setFormData(prev => ({
      ...prev,
      languages: [...prev.languages, { name: '', level: 'Intermedio' }]
    }));
  };

  const updateLanguage = (index: number, updates: Partial<Language>) => {
    setFormData(prev => ({
      ...prev,
      languages: prev.languages.map((lang, i) => i === index ? { ...lang, ...updates } : lang)
    }));
  };

  const removeLanguage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      languages: prev.languages.filter((_, i) => i !== index)
    }));
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
                    value={formData.linkedinUrl}
                    onChange={(e) => setFormData(prev => ({ ...prev, linkedinUrl: e.target.value }))}
                  />
                </div>
                <Button 
                  className="w-full"
                  onClick={() => setActiveTab('manual')}
                  disabled={!formData.linkedinUrl}
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
                    <Label>Nombre Completo *</Label>
                    <Input
                      required
                      value={formData.fullName}
                      onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                      placeholder="Juan Pérez"
                    />
                  </div>
                  <div>
                    <Label>Email *</Label>
                    <Input
                      required
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="juan@ejemplo.com"
                    />
                  </div>
                  <div>
                    <Label>Teléfono</Label>
                    <Input
                      value={formData.phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="+1 234 567 890"
                    />
                  </div>
                  <div>
                    <Label>Ubicación</Label>
                    <Input
                      value={formData.location}
                      onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                      placeholder="Ciudad, País"
                    />
                  </div>
                  <div>
                    <Label>LinkedIn URL</Label>
                    <Input
                      value={formData.linkedinUrl}
                      onChange={(e) => setFormData(prev => ({ ...prev, linkedinUrl: e.target.value }))}
                      placeholder="https://linkedin.com/in/..."
                    />
                  </div>
                  <div>
                    <Label>Estado</Label>
                    <Select
                      value={formData.status}
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Puesto Actual</Label>
                    <Input
                      value={formData.currentRole}
                      onChange={(e) => setFormData(prev => ({ ...prev, currentRole: e.target.value }))}
                      placeholder="Senior Developer"
                    />
                  </div>
                  <div>
                    <Label>Empresa Actual</Label>
                    <Input
                      value={formData.currentCompany}
                      onChange={(e) => setFormData(prev => ({ ...prev, currentCompany: e.target.value }))}
                      placeholder="Empresa S.A."
                    />
                  </div>
                </div>

                <div>
                  <Label>Resumen / Bio</Label>
                  <Textarea
                    value={formData.summary}
                    onChange={(e) => setFormData(prev => ({ ...prev, summary: e.target.value }))}
                    placeholder="Breve descripción del candidato..."
                    rows={3}
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="openToWork"
                    checked={formData.openToWork}
                    onChange={(e) => setFormData(prev => ({ ...prev, openToWork: e.target.checked }))}
                    className="w-4 h-4 rounded border-gray-300"
                  />
                  <Label htmlFor="openToWork" className="mb-0">
                    Open to Work (Abierto a nuevas oportunidades)
                  </Label>
                </div>
              </CardContent>
            </Card>

            {/* Skills */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Skills</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2 mb-4">
                  <Input
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    placeholder="Agregar skill..."
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                  />
                  <Button type="button" onClick={addSkill} variant="outline">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.skills.map(skill => (
                    <Badge key={skill} variant="secondary" className="gap-1">
                      {skill}
                      <X 
                        className="h-3 w-3 cursor-pointer" 
                        onClick={() => removeSkill(skill)}
                      />
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Experience */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <Briefcase className="h-4 w-4" />
                  Experiencia Laboral
                </CardTitle>
                <Button type="button" onClick={addExperience} variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-1" />
                  Agregar
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {formData.experience.map((exp, index) => (
                  <div key={exp.id} className="p-4 border rounded-lg space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Experiencia #{index + 1}</span>
                      <Button 
                        type="button" 
                        onClick={() => removeExperience(exp.id)}
                        variant="ghost" 
                        size="sm"
                        className="text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <Input
                        placeholder="Puesto"
                        value={exp.title}
                        onChange={(e) => updateExperience(exp.id, { title: e.target.value })}
                      />
                      <Input
                        placeholder="Empresa"
                        value={exp.company}
                        onChange={(e) => updateExperience(exp.id, { company: e.target.value })}
                      />
                      <Input
                        type="date"
                        placeholder="Fecha inicio"
                        value={exp.startDate}
                        onChange={(e) => updateExperience(exp.id, { startDate: e.target.value })}
                      />
                      <div className="flex items-center gap-2">
                        <Input
                          type="date"
                          placeholder="Fecha fin"
                          value={exp.endDate || ''}
                          onChange={(e) => updateExperience(exp.id, { endDate: e.target.value })}
                          disabled={exp.current}
                        />
                        <label className="flex items-center gap-1 whitespace-nowrap">
                          <input
                            type="checkbox"
                            checked={exp.current}
                            onChange={(e) => updateExperience(exp.id, { current: e.target.checked })}
                          />
                          Actual
                        </label>
                      </div>
                    </div>
                    <Textarea
                      placeholder="Descripción"
                      value={exp.description || ''}
                      onChange={(e) => updateExperience(exp.id, { description: e.target.value })}
                      rows={2}
                    />
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Education */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <GraduationCap className="h-4 w-4" />
                  Educación
                </CardTitle>
                <Button type="button" onClick={addEducation} variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-1" />
                  Agregar
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {formData.education.map((edu, index) => (
                  <div key={edu.id} className="p-4 border rounded-lg space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Educación #{index + 1}</span>
                      <Button 
                        type="button" 
                        onClick={() => removeEducation(edu.id)}
                        variant="ghost" 
                        size="sm"
                        className="text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <Input
                        placeholder="Institución"
                        value={edu.institution}
                        onChange={(e) => updateEducation(edu.id, { institution: e.target.value })}
                      />
                      <Input
                        placeholder="Título/Grado"
                        value={edu.degree}
                        onChange={(e) => updateEducation(edu.id, { degree: e.target.value })}
                      />
                      <Input
                        placeholder="Campo de estudio"
                        value={edu.field || ''}
                        onChange={(e) => updateEducation(edu.id, { field: e.target.value })}
                      />
                      <div className="flex gap-2">
                        <Input
                          type="date"
                          placeholder="Inicio"
                          value={edu.startDate}
                          onChange={(e) => updateEducation(edu.id, { startDate: e.target.value })}
                        />
                        <Input
                          type="date"
                          placeholder="Fin"
                          value={edu.endDate || ''}
                          onChange={(e) => updateEducation(edu.id, { endDate: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Languages */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <Languages className="h-4 w-4" />
                  Idiomas
                </CardTitle>
                <Button type="button" onClick={addLanguage} variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-1" />
                  Agregar
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {formData.languages.map((lang, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        placeholder="Idioma"
                        value={lang.name}
                        onChange={(e) => updateLanguage(index, { name: e.target.value })}
                      />
                      <Select
                        value={lang.level}
                        onValueChange={(value) => updateLanguage(index, { level: value as Language['level'] })}
                      >
                        <SelectTrigger className="w-40">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {languageLevels.map(level => (
                            <SelectItem key={level} value={level}>{level}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button 
                        type="button" 
                        onClick={() => removeLanguage(index)}
                        variant="ghost"
                        className="text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Tags */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Etiquetas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2 mb-4">
                  <Input
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="Agregar etiqueta..."
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  />
                  <Button type="button" onClick={addTag} variant="outline">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map(tag => (
                    <Badge key={tag} variant="outline" className="gap-1 bg-blue-50">
                      {tag}
                      <X 
                        className="h-3 w-3 cursor-pointer" 
                        onClick={() => removeTag(tag)}
                      />
                    </Badge>
                  ))}
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
