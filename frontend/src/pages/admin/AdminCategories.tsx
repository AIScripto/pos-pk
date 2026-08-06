import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { getUserFriendlyErrorMessage } from '@/lib/error-handler';
import { Category, adminCategoryApi } from '@/lib/api/admin-category.api';
import { adminFoodTypeApi } from '@/lib/api/admin-food-type.api';
import AdminCategoryFormDialog from '@/components/admin/AdminCategoryFormDialog';
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
import { Edit, Grid3x3, Plus, Search, Trash2 } from 'lucide-react';
import SearchableSelect from '@/components/admin/SearchableSelect';

export default function AdminCategories() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [selectedFoodTypeId, setSelectedFoodTypeId] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [isFormLoading, setIsFormLoading] = useState(false);

  const { data: categories = [], isLoading, error } = useQuery({
    queryKey: ['categories'],
    queryFn: () => adminCategoryApi.list(),
  });

  const { data: foodTypes = [] } = useQuery({
    queryKey: ['food-types'],
    queryFn: () => adminFoodTypeApi.list(),
  });

  const deleteMutation = useMutation({
    mutationFn: (categoryId: string) => adminCategoryApi.delete(categoryId),
    onSuccess: () => {
      toast({
        title: 'Category deleted',
        description: 'Category has been deleted successfully',
        variant: 'default',
      });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      setDeleteOpen(false);
      setSelectedCategory(null);
    },
    onError: (err: unknown) => {
      toast({
        title: 'Failed to delete category',
        description: getUserFriendlyErrorMessage(err),
        variant: 'destructive',
      });
    },
  });

  // Filter categories by Food Type first, then by search
  const filteredCategories = categories.filter((cat) => {
    // Filter by Food Type if selected (selectedFoodTypeId only filters when not empty/null)
    if (selectedFoodTypeId && selectedFoodTypeId.trim()) {
      if (cat.foodTypeId !== selectedFoodTypeId) {
        return false;
      }
    }
    // If no search term, include all matching categories
    if (!search.trim()) {
      return true;
    }
    // Filter by search term
    return (
      cat.name.toLowerCase().includes(search.toLowerCase()) ||
      cat.tag.toLowerCase().includes(search.toLowerCase())
    );
  });

  const handleCreate = () => {
    setSelectedCategory(null);
    setFormOpen(true);
  };

  const handleEdit = (category: Category) => {
    setSelectedCategory(category);
    setFormOpen(true);
  };

  const handleDelete = (category: Category) => {
    setSelectedCategory(category);
    setDeleteOpen(true);
  };

  const getFoodTypeName = (foodTypeId: string | null) => {
    if (!foodTypeId) return '—';
    const foodType = foodTypes.find((ft) => ft.id === foodTypeId);
    return foodType ? `${foodType.name} (${foodType.slug})` : '—';
  };

  return (
    <div className="min-h-screen space-y-6 rounded-2xl bg-gradient-to-b from-slate-100 via-slate-50 to-blue-50/30 p-6 dark:from-slate-950 dark:via-slate-950 dark:to-slate-900">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">Categories</h1>
          <p className="mt-1 text-slate-600 dark:text-slate-200">Manage product categories</p>
        </div>
        <Button
          onClick={handleCreate}
          variant="create"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Category
        </Button>
      </div>

      <Card className="border-slate-200 bg-slate-50/90 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <CardContent className="pt-6">
          <div className="space-y-4">
            {/* Food Type Filter */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Filter by Food Type
              </label>
              <SearchableSelect
                value={selectedFoodTypeId || ''}
                onChange={(val) => setSelectedFoodTypeId(val || null)}
                placeholder="All Food Types"
                options={[
                  { value: '', label: 'All Food Types' },
                  ...foodTypes.map((ft) => ({ value: ft.id, label: ft.name, sublabel: ft.slug })),
                ]}
              />
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-slate-500 dark:text-slate-300" />
              <Input
                placeholder="Search by name or tag..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="border-slate-300 bg-slate-100 pl-10 text-slate-900 placeholder:text-slate-500 dark:border-slate-600 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-300"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-slate-200 bg-slate-50/90 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <CardHeader>
          <CardTitle className="text-slate-900 dark:text-white font-bold">
            Categories ({filteredCategories.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <p className="text-slate-500 dark:text-slate-200">Loading categories...</p>
            </div>
          ) : error ? (
            <Alert variant="destructive">
              <AlertDescription>Failed to load categories</AlertDescription>
            </Alert>
          ) : categories.length === 0 ? (
            <div className="text-center py-8">
              <Grid3x3 className="mx-auto mb-3 h-12 w-12 text-slate-400 dark:text-slate-300" />
              <p className="font-medium text-slate-600 dark:text-slate-100">No categories found</p>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-300">Click "Add Category" to create one</p>
            </div>
          ) : filteredCategories.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-slate-600 dark:text-slate-200">No categories match your search</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-800 dark:bg-slate-950">
                    <th className="px-4 py-3 text-left font-semibold text-white">Name</th>
                    <th className="px-4 py-3 text-left font-semibold text-white">Food Type</th>
                    <th className="px-4 py-3 text-left font-semibold text-white">Tag</th>
                    <th className="px-4 py-3 text-left font-semibold text-white">Sort Order</th>
                    <th className="px-4 py-3 text-left font-semibold text-white">Status</th>
                    <th className="px-4 py-3 text-right font-semibold text-white">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                  {filteredCategories.map((category: Category) => (
                    <tr key={category.id} className="hover:bg-slate-100/70 dark:hover:bg-slate-800">
                      <td className="px-4 py-3 font-semibold text-slate-900 dark:text-white">{category.name}</td>
                      <td className="px-4 py-3 text-sm text-slate-700 dark:text-slate-200">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400">
                          {getFoodTypeName(category.foodTypeId)}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="rounded-full bg-slate-200 px-2.5 py-0.5 text-xs font-semibold text-slate-700 dark:bg-slate-700 dark:text-white">
                          {category.tag}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-700 dark:text-slate-200">{category.sortOrder}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                            category.isActive
                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200'
                              : 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-100'
                          }`}
                        >
                          {category.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right space-x-2">
                        <Button
                          variant="edit"
                          size="sm"
                          onClick={() => handleEdit(category)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="delete"
                          size="sm"
                          onClick={() => handleDelete(category)}
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

      <AdminCategoryFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        category={selectedCategory || undefined}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ['categories'] });
        }}
      />

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="border-slate-200 bg-slate-50 text-slate-900 dark:border-slate-600 dark:bg-slate-900 dark:text-white">
          <DialogHeader>
            <DialogTitle>Delete Category?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-slate-600 dark:text-slate-200">
            Are you sure you want to delete <strong>{selectedCategory?.name}</strong>?
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => selectedCategory && deleteMutation.mutate(selectedCategory.id)}
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
