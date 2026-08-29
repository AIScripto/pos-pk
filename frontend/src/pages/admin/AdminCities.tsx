// =============================================================================
// AdminCities — city management page
// =============================================================================

import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { getUserFriendlyErrorMessage } from '@/lib/error-handler';
import { cityApi, City, CreateCityInput, UpdateCityInput } from '@/lib/api/city.api';
import { stateApi } from '@/lib/api/state.api';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Plus, Search, Edit, Trash2, MapPin } from 'lucide-react';
import SearchableSelect from '@/components/admin/SearchableSelect';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import CityFormDialog from '@/components/admin/CityFormDialog';

export default function AdminCities() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  // State
  const [selectedStateId, setSelectedStateId] = useState<string>('');
  const [search, setSearch] = useState('');
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  // Load all cities
  const { data: allCities = [], isLoading, error } = useQuery({
    queryKey: ['cities'],
    queryFn: () => cityApi.list(),
  });

  const { data: states = [] } = useQuery({
    queryKey: ['states'],
    queryFn: () => stateApi.list(),
  });

  const stateNameById = useMemo(() => {
    return new Map(states.map((state) => [state.id, state.name]));
  }, [states]);

  // The backend now stores state/province as stateId, not a denormalized province string.
  const stateOptions = useMemo(() => {
    const ids = new Set(allCities.map((city) => city.stateId).filter((id): id is string => Boolean(id)));
    return Array.from(ids)
      .map((stateId) => ({ value: stateId, label: stateNameById.get(stateId) ?? `State ${stateId}` }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [allCities, stateNameById]);

  // Filter cities based on selected state and search
  const filteredCities = useMemo(() => {
    return allCities.filter(city => {
      const matchesState = !selectedStateId || city.stateId === selectedStateId;
      const matchesSearch = !search ||
        city.name.toLowerCase().includes(search.toLowerCase()) ||
        city.code.toLowerCase().includes(search.toLowerCase());
      return matchesState && matchesSearch;
    });
  }, [allCities, selectedStateId, search]);

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data: CreateCityInput) => cityApi.create(data),
    onSuccess: () => {
      toast({
        title: 'City created',
        description: 'City has been created successfully',
        variant: 'default',
      });
      queryClient.invalidateQueries({ queryKey: ['cities'] });
      setFormOpen(false);
    },
    onError: (err: unknown) => {
      toast({
        title: 'Failed to create city',
        description: getUserFriendlyErrorMessage(err),
        variant: 'destructive',
      });
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCityInput }) => cityApi.update(id, data),
    onSuccess: () => {
      toast({
        title: 'City updated',
        description: 'City has been updated successfully',
        variant: 'default',
      });
      queryClient.invalidateQueries({ queryKey: ['cities'] });
      setFormOpen(false);
      setSelectedCity(null);
    },
    onError: (err: unknown) => {
      toast({
        title: 'Failed to update city',
        description: getUserFriendlyErrorMessage(err),
        variant: 'destructive',
      });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (cityId: string) => cityApi.delete(cityId),
    onSuccess: () => {
      toast({
        title: 'City deleted',
        description: 'City has been deleted successfully',
        variant: 'default',
      });
      queryClient.invalidateQueries({ queryKey: ['cities'] });
      setDeleteOpen(false);
      setSelectedCity(null);
    },
    onError: (err: unknown) => {
      toast({
        title: 'Failed to delete city',
        description: getUserFriendlyErrorMessage(err),
        variant: 'destructive',
      });
    },
  });

  const handleCreateClick = () => {
    setSelectedCity(null);
    setFormOpen(true);
  };

  const handleEditClick = (city: City) => {
    setSelectedCity(city);
    setFormOpen(true);
  };

  const handleDeleteClick = (city: City) => {
    setSelectedCity(city);
    setDeleteOpen(true);
  };

  const confirmDelete = () => {
    if (selectedCity) {
      deleteMutation.mutate(selectedCity.id);
    }
  };

  return (
    <div className="min-h-screen space-y-6 rounded-2xl bg-gradient-to-b from-muted/40 via-muted/40 to-primary/30 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Cities</h1>
          <p className="mt-1 text-foreground">Manage operational cities and regions</p>
        </div>
        <Button
          onClick={handleCreateClick}
          variant="create"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add City
        </Button>
      </div>

      {/* State Selector */}
      <Card className="border-border bg-card shadow-sm">
        <CardContent className="pt-6">
          <div>
            <label className="mb-2 block text-sm font-semibold text-foreground">
              Select State
            </label>
            <SearchableSelect
              value={selectedStateId}
              onChange={(val) => setSelectedStateId(val)}
              placeholder="All States"
              options={[
                { value: '', label: 'All States' },
                ...stateOptions,
              ]}
            />
          </div>
        </CardContent>
      </Card>

      {/* Search */}
      <Card className="border-border bg-card shadow-sm">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by city tag or name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border-border bg-secondary pl-10 text-foreground placeholder:text-muted-foreground"
            />
          </div>
        </CardContent>
      </Card>

      {/* Cities Table */}
      <Card className="border-border bg-card shadow-sm">
        <CardHeader>
          <CardTitle className="font-bold text-foreground">
            Cities {selectedStateId ? `in state ${selectedStateId}` : ''} ({filteredCities.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Loading cities...</p>
            </div>
          ) : error ? (
            <Alert variant="destructive">
              <AlertDescription>Failed to load cities</AlertDescription>
            </Alert>
          ) : filteredCities.length === 0 ? (
            <div className="text-center py-8">
              <MapPin className="mx-auto mb-3 h-12 w-12 text-muted-foreground" />
              <p className="font-medium text-muted-foreground">No cities found</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Click "Add City" to create the first city
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-border">
                  <tr>
                    <th className="px-4 py-3 text-left font-bold text-foreground/80 dark:text-white">Tag</th>
                    <th className="px-4 py-3 text-left font-bold text-foreground/80 dark:text-white">Name</th>
                    <th className="px-4 py-3 text-left font-bold text-foreground/80 dark:text-white">State</th>
                    <th className="px-4 py-3 text-left font-bold text-foreground/80 dark:text-white">Coordinates</th>
                    <th className="px-4 py-3 text-left font-bold text-foreground/80 dark:text-white">Status</th>
                    <th className="px-4 py-3 text-right font-bold text-foreground/80 dark:text-white">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredCities.map((city: City) => (
                    <tr key={city.id} className="hover:bg-secondary/70">
                      <td className="py-3 px-4">
                        <span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-semibold text-foreground/80 dark:text-white">
                          {city.code}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-semibold text-foreground">{city.name}</td>
                      <td className="px-4 py-3 text-foreground">
                        {city.stateId ? stateNameById.get(city.stateId) ?? city.stateId : '—'}
                      </td>
                      <td className="px-4 py-3 text-xs text-foreground">
                        {city.latitude && city.longitude ? (
                          <>
                            {Number(city.latitude).toFixed(4)}, {Number(city.longitude).toFixed(4)}
                          </>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${city.isActive
                            ? 'bg-success-subtle text-success-text'
                            : 'bg-secondary text-foreground'
                            }`}
                        >
                          {city.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right space-x-2">
                        <Button
                          variant="edit"
                          size="sm"
                          onClick={() => handleEditClick(city)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="delete"
                          size="sm"
                          onClick={() => handleDeleteClick(city)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* City Form Dialog */}
      <CityFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        city={selectedCity || undefined}
        onSave={async (data) => {
          if (selectedCity) {
            await updateMutation.mutateAsync({ id: selectedCity.id, data });
          } else {
            await createMutation.mutateAsync(data as CreateCityInput);
          }
        }}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="border-border bg-muted/40 text-foreground">
          <DialogHeader>
            <DialogTitle>Delete City?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-foreground">
            Are you sure you want to delete <strong>{selectedCity?.name}</strong>? This action
            cannot be undone and will fail if the city has active branches.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={deleteMutation.isPending}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
