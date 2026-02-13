import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import type { Candidate, CandidateStatus } from '@/types';
import {
  Search,
  Filter,
  MoreVertical,
  Linkedin,
  Edit3,
  Mail,
  MapPin,
  Briefcase,
  Tag,
  Plus,
  X
} from 'lucide-react';
import {
  getStatusColor,
  getStatusLabel,
  getInitials,
  getSourceIcon
} from '@/lib/utils';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { AddToJobDialog } from './AddToJobDialog';

interface CandidateListProps {
  candidates: Candidate[];
  allTags: string[];
  allSkills: string[];
  onViewCandidate: (id: string) => void;
  onEditCandidate: (candidate: Candidate) => void;
  onDeleteCandidate: (id: string) => void;
  onAddTag: (candidateId: string, tag: string) => void;
  onRemoveTag: (candidateId: string, tag: string) => void;
  onUpdateStatus: (candidateId: string, status: CandidateStatus) => void;
}

const statusOptions: CandidateStatus[] = [
  'nuevo', 'en_revision', 'entrevista', 'oferta', 'contratado', 'rechazado', 'archivado'
];

export function CandidateList({
  candidates,
  allTags,
  onViewCandidate,
  onEditCandidate,
  onDeleteCandidate,
  onAddTag,
  onRemoveTag
}: CandidateListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<CandidateStatus[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCandidateForJob, setSelectedCandidateForJob] = useState<Candidate | null>(null);

  const filteredCandidates = candidates.filter(candidate => {
    const matchesSearch = !searchQuery ||
      candidate.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      candidate.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      candidate.currentRole?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      candidate.currentCompany?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      candidate.skills.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus = selectedStatus.length === 0 || selectedStatus.includes(candidate.status);
    const matchesTags = selectedTags.length === 0 || selectedTags.every(tag => candidate.tags.includes(tag));

    return matchesSearch && matchesStatus && matchesTags;
  });

  const toggleStatus = (status: CandidateStatus) => {
    setSelectedStatus(prev =>
      prev.includes(status)
        ? prev.filter(s => s !== status)
        : [...prev, status]
    );
  };

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedStatus([]);
    setSelectedTags([]);
  };

  const hasActiveFilters = searchQuery || selectedStatus.length > 0 || selectedTags.length > 0;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Candidatos</h2>
          <p className="text-gray-600">
            {filteredCandidates.length} de {candidates.length} candidatos
          </p>
        </div>
        <Button onClick={() => onEditCandidate({} as Candidate)} className="gap-2">
          <Plus className="h-4 w-4" />
          Agregar Candidato
        </Button>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar por nombre, email, puesto, empresa o skills..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="gap-2"
            >
              <Filter className="h-4 w-4" />
              Filtros
              {hasActiveFilters && (
                <Badge variant="secondary" className="ml-1">
                  {[...selectedStatus, ...selectedTags].length}
                </Badge>
              )}
            </Button>
          </div>

          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200 space-y-4">
              {/* Status Filters */}
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Estado</p>
                <div className="flex flex-wrap gap-2">
                  {statusOptions.map(status => (
                    <button
                      key={status}
                      onClick={() => toggleStatus(status)}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${selectedStatus.includes(status)
                          ? getStatusColor(status)
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                    >
                      {getStatusLabel(status)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tag Filters */}
              {allTags.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Etiquetas</p>
                  <div className="flex flex-wrap gap-2">
                    {allTags.map(tag => (
                      <button
                        key={tag}
                        onClick={() => toggleTag(tag)}
                        className={`px-3 py-1.5 rounded-full text-sm transition-all ${selectedTags.includes(tag)
                            ? 'bg-blue-100 text-blue-800 border border-blue-300'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {hasActiveFilters && (
                <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1">
                  <X className="h-3 w-3" />
                  Limpiar filtros
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Candidates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredCandidates.map(candidate => (
          <CandidateCard
            key={candidate.id}
            candidate={candidate}
            onView={() => onViewCandidate(candidate.id)}
            onEdit={() => onEditCandidate(candidate)}
            onDelete={() => onDeleteCandidate(candidate.id)}
            onAddTag={(tag) => onAddTag(candidate.id, tag)}
            onRemoveTag={(tag) => onRemoveTag(candidate.id, tag)}
            onAddToJob={() => setSelectedCandidateForJob(candidate)}
            availableTags={allTags.filter(t => !candidate.tags.includes(t))}
          />
        ))}
      </div>

      {/* Add to Job Dialog */}
      {selectedCandidateForJob && (
        <AddToJobDialog
          isOpen={!!selectedCandidateForJob}
          onClose={() => setSelectedCandidateForJob(null)}
          applicantId={selectedCandidateForJob.id}
          applicantName={selectedCandidateForJob.fullName}
        />
      )}

      {filteredCandidates.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No se encontraron candidatos
            </h3>
            <p className="text-gray-600 mb-4">
              {hasActiveFilters
                ? 'Intenta ajustar los filtros de búsqueda'
                : 'Comienza agregando tu primer candidato'}
            </p>
            {hasActiveFilters && (
              <Button variant="outline" onClick={clearFilters}>
                Limpiar filtros
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

interface CandidateCardProps {
  candidate: Candidate;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onAddTag: (tag: string) => void;
  onRemoveTag: (tag: string) => void;
  onAddToJob: () => void;
  availableTags: string[];
}

function CandidateCard({
  candidate,
  onView,
  onEdit,
  onDelete,
  onAddTag,
  onRemoveTag,
  onAddToJob,
  availableTags
}: CandidateCardProps) {
  const [showTagDialog, setShowTagDialog] = useState(false);

  return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer group" onClick={onView}>
      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-medium">
              {getInitials(candidate.fullName)}
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                {candidate.fullName}
              </h3>
              <p className="text-sm text-gray-600">
                {candidate.currentRole || 'Sin puesto'}
              </p>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit(); }}>
                <Edit3 className="h-4 w-4 mr-2" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onAddToJob(); }}>
                <Briefcase className="h-4 w-4 mr-2" />
                Agregar a oferta
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setShowTagDialog(true); }}>
                <Tag className="h-4 w-4 mr-2" />
                Gestionar etiquetas
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(e) => { e.stopPropagation(); onDelete(); }}
                className="text-red-600"
              >
                <X className="h-4 w-4 mr-2" />
                Eliminar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Info */}
        <div className="space-y-2 mb-3">
          {candidate.currentCompany && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Briefcase className="h-4 w-4 text-gray-400" />
              {candidate.currentCompany}
            </div>
          )}
          {candidate.location && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <MapPin className="h-4 w-4 text-gray-400" />
              {candidate.location}
            </div>
          )}
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Mail className="h-4 w-4 text-gray-400" />
            {candidate.email}
          </div>
        </div>

        {/* Status & Source */}
        <div className="flex items-center gap-2 mb-3">
          <Badge variant="outline" className={getStatusColor(candidate.status)}>
            {getStatusLabel(candidate.status)}
          </Badge>
          {candidate.openToWork && (
            <Badge className="bg-green-100 text-green-800 border-green-200">
              Open to Work
            </Badge>
          )}
          <span className="text-lg" title={`Fuente: ${candidate.source}`}>
            {getSourceIcon(candidate.source)}
          </span>
        </div>

        {/* Skills */}
        {candidate.skills.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {candidate.skills.slice(0, 4).map(skill => (
              <Badge key={skill} variant="secondary" className="text-xs">
                {skill}
              </Badge>
            ))}
            {candidate.skills.length > 4 && (
              <Badge variant="secondary" className="text-xs">
                +{candidate.skills.length - 4}
              </Badge>
            )}
          </div>
        )}

        {/* Tags */}
        {candidate.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {candidate.tags.map(tag => (
              <Badge
                key={tag}
                variant="outline"
                className="text-xs bg-blue-50 text-blue-700 border-blue-200"
              >
                {tag}
              </Badge>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
          <span>
            Agregado {format(parseISO(candidate.createdAt), 'dd MMM yyyy', { locale: es })}
          </span>
          {candidate.linkedin && (
            <Linkedin className="h-4 w-4 text-blue-600" />
          )}
        </div>
      </CardContent>

      {/* Tag Dialog */}
      <Dialog open={showTagDialog} onOpenChange={setShowTagDialog}>
        <DialogContent onClick={(e) => e.stopPropagation()}>
          <DialogHeader>
            <DialogTitle>Gestionar Etiquetas - {candidate.fullName}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium mb-2">Etiquetas actuales:</p>
              <div className="flex flex-wrap gap-2">
                {candidate.tags.map(tag => (
                  <Badge
                    key={tag}
                    variant="outline"
                    className="cursor-pointer hover:bg-red-50"
                    onClick={() => onRemoveTag(tag)}
                  >
                    {tag} <X className="h-3 w-3 ml-1" />
                  </Badge>
                ))}
                {candidate.tags.length === 0 && (
                  <p className="text-sm text-gray-500">Sin etiquetas</p>
                )}
              </div>
            </div>
            {availableTags.length > 0 && (
              <div>
                <p className="text-sm font-medium mb-2">Agregar etiqueta:</p>
                <div className="flex flex-wrap gap-2">
                  {availableTags.map(tag => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="cursor-pointer hover:bg-blue-100"
                      onClick={() => onAddTag(tag)}
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
