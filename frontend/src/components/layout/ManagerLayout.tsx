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
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-950">

      {/* ── Sidebar ─────────────────────────────────────────────────────────── */}
      <aside className={`flex flex-col shrink-0 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 transition-[width] duration-200 ${open ? 'w-60' : 'w-16'}`}>

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-slate-200 dark:border-slate-800">
          {open && (
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-50 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-900/50 text-orange-600 dark:text-orange-400 shadow-sm">
                <Zap className="h-4 w-4" />
              </div>
              <div className="leading-none">
                <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500">Manager</p>
                <p className="text-sm font-black text-slate-900 dark:text-slate-100">Operations</p>
              </div>
            </div>
          )}
          <button
            onClick={() => setOpen(!open)}
            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Branch badge */}
        {open && (
          <div className="mx-3 mt-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100/80 dark:bg-slate-900/80 px-3 py-2 shadow-sm">
            <p className="text-[10px] font-extrabold uppercase tracking-[0.15em] text-slate-400 dark:text-slate-500">Branch</p>
            <p className="mt-0.5 truncate text-sm font-extrabold text-slate-900 dark:text-slate-100">{branchLabel}</p>
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
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-sm shadow-blue-500/20'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {item.icon}
                {open && <span>{item.label}</span>}
                {open && active && <ChevronRight className="ml-auto h-4 w-4 text-white" />}
              </button>
            );
          })}

          {/* Divider */}
          <div className="my-2 border-t border-slate-200 dark:border-slate-800" />

          {/* POS shortcut */}
          <Link
            to="/"
            title={!open ? 'Go to POS' : undefined}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-extrabold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-white transition-all"
          >
            <Store className="h-5 w-5" />
            {open && <span>POS Screen</span>}
          </Link>
        </nav>

        {/* Footer */}
        <div className="space-y-2 border-t border-slate-200 dark:border-slate-800 p-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleTheme}
            className="w-full justify-start text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white font-bold"
          >
            {theme === 'dark'
              ? <Sun  className={`h-4 w-4 text-amber-400 ${open ? 'mr-2' : ''}`} />
              : <Moon className={`h-4 w-4 text-slate-600 ${open ? 'mr-2' : ''}`} />}
            {open && (theme === 'dark' ? 'Light Mode' : 'Dark Mode')}
          </Button>

          {open && (
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100/80 dark:bg-slate-900/80 px-3 py-2 text-xs">
              <p className="text-slate-400 dark:text-slate-500 font-medium">Signed in as</p>
              <p className="truncate font-extrabold text-slate-900 dark:text-slate-100">{user?.name}</p>
              <p className="capitalize font-semibold text-slate-500 dark:text-slate-400">{user?.role?.replace(/_/g, ' ')}</p>
            </div>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="w-full justify-start text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:text-rose-700 font-bold"
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
