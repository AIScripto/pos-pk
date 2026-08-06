import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { authApi } from '@/lib/api/auth.api';
import { managerOverviewApi } from '@/lib/api/manager-overview.api';
import { useToast } from '@/hooks/use-toast';
import { KITCHEN_STATES } from '@/components/admin/manager/ManagerCommon';

const BRANCH_FIXED_ROLES = new Set(['branch_manager', 'manager']);
export type TabCategory = 'overview' | 'openclosing' | 'tills' | 'kitchen';

export function useManagerPanelState() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  // Active Tab state synced with URL ?tab=...
  const activeTab = (searchParams.get('tab') as TabCategory) || 'overview';
  const setActiveTab = (tab: TabCategory) => {
    setSearchParams({ tab }, { replace: true });
  };

  const isBranchFixed = BRANCH_FIXED_ROLES.has(user?.role ?? '');
  const [branchId, setBranchId] = useState(user?.branchId ?? user?.branchIds?.[0] ?? '');

  const { data: branches = [] } = useQuery({
    queryKey: ['manager-branches'],
    queryFn:  authApi.branches,
    enabled:  !isBranchFixed,
  });

  const allowedBranches = useMemo(() => {
    if (isBranchFixed) return [];
    if (user?.branchId) return branches.filter((b) => b.id === user.branchId);
    if (user?.branchIds?.length) return branches.filter((b) => user.branchIds.includes(b.id));
    return branches;
  }, [isBranchFixed, branches, user?.branchId, user?.branchIds]);

  useEffect(() => {
    if (!branchId && allowedBranches.length > 0) setBranchId(allowedBranches[0].id);
  }, [allowedBranches, branchId]);

  const isMultiBranch = !isBranchFixed && allowedBranches.length > 1;
  const activeBranch  = isBranchFixed
    ? { name: user?.branchName ?? user?.branchId ?? '', label: user?.branchName ?? '' }
    : allowedBranches.find((b) => b.id === branchId);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['manager-overview', branchId],
    queryFn: () => managerOverviewApi.overview(branchId),
    enabled: Boolean(branchId),
    refetchInterval: 30_000,
  });

  const { data: shiftSummary } = useQuery({
    queryKey: ['manager-shift-summary', branchId],
    queryFn: () => managerOverviewApi.shiftSummary(branchId),
    enabled: Boolean(branchId && data?.operations.shiftSession),
    refetchInterval: 30_000,
  });

  const { data: daySummary } = useQuery({
    queryKey: ['manager-day-summary', branchId],
    queryFn: () => managerOverviewApi.businessDaySummary(branchId),
    enabled: Boolean(branchId && data?.operations.businessDay),
    refetchInterval: 30_000,
  });

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ['manager-overview', branchId] });
    queryClient.invalidateQueries({ queryKey: ['manager-shift-summary', branchId] });
    queryClient.invalidateQueries({ queryKey: ['manager-day-summary', branchId] });
  };

  const ERROR_MESSAGES: Record<string, string> = {
    BUSINESS_DAY_NOT_OPEN:      'Business day is not open.',
    BUSINESS_DAY_ALREADY_CLOSED:'This business day was already closed. Cannot re-open it.',
    SHIFT_NOT_OPEN:             'No shift is currently open.',
    NO_REMAINING_SHIFTS:        'All configured shifts have been used for today. Add more shift templates in Setup.',
    NO_ACTIVE_SHIFT:            'No shift template matches the current time.',
    ACTIVE_TILLS_EXIST:         'Close all open tills before closing the shift or day.',
    OPEN_SHIFTS_EXIST:          'Close the current shift before closing the business day.',
    TILL_NOT_PENDING_APPROVAL:  'This till is not awaiting approval.',
    BRANCH_NOT_FOUND:           'Branch not found. Please refresh and try again.',
    PREVIOUS_DAY_NOT_CLOSED:    'The previous business day is still open. Close it first before opening a new one.',
  };

  const onErr = (label: string) => (err: unknown) => {
    const msg = (err as Error)?.message ?? String(err);
    toast({
      title:       `${label} failed`,
      description: ERROR_MESSAGES[msg] ?? msg,
      variant:     'destructive',
    });
  };

  const openDay    = useMutation({ mutationFn: () => managerOverviewApi.openBusinessDay(branchId), onSuccess: refresh, onError: onErr('Open Day') });
  const closeDay   = useMutation({ mutationFn: (notes?: string) => managerOverviewApi.closeBusinessDay(branchId, notes), onSuccess: refresh, onError: onErr('Close Day') });
  const openShift  = useMutation({ mutationFn: () => managerOverviewApi.openShift(branchId, data?.operations.suggestedShift?.id), onSuccess: refresh, onError: onErr('Open Shift') });
  const closeShift = useMutation({ mutationFn: (notes?: string) => managerOverviewApi.closeShift(branchId, notes), onSuccess: refresh, onError: onErr('Close Shift') });
  const approveClose = useMutation({ mutationFn: ({ sessionId, notes }: { sessionId: string; notes?: string }) => managerOverviewApi.approveTillClose(sessionId, notes), onSuccess: refresh, onError: onErr('Approve Close') });
  const rejectClose  = useMutation({ mutationFn: ({ sessionId, notes }: { sessionId: string; notes?: string }) => managerOverviewApi.rejectTillClose(sessionId, notes), onSuccess: refresh, onError: onErr('Reject Close') });
  const forceClose   = useMutation({ mutationFn: ({ sessionId, notes }: { sessionId: string; notes?: string }) => managerOverviewApi.forceCloseTill(sessionId, notes), onSuccess: refresh, onError: onErr('Force Close Till') });

  // Themed modal prompt state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalDescription, setModalDescription] = useState('');
  const [modalInputLabel, setModalInputLabel] = useState('');
  const [modalInputValue, setModalInputValue] = useState('');
  const [modalOnConfirm, setModalOnConfirm] = useState<((notes: string) => void) | null>(null);
  const [modalTheme, setModalTheme] = useState<'blue' | 'orange' | 'emerald' | 'amber' | 'danger'>('blue');

  const openModalPrompt = ({
    title,
    description,
    inputLabel,
    defaultValue = '',
    onConfirm,
    theme = 'blue'
  }: {
    title: string;
    description: string;
    inputLabel: string;
    defaultValue?: string;
    onConfirm: (notes: string) => void;
    theme?: 'blue' | 'orange' | 'emerald' | 'amber' | 'danger';
  }) => {
    setModalTitle(title);
    setModalDescription(description);
    setModalInputLabel(inputLabel);
    setModalInputValue(defaultValue);
    setModalOnConfirm(() => onConfirm);
    setModalTheme(theme);
    setModalOpen(true);
  };

  const kitchenByState = useMemo(() => {
    const map = new Map<string, NonNullable<typeof data>['kitchen']['orders']>();
    for (const s of KITCHEN_STATES) map.set(s.key, []);
    for (const order of data?.kitchen.orders ?? []) {
      const bucket = map.get(order.status) ?? [];
      bucket.push(order);
      map.set(order.status, bucket);
    }
    return map;
  }, [data?.kitchen.orders]);

  const ops         = data?.operations;
  const hasOpenDay  = Boolean(ops?.businessDay);
  const hasOpenShift = Boolean(ops?.shiftSession);

  // Active tills only exist if a Business Day and Shift Session are currently open
  const activeTillsList = useMemo(() => {
    if (!hasOpenDay || !hasOpenShift) return [];
    return data?.tills ?? [];
  }, [hasOpenDay, hasOpenShift, data?.tills]);

  const openTills   = activeTillsList.length;
  const pendingTills = data?.totals.pendingCloseTills ?? 0;
  const canCloseShift = hasOpenShift && openTills === 0 && pendingTills === 0;
  const canCloseDay   = hasOpenDay && !hasOpenShift && openTills === 0 && pendingTills === 0;
  const totalKitchenOrders = data?.kitchen.orders.length ?? 0;

  return {
    user,
    activeTab,
    setActiveTab,
    isBranchFixed,
    branchId,
    setBranchId,
    allowedBranches,
    isMultiBranch,
    activeBranch,
    data,
    isLoading,
    error,
    refetch,
    shiftSummary,
    daySummary,
    openDay,
    closeDay,
    openShift,
    closeShift,
    approveClose,
    rejectClose,
    forceClose,
    modalOpen,
    setModalOpen,
    modalTitle,
    modalDescription,
    modalInputLabel,
    modalInputValue,
    setModalInputValue,
    modalOnConfirm,
    modalTheme,
    openModalPrompt,
    kitchenByState,
    ops,
    hasOpenDay,
    hasOpenShift,
    activeTillsList,
    openTills,
    pendingTills,
    canCloseShift,
    canCloseDay,
    totalKitchenOrders,
  };
}
