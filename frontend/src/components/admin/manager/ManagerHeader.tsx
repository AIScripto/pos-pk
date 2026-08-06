import { RefreshCw, ChevronDown } from 'lucide-react';
import { formatDate } from './ManagerCommon';

interface ManagerHeaderProps {
  activeBranch?: { name: string; label: string };
  businessDate?: string;
  shiftSessionName?: string;
  isLoading: boolean;
  onRefresh: () => void;
  isBranchFixed: boolean;
  isMultiBranch: boolean;
  branchId: string;
  setBranchId: (id: string) => void;
  allowedBranches: Array<{ id: string; name: string; label: string }>;
}

export function ManagerHeader({
  activeBranch,
  businessDate,
  shiftSessionName,
  isLoading,
  onRefresh,
  isBranchFixed,
  isMultiBranch,
  branchId,
  setBranchId,
  allowedBranches,
}: ManagerHeaderProps) {
  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-850 dark:bg-slate-950 md:flex-row md:items-center md:justify-between">
      <div className="min-w-0">
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-zinc-400 dark:text-zinc-500">Manager Operations</p>
        <h1 className="mt-0.5 truncate text-xl font-bold tracking-tight text-slate-900 dark:text-white">
          {activeBranch ? activeBranch.name : 'Branch Control Panel'}
        </h1>
        <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
          {businessDate ? `Business date ${formatDate(businessDate)}` : 'Live operations dashboard'}
          {shiftSessionName && ` · ${shiftSessionName}`}
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-3">
        <button
          onClick={onRefresh}
          disabled={isLoading}
          title="Refresh"
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:bg-slate-50 disabled:opacity-40 dark:border-slate-700 dark:hover:bg-slate-900"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
        </button>

        {!isBranchFixed && isMultiBranch && (
          <div className="relative">
            <select
              value={branchId}
              onChange={(e) => setBranchId(e.target.value)}
              className="h-9 appearance-none rounded-lg border border-slate-300 bg-white pl-3 pr-8 text-sm font-semibold text-slate-900 shadow-sm focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            >
              {allowedBranches.map((b) => (
                <option key={b.id} value={b.id}>{b.name} ({b.label})</option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          </div>
        )}
      </div>
    </div>
  );
}
