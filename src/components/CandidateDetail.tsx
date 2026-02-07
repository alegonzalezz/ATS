import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import type { Candidate, ChangeRecord } from '@/types';
import { 
  ArrowLeft, 
  Edit3, 
  Linkedin, 
  Mail, 
  Phone, 
  MapPin, 
  Briefcase,
  GraduationCap,
  Languages,
  Tag,
  Clock,
  Plus,
  MessageSquare,
  History,
  FileText,
  CheckCircle2
} from 'lucide-react';
import { 
  getStatusColor, 
  getStatusLabel, 
  getInitials,
  formatDate 
} from '@/lib/utils';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

interface CandidateDetailProps {
  candidate: Candidate;
  onBack: () => void;
  onEdit: () => void;
  onAddNote: (content: string) => void;
  onSyncLinkedIn: () => void;
}

export function CandidateDetail({ 
  candidate, 
  onBack, 
  onEdit, 
  onAddNote,
  onSyncLinkedIn 
}: CandidateDetailProps) {
  const [newNote, setNewNote] = useState('');
  const [activeTab, setActiveTab] = useState('profile');

  const handleAddNote = () => {
    if (newNote.trim()) {
      onAddNote(newNote.trim());
      setNewNote('');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Perfil del Candidato</h2>
            <p className="text-gray-600">{candidate.fullName}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {candidate.linkedinUrl && (
            <Button variant="outline" onClick={onSyncLinkedIn} className="gap-2">
              <Linkedin className="h-4 w-4" />
              Sincronizar LinkedIn
            </Button>
          )}
          <Button onClick={onEdit} className="gap-2">
            <Edit3 className="h-4 w-4" />
            Editar
          </Button>
        </div>
      </div>

      {/* Profile Header Card */}
      <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
              {getInitials(candidate.fullName)}
            </div>
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <h1 className="text-2xl font-bold text-gray-900">{candidate.fullName}</h1>
                <Badge variant="outline" className={getStatusColor(candidate.status)}>
                  {getStatusLabel(candidate.status)}
                </Badge>
                {candidate.openToWork && (
                  <Badge className="bg-green-100 text-green-800 border-green-200">
                    Open to Work
                  </Badge>
                )}
              </div>
              <p className="text-lg text-gray-700 mb-3">
                {candidate.currentRole || 'Sin puesto actual'} 
                {candidate.currentCompany && ` @ ${candidate.currentCompany}`}
              </p>
              <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Mail className="h-4 w-4" />
                  {candidate.email}
                </div>
                {candidate.phone && (
                  <div className="flex items-center gap-1">
                    <Phone className="h-4 w-4" />
                    {candidate.phone}
                  </div>
                )}
                {candidate.location && (
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {candidate.location}
                  </div>
                )}
              </div>
            </div>
            {candidate.linkedinUrl && (
              <a 
                href={candidate.linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Linkedin className="h-5 w-5" />
                Ver LinkedIn
              </a>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-flex">
          <TabsTrigger value="profile" className="gap-2">
            <Briefcase className="h-4 w-4" />
            <span className="hidden sm:inline">Perfil</span>
          </TabsTrigger>
          <TabsTrigger value="experience" className="gap-2">
            <Clock className="h-4 w-4" />
            <span className="hidden sm:inline">Experiencia</span>
          </TabsTrigger>
          <TabsTrigger value="notes" className="gap-2">
            <MessageSquare className="h-4 w-4" />
            <span className="hidden sm:inline">Notas</span>
            {candidate.notes.length > 0 && (
              <Badge variant="secondary" className="ml-1">{candidate.notes.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="history" className="gap-2">
            <History className="h-4 w-4" />
            <span className="hidden sm:inline">Historial</span>
            {candidate.changeHistory.length > 0 && (
              <Badge variant="secondary" className="ml-1">{candidate.changeHistory.length}</Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Summary */}
            {candidate.summary && (
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <FileText className="h-4 w-4 text-blue-600" />
                    Resumen
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 whitespace-pre-wrap">{candidate.summary}</p>
                </CardContent>
              </Card>
            )}

            {/* Skills */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <CheckCircle2 className="h-4 w-4 text-blue-600" />
                  Skills
                </CardTitle>
              </CardHeader>
              <CardContent>
                {candidate.skills.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {candidate.skills.map(skill => (
                      <Badge key={skill} variant="secondary">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No hay skills registrados</p>
                )}
              </CardContent>
            </Card>

            {/* Languages */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Languages className="h-4 w-4 text-blue-600" />
                  Idiomas
                </CardTitle>
              </CardHeader>
              <CardContent>
                {candidate.languages.length > 0 ? (
                  <div className="space-y-2">
                    {candidate.languages.map((lang, idx) => (
                      <div key={idx} className="flex items-center justify-between">
                        <span className="text-gray-700">{lang.name}</span>
                        <Badge variant="outline">{lang.level}</Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No hay idiomas registrados</p>
                )}
              </CardContent>
            </Card>

            {/* Tags */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Tag className="h-4 w-4 text-blue-600" />
                  Etiquetas
                </CardTitle>
              </CardHeader>
              <CardContent>
                {candidate.tags.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {candidate.tags.map(tag => (
                      <Badge 
                        key={tag}
                        variant="outline"
                        className="bg-blue-50 text-blue-700 border-blue-200"
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">Sin etiquetas</p>
                )}
              </CardContent>
            </Card>

            {/* CV Info */}
            {candidate.cvFileName && (
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <FileText className="h-4 w-4 text-blue-600" />
                    Documento CV
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <FileText className="h-8 w-8 text-gray-400" />
                    <div>
                      <p className="font-medium text-gray-900">{candidate.cvFileName}</p>
                      <p className="text-sm text-gray-500">Archivo cargado</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Experience Tab */}
        <TabsContent value="experience" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Work Experience */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5 text-blue-600" />
                  Experiencia Laboral
                </CardTitle>
              </CardHeader>
              <CardContent>
                {candidate.experience.length > 0 ? (
                  <div className="space-y-6">
                    {candidate.experience.map(exp => (
                      <div key={exp.id} className="border-l-2 border-blue-200 pl-4">
                        <h4 className="font-semibold text-gray-900">{exp.title}</h4>
                        <p className="text-gray-700">{exp.company}</p>
                        <p className="text-sm text-gray-500">
                          {formatDate(exp.startDate)} - {exp.current ? 'Presente' : formatDate(exp.endDate)}
                          {exp.location && ` · ${exp.location}`}
                        </p>
                        {exp.description && (
                          <p className="text-gray-600 mt-2 text-sm">{exp.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No hay experiencia registrada</p>
                )}
              </CardContent>
            </Card>

            {/* Education */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GraduationCap className="h-5 w-5 text-blue-600" />
                  Educación
                </CardTitle>
              </CardHeader>
              <CardContent>
                {candidate.education.length > 0 ? (
                  <div className="space-y-6">
                    {candidate.education.map(edu => (
                      <div key={edu.id} className="border-l-2 border-green-200 pl-4">
                        <h4 className="font-semibold text-gray-900">{edu.degree}</h4>
                        <p className="text-gray-700">{edu.institution}</p>
                        {edu.field && <p className="text-gray-600 text-sm">{edu.field}</p>}
                        <p className="text-sm text-gray-500">
                          {formatDate(edu.startDate)} - {formatDate(edu.endDate)}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No hay educación registrada</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Notes Tab */}
        <TabsContent value="notes" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-blue-600" />
                Notas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Textarea
                    placeholder="Agregar una nota..."
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    className="flex-1"
                  />
                  <Button onClick={handleAddNote} className="self-start gap-2">
                    <Plus className="h-4 w-4" />
                    Agregar
                  </Button>
                </div>

                <div className="space-y-4">
                  {candidate.notes.length === 0 ? (
                    <p className="text-center text-gray-500 py-8">
                      No hay notas registradas
                    </p>
                  ) : (
                    candidate.notes.map(note => (
                      <div key={note.id} className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-gray-700 whitespace-pre-wrap">{note.content}</p>
                        <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                          <span>{note.createdBy}</span>
                          <span>·</span>
                          <span>{format(parseISO(note.createdAt), 'dd MMM yyyy HH:mm', { locale: es })}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5 text-blue-600" />
                Historial de Cambios
              </CardTitle>
            </CardHeader>
            <CardContent>
              {candidate.changeHistory.length === 0 ? (
                <p className="text-center text-gray-500 py-8">
                  No hay cambios registrados
                </p>
              ) : (
                <div className="space-y-4">
                  {candidate.changeHistory.map(change => (
                    <div key={change.id} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <History className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className="text-xs">
                            {getChangeTypeLabel(change.type)}
                          </Badge>
                          <span className="text-sm text-gray-500">
                            {format(parseISO(change.date), 'dd MMM yyyy HH:mm', { locale: es })}
                          </span>
                        </div>
                        <p className="text-gray-700">{change.description}</p>
                        {change.oldValue && change.newValue && (
                          <div className="mt-2 text-sm">
                            <span className="text-red-600 line-through">{change.oldValue}</span>
                            <span className="mx-2 text-gray-400">→</span>
                            <span className="text-green-600">{change.newValue}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function getChangeTypeLabel(type: ChangeRecord['type']): string {
  const labels: Record<string, string> = {
    job_change: 'Cambio de trabajo',
    status_update: 'Actualización de estado',
    profile_update: 'Actualización de perfil',
    open_to_work: 'Disponibilidad',
    other: 'Otro',
  };
  return labels[type] || type;
}
