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
    <div className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm md:flex-row md:items-center md:justify-between">
      <div className="min-w-0">
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground/70">Manager Operations</p>
        <h1 className="mt-0.5 truncate text-xl font-bold tracking-tight text-foreground">
          {activeBranch ? activeBranch.name : 'Branch Control Panel'}
        </h1>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {businessDate ? `Business date ${formatDate(businessDate)}` : 'Live operations dashboard'}
          {shiftSessionName && ` · ${shiftSessionName}`}
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-3">
        <button
          onClick={onRefresh}
          disabled={isLoading}
          title="Refresh"
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-muted-foreground transition hover:bg-muted/40 disabled:opacity-40"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
        </button>

        {!isBranchFixed && isMultiBranch && (
          <div className="relative">
            <select
              value={branchId}
              onChange={(e) => setBranchId(e.target.value)}
              className="h-9 appearance-none rounded-lg border border-border bg-card pl-3 pr-8 text-sm font-semibold text-foreground shadow-sm focus:outline-none"
            >
              {allowedBranches.map((b) => (
                <option key={b.id} value={b.id}>{b.name} ({b.label})</option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/70" />
          </div>
        )}
      </div>
    </div>
  );
}
