import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import { LOCAL_DEV_CREDENTIALS } from '@/config/localCredentials';

interface DemoCredentialsPanelProps {
  mode: 'cashier' | 'admin';
  onSelectRole: (role: 'admin' | 'manager' | 'pos') => void;
}

/**
 * DemoCredentialsPanel Component
 * 
 * Helper widget rendered when demo/local test credentials flag is active.
 * Allows quick auto-filling of Admin, Manager, or Cashier test credentials.
 * 
 * @component
 */
export const DemoCredentialsPanel: React.FC<DemoCredentialsPanelProps> = ({
  mode,
  onSelectRole,
}) => {
  return (
    <div className="mb-4 rounded-xl border border-slate-700 bg-slate-900/40 p-4">
      <div className="flex items-center gap-2 mb-3">
        <CheckCircle2 className="w-4 h-4 text-orange-400" />
        <p className="text-xs font-bold text-slate-300 uppercase tracking-wider">
          Test Accounts (Click to Auto-fill)
        </p>
      </div>

      <div className="grid grid-cols-1 gap-2">
        {mode === 'admin' ? (
          <>
            <button
              type="button"
              onClick={() => onSelectRole('admin')}
              className="flex flex-col text-left p-2.5 rounded-lg border border-slate-700/50 bg-slate-800/40 hover:bg-slate-700/50 hover:border-slate-600 transition-all text-xs"
            >
              <div className="flex items-center justify-between w-full mb-1">
                <span className="font-bold text-blue-400">Admin Account</span>
                <span className="px-1.5 py-0.5 rounded bg-blue-500/15 text-blue-400 font-mono text-[9px]">
                  PIN: 1234
                </span>
              </div>
              <p className="text-slate-400 font-mono text-[10px] truncate">
                {LOCAL_DEV_CREDENTIALS.admin.email} · {LOCAL_DEV_CREDENTIALS.admin.password}
              </p>
            </button>

            <button
              type="button"
              onClick={() => onSelectRole('manager')}
              className="flex flex-col text-left p-2.5 rounded-lg border border-slate-700/50 bg-slate-800/40 hover:bg-slate-700/50 hover:border-slate-600 transition-all text-xs"
            >
              <div className="flex items-center justify-between w-full mb-1">
                <span className="font-bold text-purple-400">Manager Account</span>
                <span className="px-1.5 py-0.5 rounded bg-purple-500/15 text-purple-400 font-mono text-[9px]">
                  PIN: 1234
                </span>
              </div>
              <p className="text-slate-400 font-mono text-[10px] truncate">
                {LOCAL_DEV_CREDENTIALS.manager.email} · {LOCAL_DEV_CREDENTIALS.manager.password}
              </p>
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={() => onSelectRole('pos')}
            className="flex flex-col text-left p-2.5 rounded-lg border border-slate-700/50 bg-slate-800/40 hover:bg-slate-700/50 hover:border-slate-600 transition-all text-xs"
          >
            <div className="flex items-center justify-between w-full mb-1">
              <span className="font-bold text-orange-400">Cashier Account</span>
              <span className="px-1.5 py-0.5 rounded bg-orange-500/15 text-orange-400 font-mono text-[9px]">
                PIN: 8591
              </span>
            </div>
            <p className="text-slate-400 font-mono text-[10px] truncate">
              {LOCAL_DEV_CREDENTIALS.pos.email} · {LOCAL_DEV_CREDENTIALS.pos.password}
            </p>
          </button>
        )}
      </div>
    </div>
  );
};

export default DemoCredentialsPanel;
