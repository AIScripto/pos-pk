import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminProductApi, Product, CreateProductInput, UpdateProductInput } from '@/lib/api/admin-product.api';
import { adminCategoryApi, Category } from '@/lib/api/admin-category.api';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Plus, Search, Edit2, Trash2, Package } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { getUserFriendlyErrorMessage } from '@/lib/error-handler';
import { useTranslation, getLocalized } from '@/i18n';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import AdminProductFormDialog from '@/components/admin/AdminProductFormDialog';
import { formatCurrency } from '@/utils/pos';

export default function AdminProducts() {
  const { t, language } = useTranslation();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  // Load all products
  const { data: products = [], isLoading, error } = useQuery({
    queryKey: ['products'],
    queryFn: () => adminProductApi.list(),
  });

  // Load all categories
  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: () => adminCategoryApi.list(),
  });

  // Helper function to get category name by ID
  const getCategoryName = (categoryId: string | null | undefined) => {
    if (!categoryId) return '—';
    const category = categories.find((cat: Category) => cat.id === categoryId);
    return category?.name || '—';
  };

  // Filter products based on search
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const searchLower = search.toLowerCase();
      const categoryName = getCategoryName(product.categoryId);
      const localizedName = getLocalized(product.name, language);
      return (
        localizedName.toLowerCase().includes(searchLower) ||
        product.name.toLowerCase().includes(searchLower) ||
        product.sku.toLowerCase().includes(searchLower) ||
        categoryName.toLowerCase().includes(searchLower)
      );
    });
  }, [products, search, categories, language]);

  // Create/Update mutation
  const saveMutation = useMutation({
    mutationFn: async (data: CreateProductInput | UpdateProductInput) => {
      if (editingProduct) {
        return adminProductApi.update(editingProduct.id, data as UpdateProductInput);
      } else {
        return adminProductApi.create(data as CreateProductInput);
      }
    },
    onSuccess: () => {
      toast({
        title: t.notifications.recordSaved,
        description: t.notifications.recordSaved,
        variant: 'default',
      });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setFormDialogOpen(false);
      setEditingProduct(null);
    },
    onError: (error) => {
      toast({
        title: t.common.save,
        description: getUserFriendlyErrorMessage(error),
        variant: 'destructive',
      });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (productId: string) => adminProductApi.delete(productId),
    onSuccess: () => {
      toast({
        title: t.notifications.recordDeleted,
        description: t.notifications.recordDeleted,
        variant: 'default',
      });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setDeleteConfirmOpen(false);
      setProductToDelete(null);
    },
    onError: (error) => {
      toast({
        title: t.common.delete,
        description: getUserFriendlyErrorMessage(error),
        variant: 'destructive',
      });
    },
  });

  const handleAddProduct = () => {
    setEditingProduct(null);
    setFormDialogOpen(true);
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setFormDialogOpen(true);
  };

  const handleDeleteProduct = (product: Product) => {
    setProductToDelete(product);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = () => {
    if (productToDelete) {
      deleteMutation.mutate(productToDelete.id);
    }
  };

  return (
    <>
      <div className="min-h-screen space-y-6 rounded-2xl bg-gradient-to-b from-slate-100 via-slate-50 to-blue-50/30 p-6 dark:from-slate-950 dark:via-slate-950 dark:to-slate-900">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">{t.admin.products}</h1>
            <p className="mt-1 text-slate-600 dark:text-slate-200">{t.admin.catalog}</p>
          </div>
          <Button
            onClick={handleAddProduct}
            variant="create"
            className="cursor-pointer"
          >
            <Plus className="w-4 h-4 mr-2" />
            {t.common.addNew}
          </Button>
        </div>

        {/* Search */}
        <Card className="border-slate-200 bg-slate-50/90 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-slate-500 dark:text-slate-300" />
              <Input
                placeholder={t.common.searchPlaceholder}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="border-slate-300 bg-slate-100 pl-10 text-slate-900 placeholder:text-slate-500 dark:border-slate-600 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-300"
              />
            </div>
          </CardContent>
        </Card>

        {/* Products Table */}
        <Card className="border-slate-200 bg-slate-50/90 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <CardHeader>
            <CardTitle className="font-bold text-slate-900 dark:text-white">
              {t.admin.products} ({filteredProducts.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                {Array(5).fill(0).map((_, i) => (
                  <div key={i} className="flex items-center gap-4 py-3">
                    <Skeleton className="h-10 w-48" />
                    <Skeleton className="h-10 w-24" />
                    <Skeleton className="h-10 w-32" />
                    <Skeleton className="h-10 w-24" />
                    <Skeleton className="h-10 w-24" />
                    <Skeleton className="h-10 w-20" />
                    <Skeleton className="h-10 w-16" />
                  </div>
                ))}
              </div>
            ) : error ? (
              <Alert variant="destructive">
                <AlertDescription>{t.common.noData}</AlertDescription>
              </Alert>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-8">
                <Package className="mx-auto mb-3 h-12 w-12 text-slate-400 dark:text-slate-300" />
                <p className="font-medium text-slate-600 dark:text-slate-100">
                  {search ? t.common.noItemsFound : t.common.noData}
                </p>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-300">
                  {t.common.tryDifferentSearch}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-800 dark:bg-slate-950">
                      <th className="text-left py-3 px-4 font-semibold text-white">{t.admin.nameEn}</th>
                      <th className="text-left py-3 px-4 font-semibold text-white">{t.admin.sku}</th>
                      <th className="text-left py-3 px-4 font-semibold text-white">{t.admin.category}</th>
                      <th className="text-right py-3 px-4 font-semibold text-white">{t.admin.cost}</th>
                      <th className="text-right py-3 px-4 font-semibold text-white">{t.admin.price}</th>
                      <th className="text-left py-3 px-4 font-semibold text-white">{t.common.status}</th>
                      <th className="text-right py-3 px-4 font-semibold text-white">{t.common.actions}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                    {filteredProducts.map((product) => {
                      const displayName = getLocalized(product.name, language);
                      return (
                        <tr key={product.id} className="hover:bg-slate-100/70 dark:hover:bg-slate-800">
                          <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">{displayName}</td>
                          <td className="py-3 px-4">
                            <span className="rounded-full bg-slate-200 px-2.5 py-0.5 text-xs font-semibold text-slate-700 dark:bg-slate-700 dark:text-white">
                              {product.sku}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-slate-700 dark:text-slate-200">
                            {getCategoryName(product.categoryId)}
                          </td>
                          <td className="py-3 px-4 text-right font-semibold text-slate-900 dark:text-white">
                            {formatCurrency(product.basePricePaisa / 100)}
                          </td>
                          <td className="py-3 px-4 text-right font-semibold text-slate-900 dark:text-white">
                            {product.salePricePaisa ? formatCurrency(product.salePricePaisa / 100) : '—'}
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                                product.isActive
                                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200'
                                  : 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-100'
                              }`}
                            >
                              {product.isActive ? t.common.active : t.common.inactive}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right space-x-2">
                            <Button
                              variant="edit"
                              size="sm"
                              onClick={() => handleEditProduct(product)}
                              disabled={saveMutation.isPending}
                              className="cursor-pointer"
                            >
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="delete"
                              size="sm"
                              onClick={() => handleDeleteProduct(product)}
                              disabled={deleteMutation.isPending}
                              className="cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Product Form Dialog */}
      <AdminProductFormDialog
        open={formDialogOpen}
        onOpenChange={setFormDialogOpen}
        product={editingProduct}
        onSave={async (data) => { await saveMutation.mutateAsync(data); }}
        isLoading={saveMutation.isPending}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent className="border-slate-200 bg-slate-50 text-slate-900 dark:border-slate-600 dark:bg-slate-900 dark:text-white">
          <AlertDialogTitle>{t.common.deleteConfirmTitle}</AlertDialogTitle>
          <AlertDialogDescription>
            {t.common.deleteConfirmDesc} ({productToDelete?.name})
          </AlertDialogDescription>
          <div className="flex justify-end gap-3">
            <AlertDialogCancel className="cursor-pointer">{t.common.cancel}</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={deleteMutation.isPending}
              className="bg-red-600 hover:bg-red-700 cursor-pointer"
            >
              {deleteMutation.isPending ? t.common.loading : t.common.delete}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
