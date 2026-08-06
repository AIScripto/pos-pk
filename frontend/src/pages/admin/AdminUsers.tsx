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
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import UserFormDialog from '@/components/admin/UserFormDialog';
import AdminPageLayout from '@/components/admin/AdminPageLayout';

export default function AdminUsers() {
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
      const action = editingUser ? 'updated' : 'created';
      toast({
        title: `User ${action}`,
        description: `User has been ${action} successfully`,
        variant: 'default',
      });
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setFormOpen(false);
      setEditingUser(null);
    },
    onError: (error) => {
      const action = editingUser ? 'update' : 'create';
      toast({
        title: `Failed to ${action} user`,
        description: getUserFriendlyErrorMessage(error),
        variant: 'destructive',
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => userApi.delete(id),
    onSuccess: () => {
      toast({
        title: 'User deleted',
        description: 'User has been deleted successfully',
        variant: 'default',
      });
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setDeleteOpen(false);
      setToDelete(null);
    },
    onError: (error) => {
      toast({
        title: 'Failed to delete user',
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
        title="Users"
        description="Manage user accounts, roles, and branch assignments"
        icon={<Users className="w-5 h-5" />}
        action={
          <Button
            onClick={openCreate}
            variant="create"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add User
          </Button>
        }
      >
        <Card className="border-slate-200 bg-slate-50/90 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <CardHeader>
            <CardTitle className="font-bold text-slate-900 dark:text-white">
              Users ({users.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-800 dark:bg-slate-950">
                    <th className="px-4 py-3 text-left font-semibold text-white">Name</th>
                    <th className="px-4 py-3 text-left font-semibold text-white">Email</th>
                    <th className="px-4 py-3 text-left font-semibold text-white">Role</th>
                    <th className="px-4 py-3 text-left font-semibold text-white">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5 text-orange-400" />
                        Branch
                      </span>
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-white">
                      <span className="flex items-center gap-1"><KeyRound className="h-3.5 w-3.5 text-orange-400" />PIN</span>
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-white">Status</th>
                    <th className="px-4 py-3 text-right font-semibold text-white">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
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
                        <Users className="mx-auto mb-3 h-10 w-10 text-slate-400" />
                        <p className="font-medium text-slate-600 dark:text-slate-300">No users yet</p>
                        <p className="mt-1 text-sm text-slate-500">Click "Add User" to create one</p>
                      </td>

                    </tr>
                  ) : users.map((user) => (
                    <tr key={user.id} className="hover:bg-slate-100/70 dark:hover:bg-slate-800">
                      <td className="px-4 py-3">
                        <p className="font-semibold text-slate-900 dark:text-white">{user.name}</p>
                        <p className="text-xs text-slate-500">{user.username}</p>
                      </td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{user.email ?? '—'}</td>
                      <td className="px-4 py-3">
                        <span className="rounded-full bg-slate-200 px-2.5 py-0.5 text-xs font-semibold text-slate-700 dark:bg-slate-700 dark:text-slate-200">
                          {user.role ?? 'No Role'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {user.branchId ? (
                          <span className="flex items-center gap-1 text-sm text-orange-700 dark:text-orange-300">
                            <MapPin className="h-3.5 w-3.5 shrink-0" />
                            {branchMap.get(user.branchId) ?? `Branch #${user.branchId}`}
                          </span>
                        ) : (
                          <span className="text-xs text-slate-400">Org-wide</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {user.hasPin ? (
                          <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                            <KeyRound className="h-3.5 w-3.5" /> Set
                          </span>
                        ) : (
                          <span className="text-xs text-slate-400">Not set</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          user.isActive
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
                            : 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-400'
                        }`}>
                          {user.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-4 py-3 space-x-2 text-right">
                        <Button
                          variant="edit" size="sm"
                          onClick={() => openEdit(user)}
                          disabled={saveMutation.isPending}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="delete" size="sm"
                          onClick={() => openDelete(user)}
                          disabled={deleteMutation.isPending}
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
        <AlertDialogContent className="border-slate-200 bg-slate-50 text-slate-900 dark:border-slate-600 dark:bg-slate-900 dark:text-white">
          <AlertDialogTitle>Delete User</AlertDialogTitle>
          <AlertDialogDescription>
            Delete "{toDelete?.name}"? This cannot be undone.
          </AlertDialogDescription>
          <div className="flex justify-end gap-3">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => toDelete && deleteMutation.mutate(toDelete.id)}
              disabled={deleteMutation.isPending}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleteMutation.isPending ? 'Deleting…' : 'Delete'}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
