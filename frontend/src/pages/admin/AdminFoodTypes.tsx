import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { getUserFriendlyErrorMessage } from '@/lib/error-handler';
import { Plus, Search, Trash2, Edit, Package, Loader2 } from 'lucide-react';
import AdminFoodTypeFormDialog from '@/components/admin/AdminFoodTypeFormDialog';
import { adminFoodTypeApi, CreateFoodTypeInput, UpdateFoodTypeInput, FoodType } from '@/lib/api/admin-food-type.api';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export default function AdminFoodTypes() {
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedFoodType, setSelectedFoodType] = useState<FoodType | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<FoodType | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data: foodTypes = [], isLoading, error } = useQuery({
    queryKey: ['food-types'],
    queryFn: () => adminFoodTypeApi.list(),
  });

  const filteredFoodTypes = useMemo(() => {
    if (!search) return foodTypes;
    const lowerSearch = search.toLowerCase();
    return foodTypes.filter(
      (ft) =>
        ft.name.toLowerCase().includes(lowerSearch) ||
        ft.slug.toLowerCase().includes(lowerSearch)
    );
  }, [foodTypes, search]);

  const createMutation = useMutation({
    mutationFn: (data: CreateFoodTypeInput) => adminFoodTypeApi.create(data),
    onSuccess: () => {
      toast({
        title: 'Food type created',
        description: 'Food type has been created successfully',
        variant: 'default',
      });
      queryClient.invalidateQueries({ queryKey: ['food-types'] });
      setDialogOpen(false);
      setSelectedFoodType(null);
      setFormError(null);
    },
    onError: (err: unknown) => {
      const message = getUserFriendlyErrorMessage(err);
      setFormError(message);
      toast({
        title: 'Failed to create food type',
        description: message,
        variant: 'destructive',
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: { id: string; input: UpdateFoodTypeInput }) =>
      adminFoodTypeApi.update(data.id, data.input),
    onSuccess: () => {
      toast({
        title: 'Food type updated',
        description: 'Food type has been updated successfully',
        variant: 'default',
      });
      queryClient.invalidateQueries({ queryKey: ['food-types'] });
      setDialogOpen(false);
      setSelectedFoodType(null);
      setFormError(null);
    },
    onError: (err: unknown) => {
      const message = getUserFriendlyErrorMessage(err);
      setFormError(message);
      toast({
        title: 'Failed to update food type',
        description: message,
        variant: 'destructive',
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminFoodTypeApi.delete(id),
    onSuccess: () => {
      toast({
        title: 'Food type deleted',
        description: 'Food type has been deleted successfully',
        variant: 'default',
      });
      queryClient.invalidateQueries({ queryKey: ['food-types'] });
      setDeleteConfirm(null);
    },
    onError: (err: unknown) => {
      toast({
        title: 'Failed to delete food type',
        description: getUserFriendlyErrorMessage(err),
        variant: 'destructive',
      });
    },
  });

  const handleSave = async (data: CreateFoodTypeInput | UpdateFoodTypeInput) => {
    if (selectedFoodType) {
      await updateMutation.mutateAsync({
        id: selectedFoodType.id,
        input: data as UpdateFoodTypeInput,
      });
    } else {
      await createMutation.mutateAsync(data as CreateFoodTypeInput);
    }
  };

  const handleOpenDialog = (foodType?: FoodType) => {
    setSelectedFoodType(foodType || null);
    setFormError(null);
    setDialogOpen(true);
  };

  if (error) {
    return (
      <div className="flex items-center justify-center h-96 text-danger-text">
        Failed to load food types
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-b from-muted/40 via-muted/40 to-primary/30 min-h-screen">
      <div className="space-y-6 p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Food Types</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Manage cuisine categories (Fast Food, Chinese, Western, etc)
            </p>
          </div>
          <button
            onClick={() => handleOpenDialog()}
            className="flex items-center gap-2 bg-gradient-to-r from-primary to-info hover:from-primary hover:to-info text-white px-6 py-3 rounded-lg font-medium transition-all shadow-lg"
          >
            <Plus className="w-5 h-5" />
            Add Food Type
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-3 w-5 h-5 text-muted-foreground/70" />
          <input
            type="text"
            placeholder="Search food types..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        {/* Table */}
        <div className="bg-card rounded-lg border border-border overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center h-96">
              <Loader2 className="h-10 w-10 animate-spin text-primary" aria-hidden="true" />
            </div>
          ) : filteredFoodTypes.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-96 text-muted-foreground">
              <Package className="w-16 h-16 mb-4 opacity-20" />
              <p className="text-lg font-medium">No food types found</p>
              <p className="text-sm">Create your first food type to get started</p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="bg-muted dark:bg-background">
                  <th className="px-6 py-3 text-left text-sm font-semibold text-white">Name</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-white">Slug</th>
                  <th className="px-6 py-3 text-center text-sm font-semibold text-white">Sort Order</th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-white">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredFoodTypes.map((foodType) => (
                  <tr
                    key={foodType.id}
                    className="border-b border-border hover:bg-secondary/50 transition-colors"
                  >
                    <td className="px-6 py-4 text-foreground font-medium">
                      {foodType.name}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-info-subtle text-primary">
                        {foodType.slug}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center text-muted-foreground">
                      {foodType.sortOrder}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleOpenDialog(foodType)}
                          className="p-2 hover:bg-secondary rounded-lg transition-colors text-muted-foreground hover:text-foreground"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(foodType)}
                          className="p-2 hover:bg-danger-subtle dark:hover:bg-danger/20 rounded-lg transition-colors text-danger-text hover:text-danger-text dark:hover:text-danger"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Form Dialog */}
      <AdminFoodTypeFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        foodType={selectedFoodType}
        onSave={handleSave}
        isLoading={createMutation.isPending || updateMutation.isPending}
        apiError={formError}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteConfirm} onOpenChange={(open) => !open && setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Food Type</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deleteConfirm?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => {
              if (deleteConfirm) {
                deleteMutation.mutate(deleteConfirm.id);
              }
            }}
            className="bg-danger hover:bg-danger/90"
          >
            Delete
          </AlertDialogAction>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
