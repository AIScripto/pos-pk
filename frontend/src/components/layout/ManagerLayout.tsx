// =============================================================================
// ManagerLayout — sidebar for the Manager Operations panel.
// Intentionally minimal: only operational items, no configuration links.
// =============================================================================

import { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { Button } from '@/components/ui/button';
import {
  Monitor, BarChart3, LogOut, Menu, X, Sun, Moon,
  ChevronRight, Zap, Store,
} from 'lucide-react';

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  exact?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Live Operations', href: '/manager',         icon: <Monitor   className="w-5 h-5" />, exact: true },
  { label: 'Reports',         href: '/manager/reports', icon: <BarChart3 className="w-5 h-5" /> },
];

interface Props { children: React.ReactNode }

export default function ManagerLayout({ children }: Props) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(true);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (item: NavItem) =>
    item.exact ? location.pathname === item.href : location.pathname.startsWith(item.href);

  // branchName comes from the JWT (set at login) — no extra API call needed
  const branchLabel = user?.branchName ?? (user?.branchId ? `Branch #${user.branchId}` : 'All Branches');

  return (
    <div className="flex h-screen overflow-hidden bg-muted/40">

      {/* ── Sidebar ─────────────────────────────────────────────────────────── */}
      <aside className={`flex flex-col shrink-0 border-r border-border dark:border-border bg-white dark:bg-background transition-[width] duration-200 ${open ? 'w-60' : 'w-16'}`}>

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-border">
          {open && (
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-warning-subtle border border-warning-border text-warning-text shadow-sm">
                <Zap className="h-4 w-4" />
              </div>
              <div className="leading-none">
                <p className="text-2xs font-extrabold uppercase tracking-[0.18em] text-muted-foreground/70">Manager</p>
                <p className="text-sm font-black text-foreground">Operations</p>
              </div>
            </div>
          )}
          <button
            onClick={() => setOpen(!open)}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Branch badge */}
        {open && (
          <div className="mx-3 mt-3 rounded-xl border border-border bg-secondary/80 px-3 py-2 shadow-sm">
            <p className="text-2xs font-extrabold uppercase tracking-[0.15em] text-muted-foreground/70">Branch</p>
            <p className="mt-0.5 truncate text-sm font-extrabold text-foreground">{branchLabel}</p>
          </div>
        )}

        {/* Nav */}
        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          {NAV_ITEMS.map((item) => {
            const active = isActive(item);
            return (
              <button
                key={item.href}
                onClick={() => navigate(item.href)}
                title={!open ? item.label : undefined}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-extrabold transition-all ${
                  active
                    ? 'bg-primary text-white shadow-sm shadow-primary/20'
                    : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                }`}
              >
                {item.icon}
                {open && <span>{item.label}</span>}
                {open && active && <ChevronRight className="ml-auto h-4 w-4 text-white" />}
              </button>
            );
          })}

          {/* Divider */}
          <div className="my-2 border-t border-border" />

          {/* POS shortcut */}
          <Link
            to="/"
            title={!open ? 'Go to POS' : undefined}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-extrabold text-muted-foreground hover:bg-secondary hover:text-foreground transition-all"
          >
            <Store className="h-5 w-5" />
            {open && <span>POS Screen</span>}
          </Link>
        </nav>

        {/* Footer */}
        <div className="space-y-2 border-t border-border p-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleTheme}
            className="w-full justify-start text-muted-foreground hover:bg-secondary hover:text-foreground font-bold"
          >
            {theme === 'dark'
              ? <Sun  className={`h-4 w-4 text-warning ${open ? 'mr-2' : ''}`} />
              : <Moon className={`h-4 w-4 text-muted-foreground ${open ? 'mr-2' : ''}`} />}
            {open && (theme === 'dark' ? 'Light Mode' : 'Dark Mode')}
          </Button>

          {open && (
            <div className="rounded-xl border border-border bg-secondary/80 px-3 py-2 text-xs">
              <p className="text-muted-foreground/70 font-medium">Signed in as</p>
              <p className="truncate font-extrabold text-foreground">{user?.name}</p>
              <p className="capitalize font-semibold text-muted-foreground">{user?.role?.replace(/_/g, ' ')}</p>
            </div>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="w-full justify-start text-danger-text hover:bg-danger-subtle hover:text-danger-text font-bold"
          >
            <LogOut className={`h-4 w-4 ${open ? 'mr-2' : ''}`} />
            {open && 'Logout'}
          </Button>
        </div>
      </aside>

      {/* ── Main ────────────────────────────────────────────────────────────── */}
      <main className="flex-1 flex flex-col min-h-0 overflow-hidden">
        <div className="flex-1 flex flex-col min-h-0 overflow-y-auto p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
