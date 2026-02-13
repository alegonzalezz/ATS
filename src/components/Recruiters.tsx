import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Edit2, Trash2, UserCog } from 'lucide-react';
import { RecruiterForm } from './RecruiterForm';
import { useRecruiters } from '@/hooks/useApi';
import type { Recruiter, CreateRecruiterDTO } from '@/services/recruiter.service';

export function Recruiters() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingRecruiter, setEditingRecruiter] = useState<Recruiter | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  const { recruiters, loading, fetchRecruiters, createRecruiter, updateRecruiter, deleteRecruiter } = useRecruiters();

  // Cargar reclutadores al montar el componente
  useEffect(() => {
    fetchRecruiters();
  }, [fetchRecruiters]);

  const filteredRecruiters = recruiters.filter(recruiter =>
    recruiter.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (recruiter.description && recruiter.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleAddNew = () => {
    setEditingRecruiter(null);
    setIsFormOpen(true);
  };

  const handleEdit = (recruiter: Recruiter) => {
    setEditingRecruiter(recruiter);
    setIsFormOpen(true);
  };

  const handleSave = async (data: CreateRecruiterDTO) => {
    if (editingRecruiter) {
      await updateRecruiter(editingRecruiter.id, data);
    } else {
      await createRecruiter(data.name, data.description);
    }
    setIsFormOpen(false);
    setEditingRecruiter(null);
  };

  const handleDelete = async (id: string) => {
    if (confirm('¿Estás seguro de que deseas eliminar este reclutador?')) {
      await deleteRecruiter(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Reclutadores</h2>
          <p className="text-gray-600 mt-1">
            Gestiona los reclutadores del sistema
          </p>
        </div>
        <Button onClick={handleAddNew} className="gap-2">
          <Plus className="h-4 w-4" />
          Nuevo Reclutador
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <UserCog className="h-5 w-5" />
            Lista de Reclutadores
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar reclutadores..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {loading ? (
            <div className="text-center py-8 text-gray-500">
              Cargando reclutadores...
            </div>
          ) : filteredRecruiters.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {searchQuery ? 'No se encontraron reclutadores' : 'No hay reclutadores registrados'}
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredRecruiters.map((recruiter) => (
                <div
                  key={recruiter.id}
                  className="py-4 flex items-center justify-between hover:bg-gray-50 px-4 -mx-4 rounded-lg transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="font-medium text-gray-900">{recruiter.name}</h3>
                      {recruiter.is_active === false && (
                        <Badge variant="secondary">Inactivo</Badge>
                      )}
                    </div>
                    {recruiter.description && (
                      <p className="text-sm text-gray-600 mt-1">{recruiter.description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(recruiter)}
                      className="h-8 w-8"
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(recruiter.id)}
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

      <RecruiterForm
        recruiter={editingRecruiter}
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingRecruiter(null);
        }}
        onSave={handleSave}
      />
    </div>
  );
}
