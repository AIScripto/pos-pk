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
            className="bg-muted text-white hover:bg-muted dark:bg-primary dark:hover:bg-primary/90 cursor-pointer"
          >
            <Plus className="w-4 h-4 mr-2" />
            {t.common.addNew}
          </Button>
        }
      >
        <Alert className="border-warning-border bg-warning-subtle text-warning-text dark:text-warning">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {t.roles.admin}, {t.roles.manager}, {t.roles.cashier}, {t.roles.kitchen}
          </AlertDescription>
        </Alert>

        <Card className="border-border bg-card shadow-sm">
          <CardHeader>
            <CardTitle className="font-bold text-foreground">
              {t.roles.rolesTitle} ({roles.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted dark:bg-background">
                    <th className="px-4 py-3 text-left font-semibold text-white">{t.roles.roleName}</th>
                    <th className="px-4 py-3 text-left font-semibold text-white">{t.admin.slug}</th>
                    <th className="px-4 py-3 text-left font-semibold text-white">{t.roles.description}</th>
                    <th className="px-4 py-3 text-left font-semibold text-white">{t.common.status}</th>
                    <th className="px-4 py-3 text-right font-semibold text-white">{t.common.actions}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {isLoading ? (
                    <tr>
                      <td colSpan={5} className="py-10 text-center text-muted-foreground">
                        {t.common.loading}
                      </td>
                    </tr>
                  ) : roles.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-10 text-center">
                        <Shield className="mx-auto mb-3 h-12 w-12 text-muted-foreground/70" />
                        <p className="font-medium text-muted-foreground">{t.common.noData}</p>
                      </td>
                    </tr>
                  ) : (
                    roles.map((role) => (
                      <tr key={role.id} className="hover:bg-secondary/70">
                        <td className="px-4 py-3 font-semibold text-foreground">
                          {role.name}
                          {isSystemRole(role.tag) && (
                            <span className="ml-2 rounded-full bg-info-subtle px-2 py-0.5 text-xs font-medium text-primary">
                              System
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <span className="rounded bg-secondary px-2 py-0.5 font-mono text-xs text-muted-foreground">
                            {role.tag}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">{role.description || '—'}</td>
                        <td className="px-4 py-3">
                          <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                            role.isActive
                              ? 'bg-success-subtle text-success-text'
                              : 'bg-secondary text-muted-foreground'
                          }`}>
                            {role.isActive ? t.common.active : t.common.inactive}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right space-x-2">
                          <Button
                            variant="ghost" size="sm"
                            onClick={() => { setEditingRole(role); setFormDialogOpen(true); }}
                            disabled={isSystemRole(role.tag) || saveMutation.isPending}
                            className="text-muted-foreground hover:bg-secondary hover:text-foreground cursor-pointer"
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost" size="sm"
                            onClick={() => { setRoleToDelete(role); setDeleteConfirmOpen(true); }}
                            disabled={isSystemRole(role.tag) || deleteMutation.isPending}
                            className="text-danger-text hover:bg-danger-subtle hover:text-danger-text cursor-pointer"
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
        <AlertDialogContent className="border-border bg-muted/40 text-foreground">
          <AlertDialogTitle>{t.common.deleteConfirmTitle}</AlertDialogTitle>
          <AlertDialogDescription>
            {t.common.deleteConfirmDesc} ({roleToDelete?.name})
          </AlertDialogDescription>
          <div className="flex justify-end gap-3">
            <AlertDialogCancel className="cursor-pointer">{t.common.cancel}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => roleToDelete && deleteMutation.mutate(roleToDelete.id)}
              disabled={deleteMutation.isPending}
              className="bg-danger hover:bg-danger/90 cursor-pointer"
            >
              {deleteMutation.isPending ? t.common.loading : t.common.delete}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

