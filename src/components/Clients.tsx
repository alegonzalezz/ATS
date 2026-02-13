import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Edit2, Trash2, Building2 } from 'lucide-react';
import { ClientForm } from './ClientForm';
import { useClients } from '@/hooks/useApi';
import type { Client, CreateClientDTO } from '@/services/client.service';

export function Clients() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  const { clients, loading, fetchClients, createClient, updateClient, deleteClient } = useClients();

  // Cargar clientes al montar el componente
  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  const filteredClients = clients.filter(client =>
    (client.name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
    (client.description?.toLowerCase() || '').includes(searchQuery.toLowerCase())
  );

  const handleAddNew = () => {
    setEditingClient(null);
    setIsFormOpen(true);
  };

  const handleEdit = (client: Client) => {
    setEditingClient(client);
    setIsFormOpen(true);
  };

  const handleSave = async (data: CreateClientDTO) => {
    if (editingClient) {
      await updateClient(editingClient.id, data);
    } else {
      await createClient(data.name, data.description);
    }
    setIsFormOpen(false);
    setEditingClient(null);
  };

  const handleDelete = async (id: string) => {
    if (confirm('¿Estás seguro de que deseas eliminar este cliente?')) {
      await deleteClient(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Clientes</h2>
          <p className="text-gray-600 mt-1">
            Gestiona los clientes del sistema
          </p>
        </div>
        <Button onClick={handleAddNew} className="gap-2">
          <Plus className="h-4 w-4" />
          Nuevo Cliente
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Lista de Clientes
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar clientes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {loading ? (
            <div className="text-center py-8 text-gray-500">
              Cargando clientes...
            </div>
          ) : filteredClients.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {searchQuery ? 'No se encontraron clientes' : 'No hay clientes registrados'}
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredClients.map((client) => (
                <div
                  key={client.id}
                  className="py-4 flex items-center justify-between hover:bg-gray-50 px-4 -mx-4 rounded-lg transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="font-medium text-gray-900">{client.name || 'Sin nombre'}</h3>
                      {client.is_active === false && (
                        <Badge variant="secondary">Inactivo</Badge>
                      )}
                    </div>
                    {client.description && (
                      <p className="text-sm text-gray-600 mt-1">{client.description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(client)}
                      className="h-8 w-8"
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(client.id)}
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

      <ClientForm
        client={editingClient}
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingClient(null);
        }}
        onSave={handleSave}
      />
    </div>
  );
}
