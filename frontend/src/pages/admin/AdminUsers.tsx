import { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { User, userApi, CreateUserInput, UpdateUserInput } from '@/lib/api/user.api';
import { branchApi } from '@/lib/api/branch.api';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Plus, Edit2, Trash2, Users, MapPin, KeyRound } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { getUserFriendlyErrorMessage } from '@/lib/error-handler';
import { useTranslation } from '@/i18n';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import UserFormDialog from '@/components/admin/UserFormDialog';
import AdminPageLayout from '@/components/admin/AdminPageLayout';

export default function AdminUsers() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [formOpen, setFormOpen]       = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deleteOpen, setDeleteOpen]   = useState(false);
  const [toDelete, setToDelete]       = useState<User | null>(null);

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['users'],
    queryFn:  userApi.list,
  });

  const { data: branches = [] } = useQuery({
    queryKey: ['branches'],
    queryFn:  () => branchApi.list(),
  });

  // Build branchId → label map for O(1) lookup in table
  const branchMap = useMemo(
    () => new Map(branches.map((b) => [b.id, `${b.name} (${b.label})`])),
    [branches],
  );

  const saveMutation = useMutation({
    mutationFn: (data: CreateUserInput | UpdateUserInput) =>
      editingUser ? userApi.update(editingUser.id, data as UpdateUserInput)
                  : userApi.create(data as CreateUserInput),
    onSuccess: () => {
      toast({
        title: t.notifications.recordSaved,
        description: t.notifications.recordSaved,
        variant: 'default',
      });
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setFormOpen(false);
      setEditingUser(null);
    },
    onError: (error) => {
      toast({
        title: t.common.save,
        description: getUserFriendlyErrorMessage(error),
        variant: 'destructive',
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => userApi.delete(id),
    onSuccess: () => {
      toast({
        title: t.notifications.recordDeleted,
        description: t.notifications.recordDeleted,
        variant: 'default',
      });
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setDeleteOpen(false);
      setToDelete(null);
    },
    onError: (error) => {
      toast({
        title: t.common.delete,
        description: getUserFriendlyErrorMessage(error),
        variant: 'destructive',
      });
    },
  });

  const openCreate = () => { setEditingUser(null); setFormOpen(true); };
  const openEdit   = (u: User) => { setEditingUser(u); setFormOpen(true); };
  const openDelete = (u: User) => { setToDelete(u); setDeleteOpen(true); };

  return (
    <>
      <AdminPageLayout
        title={t.users.usersTitle}
        description={t.users.allUsers}
        icon={<Users className="w-5 h-5" />}
        action={
          <Button
            onClick={openCreate}
            variant="create"
            className="cursor-pointer"
          >
            <Plus className="w-4 h-4 mr-2" />
            {t.common.addNew}
          </Button>
        }
      >
        <Card className="border-border bg-card shadow-sm">
          <CardHeader>
            <CardTitle className="font-bold text-foreground">
              {t.users.usersTitle} ({users.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted dark:bg-background">
                    <th className="px-4 py-3 text-left font-semibold text-white">{t.users.name}</th>
                    <th className="px-4 py-3 text-left font-semibold text-white">{t.users.email}</th>
                    <th className="px-4 py-3 text-left font-semibold text-white">{t.users.role}</th>
                    <th className="px-4 py-3 text-left font-semibold text-white">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5 text-warning" />
                        {t.admin.branches}
                      </span>
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-white">
                      <span className="flex items-center gap-1"><KeyRound className="h-3.5 w-3.5 text-warning" />{t.users.pinCode}</span>
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-white">{t.common.status}</th>
                    <th className="px-4 py-3 text-right font-semibold text-white">{t.common.actions}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {isLoading ? (
                    <>
                      {Array(5).fill(0).map((_, i) => (
                        <tr key={i}>
                          <td className="px-4 py-3"><Skeleton className="h-8 w-32" /></td>
                          <td className="px-4 py-3"><Skeleton className="h-8 w-40" /></td>
                          <td className="px-4 py-3"><Skeleton className="h-8 w-24" /></td>
                          <td className="px-4 py-3"><Skeleton className="h-8 w-36" /></td>
                          <td className="px-4 py-3"><Skeleton className="h-8 w-20" /></td>
                          <td className="px-4 py-3"><Skeleton className="h-8 w-20" /></td>
                          <td className="px-4 py-3"><Skeleton className="h-8 w-16" /></td>
                        </tr>
                      ))}
                    </>
                  ) : users.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-10 text-center">
                        <Users className="mx-auto mb-3 h-10 w-10 text-muted-foreground/70" />
                        <p className="font-medium text-muted-foreground">{t.common.noData}</p>
                        <p className="mt-1 text-sm text-muted-foreground">{t.common.addNew}</p>
                      </td>
                    </tr>
                  ) : users.map((user) => (
                    <tr key={user.id} className="hover:bg-secondary/70">
                      <td className="px-4 py-3">
                        <p className="font-semibold text-foreground">{user.name}</p>
                        <p className="text-xs text-muted-foreground">{user.username}</p>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{user.email ?? '—'}</td>
                      <td className="px-4 py-3">
                        <span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-semibold text-foreground">
                          {user.role ?? 'No Role'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {user.branchId ? (
                          <span className="flex items-center gap-1 text-sm text-warning-text">
                            <MapPin className="h-3.5 w-3.5 shrink-0" />
                            {branchMap.get(user.branchId) ?? `Branch #${user.branchId}`}
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground/70">Org-wide</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {user.hasPin ? (
                          <span className="flex items-center gap-1 text-xs font-semibold text-success-text">
                            <KeyRound className="h-3.5 w-3.5" /> {t.common.active}
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground/70">{t.common.inactive}</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          user.isActive
                            ? 'bg-success-subtle text-success-text'
                            : 'bg-secondary text-muted-foreground'
                        }`}>
                          {user.isActive ? t.common.active : t.common.inactive}
                        </span>
                      </td>
                      <td className="px-4 py-3 space-x-2 text-right">
                        <Button
                          variant="edit" size="sm"
                          onClick={() => openEdit(user)}
                          disabled={saveMutation.isPending}
                          className="cursor-pointer"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="delete" size="sm"
                          onClick={() => openDelete(user)}
                          disabled={deleteMutation.isPending}
                          className="cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </AdminPageLayout>

      <UserFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        user={editingUser}
        onSave={async (data) => { await saveMutation.mutateAsync(data); }}
        isLoading={saveMutation.isPending}
      />

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent className="border-border bg-muted/40 text-foreground">
          <AlertDialogTitle>{t.common.deleteConfirmTitle}</AlertDialogTitle>
          <AlertDialogDescription>
            {t.common.deleteConfirmDesc} ({toDelete?.name})
          </AlertDialogDescription>
          <div className="flex justify-end gap-3">
            <AlertDialogCancel className="cursor-pointer">{t.common.cancel}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => toDelete && deleteMutation.mutate(toDelete.id)}
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

