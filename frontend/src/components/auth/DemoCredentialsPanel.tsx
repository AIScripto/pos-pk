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
    <div className="mb-4 rounded-xl border border-slate-700 bg-slate-900/40 p-4">
      <div className="flex items-center gap-2 mb-3">
        <CheckCircle2 className="w-4 h-4 text-orange-400" />
        <p className="text-xs font-bold text-slate-300 uppercase tracking-wider">
          Demo Accounts
        </p>
      </div>

      <div className="grid grid-cols-1 gap-2">
        {mode === 'admin' ? (
          <>
            <button
              type="button"
              onClick={() => onSelectRole('admin')}
              className="flex flex-col text-left p-2.5 rounded-lg border border-slate-700/50 bg-slate-800/40 hover:bg-slate-700/50 hover:border-slate-600 transition-all text-xs cursor-pointer"
            >
              <div className="flex items-center justify-between w-full mb-1">
                <span className="font-bold text-blue-400">{t.roles.admin}</span>
                <span className="px-1.5 py-0.5 rounded bg-blue-500/15 text-blue-400 font-mono text-[9px]">
                  PIN: 1234
                </span>
              </div>
              <p className="text-slate-400 font-mono text-[10px] truncate">
                <strong className="text-white">{LOCAL_DEV_CREDENTIALS.admin.username}</strong> · {LOCAL_DEV_CREDENTIALS.admin.password}
              </p>
            </button>

            <button
              type="button"
              onClick={() => onSelectRole('manager')}
              className="flex flex-col text-left p-2.5 rounded-lg border border-slate-700/50 bg-slate-800/40 hover:bg-slate-700/50 hover:border-slate-600 transition-all text-xs cursor-pointer"
            >
              <div className="flex items-center justify-between w-full mb-1">
                <span className="font-bold text-purple-400">{t.roles.manager}</span>
                <span className="px-1.5 py-0.5 rounded bg-purple-500/15 text-purple-400 font-mono text-[9px]">
                  PIN: 1234
                </span>
              </div>
              <p className="text-slate-400 font-mono text-[10px] truncate">
                <strong className="text-white">{LOCAL_DEV_CREDENTIALS.manager.username}</strong> · {LOCAL_DEV_CREDENTIALS.manager.password}
              </p>
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={() => onSelectRole('pos')}
            className="flex flex-col text-left p-2.5 rounded-lg border border-slate-700/50 bg-slate-800/40 hover:bg-slate-700/50 hover:border-slate-600 transition-all text-xs cursor-pointer"
          >
            <div className="flex items-center justify-between w-full mb-1">
              <span className="font-bold text-orange-400">{t.roles.cashier}</span>
              <span className="px-1.5 py-0.5 rounded bg-orange-500/15 text-orange-400 font-mono text-[9px]">
                PIN: 1234
              </span>
            </div>
            <p className="text-slate-400 font-mono text-[10px] truncate">
              <strong className="text-white">{LOCAL_DEV_CREDENTIALS.pos.username}</strong> · {LOCAL_DEV_CREDENTIALS.pos.password}
            </p>
          </button>
        )}
      </div>
    </div>
  );
};

export default DemoCredentialsPanel;

