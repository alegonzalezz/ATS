import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { useSkills } from '@/hooks/useSkills';
import { Plus, Search, ToggleLeft, ToggleRight } from 'lucide-react';
import { toast } from 'sonner';

export function Skills() {
  const {
    skills,
    isLoading,
    createSkill,
    deactivateSkill,
    reactivateSkill,
  } = useSkills();

  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newSkillName, setNewSkillName] = useState('');
  const [showInactive, setShowInactive] = useState(false);

  // Filter skills based on search and active/inactive status
  const filteredSkills = skills.filter(skill => {
    const matchesSearch = skill.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = showInactive || !skill.deactive_at;
    return matchesSearch && matchesStatus;
  });

  const handleCreateSkill = async () => {
    if (!newSkillName.trim()) {
      toast.error('El nombre de la habilidad es requerido');
      return;
    }

    try {
      await createSkill(newSkillName);
      setNewSkillName('');
      setIsCreateDialogOpen(false);
      toast.success('Habilidad creada correctamente');
    } catch (error: unknown) {
      if (error instanceof Error && error.message?.includes('already exists')) {
        toast.error('La habilidad ya existe');
      } else {
        toast.error('Error al crear la habilidad');
      }
    }
  };

  const handleToggleStatus = async (skill: { id: string; deactive_at: string | null }) => {
    console.log('handleToggleStatus called for skill:', skill);
    console.log('Current skills:', skills);
    
    try {
      if (skill.deactive_at) {
        console.log('Reactivating skill...');
        await reactivateSkill(skill.id);
        toast.success('Habilidad activada correctamente');
      } else {
        console.log('Deactivating skill...');
        await deactivateSkill(skill.id);
        toast.success('Habilidad desactivada correctamente');
        // Show inactive skills after deactivating
        setShowInactive(true);
      }
      console.log('Skills after toggle:', skills);
    } catch (error) {
      console.error('Error toggling skill status:', error);
      toast.error('Error al cambiar el estado de la habilidad');
    }
  };

  const getStatusBadge = (deactive_at: string | null) => {
    if (deactive_at) {
      return <Badge variant="destructive">Inactiva</Badge>;
    }
    return <Badge variant="default">Activa</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestión de Habilidades</h2>
          <p className="text-gray-600">Administra el catálogo de habilidades</p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Nueva Habilidad
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar habilidades..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Button
              variant={showInactive ? "default" : "outline"}
              onClick={() => setShowInactive(!showInactive)}
            >
              {showInactive ? 'Mostrar solo activas' : 'Mostrar todas'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Skills Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            Habilidades {showInactive ? '(Todas)' : '(Activas)'}: {filteredSkills.length}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-center text-gray-500 py-8">Cargando habilidades...</p>
          ) : filteredSkills.length === 0 ? (
            <p className="text-center text-gray-500 py-8">
              {searchQuery ? 'No se encontraron habilidades' : 'No hay habilidades registradas'}
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Fecha Creación</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSkills.map(skill => (
                  <TableRow key={skill.id}>
                    <TableCell className="font-medium">{skill.name}</TableCell>
                    <TableCell>{getStatusBadge(skill.deactive_at)}</TableCell>
                    <TableCell>
                      {new Date(skill.created_at).toLocaleDateString('es-ES')}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            console.log('Button clicked for skill:', skill);
                            handleToggleStatus(skill);
                          }}
                          title={skill.deactive_at ? 'Activar' : 'Desactivar'}
                          className={skill.deactive_at ? 'text-green-600 border-green-300' : 'text-gray-500'}
                        >
                          {skill.deactive_at ? (
                            <ToggleRight className="h-4 w-4" />
                          ) : (
                            <ToggleLeft className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Create Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nueva Habilidad</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Input
              placeholder="Nombre de la habilidad (ej: JavaScript, React, Python)"
              value={newSkillName}
              onChange={(e) => setNewSkillName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreateSkill()}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreateSkill}>Crear</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
