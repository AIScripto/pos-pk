import { Invoice } from '@/types/pos';
import { formatCurrency, formatDate } from '@/utils/pos';
import { FileText, Printer, Trash2, ChevronRight, Search, X } from 'lucide-react';
import { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface InvoiceHistoryProps {
  invoices: Invoice[];
  onViewInvoice: (invoice: Invoice) => void;
  onDeleteInvoice: (id: string) => void;
  onPrintInvoice: (invoice: Invoice) => void;
}

type FilterStatus   = 'all' | 'paid' | 'pending';
type FilterPayment  = 'all' | 'cash' | 'card' | 'cash-on-delivery' | 'card-on-delivery';
type SortOrder      = 'newest' | 'oldest' | 'highest' | 'lowest';

const STATUS_FILTERS: { key: FilterStatus; label: string }[] = [
  { key: 'all',     label: 'All'     },
  { key: 'paid',    label: 'Paid'    },
  { key: 'pending', label: 'Unpaid'  },
];

const PAYMENT_FILTERS: { key: FilterPayment; label: string }[] = [
  { key: 'all',               label: 'All methods'    },
  { key: 'cash',              label: 'Cash'           },
  { key: 'card',              label: 'Card'           },
  { key: 'cash-on-delivery',  label: 'COD Cash'       },
  { key: 'card-on-delivery',  label: 'COD Card'       },
];

const SORT_OPTIONS: { key: SortOrder; label: string }[] = [
  { key: 'newest',  label: 'Newest first'  },
  { key: 'oldest',  label: 'Oldest first'  },
  { key: 'highest', label: 'Highest total' },
  { key: 'lowest',  label: 'Lowest total'  },
];

export function InvoiceHistory({
  invoices,
  onViewInvoice,
  onDeleteInvoice,
  onPrintInvoice,
}: InvoiceHistoryProps) {
  const [deleteId,       setDeleteId]       = useState<string | null>(null);
  const [search,         setSearch]         = useState('');
  const [filterStatus,   setFilterStatus]   = useState<FilterStatus>('all');
  const [filterPayment,  setFilterPayment]  = useState<FilterPayment>('all');
  const [sortOrder,      setSortOrder]      = useState<SortOrder>('newest');
  const [showFilters,    setShowFilters]    = useState(false);

  const confirmDelete = () => {
    if (deleteId) { onDeleteInvoice(deleteId); setDeleteId(null); }
  };

  const filtered = useMemo(() => {
    let list = [...invoices];

    // Search — invoice ID, customer name, customer phone
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((inv) =>
        inv.id.toLowerCase().includes(q) ||
        inv.customer?.name?.toLowerCase().includes(q) ||
        inv.customer?.phone?.includes(q)
      );
    }

    // Payment status filter
    if (filterStatus !== 'all') {
      list = list.filter((inv) => (inv.paymentStatus ?? 'paid') === filterStatus);
    }

    // Payment method filter
    if (filterPayment !== 'all') {
      list = list.filter((inv) => (inv.paymentMethod ?? 'cash') === filterPayment);
    }

    // Sort
    list.sort((a, b) => {
      if (sortOrder === 'newest')  return new Date(b.date).getTime() - new Date(a.date).getTime();
      if (sortOrder === 'oldest')  return new Date(a.date).getTime() - new Date(b.date).getTime();
      if (sortOrder === 'highest') return b.grandTotal - a.grandTotal;
      if (sortOrder === 'lowest')  return a.grandTotal - b.grandTotal;
      return 0;
    });

    return list;
  }, [invoices, search, filterStatus, filterPayment, sortOrder]);

  // Summary stats for visible set
  const totalVisible  = filtered.length;
  const totalRevenue  = filtered.reduce((s, inv) => s + inv.grandTotal, 0);
  const totalUnpaid   = filtered.filter((inv) => (inv.paymentStatus ?? 'paid') === 'pending').length;

  const hasActiveFilters = filterStatus !== 'all' || filterPayment !== 'all' || sortOrder !== 'newest';

  const clearFilters = () => {
    setFilterStatus('all');
    setFilterPayment('all');
    setSortOrder('newest');
    setSearch('');
  };

  return (
    <>
      {/* ── Search bar ── */}
      <div className="space-y-2 mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by invoice ID, customer name or phone…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-border bg-secondary py-2.5 pl-9 pr-9 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filter toggle row */}
        <div className="flex items-center justify-between gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              'flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-700 transition-all',
              hasActiveFilters
                ? 'border-primary/30 bg-primary/10 text-primary'
                : 'border-border bg-secondary text-muted-foreground hover:text-foreground'
            )}
            style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700 }}
          >
            Filters {hasActiveFilters && `(${[filterStatus !== 'all', filterPayment !== 'all', sortOrder !== 'newest'].filter(Boolean).length} active)`}
          </button>

          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="text-xs text-muted-foreground hover:text-destructive transition-colors"
            >
              Clear all
            </button>
          )}

          {/* Summary */}
          <div className="ml-auto flex items-center gap-3 text-xs text-muted-foreground">
            <span>{totalVisible} invoices</span>
            <span className="text-foreground font-700"
              style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700 }}>
              {formatCurrency(totalRevenue)}
            </span>
            {totalUnpaid > 0 && (
              <span className="text-purple-400">{totalUnpaid} unpaid</span>
            )}
          </div>
        </div>

        {/* Filter panel */}
        {showFilters && (
          <div className="rounded-xl border border-border bg-card p-3 space-y-3 animate-slide-up">
            {/* Payment status */}
            <div>
              <p className="text-[9px] uppercase tracking-[0.18em] text-muted-foreground mb-1.5"
                style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700 }}>
                Payment status
              </p>
              <div className="flex gap-1.5">
                {STATUS_FILTERS.map((f) => (
                  <button
                    key={f.key}
                    onClick={() => setFilterStatus(f.key)}
                    className={cn(
                      'flex-1 rounded-lg border py-1.5 text-[10px] font-700 uppercase tracking-wide transition-all',
                      filterStatus === f.key
                        ? f.key === 'pending'
                          ? 'bg-purple-500/10 border-purple-500/30 text-purple-400'
                          : f.key === 'paid'
                            ? 'bg-green-500/10 border-green-500/30 text-green-400'
                            : 'bg-primary/10 border-primary/30 text-primary'
                        : 'bg-transparent border-border text-muted-foreground hover:bg-secondary'
                    )}
                    style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700 }}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Payment method */}
            <div>
              <p className="text-[9px] uppercase tracking-[0.18em] text-muted-foreground mb-1.5"
                style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700 }}>
                Payment method
              </p>
              <div className="flex flex-wrap gap-1.5">
                {PAYMENT_FILTERS.map((f) => (
                  <button
                    key={f.key}
                    onClick={() => setFilterPayment(f.key)}
                    className={cn(
                      'rounded-lg border px-3 py-1.5 text-[10px] font-700 uppercase tracking-wide transition-all',
                      filterPayment === f.key
                        ? 'bg-primary/10 border-primary/30 text-primary'
                        : 'bg-transparent border-border text-muted-foreground hover:bg-secondary'
                    )}
                    style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700 }}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Sort */}
            <div>
              <p className="text-[9px] uppercase tracking-[0.18em] text-muted-foreground mb-1.5"
                style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700 }}>
                Sort by
              </p>
              <div className="flex flex-wrap gap-1.5">
                {SORT_OPTIONS.map((s) => (
                  <button
                    key={s.key}
                    onClick={() => setSortOrder(s.key)}
                    className={cn(
                      'rounded-lg border px-3 py-1.5 text-[10px] font-700 uppercase tracking-wide transition-all',
                      sortOrder === s.key
                        ? 'bg-primary/10 border-primary/30 text-primary'
                        : 'bg-transparent border-border text-muted-foreground hover:bg-secondary'
                    )}
                    style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700 }}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Invoice list ── */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-14 h-14 rounded-full bg-secondary flex items-center justify-center mb-3">
            <FileText className="w-6 h-6 text-muted-foreground" />
          </div>
          <p className="text-sm font-700 text-foreground"
            style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 700 }}>
            {invoices.length === 0 ? 'No invoices yet' : 'No results found'}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {invoices.length === 0
              ? 'Completed orders will appear here'
              : 'Try adjusting your search or filters'}
          </p>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="mt-3 text-xs text-primary hover:underline"
            >
              Clear filters
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((invoice) => (
            <div
              key={invoice.id}
              className="bg-card border border-border rounded-xl p-3.5 hover:border-primary/40 transition-colors animate-slide-up"
            >
              <div className="flex items-center gap-3">
                {/* Icon */}
                <div className={cn(
                  'w-9 h-9 rounded-lg flex items-center justify-center shrink-0',
                  (invoice.paymentStatus ?? 'paid') === 'pending'
                    ? 'bg-purple-500/10'
                    : 'bg-primary/10'
                )}>
                  <FileText className={cn(
                    'w-4 h-4',
                    (invoice.paymentStatus ?? 'paid') === 'pending' ? 'text-purple-400' : 'text-primary'
                  )} />
                </div>

                {/* Info */}
                <div
                  className="flex-1 min-w-0 cursor-pointer"
                  onClick={() => onViewInvoice(invoice)}
                >
                  <div className="flex items-center gap-2">
                    <p className="font-mono font-700 text-foreground text-sm truncate"
                      style={{ fontWeight: 700 }}>
                      {invoice.id}
                    </p>
                    <span className={cn(
                      'shrink-0 rounded-full px-1.5 py-0.5 text-[9px] font-700 uppercase tracking-wide border',
                      (invoice.paymentStatus ?? 'paid') === 'pending'
                        ? 'bg-purple-500/10 border-purple-500/30 text-purple-400'
                        : 'bg-green-500/10 border-green-500/30 text-green-400'
                    )}
                      style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700 }}>
                      {(invoice.paymentStatus ?? 'paid') === 'pending' ? 'Unpaid' : 'Paid'}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {formatDate(invoice.date)}
                    {' · '}
                    {invoice.items.reduce((s, i) => s + i.quantity, 0)} items
                    {' · '}
                    <span className="capitalize">
                      {(invoice.paymentMethod ?? 'cash').replace(/-/g, ' ')}
                    </span>
                  </p>
                  {invoice.customer && (
                    <p className="text-xs text-muted-foreground truncate mt-0.5">
                      {invoice.customer.name}
                      {invoice.customer.phone && ` · ${invoice.customer.phone}`}
                    </p>
                  )}
                </div>

                {/* Total */}
                <div className="text-right shrink-0">
                  <p className="font-900 text-foreground tabular-nums"
                    style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: '17px' }}>
                    {formatCurrency(invoice.grandTotal)}
                  </p>
                  {invoice.totalDiscount > 0 && (
                    <p className="text-[10px] text-accent">
                      -{formatCurrency(invoice.totalDiscount)}
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-0.5 shrink-0">
                  <button
                    onClick={() => onPrintInvoice(invoice)}
                    className="p-2 rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
                    title="Print"
                  >
                    <Printer className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onViewInvoice(invoice)}
                    className="p-2 rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
                    title="View"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setDeleteId(invoice.id)}
                    className="p-2 rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Invoice</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this invoice? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
