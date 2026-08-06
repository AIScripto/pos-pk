// =============================================================================
// AdminPageLayout — shared page wrapper for consistent admin UI
// =============================================================================

import React from 'react';

interface Props {
  title: string;
  description: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  children: React.ReactNode;
}

export default function AdminPageLayout({ title, description, icon, action, children }: Props) {
  return (
    <div className="admin-page">
      {/* Page Header */}
      <div className="admin-page-header">
        <div className="flex items-center gap-3">
          {icon && (
            <div className="admin-page-icon">
              {icon}
            </div>
          )}
          <div>
            <h1 className="admin-page-title">{title}</h1>
            <p className="admin-page-description">{description}</p>
          </div>
        </div>
        {action && <div>{action}</div>}
      </div>

      {children}
    </div>
  );
}
