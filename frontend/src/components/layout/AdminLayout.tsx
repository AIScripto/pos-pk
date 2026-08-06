// =============================================================================
// AdminLayout — sidebar navigation for admin panel
// =============================================================================

import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { Button } from '@/components/ui/button';
import ExpandableNavItem from './ExpandableNavItem';
import {
  LayoutDashboard, Package, Settings, Users, MapPin, Globe, MapPinned, Map, BarChart3,
  LogOut, Menu, X, ChevronRight, Sun, Moon, Shield, Zap, Grid3x3, UtensilsCrossed, Lock, Building2,
  Bot, FileText, Table2, Monitor, ExternalLink, Award,
} from 'lucide-react';

interface NavItem {
  label: string;
  icon: React.ReactNode;
  href?: string;
  minRole?: string;
  children?: NavSubItem[];
}

interface NavSubItem {
  label: string;
  href: string;
  icon?: React.ReactNode;
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" />, href: '/admin/dashboard' },
  {
    label: 'Products',
    icon: <Package className="w-5 h-5" />,
    children: [
      { label: 'All Products', href: '/admin/products', icon: <Package className="w-4 h-4" /> },
      { label: 'Food Types', href: '/admin/food-types', icon: <UtensilsCrossed className="w-4 h-4" /> },
      { label: 'Categories', href: '/admin/categories', icon: <Grid3x3 className="w-4 h-4" /> },
      { label: 'Deals', href: '/admin/deals', icon: <Zap className="w-4 h-4" /> },
    ],
  },
  {
    label: 'Location Management',
    icon: <MapPin className="w-5 h-5" />,
    minRole: 'org_admin',
    children: [
      { label: 'Brands', href: '/admin/brands', icon: <Award className="w-4 h-4" /> },
      { label: 'Branches', href: '/admin/branches', icon: <MapPin className="w-4 h-4" /> },
      { label: 'Cities', href: '/admin/cities', icon: <Globe className="w-4 h-4" /> },
      { label: 'Areas', href: '/admin/areas', icon: <MapPinned className="w-4 h-4" /> },
      { label: 'States', href: '/admin/states', icon: <Map className="w-4 h-4" /> },
    ],
  },
  {
    label: 'User Management',
    icon: <Lock className="w-5 h-5" />,
    minRole: 'org_admin',
    children: [
      { label: 'Roles', href: '/admin/roles', icon: <Shield className="w-4 h-4" /> },
      { label: 'Users', href: '/admin/users', icon: <Users className="w-4 h-4" /> },
    ],
  },
  {
    label: 'Setup',
    icon: <Settings className="w-5 h-5" />,
    minRole: 'org_admin',
    children: [
      { label: 'Organisation', href: '/admin/organisation', icon: <Building2 className="w-4 h-4" /> },
      { label: 'Configuration', href: '/admin/config',       icon: <Settings   className="w-4 h-4" /> },
      { label: 'Tills & Shifts', href: '/admin/tills',       icon: <Monitor    className="w-4 h-4" /> },
    ],
  },
  {
    label: 'Reports',
    icon: <BarChart3 className="w-5 h-5" />,
    children: [
      { label: 'Sales Dashboard', href: '/admin/reports?panel=performance&view=visual', icon: <BarChart3 className="w-4 h-4" /> },
      { label: 'Summary Report', href: '/admin/reports?panel=performance&view=tabular&tab=summary', icon: <FileText className="w-4 h-4" /> },
      { label: 'Detailed Report', href: '/admin/reports?panel=performance&view=tabular&tab=details', icon: <Table2 className="w-4 h-4" /> },
      { label: 'Order Details', href: '/admin/reports?panel=performance&view=tabular&tab=orders', icon: <FileText className="w-4 h-4" /> },
      { label: 'Insight Assistant', href: '/admin/reports?panel=assistant', icon: <Bot className="w-4 h-4" /> },
    ],
  },
];

interface Props {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: Props) {
  const { user, logout, hasRole } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const visibleItems = NAV_ITEMS.filter(
    (item) => !item.minRole || hasRole(item.minRole)
  );


  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const isActive = (href: string) => `${location.pathname}${location.search}` === href;

  return (
    <div className="admin-shell">
      {/* Sidebar */}
      <aside className={`${
        sidebarOpen ? 'w-64' : 'w-20'
      } admin-sidebar`}>

        {/* Logo/Header */}
        <div className="admin-sidebar-header">
          {sidebarOpen && (
            <div className="flex items-center gap-2">
              <div className="admin-sidebar-logo">
                <Settings className="w-5 h-5" />
              </div>
              <div className="leading-none">
                <p className="text-[10px] font-black uppercase tracking-[0.15em] opacity-60">Back Office</p>
                <span className="font-black text-base">Admin</span>
              </div>
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="admin-sidebar-toggle"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {visibleItems.map((item) => {
            // Handle items with children
            if (item.children) {
              return (
                <ExpandableNavItem
                  key={item.label}
                  label={item.label}
                  icon={item.icon}
                  items={item.children}
                  sidebarOpen={sidebarOpen}
                />
              );
            }

            // Regular menu items
            return (
              <button
                key={item.href}
                onClick={() => navigate(item.href!)}
                className={`admin-sidebar-item ${
                  isActive(item.href!)
                    ? 'admin-sidebar-item-active'
                    : ''
                }`}
                title={!sidebarOpen ? item.label : undefined}
              >
                {item.icon}
                {sidebarOpen && <span className="text-sm font-medium">{item.label}</span>}
                {sidebarOpen && isActive(item.href!) && (
                  <ChevronRight className="w-4 h-4 ml-auto" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Branch Operations shortcut */}
        <div className="border-t border-sidebar-border px-4 py-3">
          <button
            onClick={() => navigate('/manager')}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
            title={!sidebarOpen ? 'Branch Operations' : undefined}
          >
            <Monitor className="h-4 w-4 shrink-0" />
            {sidebarOpen && (
              <span className="flex flex-1 items-center gap-1">
                Branch Operations
                <ExternalLink className="ml-auto h-3 w-3 opacity-60" />
              </span>
            )}
          </button>
        </div>

        {/* User Info */}
        <div className="space-y-3 border-t border-slate-800 dark:border-zinc-900 p-4">
          <Button
            variant="outline"
            size="sm"
            onClick={toggleTheme}
            className="w-full border-slate-800 bg-transparent text-zinc-400 hover:bg-slate-800 hover:text-white dark:border-zinc-800 dark:hover:bg-zinc-900 border"
          >
            {sidebarOpen ? (
              <>
                {theme === 'dark' ? <Sun className="mr-2 h-4 w-4 text-amber-400" /> : <Moon className="mr-2 h-4 w-4" />}
                {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
              </>
            ) : (
              theme === 'dark' ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4" />
            )}
          </Button>

          {sidebarOpen && (
            <div className="text-xs">
              <p className="text-zinc-500">Logged in as</p>
              <p className="truncate font-semibold text-white">{user?.name}</p>
              <p className="text-xs capitalize text-zinc-400">{user?.role.replace('_', ' ')}</p>
            </div>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            className="w-full border-red-900/30 bg-red-950/10 text-red-400 hover:bg-red-950/30 hover:text-red-200 dark:border-rose-900/30 dark:bg-rose-950/10 dark:text-rose-400 dark:hover:bg-rose-950/30 border"
          >
            {sidebarOpen ? (
              <>
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </>
            ) : (
              <LogOut className="w-4 h-4" />
            )}
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="admin-main">
        <div className="admin-main-inner">
          {children}
        </div>
      </main>
    </div>
  );
}
