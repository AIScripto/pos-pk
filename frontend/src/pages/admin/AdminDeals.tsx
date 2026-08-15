import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { getUserFriendlyErrorMessage } from '@/lib/error-handler';
import { adminDealApi, Deal, CreateDealInput, UpdateDealInput } from '@/lib/api/admin-deal.api';
import { adminProductApi } from '@/lib/api/admin-product.api';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Plus, Search, Edit2, Trash2, Zap } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { useTranslation, getLocalized } from '@/i18n';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import AdminDealFormDialog from '@/components/admin/AdminDealFormDialog';
import { formatCurrency } from '@/utils/pos';

export default function AdminDeals() {
  const { t, language } = useTranslation();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [editingDeal, setEditingDeal] = useState<Deal | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [dealToDelete, setDealToDelete] = useState<Deal | null>(null);

  // Load all deals
  const { data: deals = [], isLoading, error } = useQuery({
    queryKey: ['deals'],
    queryFn: () => adminDealApi.list(),
  });

  // Load all products (to resolve names in table)
  const { data: products = [] } = useQuery({
    queryKey: ['adminProducts'],
    queryFn: () => adminProductApi.list(),
  });

  // Filter deals based on search
  const filteredDeals = useMemo(() => {
    return deals.filter(deal => {
      const searchLower = search.toLowerCase();
      const localizedName = getLocalized(deal.name, language);
      return (
        localizedName.toLowerCase().includes(searchLower) ||
        deal.name.toLowerCase().includes(searchLower) ||
        deal.tag.toLowerCase().includes(searchLower) ||
        (deal.description?.toLowerCase().includes(searchLower) || false)
      );
    });
  }, [deals, search, language]);

  // Create/Update mutation
  const saveMutation = useMutation({
    mutationFn: async (data: CreateDealInput | UpdateDealInput) => {
      if (editingDeal) {
        return adminDealApi.update(editingDeal.id, data as UpdateDealInput);
      } else {
        return adminDealApi.create(data as CreateDealInput);
      }
    },
    onSuccess: () => {
      toast({
        title: t.notifications.recordSaved,
        description: t.notifications.recordSaved,
        variant: 'default',
      });
      queryClient.invalidateQueries({ queryKey: ['deals'] });
      setFormDialogOpen(false);
      setEditingDeal(null);
    },
    onError: (err: unknown) => {
      toast({
        title: t.common.save,
        description: getUserFriendlyErrorMessage(err),
        variant: 'destructive',
      });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (dealId: string) => {
      return adminDealApi.delete(dealId);
    },
    onSuccess: () => {
      toast({
        title: t.notifications.recordDeleted,
        description: t.notifications.recordDeleted,
        variant: 'default',
      });
      queryClient.invalidateQueries({ queryKey: ['deals'] });
      setDeleteConfirmOpen(false);
      setDealToDelete(null);
    },
    onError: (err: unknown) => {
      toast({
        title: t.common.delete,
        description: getUserFriendlyErrorMessage(err),
        variant: 'destructive',
      });
    },
  });

  const handleAddDeal = () => {
    setEditingDeal(null);
    setFormDialogOpen(true);
  };

  const handleEditDeal = (deal: Deal) => {
    setEditingDeal(deal);
    setFormDialogOpen(true);
  };

  const handleDeleteDeal = (deal: Deal) => {
    setDealToDelete(deal);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = () => {
    if (dealToDelete) {
      deleteMutation.mutate(dealToDelete.id);
    }
  };

  return (
    <>
      <div className="min-h-screen space-y-6 rounded-2xl bg-gradient-to-b from-slate-100 via-slate-50 to-blue-50/30 p-6 dark:from-slate-950 dark:via-slate-950 dark:to-slate-900">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">{t.admin.deals}</h1>
            <p className="mt-1 text-slate-600 dark:text-slate-200">{t.admin.catalog}</p>
          </div>
          <Button
            onClick={handleAddDeal}
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

        {/* Deals Table */}
        <Card className="border-slate-200 bg-slate-50/90 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <CardHeader>
            <CardTitle className="font-bold text-slate-900 dark:text-white">
              {t.admin.deals} ({filteredDeals.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">
                <p className="text-slate-500 dark:text-slate-200">{t.common.loading}</p>
              </div>
            ) : error ? (
              <Alert variant="destructive">
                <AlertDescription>{t.common.noData}</AlertDescription>
              </Alert>
            ) : filteredDeals.length === 0 ? (
              <div className="text-center py-8">
                <Zap className="mx-auto mb-3 h-12 w-12 text-slate-400 dark:text-slate-300" />
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
                      <th className="text-left py-3 px-4 font-semibold text-white">{t.admin.slug}</th>
                      <th className="text-left py-3 px-4 font-semibold text-white">{t.pos.dealItems}</th>
                      <th className="text-right py-3 px-4 font-semibold text-white">{t.admin.cost}</th>
                      <th className="text-right py-3 px-4 font-semibold text-white">{t.admin.price}</th>
                      <th className="text-center py-3 px-4 font-semibold text-white">{t.discount.discountTitle}</th>
                      <th className="text-left py-3 px-4 font-semibold text-white">{t.common.status}</th>
                      <th className="text-right py-3 px-4 font-semibold text-white">{t.common.actions}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                    {filteredDeals.map((deal) => {
                      const displayName = getLocalized(deal.name, language);
                      return (
                        <tr key={deal.id} className="hover:bg-slate-100/70 dark:hover:bg-slate-800">
                          <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">
                            <p>{displayName}</p>
                            {deal.description && (
                              <p className="text-[10px] font-normal text-slate-400 dark:text-slate-500 max-w-[200px] truncate">
                                {deal.description}
                              </p>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            <span className="rounded-full bg-slate-200 px-2.5 py-0.5 text-xs font-semibold text-slate-700 dark:bg-slate-700 dark:text-white">
                              {deal.tag}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex flex-wrap gap-1 max-w-[200px]">
                              {(() => {
                                const counts: Record<string, number> = {};
                                (deal.productIds || []).forEach(id => {
                                  counts[id] = (counts[id] || 0) + 1;
                                });
                                return Object.entries(counts).map(([id, qty]) => {
                                  const prod = products.find((p) => p.id === id);
                                  if (!prod) return null;
                                  const prodName = getLocalized(prod.name, language);
                                  return (
                                    <Badge key={id} variant="outline" className="text-[10px] px-1.5 py-0.5 border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
                                      {qty > 1 ? `${qty}x ` : ''}{prodName}
                                    </Badge>
                                  );
                                });
                              })()}
                              {(!deal.productIds || deal.productIds.length === 0) && (
                                <span className="text-xs text-slate-400 dark:text-slate-500">—</span>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-4 text-right font-semibold text-slate-900 dark:text-white">
                            {formatCurrency(deal.basePricePaisa / 100)}
                          </td>
                          <td className="py-3 px-4 text-right font-semibold text-slate-900 dark:text-white">
                            {deal.salePricePaisa ? formatCurrency(deal.salePricePaisa / 100) : '—'}
                          </td>
                          <td className="py-3 px-4 text-center">
                            {deal.discountPercentage ? (
                              <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-700 dark:bg-amber-900/40 dark:text-amber-200">
                                {deal.discountPercentage}%
                              </span>
                            ) : (
                              <span className="text-slate-400 dark:text-slate-500">—</span>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                                deal.isActive
                                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200'
                                  : 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-100'
                              }`}
                            >
                              {deal.isActive ? t.common.active : t.common.inactive}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right space-x-2">
                            <Button
                              variant="edit"
                              size="sm"
                              onClick={() => handleEditDeal(deal)}
                              disabled={saveMutation.isPending}
                              className="cursor-pointer"
                            >
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="delete"
                              size="sm"
                              onClick={() => handleDeleteDeal(deal)}
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

      {/* Deal Form Dialog */}
      <AdminDealFormDialog
        open={formDialogOpen}
        onOpenChange={setFormDialogOpen}
        deal={editingDeal}
        onSave={(data) => saveMutation.mutateAsync(data)}
        isLoading={saveMutation.isPending}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent className="border-slate-200 bg-slate-50 text-slate-900 dark:border-slate-600 dark:bg-slate-900 dark:text-white">
          <AlertDialogTitle>{t.common.deleteConfirmTitle}</AlertDialogTitle>
          <AlertDialogDescription>
            {t.common.deleteConfirmDesc} ({dealToDelete?.name})
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

