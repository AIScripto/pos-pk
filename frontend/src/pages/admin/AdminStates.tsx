import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { getUserFriendlyErrorMessage } from '@/lib/error-handler';
import { stateApi, type State } from '@/lib/api/state.api';
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
  const [selectedState, setSelectedState] = useState<State | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<State | null>(null);

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

  const handleEdit = (state: State) => {
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

  const handleDeleteState = (state: State) => {
    setDeleteConfirm(state);
  };

  if (isLoading) {
    return (
      <div className="p-6 text-center text-muted-foreground">
        Loading states...
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-foreground">States</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage states and provinces for your organization
          </p>
        </div>
        <Button onClick={handleCreate} className="gap-2">
          <Plus className="w-4 h-4" />
          Add State
        </Button>
      </div>

      <div className="border rounded-lg border-border overflow-hidden">
        <table className="w-full">
          <thead className="bg-muted/40 border-b border-border">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground">
                Tag
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground">
                Code
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground">
                Country
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground">
                Status
              </th>
              <th className="px-6 py-3 text-right text-xs font-semibold text-muted-foreground">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {states.map((state) => (
              <tr
                key={state.id}
                className="hover:bg-muted/40 transition-colors"
              >
                <td className="px-6 py-4 text-sm font-medium text-foreground">
                  {state.name}
                </td>
                <td className="px-6 py-4 text-sm text-muted-foreground">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-info-subtle text-primary">
                    {state.tag}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-muted-foreground">
                  {state.code || '-'}
                </td>
                <td className="px-6 py-4 text-sm text-muted-foreground">
                  {state.country}
                </td>
                <td className="px-6 py-4 text-sm">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      state.isActive
                        ? 'bg-success-subtle text-success-text dark:bg-success/30 dark:text-success'
                        : 'bg-secondary text-foreground'
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
                      className="gap-1 text-danger-text hover:text-danger-text hover:bg-danger-subtle dark:hover:bg-danger/20"
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
          <div className="px-6 py-8 text-center text-muted-foreground">
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
            className="bg-danger hover:bg-danger/90"
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
