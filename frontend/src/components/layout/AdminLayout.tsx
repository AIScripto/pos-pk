import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { Button } from '@/components/ui/button';
import ExpandableNavItem from './ExpandableNavItem';
import { LanguageSelector } from '@/components/common/LanguageSelector';
import { useTranslation } from '@/i18n';
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

interface Props {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: Props) {
  const { t } = useTranslation();
  const { user, logout, hasRole } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const navItems: NavItem[] = [
    { label: t.admin.dashboard, icon: <LayoutDashboard className="w-5 h-5" />, href: '/admin/dashboard' },
    {
      label: t.admin.products,
      icon: <Package className="w-5 h-5" />,
      children: [
        { label: t.admin.products,   href: '/admin/products',   icon: <Package className="w-4 h-4" /> },
        { label: t.admin.foodTypes,  href: '/admin/food-types', icon: <UtensilsCrossed className="w-4 h-4" /> },
        { label: t.admin.categories, href: '/admin/categories', icon: <Grid3x3 className="w-4 h-4" /> },
        { label: t.admin.deals,      href: '/admin/deals',      icon: <Zap className="w-4 h-4" /> },
      ],
    },
    {
      label: t.admin.geography,
      icon: <MapPin className="w-5 h-5" />,
      minRole: 'org_admin',
      children: [
        { label: t.admin.brands,   href: '/admin/brands',   icon: <Award className="w-4 h-4" /> },
        { label: t.admin.branches, href: '/admin/branches', icon: <MapPin className="w-4 h-4" /> },
        { label: t.admin.cities,   href: '/admin/cities',   icon: <Globe className="w-4 h-4" /> },
        { label: t.admin.areas,    href: '/admin/areas',    icon: <MapPinned className="w-4 h-4" /> },
        { label: t.admin.states,   href: '/admin/states',   icon: <Map className="w-4 h-4" /> },
      ],
    },
    {
      label: t.users.usersTitle,
      icon: <Lock className="w-5 h-5" />,
      minRole: 'org_admin',
      children: [
        { label: t.admin.roles, href: '/admin/roles', icon: <Shield className="w-4 h-4" /> },
        { label: t.admin.users, href: '/admin/users', icon: <Users className="w-4 h-4" /> },
      ],
    },
    {
      label: t.admin.config,
      icon: <Settings className="w-5 h-5" />,
      minRole: 'org_admin',
      children: [
        { label: t.config.orgInfo,     href: '/admin/organisation', icon: <Building2 className="w-4 h-4" /> },
        { label: t.admin.config,       href: '/admin/config',       icon: <Settings   className="w-4 h-4" /> },
        { label: t.admin.tillSetup,    href: '/admin/tills',        icon: <Monitor    className="w-4 h-4" /> },
      ],
    },
    {
      label: t.admin.reports,
      icon: <BarChart3 className="w-5 h-5" />,
      children: [
        { label: t.managerReport.salesTrend,  href: '/admin/reports?panel=performance&view=visual', icon: <BarChart3 className="w-4 h-4" /> },
        { label: t.managerReport.reportsTitle, href: '/admin/reports?panel=performance&view=tabular&tab=summary', icon: <FileText className="w-4 h-4" /> },
        { label: t.common.invoices,            href: '/admin/reports?panel=performance&view=tabular&tab=details', icon: <Table2 className="w-4 h-4" /> },
        { label: t.common.orders,              href: '/admin/reports?panel=performance&view=tabular&tab=orders', icon: <FileText className="w-4 h-4" /> },
        { label: t.managerReport.aiAssistantTitle, href: '/admin/reports?panel=assistant', icon: <Bot className="w-4 h-4" /> },
      ],
    },
  ];

  const visibleItems = navItems.filter(
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
                <p className="text-2xs font-black uppercase tracking-[0.15em] opacity-60">Back Office</p>
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
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors cursor-pointer"
            title={!sidebarOpen ? t.common.serviceBoard : undefined}
          >
            <Monitor className="h-4 w-4 shrink-0" />
            {sidebarOpen && (
              <span className="flex flex-1 items-center gap-1">
                {t.common.serviceBoard}
                <ExternalLink className="ml-auto h-3 w-3 opacity-60" />
              </span>
            )}
          </button>
        </div>

        {/* User Info & Preferences */}
        <div className="space-y-3 border-t border-border p-4">
          {sidebarOpen && (
            <div className="flex justify-center pb-1">
              <LanguageSelector />
            </div>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={toggleTheme}
            className="w-full border-border bg-transparent text-muted-foreground hover:bg-muted hover:text-white border cursor-pointer"
          >
            {sidebarOpen ? (
              <>
                {theme === 'dark' ? <Sun className="mr-2 h-4 w-4 text-warning" /> : <Moon className="mr-2 h-4 w-4" />}
                {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
              </>
            ) : (
              theme === 'dark' ? <Sun className="h-4 w-4 text-warning" /> : <Moon className="h-4 w-4" />
            )}
          </Button>

          {sidebarOpen && (
            <div className="text-xs">
              <p className="text-muted-foreground">{t.common.user}</p>
              <p className="truncate font-semibold text-white">{user?.name}</p>
              <p className="text-xs capitalize text-muted-foreground/70">{user?.role.replace('_', ' ')}</p>
            </div>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            className="w-full border-danger/30 bg-danger/10 text-danger hover:bg-danger/30 hover:text-danger border cursor-pointer"
          >
            {sidebarOpen ? (
              <>
                <LogOut className="w-4 h-4 mr-2" />
                {t.admin.logout}
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
