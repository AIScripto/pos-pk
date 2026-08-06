import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ChevronDown, ChevronRight } from 'lucide-react';

interface SubItem {
  label: string;
  href: string;
  icon?: React.ReactNode;
}

interface Props {
  label: string;
  icon: React.ReactNode;
  items: SubItem[];
  sidebarOpen: boolean;
}

export default function ExpandableNavItem({ label, icon, items, sidebarOpen }: Props) {
  const navigate = useNavigate();
  const location = useLocation();
  const currentHref = `${location.pathname}${location.search}`;

  const isActive = (href: string) => href.includes('?') ? currentHref === href : location.pathname === href;
  const hasActive = items.some(item => isActive(item.href));
  const [expanded, setExpanded] = useState(hasActive);

  useEffect(() => {
    if (hasActive) setExpanded(true);
  }, [hasActive]);

  return (
    <div className="space-y-1">
      {/* Parent Item */}
      <button
        onClick={() => setExpanded(!expanded)}
        className={`admin-sidebar-item ${
          hasActive
            ? 'admin-sidebar-item-active'
            : ''
        }`}
        title={!sidebarOpen ? label : undefined}
      >
        {icon}
        {sidebarOpen && (
          <>
            <span className="text-sm font-medium flex-1 text-left">{label}</span>
            {expanded ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </>
        )}
      </button>

      {/* Sub Items */}
      {sidebarOpen && expanded && (
        <div className="admin-sidebar-sublist">
          {items.map((item) => (
            <button
              key={`${item.label}-${item.href}`}
              onClick={() => navigate(item.href)}
              className={`admin-sidebar-item gap-2 py-2 text-sm ${
                isActive(item.href)
                  ? 'admin-sidebar-item-active'
                  : ''
              }`}
            >
              {item.icon && <span className="flex items-center">{item.icon}</span>}
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
