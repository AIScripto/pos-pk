import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Monitor, Plus, Save, CalendarClock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import SearchableSelect from '@/components/admin/SearchableSelect';
import { branchApi } from '@/lib/api/branch.api';
import { tillConfigApi, ShiftTemplate, TillConfig } from '@/lib/api/till-config.api';

const tillTypes = ['counter', 'drive_thru', 'delivery', 'kiosk', 'backup'];

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Save failed';
}

export default function AdminTillSetup() {
  const queryClient = useQueryClient();
  const [branchId, setBranchId] = useState('');
  const [error, setError] = useState('');

  const { data: branches = [] } = useQuery({
    queryKey: ['branches'],
    queryFn: () => branchApi.list(),
  });

  const { data: tills = [], isLoading: tillsLoading } = useQuery({
    queryKey: ['till-config', branchId],
    queryFn: () => tillConfigApi.listTills(branchId),
    enabled: Boolean(branchId),
  });

  const { data: shifts = [], isLoading: shiftsLoading } = useQuery({
    queryKey: ['shift-config', branchId],
    queryFn: () => tillConfigApi.listShifts(branchId),
    enabled: Boolean(branchId),
  });

  const nextTillNumber = useMemo(() => tills.length + 1, [tills.length]);

  const saveTill = useMutation({
    mutationFn: (till: Partial<TillConfig> & { id?: string; branchId: string; name: string }) =>
      till.id ? tillConfigApi.updateTill(till.id, till) : tillConfigApi.createTill(till),
    onSuccess: () => {
      setError('');
      queryClient.invalidateQueries({ queryKey: ['till-config', branchId] });
    },
    onError: (err) => setError(errorMessage(err)),
  });

  const saveShift = useMutation({
    mutationFn: (shift: Partial<ShiftTemplate> & { id?: string; branchId: string; name: string; startTime: string; endTime: string }) =>
      shift.id ? tillConfigApi.updateShift(shift.id, shift) : tillConfigApi.createShift(shift),
    onSuccess: () => {
      setError('');
      queryClient.invalidateQueries({ queryKey: ['shift-config', branchId] });
    },
    onError: (err) => setError(errorMessage(err)),
  });

  const addTill = () => {
    if (!branchId) return;
    saveTill.mutate({
      branchId,
      name: `Till ${nextTillNumber}`,
      code: `TILL-${String(nextTillNumber).padStart(2, '0')}`,
      type: 'counter',
      description: `Counter Till ${nextTillNumber}`,
      sortOrder: nextTillNumber,
      isActive: true,
    });
  };

  const addShift = () => {
    if (!branchId) return;
    saveShift.mutate({
      branchId,
      name: `Shift ${shifts.length + 1}`,
      startTime: '09:00',
      endTime: '17:00',
      sortOrder: shifts.length + 1,
      isActive: true,
    });
  };

  return (
    <div className="min-h-screen space-y-6 bg-muted/40 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
            Tills & Shifts
          </h1>
          <p className="mt-1 text-muted-foreground">
            Number branch tills and configure operational shifts for clean opening and closing.
          </p>
        </div>
      </div>

      <Card className="border-border bg-card shadow-sm">
        <CardContent className="pt-6">
          <label className="mb-2 block text-sm font-semibold text-foreground">
            Branch
          </label>
          <SearchableSelect
            value={branchId}
            onChange={setBranchId}
            placeholder="Select branch"
            options={branches.map((branch) => ({
              value: branch.id,
              label: branch.name,
              sublabel: branch.label,
            }))}
          />
        </CardContent>
      </Card>

      {error && (
        <div className="rounded-lg border border-danger-border bg-danger-subtle px-4 py-3 text-sm text-danger-text dark:border-danger">
          {error}
        </div>
      )}

      {branchId && (
        <div className="grid gap-6 xl:grid-cols-2">
          <Card className="border-border bg-card shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-foreground">
                <Monitor className="h-5 w-5" />
                Tills
              </CardTitle>
              <Button onClick={addTill} disabled={saveTill.isPending}>
                <Plus className="mr-2 h-4 w-4" />
                Add Till
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {tillsLoading && <p className="text-sm text-muted-foreground">Loading tills...</p>}
              {tills.map((till) => (
                <TillRow key={till.id} till={till} onSave={(patch) => saveTill.mutate({ ...till, ...patch, branchId })} />
              ))}
            </CardContent>
          </Card>

          <Card className="border-border bg-card shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-foreground">
                <CalendarClock className="h-5 w-5" />
                Shift Templates
              </CardTitle>
              <Button onClick={addShift} disabled={saveShift.isPending}>
                <Plus className="mr-2 h-4 w-4" />
                Add Shift
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {shiftsLoading && <p className="text-sm text-muted-foreground">Loading shifts...</p>}
              {shifts.map((shift) => (
                <ShiftRow key={shift.id} shift={shift} onSave={(patch) => saveShift.mutate({ ...shift, ...patch, branchId })} />
              ))}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

function TillRow({ till, onSave }: { till: TillConfig; onSave: (patch: Partial<TillConfig>) => void }) {
  const [draft, setDraft] = useState(till);

  useEffect(() => {
    setDraft(till);
  }, [till]);

  return (
    <div className="grid gap-2 rounded-lg border border-border p-3 md:grid-cols-[1fr_1fr_1fr_auto_auto]">
      <Input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
      <Input value={draft.code ?? ''} onChange={(e) => setDraft({ ...draft, code: e.target.value })} />
      <select
        value={draft.type}
        onChange={(e) => setDraft({ ...draft, type: e.target.value })}
        className="rounded-md border border-input bg-background px-3 py-2 text-sm"
      >
        {tillTypes.map((type) => <option key={type} value={type}>{type.replace('_', ' ')}</option>)}
      </select>
      <label className="flex min-w-[88px] items-center justify-between gap-2 rounded-md border border-input bg-background px-3 py-2 text-xs font-semibold text-foreground">
        Active
        <Switch
          checked={draft.isActive}
          onCheckedChange={(isActive) => setDraft({ ...draft, isActive })}
          aria-label={`Toggle ${draft.name}`}
        />
      </label>
      <Button onClick={() => onSave(draft)} variant="secondary">
        <Save className="h-4 w-4" />
      </Button>
    </div>
  );
}

function ShiftRow({ shift, onSave }: { shift: ShiftTemplate; onSave: (patch: Partial<ShiftTemplate>) => void }) {
  const [draft, setDraft] = useState(shift);

  useEffect(() => {
    setDraft(shift);
  }, [shift]);

  return (
    <div className="grid gap-2 rounded-lg border border-border p-3 md:grid-cols-[1fr_120px_120px_auto_auto]">
      <Input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
      <Input type="time" value={draft.startTime} onChange={(e) => setDraft({ ...draft, startTime: e.target.value })} />
      <Input type="time" value={draft.endTime} onChange={(e) => setDraft({ ...draft, endTime: e.target.value })} />
      <label className="flex min-w-[88px] items-center justify-between gap-2 rounded-md border border-input bg-background px-3 py-2 text-xs font-semibold text-foreground">
        Active
        <Switch
          checked={draft.isActive}
          onCheckedChange={(isActive) => setDraft({ ...draft, isActive })}
          aria-label={`Toggle ${draft.name}`}
        />
      </label>
      <Button onClick={() => onSave(draft)} variant="secondary">
        <Save className="h-4 w-4" />
      </Button>
    </div>
  );
}
