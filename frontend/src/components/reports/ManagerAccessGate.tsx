import { ShieldCheck, LockKeyhole, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useTranslation } from '@/i18n';

interface ManagerAccessGateProps {
  password: string;
  isSubmitting: boolean;
  onPasswordChange: (value: string) => void;
  onUnlock: () => void;
}

export function ManagerAccessGate({
  password,
  isSubmitting,
  onPasswordChange,
  onUnlock,
}: ManagerAccessGateProps) {
  const { t } = useTranslation();

  return (
    <div className="relative flex h-full min-h-[560px] items-center justify-center overflow-hidden rounded-[32px] bg-slate-950 px-6 py-10 text-slate-50">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(251,146,60,0.32),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(16,185,129,0.22),transparent_24%),linear-gradient(160deg,#020617,#0f172a_55%,#111827)]" />
      <div className="absolute -left-16 top-10 h-48 w-48 rounded-full bg-orange-400/20 blur-3xl" />
      <div className="absolute -right-16 bottom-6 h-56 w-56 rounded-full bg-emerald-400/20 blur-3xl" />

      <div className="relative grid w-full max-w-5xl gap-8 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-medium text-white/80 backdrop-blur">
            <ShieldCheck className="h-4 w-4 text-emerald-300" />
            {t.managerReport.reportsTitle}
          </div>
          <div className="space-y-4">
            <h2 className="max-w-2xl font-sans text-4xl font-bold leading-tight text-white sm:text-5xl">
              {t.managerReport.panelDesc}
            </h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-400">{t.managerReport.trendOutput}</p>
              <p className="mt-3 text-lg font-semibold text-white">{t.managerReport.salesTrend}</p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-400">{t.managerReport.grouping}</p>
              <p className="mt-3 text-lg font-semibold text-white">{t.managerReport.dailyTrend}</p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-400">{t.managerReport.mixOutput}</p>
              <p className="mt-3 text-lg font-semibold text-white">{t.managerReport.topProducts}</p>
            </div>
          </div>
        </div>

        <div className="rounded-[32px] border border-white/10 bg-white/10 p-6 shadow-2xl shadow-black/35 backdrop-blur-xl">
          <div className="flex h-full flex-col justify-between gap-6">
            <div className="space-y-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10">
                <LockKeyhole className="h-7 w-7 text-orange-200" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-slate-400">{t.managerReport.managerGate}</p>
                <h3 className="mt-2 text-2xl font-semibold text-white">{t.managerReport.enterPassword}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-300">
                  {t.managerReport.enterManagerPin}
                </p>
              </div>
            </div>

            <form
              className="space-y-4"
              onSubmit={(event) => {
                event.preventDefault();
                onUnlock();
              }}
            >
              <Input
                type="password"
                value={password}
                onChange={(event) => onPasswordChange(event.target.value)}
                placeholder={t.auth.password}
                className="h-12 rounded-2xl border-white/10 bg-slate-900/70 px-4 text-white placeholder:text-slate-500 focus-visible:ring-orange-400"
              />
              <Button
                type="submit"
                disabled={isSubmitting}
                className="h-12 w-full rounded-2xl border-0 bg-gradient-to-r from-orange-400 via-orange-500 to-emerald-400 text-slate-950 shadow-lg shadow-orange-500/30 hover:opacity-95 cursor-pointer"
              >
                <Sparkles className="h-4 w-4" />
                {t.managerReport.openReportPanel}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

