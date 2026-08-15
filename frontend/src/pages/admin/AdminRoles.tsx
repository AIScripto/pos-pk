import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { getUserFriendlyErrorMessage } from '@/lib/error-handler';
import { Role, roleApi, CreateRoleInput, UpdateRoleInput } from '@/lib/api/role.api';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Plus, Edit2, Trash2, AlertCircle, Shield } from 'lucide-react';
import { useTranslation } from '@/i18n';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import RoleFormDialog from '@/components/admin/RoleFormDialog';
import AdminPageLayout from '@/components/admin/AdminPageLayout';

export default function AdminRoles() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState<Role | null>(null);

  const { data: roles = [], isLoading } = useQuery({
    queryKey: ['roles'],
    queryFn: () => roleApi.list(),
  });

  const saveMutation = useMutation({
    mutationFn: async (data: CreateRoleInput | UpdateRoleInput) => {
      if (editingRole) {
        return roleApi.update(editingRole.id, data as UpdateRoleInput);
      } else {
        return roleApi.create(data as CreateRoleInput);
      }
    },
    onSuccess: () => {
      toast({
        title: t.notifications.recordSaved,
        description: t.notifications.recordSaved,
        variant: 'default',
      });
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      setFormDialogOpen(false);
      setEditingRole(null);
    },
    onError: (err: unknown) => {
      toast({
        title: t.common.save,
        description: getUserFriendlyErrorMessage(err),
        variant: 'destructive',
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (roleId: string) => roleApi.delete(roleId),
    onSuccess: () => {
      toast({
        title: t.notifications.recordDeleted,
        description: t.notifications.recordDeleted,
        variant: 'default',
      });
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      setDeleteConfirmOpen(false);
      setRoleToDelete(null);
    },
    onError: (err: unknown) => {
      toast({
        title: t.common.delete,
        description: getUserFriendlyErrorMessage(err),
        variant: 'destructive',
      });
    },
  });

  const isSystemRole = (tag: string) =>
    ['admin', 'manager', 'cashier', 'kitchen'].includes(tag);

  return (
    <>
      <AdminPageLayout
        title={t.roles.rolesTitle}
        description={t.roles.rolesTitle}
        icon={<Shield className="w-5 h-5" />}
        action={
          <Button
            onClick={() => { setEditingRole(null); setFormDialogOpen(true); }}
            className="bg-slate-800 text-white hover:bg-slate-900 dark:bg-blue-600 dark:hover:bg-blue-700 cursor-pointer"
          >
            <Plus className="w-4 h-4 mr-2" />
            {t.common.addNew}
          </Button>
        }
      >
        <Alert className="border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-300">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {t.roles.admin}, {t.roles.manager}, {t.roles.cashier}, {t.roles.kitchen}
          </AlertDescription>
        </Alert>

        <Card className="border-slate-200 bg-slate-50/90 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <CardHeader>
            <CardTitle className="font-bold text-slate-900 dark:text-white">
              {t.roles.rolesTitle} ({roles.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-800 dark:bg-slate-950">
                    <th className="px-4 py-3 text-left font-semibold text-white">{t.roles.roleName}</th>
                    <th className="px-4 py-3 text-left font-semibold text-white">{t.admin.slug}</th>
                    <th className="px-4 py-3 text-left font-semibold text-white">{t.roles.description}</th>
                    <th className="px-4 py-3 text-left font-semibold text-white">{t.common.status}</th>
                    <th className="px-4 py-3 text-right font-semibold text-white">{t.common.actions}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                  {isLoading ? (
                    <tr>
                      <td colSpan={5} className="py-10 text-center text-slate-500 dark:text-slate-400">
                        {t.common.loading}
                      </td>
                    </tr>
                  ) : roles.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-10 text-center">
                        <Shield className="mx-auto mb-3 h-12 w-12 text-slate-400" />
                        <p className="font-medium text-slate-600 dark:text-slate-300">{t.common.noData}</p>
                      </td>
                    </tr>
                  ) : (
                    roles.map((role) => (
                      <tr key={role.id} className="hover:bg-slate-100/70 dark:hover:bg-slate-800">
                        <td className="px-4 py-3 font-semibold text-slate-900 dark:text-white">
                          {role.name}
                          {isSystemRole(role.tag) && (
                            <span className="ml-2 rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
                              System
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <span className="rounded bg-slate-200 px-2 py-0.5 font-mono text-xs text-slate-700 dark:bg-slate-700 dark:text-slate-300">
                            {role.tag}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{role.description || '—'}</td>
                        <td className="px-4 py-3">
                          <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                            role.isActive
                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
                              : 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-400'
                          }`}>
                            {role.isActive ? t.common.active : t.common.inactive}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right space-x-2">
                          <Button
                            variant="ghost" size="sm"
                            onClick={() => { setEditingRole(role); setFormDialogOpen(true); }}
                            disabled={isSystemRole(role.tag) || saveMutation.isPending}
                            className="text-slate-600 hover:bg-slate-200 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-white cursor-pointer"
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost" size="sm"
                            onClick={() => { setRoleToDelete(role); setDeleteConfirmOpen(true); }}
                            disabled={isSystemRole(role.tag) || deleteMutation.isPending}
                            className="text-rose-600 hover:bg-rose-100 hover:text-rose-700 dark:text-rose-400 dark:hover:bg-rose-900/30 cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </AdminPageLayout>

      <RoleFormDialog
        open={formDialogOpen}
        onOpenChange={setFormDialogOpen}
        role={editingRole}
        onSave={async (data) => { await saveMutation.mutateAsync(data); }}
        isLoading={saveMutation.isPending}
      />

      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent className="border-slate-200 bg-slate-50 text-slate-900 dark:border-slate-600 dark:bg-slate-900 dark:text-white">
          <AlertDialogTitle>{t.common.deleteConfirmTitle}</AlertDialogTitle>
          <AlertDialogDescription>
            {t.common.deleteConfirmDesc} ({roleToDelete?.name})
          </AlertDialogDescription>
          <div className="flex justify-end gap-3">
            <AlertDialogCancel className="cursor-pointer">{t.common.cancel}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => roleToDelete && deleteMutation.mutate(roleToDelete.id)}
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

