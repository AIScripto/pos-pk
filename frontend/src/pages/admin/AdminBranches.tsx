import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { getUserFriendlyErrorMessage } from '@/lib/error-handler';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, Search, Edit, Trash2, MapPin, Loader2 } from 'lucide-react';
import SearchableSelect from '@/components/admin/SearchableSelect';
import BranchFormDialog from '@/components/admin/BranchFormDialog';
import { branchApi, Branch, CreateBranchInput, UpdateBranchInput } from '@/lib/api/branch.api';
import { cityApi } from '@/lib/api/city.api';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';

function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error) return error.message;
  return fallback;
}

export default function AdminBranches() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [selectedCityId, setSelectedCityId] = useState('');
  const [search, setSearch] = useState('');
  const [selectedBranch, setSelectedBranch] = useState<Branch | undefined>();
  const [formOpen, setFormOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [branchToDelete, setBranchToDelete] = useState<Branch | null>(null);
  const [error, setError] = useState('');

  // Load cities
  const { data: cities = [] } = useQuery({
    queryKey: ['cities'],
    queryFn: () => cityApi.list(),
  });

  // Load branches
  const { data: branches = [], isLoading } = useQuery({
    queryKey: ['branches', selectedCityId, search],
    queryFn: () => branchApi.list(selectedCityId || undefined, search || undefined),
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data: CreateBranchInput) => branchApi.create(data),
    onSuccess: () => {
      toast({
        title: 'Branch created',
        description: 'Branch has been created successfully',
        variant: 'default',
      });
      queryClient.invalidateQueries({ queryKey: ['branches'] });
      setFormOpen(false);
    },
    onError: (err: unknown) => {
      toast({
        title: 'Failed to create branch',
        description: getUserFriendlyErrorMessage(err),
        variant: 'destructive',
      });
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateBranchInput }) => branchApi.update(id, data),
    onSuccess: () => {
      toast({
        title: 'Branch updated',
        description: 'Branch has been updated successfully',
        variant: 'default',
      });
      queryClient.invalidateQueries({ queryKey: ['branches'] });
      setFormOpen(false);
      setSelectedBranch(undefined);
    },
    onError: (err: unknown) => {
      toast({
        title: 'Failed to update branch',
        description: getUserFriendlyErrorMessage(err),
        variant: 'destructive',
      });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => branchApi.delete(id),
    onSuccess: () => {
      toast({
        title: 'Branch deleted',
        description: 'Branch has been deleted successfully',
        variant: 'default',
      });
      queryClient.invalidateQueries({ queryKey: ['branches'] });
      setDeleteOpen(false);
      setBranchToDelete(null);
    },
    onError: (err: unknown) => {
      toast({
        title: 'Failed to delete branch',
        description: getUserFriendlyErrorMessage(err),
        variant: 'destructive',
      });
    },
  });

  const handleCreateClick = () => {
    if (!selectedCityId) {
      setError('Please select a city first');
      return;
    }
    setSelectedBranch(undefined);
    setFormOpen(true);
  };

  const handleEditClick = (branch: Branch) => {
    setSelectedBranch(branch);
    setFormOpen(true);
  };

  const handleDeleteClick = (branch: Branch) => {
    setBranchToDelete(branch);
    setDeleteOpen(true);
  };

  const handleSave = async (data: CreateBranchInput | UpdateBranchInput) => {
    setError('');
    if (selectedBranch) {
      await updateMutation.mutateAsync({ id: selectedBranch.id, data });
    } else {
      await createMutation.mutateAsync(data as CreateBranchInput);
    }
  };

  const handleConfirmDelete = async () => {
    if (branchToDelete) {
      await deleteMutation.mutateAsync(branchToDelete.id);
    }
  };

  const handleCloseDialog = () => {
    setFormOpen(false);
    setSelectedBranch(undefined);
    setError('');
  };

  const selectedCity = cities.find((c) => c.id === selectedCityId);

  return (
    <div className="min-h-screen space-y-6 rounded-2xl bg-gradient-to-b from-muted/40 via-muted/40 to-primary/30 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
            Branches
          </h1>
          <p className="mt-1 text-foreground">
            Manage operational branches and locations
          </p>
        </div>
        <Button
          onClick={handleCreateClick}
          disabled={!selectedCityId}
          variant="create"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Branch
        </Button>
      </div>

      {/* City Selector */}
      <Card className="border-border bg-card shadow-sm">
        <CardContent className="pt-6">
          <div>
            <label className="mb-2 block text-sm font-semibold text-foreground">
              Select City
            </label>
            <SearchableSelect
              value={selectedCityId}
              onChange={(val) => { setSelectedCityId(val); setSearch(''); }}
              placeholder="Select a City"
              options={cities.map((city) => ({ value: city.id, label: city.name, sublabel: city.code }))}
            />
          </div>
        </CardContent>
      </Card>

      {/* Search */}
      {selectedCityId && (
        <Card className="border-border bg-card shadow-sm">
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by branch code or name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="border-border bg-secondary pl-10 text-foreground placeholder:text-muted-foreground"
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Branches Table */}
      {selectedCityId && (
        <Card className="border-border bg-card shadow-sm">
          <CardHeader>
            <CardTitle className="font-bold text-foreground">
              Branches in {selectedCity?.name} ({branches.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                {Array(5).fill(0).map((_, i) => (
                  <div key={i} className="flex items-center gap-4 py-3">
                    <Skeleton className="h-8 w-20" />
                    <Skeleton className="h-8 w-40" />
                    <Skeleton className="h-8 w-32" />
                    <Skeleton className="h-8 w-24" />
                    <Skeleton className="h-8 w-32" />
                    <Skeleton className="h-8 w-20" />
                    <Skeleton className="h-8 w-16" />
                  </div>
                ))}
              </div>
            ) : error ? (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            ) : branches.length === 0 ? (
              <div className="text-center py-8">
                <MapPin className="mx-auto mb-3 h-12 w-12 text-muted-foreground" />
                <p className="font-medium text-muted-foreground">No branches found</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Click "Add Branch" to create the first branch
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b border-border">
                    <tr>
                      <th className="px-4 py-3 text-left font-bold text-foreground/80 dark:text-white">
                        Code
                      </th>
                      <th className="px-4 py-3 text-left font-bold text-foreground/80 dark:text-white">
                        Branch Name
                      </th>
                      <th className="px-4 py-3 text-left font-bold text-foreground/80 dark:text-white">
                        Area
                      </th>
                      <th className="px-4 py-3 text-left font-bold text-foreground/80 dark:text-white">
                        Hours
                      </th>
                      <th className="px-4 py-3 text-left font-bold text-foreground/80 dark:text-white">
                        Contact
                      </th>
                      <th className="px-4 py-3 text-left font-bold text-foreground/80 dark:text-white">
                        Status
                      </th>
                      <th className="px-4 py-3 text-right font-bold text-foreground/80 dark:text-white">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {branches.map((branch: Branch) => (
                      <tr key={branch.id} className="hover:bg-secondary/70">
                        <td className="py-3 px-4">
                          <span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-semibold text-foreground/80 dark:text-white">
                            {branch.label}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-semibold text-foreground">
                          {branch.name}
                        </td>
                        <td className="px-4 py-3 text-foreground">
                          {branch.area ? (
                            <span className="inline-flex items-center gap-1">
                              <span>{branch.area.name}</span>
                              <span className="text-xs text-muted-foreground">({branch.area.tag})</span>
                            </span>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-xs text-foreground">
                          {branch.openTime} - {branch.closeTime}
                        </td>
                        <td className="px-4 py-3 text-xs text-foreground">
                          {branch.phone ? (
                            <div>{branch.phone}</div>
                          ) : (
                            <span className="text-muted-foreground/70">—</span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                              branch.isActive
                                ? 'bg-success-subtle text-success-text'
                                : 'bg-secondary text-foreground'
                            }`}
                          >
                            {branch.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right space-x-2">
                          <Button
                            variant="edit"
                            size="sm"
                            onClick={() => handleEditClick(branch)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="delete"
                            size="sm"
                            onClick={() => handleDeleteClick(branch)}
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
      )}

      {/* Form Dialog */}
      <BranchFormDialog
        open={formOpen}
        onOpenChange={handleCloseDialog}
        branch={selectedBranch}
        onSave={handleSave}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="border-border bg-muted/40 text-foreground">
          <DialogHeader>
            <DialogTitle>Delete Branch?</DialogTitle>
            <DialogDescription className="text-foreground">
              Are you sure you want to delete <strong>{branchToDelete?.name}</strong>? This action
              cannot be undone and will fail if the branch has active terminals.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
