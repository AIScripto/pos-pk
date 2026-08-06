import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { getUserFriendlyErrorMessage } from '@/lib/error-handler';
import { stateApi } from '@/lib/api/state.api';
import StateFormDialog from '@/components/admin/StateFormDialog';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Plus, Edit2, Trash2 } from 'lucide-react';

export default function AdminStates() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [formOpen, setFormOpen] = useState(false);
  const [selectedState, setSelectedState] = useState<any>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<any>(null);

  const { data: states = [], isLoading } = useQuery({
    queryKey: ['states'],
    queryFn: () => stateApi.list(),
  });

  const deleteMutation = useMutation({
    mutationFn: (stateId: string) => stateApi.delete(stateId),
    onSuccess: () => {
      toast({
        title: 'State deleted',
        description: 'State has been deleted successfully',
        variant: 'default',
      });
      queryClient.invalidateQueries({ queryKey: ['states'] });
      setDeleteConfirm(null);
    },
    onError: (err: unknown) => {
      toast({
        title: 'Failed to delete state',
        description: getUserFriendlyErrorMessage(err),
        variant: 'destructive',
      });
    },
  });

  const handleEdit = (state: any) => {
    setSelectedState(state);
    setFormOpen(true);
  };

  const handleCreate = () => {
    setSelectedState(null);
    setFormOpen(true);
  };

  const handleCloseForm = () => {
    setFormOpen(false);
    setSelectedState(null);
  };

  const handleDeleteState = (state: any) => {
    setDeleteConfirm(state);
  };

  if (isLoading) {
    return (
      <div className="p-6 text-center text-slate-500">
        Loading states...
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">States</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage states and provinces for your organization
          </p>
        </div>
        <Button onClick={handleCreate} className="gap-2">
          <Plus className="w-4 h-4" />
          Add State
        </Button>
      </div>

      <div className="border rounded-lg border-slate-200 dark:border-slate-700 overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 dark:text-slate-300">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 dark:text-slate-300">
                Tag
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 dark:text-slate-300">
                Code
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 dark:text-slate-300">
                Country
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 dark:text-slate-300">
                Status
              </th>
              <th className="px-6 py-3 text-right text-xs font-semibold text-slate-700 dark:text-slate-300">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
            {states.map((state) => (
              <tr
                key={state.id}
                className="hover:bg-slate-50 dark:hover:bg-slate-900/30 transition-colors"
              >
                <td className="px-6 py-4 text-sm font-medium text-slate-900 dark:text-white">
                  {state.name}
                </td>
                <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                    {state.tag}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                  {state.code || '-'}
                </td>
                <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                  {state.country}
                </td>
                <td className="px-6 py-4 text-sm">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      state.isActive
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300'
                    }`}
                  >
                    {state.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(state)}
                      className="gap-1"
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteState(state)}
                      className="gap-1 text-red-600 hover:text-red-700 hover:bg-red-100 dark:text-red-400 dark:hover:bg-red-900/20"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {states.length === 0 && (
          <div className="px-6 py-8 text-center text-slate-500 dark:text-slate-400">
            No states found. Create one to get started.
          </div>
        )}
      </div>

      <StateFormDialog
        open={formOpen}
        onOpenChange={handleCloseForm}
        state={selectedState}
        onSuccess={() => setSelectedState(null)}
      />

      <AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete State</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deleteConfirm?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            className="bg-red-600 hover:bg-red-700"
            onClick={() => deleteConfirm && deleteMutation.mutate(deleteConfirm.id)}
            disabled={deleteMutation.isPending}
          >
            {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
          </AlertDialogAction>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
