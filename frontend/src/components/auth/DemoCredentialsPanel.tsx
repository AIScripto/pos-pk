import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import { LOCAL_DEV_CREDENTIALS } from '@/config/localCredentials';
import { useTranslation } from '@/i18n';

interface DemoCredentialsPanelProps {
  mode: 'cashier' | 'admin';
  onSelectRole: (role: 'admin' | 'manager' | 'pos') => void;
}

export const DemoCredentialsPanel: React.FC<DemoCredentialsPanelProps> = ({
  mode,
  onSelectRole,
}) => {
  const { t } = useTranslation();

  return (
    <div className="mb-4 rounded-xl border border-screen-border bg-screen-raised/40 p-4">
      <div className="flex items-center gap-2 mb-3">
        <CheckCircle2 className="w-4 h-4 text-warning" />
        <p className="text-xs font-bold text-screen-subtle uppercase tracking-wider">
          Demo Accounts
        </p>
      </div>

      <div className="grid grid-cols-1 gap-2">
        {mode === 'admin' ? (
          <>
            <button
              type="button"
              onClick={() => onSelectRole('admin')}
              className="flex flex-col text-left p-2.5 rounded-lg border border-screen-border/50 bg-screen-raised-2/40 hover:bg-screen-border/50 hover:border-screen-muted/60 transition-all text-xs cursor-pointer"
            >
              <div className="flex items-center justify-between w-full mb-1">
                <span className="font-bold text-primary">{t.roles.admin}</span>
                <span className="px-1.5 py-0.5 rounded bg-primary/15 text-primary font-mono text-2xs">
                  PIN: 1234
                </span>
              </div>
              <p className="text-screen-muted font-mono text-2xs truncate">
                <strong className="text-screen-foreground">{LOCAL_DEV_CREDENTIALS.admin.username}</strong> · {LOCAL_DEV_CREDENTIALS.admin.password}
              </p>
            </button>

            <button
              type="button"
              onClick={() => onSelectRole('manager')}
              className="flex flex-col text-left p-2.5 rounded-lg border border-screen-border/50 bg-screen-raised-2/40 hover:bg-screen-border/50 hover:border-screen-muted/60 transition-all text-xs cursor-pointer"
            >
              <div className="flex items-center justify-between w-full mb-1">
                <span className="font-bold text-special">{t.roles.manager}</span>
                <span className="px-1.5 py-0.5 rounded bg-special/15 text-special font-mono text-2xs">
                  PIN: 1234
                </span>
              </div>
              <p className="text-screen-muted font-mono text-2xs truncate">
                <strong className="text-screen-foreground">{LOCAL_DEV_CREDENTIALS.manager.username}</strong> · {LOCAL_DEV_CREDENTIALS.manager.password}
              </p>
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={() => onSelectRole('pos')}
            className="flex flex-col text-left p-2.5 rounded-lg border border-screen-border/50 bg-screen-raised-2/40 hover:bg-screen-border/50 hover:border-screen-muted/60 transition-all text-xs cursor-pointer"
          >
            <div className="flex items-center justify-between w-full mb-1">
              <span className="font-bold text-warning">{t.roles.cashier}</span>
              <span className="px-1.5 py-0.5 rounded bg-warning/15 text-warning font-mono text-2xs">
                PIN: 1234
              </span>
            </div>
            <p className="text-screen-muted font-mono text-2xs truncate">
              <strong className="text-screen-foreground">{LOCAL_DEV_CREDENTIALS.pos.username}</strong> · {LOCAL_DEV_CREDENTIALS.pos.password}
            </p>
          </button>
        )}
      </div>
    </div>
  );
};

export default DemoCredentialsPanel;

