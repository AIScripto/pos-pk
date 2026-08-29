import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { getUserFriendlyErrorMessage } from '@/lib/error-handler';
import { Area, areaApi } from '@/lib/api/area.api';
import { City, cityApi } from '@/lib/api/city.api';
import AreaFormDialog from '@/components/admin/AreaFormDialog';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Edit, MapPin, Plus, Search, Trash2 } from 'lucide-react';
import SearchableSelect from '@/components/admin/SearchableSelect';

export default function AdminAreas() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [selectedCityId, setSelectedCityId] = useState('');
  const [search, setSearch] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [selectedArea, setSelectedArea] = useState<Area | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const { data: cities = [] } = useQuery({
    queryKey: ['cities'],
    queryFn: () => cityApi.list(),
  });

  useEffect(() => {
    if (!selectedCityId && cities.length > 0) {
      setSelectedCityId(cities[0].id);
    }
  }, [cities, selectedCityId]);

  const { data: areas = [], isLoading, error } = useQuery({
    queryKey: ['areas', selectedCityId, search],
    queryFn: () => areaApi.list(selectedCityId, search.trim() || undefined),
    enabled: !!selectedCityId,
  });

  const deleteMutation = useMutation({
    mutationFn: (areaId: string) => areaApi.delete(areaId),
    onSuccess: () => {
      toast({
        title: 'Area deleted',
        description: 'Area has been deleted successfully',
        variant: 'default',
      });
      queryClient.invalidateQueries({ queryKey: ['areas'] });
      setDeleteOpen(false);
      setSelectedArea(null);
    },
    onError: (err: unknown) => {
      toast({
        title: 'Failed to delete area',
        description: getUserFriendlyErrorMessage(err),
        variant: 'destructive',
      });
    },
  });

  const selectedCityName = useMemo(
    () => cities.find((city: City) => city.id === selectedCityId)?.name || '',
    [cities, selectedCityId],
  );

  const handleCreate = () => {
    setSelectedArea(null);
    setFormOpen(true);
  };

  const handleEdit = (area: Area) => {
    setSelectedArea(area);
    setFormOpen(true);
  };

  const handleDelete = (area: Area) => {
    setSelectedArea(area);
    setDeleteOpen(true);
  };

  return (
    <div className="min-h-screen space-y-6 rounded-2xl bg-gradient-to-b from-muted/40 via-muted/40 to-primary/30 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Areas</h1>
          <p className="mt-1 text-foreground">Manage areas by city</p>
        </div>
        <Button
          onClick={handleCreate}
          variant="create"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Area
        </Button>
      </div>

      <Card className="border-border bg-card shadow-sm">
        <CardContent className="pt-6 space-y-4">
          <div>
            <label className="mb-2 block text-sm font-semibold text-foreground">Select City *</label>
            <SearchableSelect
              value={selectedCityId}
              onChange={(val) => { setSelectedCityId(val); setSearch(''); }}
              placeholder="Choose city..."
              options={cities.map((city: City) => ({ value: city.id, label: city.name, sublabel: city.code }))}
            />
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by area tag or name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              disabled={!selectedCityId}
              className="border-border bg-secondary pl-10 text-foreground placeholder:text-muted-foreground"
            />
          </div>
        </CardContent>
      </Card>

      <Card className="border-border bg-card shadow-sm">
        <CardHeader>
          <CardTitle className="text-foreground font-bold">
            Areas {selectedCityName ? `in ${selectedCityName}` : ''} ({areas.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!selectedCityId ? (
            <div className="text-center py-8">
              <p className="text-foreground">Select a city to view and manage areas.</p>
            </div>
          ) : isLoading ? (
            <div className="space-y-2">
              {Array(5).fill(0).map((_, i) => (
                <div key={i} className="flex items-center gap-4 py-3">
                  <Skeleton className="h-8 w-12" />
                  <Skeleton className="h-8 w-32" />
                  <Skeleton className="h-8 w-40" />
                  <Skeleton className="h-8 w-36" />
                  <Skeleton className="h-8 w-20" />
                  <Skeleton className="h-8 w-16" />
                </div>
              ))}
            </div>
          ) : error ? (
            <Alert variant="destructive">
              <AlertDescription>Failed to load areas</AlertDescription>
            </Alert>
          ) : areas.length === 0 ? (
            <div className="text-center py-8">
              <MapPin className="mx-auto mb-3 h-12 w-12 text-muted-foreground" />
              <p className="font-medium text-muted-foreground">No areas found</p>
              <p className="mt-1 text-sm text-muted-foreground">Click "Add Area" to create one</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-border">
                  <tr>
                    <th className="px-4 py-3 text-left font-bold text-foreground/80 dark:text-white">Tag</th>
                    <th className="px-4 py-3 text-left font-bold text-foreground/80 dark:text-white">Name</th>
                    <th className="px-4 py-3 text-left font-bold text-foreground/80 dark:text-white">Details</th>
                    <th className="px-4 py-3 text-left font-bold text-foreground/80 dark:text-white">Coordinates</th>
                    <th className="px-4 py-3 text-left font-bold text-foreground/80 dark:text-white">Status</th>
                    <th className="px-4 py-3 text-right font-bold text-foreground/80 dark:text-white">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {areas.map((area: Area) => (
                    <tr key={area.id} className="hover:bg-secondary/70">
                      <td className="py-3 px-4">
                        <span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-semibold text-foreground/80 dark:text-white">
                          {area.tag}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-semibold text-foreground">{area.name}</td>
                      <td className="px-4 py-3 text-foreground">{area.details || '—'}</td>
                      <td className="px-4 py-3 text-xs text-foreground">
                        {area.latitude != null && area.longitude != null
                          ? `${Number(area.latitude).toFixed(4)}, ${Number(area.longitude).toFixed(4)}`
                          : '—'}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                            area.isActive
                              ? 'bg-success-subtle text-success-text'
                              : 'bg-secondary text-foreground'
                          }`}
                        >
                          {area.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right space-x-2">
                        <Button
                          variant="edit"
                          size="sm"
                          onClick={() => handleEdit(area)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="delete"
                          size="sm"
                          onClick={() => handleDelete(area)}
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

      <AreaFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        area={selectedArea || undefined}
        initialCityId={selectedCityId}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ['areas'] });
          queryClient.invalidateQueries({ queryKey: ['areas', selectedCityId, search] });
        }}
      />

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="border-border bg-muted/40 text-foreground">
          <DialogHeader>
            <DialogTitle>Delete Area?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-foreground">
            Are you sure you want to delete <strong>{selectedArea?.name}</strong>?
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => selectedArea && deleteMutation.mutate(selectedArea.id)}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
