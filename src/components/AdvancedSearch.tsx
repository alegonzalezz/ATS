import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import type { Candidate, CandidateStatus, SearchFilters } from '@/types';
import { 
  Search, 
  Filter, 
  X, 
  MapPin,
  Sparkles
} from 'lucide-react';
import { getStatusColor, getStatusLabel, getInitials } from '@/lib/utils';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

interface AdvancedSearchProps {
  candidates: Candidate[];
  allSkills: string[];
  allTags: string[];
  filters: SearchFilters;
  onFiltersChange: (filters: SearchFilters) => void;
  onViewCandidate: (id: string) => void;
}

const statusOptions: CandidateStatus[] = [
  'nuevo', 'en_revision', 'entrevista', 'oferta', 'contratado', 'rechazado', 'archivado'
];

const experienceOptions = [
  { value: 'any', label: 'Cualquier experiencia' },
  { value: '0-2', label: '0-2 años' },
  { value: '2-5', label: '2-5 años' },
  { value: '5-10', label: '5-10 años' },
  { value: '10+', label: '10+ años' },
];

export function AdvancedSearch({ 
  candidates, 
  allSkills, 
  allTags,
  filters,
  onFiltersChange,
  onViewCandidate
}: AdvancedSearchProps) {
  const [localFilters, setLocalFilters] = useState<SearchFilters>(filters);

  const applyFilters = () => {
    onFiltersChange(localFilters);
  };

  const clearFilters = () => {
    const emptyFilters: SearchFilters = {
      query: '',
      status: [],
      skills: [],
      location: '',
      experience: 'any',
      openToWork: null,
      tags: [],
      source: [],
    };
    setLocalFilters(emptyFilters);
    onFiltersChange(emptyFilters);
  };

  const toggleStatus = (status: CandidateStatus) => {
    setLocalFilters(prev => ({
      ...prev,
      status: prev.status.includes(status)
        ? prev.status.filter(s => s !== status)
        : [...prev.status, status]
    }));
  };

  const toggleSkill = (skill: string) => {
    setLocalFilters(prev => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter(s => s !== skill)
        : [...prev.skills, skill]
    }));
  };

  const toggleTag = (tag: string) => {
    setLocalFilters(prev => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag]
    }));
  };

  const filteredCandidates = candidates.filter(candidate => {
    const matchesQuery = !filters.query || 
      candidate.fullName.toLowerCase().includes(filters.query.toLowerCase()) ||
      candidate.email.toLowerCase().includes(filters.query.toLowerCase()) ||
      candidate.currentRole?.toLowerCase().includes(filters.query.toLowerCase()) ||
      candidate.currentCompany?.toLowerCase().includes(filters.query.toLowerCase());

    const matchesStatus = filters.status.length === 0 || filters.status.includes(candidate.status);
    const matchesSkills = filters.skills.length === 0 || 
      filters.skills.every(skill => candidate.skills.includes(skill));
    const matchesLocation = !filters.location || 
      candidate.location?.toLowerCase().includes(filters.location.toLowerCase());
    const matchesOpenToWork = filters.openToWork === null || candidate.openToWork === filters.openToWork;
    const matchesTags = filters.tags.length === 0 || 
      filters.tags.every(tag => candidate.tags.includes(tag));

    return matchesQuery && matchesStatus && matchesSkills && matchesLocation && matchesOpenToWork && matchesTags;
  });

  const hasActiveFilters = 
    filters.query || 
    filters.status.length > 0 || 
    filters.skills.length > 0 ||
    filters.location ||
    filters.experience !== 'any' ||
    filters.openToWork !== null ||
    filters.tags.length > 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-purple-600" />
          Búsqueda Avanzada
        </h2>
        <p className="text-gray-600 mt-1">
          Encuentra candidatos usando múltiples criterios de filtrado.
        </p>
      </div>

      {/* Search Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                placeholder="Buscar por nombre, email, puesto, empresa..."
                value={localFilters.query}
                onChange={(e) => setLocalFilters(prev => ({ ...prev, query: e.target.value }))}
                className="pl-12 h-12 text-lg"
                onKeyPress={(e) => e.key === 'Enter' && applyFilters()}
              />
            </div>
            <Button onClick={applyFilters} size="lg" className="gap-2">
              <Search className="h-5 w-5" />
              Buscar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Filter Panel */}
        <Card className="lg:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Filtros
            </CardTitle>
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1">
                <X className="h-3 w-3" />
                Limpiar
              </Button>
            )}
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Status Filter */}
            <div>
              <Label className="text-sm font-medium mb-2 block">Estado</Label>
              <div className="space-y-1">
                {statusOptions.map(status => (
                  <label 
                    key={status} 
                    className="flex items-center gap-2 p-2 rounded hover:bg-gray-50 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={localFilters.status.includes(status)}
                      onChange={() => toggleStatus(status)}
                      className="rounded border-gray-300"
                    />
                    <Badge variant="outline" className={getStatusColor(status)}>
                      {getStatusLabel(status)}
                    </Badge>
                  </label>
                ))}
              </div>
            </div>

            {/* Experience Filter */}
            <div>
              <Label className="text-sm font-medium mb-2 block">Experiencia</Label>
              <Select
                value={localFilters.experience}
                onValueChange={(value) => setLocalFilters(prev => ({ ...prev, experience: value as SearchFilters['experience'] }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {experienceOptions.map(opt => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Location Filter */}
            <div>
              <Label className="text-sm font-medium mb-2 block">Ubicación</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Ciudad, país..."
                  value={localFilters.location}
                  onChange={(e) => setLocalFilters(prev => ({ ...prev, location: e.target.value }))}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Open to Work Filter */}
            <div>
              <Label className="text-sm font-medium mb-2 block">Disponibilidad</Label>
              <Select
                value={localFilters.openToWork === null ? 'any' : String(localFilters.openToWork)}
                onValueChange={(value) => setLocalFilters(prev => ({ 
                  ...prev, 
                  openToWork: value === 'any' ? null : value === 'true'
                }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Cualquiera</SelectItem>
                  <SelectItem value="true">Open to Work</SelectItem>
                  <SelectItem value="false">No disponible</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Skills Filter */}
            {allSkills.length > 0 && (
              <div>
                <Label className="text-sm font-medium mb-2 block">Skills</Label>
                <div className="flex flex-wrap gap-1 max-h-40 overflow-y-auto">
                  {allSkills.map(skill => (
                    <button
                      key={skill}
                      onClick={() => toggleSkill(skill)}
                      className={`px-2 py-1 rounded text-xs transition-all ${
                        localFilters.skills.includes(skill)
                          ? 'bg-blue-100 text-blue-800 border border-blue-300'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {skill}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Tags Filter */}
            {allTags.length > 0 && (
              <div>
                <Label className="text-sm font-medium mb-2 block">Etiquetas</Label>
                <div className="flex flex-wrap gap-1 max-h-40 overflow-y-auto">
                  {allTags.map(tag => (
                    <button
                      key={tag}
                      onClick={() => toggleTag(tag)}
                      className={`px-2 py-1 rounded text-xs transition-all ${
                        localFilters.tags.includes(tag)
                          ? 'bg-purple-100 text-purple-800 border border-purple-300'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <Button onClick={applyFilters} className="w-full">
              Aplicar filtros
            </Button>
          </CardContent>
        </Card>

        {/* Results */}
        <div className="lg:col-span-3 space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-gray-600">
              <span className="font-semibold text-gray-900">{filteredCandidates.length}</span> candidatos encontrados
            </p>
            {hasActiveFilters && (
              <div className="flex flex-wrap gap-2">
                {filters.query && (
                  <Badge variant="outline" className="gap-1">
                    "{filters.query}"
                    <X className="h-3 w-3 cursor-pointer" onClick={() => setLocalFilters(prev => ({ ...prev, query: '' }))} />
                  </Badge>
                )}
                {filters.status.map(s => (
                  <Badge key={s} variant="outline" className={`gap-1 ${getStatusColor(s)}`}>
                    {getStatusLabel(s)}
                    <X className="h-3 w-3 cursor-pointer" onClick={() => toggleStatus(s)} />
                  </Badge>
                ))}
                {filters.openToWork === true && (
                  <Badge variant="outline" className="gap-1 bg-green-100 text-green-800">
                    Open to Work
                    <X className="h-3 w-3 cursor-pointer" onClick={() => setLocalFilters(prev => ({ ...prev, openToWork: null }))} />
                  </Badge>
                )}
              </div>
            )}
          </div>

          <div className="space-y-3">
            {filteredCandidates.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Search className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No se encontraron candidatos
                  </h3>
                  <p className="text-gray-600">
                    Intenta ajustar los filtros de búsqueda
                  </p>
                </CardContent>
              </Card>
            ) : (
              filteredCandidates.map(candidate => (
                <Card 
                  key={candidate.id} 
                  className="hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => onViewCandidate(candidate.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-medium flex-shrink-0">
                        {getInitials(candidate.fullName)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold text-gray-900">{candidate.fullName}</h3>
                          <Badge variant="outline" className={getStatusColor(candidate.status)}>
                            {getStatusLabel(candidate.status)}
                          </Badge>
                          {candidate.openToWork && (
                            <Badge className="bg-green-100 text-green-800 border-green-200">
                              Open to Work
                            </Badge>
                          )}
                        </div>
                        <p className="text-gray-600 text-sm">
                          {candidate.currentRole || 'Sin puesto'} 
                          {candidate.currentCompany && ` @ ${candidate.currentCompany}`}
                        </p>
                        <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-gray-500">
                          <span>{candidate.email}</span>
                          {candidate.location && (
                            <>
                              <span>·</span>
                              <span className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {candidate.location}
                              </span>
                            </>
                          )}
                          <span>·</span>
                          <span>
                            {format(parseISO(candidate.createdAt), 'dd MMM yyyy', { locale: es })}
                          </span>
                        </div>
                        {candidate.skills.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-3">
                            {candidate.skills.slice(0, 5).map(skill => (
                              <Badge key={skill} variant="secondary" className="text-xs">
                                {skill}
                              </Badge>
                            ))}
                            {candidate.skills.length > 5 && (
                              <Badge variant="secondary" className="text-xs">
                                +{candidate.skills.length - 5}
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
