import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { getUserFriendlyErrorMessage } from '@/lib/error-handler';
import { Plus, Search, Trash2, Edit, Package } from 'lucide-react';
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
      <div className="flex items-center justify-center h-96 text-red-600">
        Failed to load food types
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-b from-slate-100 via-slate-50 to-blue-50/30 dark:from-slate-950 dark:via-slate-950 dark:to-slate-900 min-h-screen">
      <div className="space-y-6 p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Food Types</h1>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              Manage cuisine categories (Fast Food, Chinese, Western, etc)
            </p>
          </div>
          <button
            onClick={() => handleOpenDialog()}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white px-6 py-3 rounded-lg font-medium transition-all shadow-lg"
          >
            <Plus className="w-5 h-5" />
            Add Food Type
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search food types..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Table */}
        <div className="bg-slate-50/90 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center h-96">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : filteredFoodTypes.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-96 text-slate-500 dark:text-slate-400">
              <Package className="w-16 h-16 mb-4 opacity-20" />
              <p className="text-lg font-medium">No food types found</p>
              <p className="text-sm">Create your first food type to get started</p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="bg-slate-800 dark:bg-slate-950">
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
                    className="border-b border-slate-200 dark:border-slate-800 hover:bg-slate-100/50 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    <td className="px-6 py-4 text-slate-900 dark:text-white font-medium">
                      {foodType.name}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400">
                        {foodType.slug}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center text-slate-600 dark:text-slate-400">
                      {foodType.sortOrder}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleOpenDialog(foodType)}
                          className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(foodType)}
                          className="p-2 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg transition-colors text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
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
            className="bg-red-600 hover:bg-red-700"
          >
            Delete
          </AlertDialogAction>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
