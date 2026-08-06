import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { AiToolResult } from '@/lib/api/ai-sales.api';
import { formatCurrency } from '@/utils/pos';
import { CHART_COLORS } from './constants';

function formatHeaderLabel(key: string): string {
  return key
    .replace(/PKR$/, '')
    .replace(/([A-Z])/g, ' $1')
    .replace(/_/g, ' ')
    .replace(/^./, s => s.toUpperCase())
    .trim();
}

function formatCellValue(key: string, value: unknown): string {
  if (value === null || value === undefined) return '—';
  if (typeof value === 'number') {
    const k = key.toLowerCase();
    if (k.includes('pkr') || k.includes('revenue') || k.includes('avg')) {
      return formatCurrency(value);
    }
    if (k.includes('rate') || k.includes('percent')) return `${value}%`;
    return value.toLocaleString();
  }
  return String(value);
}

function DataTable({ data }: { data: Record<string, unknown>[] }) {
  if (!data.length) return null;

  const headers = Object.keys(data[0]);
  const maxByKey: Record<string, number> = {};
  headers.forEach(h => {
    maxByKey[h] = Math.max(...data.map(r => Number(r[h]) || 0));
  });

  return (
    <div className="mt-3 overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-100/80 dark:bg-slate-800/90">
              <th className="w-7 px-3 py-2.5 text-left font-bold text-slate-400 dark:text-slate-500">#</th>
              {headers.map(h => (
                <th key={h} className="whitespace-nowrap px-3 py-2.5 text-left font-extrabold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  {formatHeaderLabel(h)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => (
              <tr key={i} className={`border-b border-slate-100 dark:border-slate-800/50 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/40 ${i % 2 === 0 ? 'bg-white dark:bg-slate-900/30' : 'bg-slate-50/50 dark:bg-slate-800/10'}`}>
                <td className="px-3 py-2.5 font-mono text-slate-400 dark:text-slate-600">{i + 1}</td>
                {headers.map((h, hi) => {
                  const val = row[h];
                  const formatted = formatCellValue(h, val);
                  const isMonetary = h.toLowerCase().includes('pkr') || h.toLowerCase().includes('revenue') || h.toLowerCase().includes('avg');
                  const pct = maxByKey[h] > 0 ? Math.round((Number(val) / maxByKey[h]) * 100) : 0;

                  return (
                    <td key={h} className={`whitespace-nowrap px-3 py-2.5 ${hi === 0 ? 'font-extrabold text-slate-900 dark:text-white' : ''} ${isMonetary ? 'font-extrabold text-blue-600 dark:text-orange-400' : 'text-slate-700 dark:text-slate-300 font-medium'}`}>
                      {isMonetary && data.length > 1 ? (
                        <div className="flex items-center gap-2">
                          <span>{formatted}</span>
                          <div className="h-1.5 w-12 flex-shrink-0 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                            <div className="h-full rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-orange-500 dark:to-amber-500 transition-all" style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      ) : formatted}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function KpiCards({ data }: { data: Record<string, unknown> }) {
  const entries = Object.entries(data).filter(([k]) => k !== 'period');
  const period = data.period as { startDate: string; endDate: string } | undefined;

  return (
    <div className="mt-3 space-y-2">
      {period && (
        <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:text-slate-500">
          {period.startDate} to {period.endDate}
        </p>
      )}
      <div className="grid grid-cols-2 gap-2">
        {entries.map(([key, value]) => {
          const formatted = formatCellValue(key, value);
          const isMonetary = key.toLowerCase().includes('pkr') || key.toLowerCase().includes('revenue');

          return (
            <div key={key} className={`rounded-xl border px-3 py-3 ${isMonetary ? 'border-blue-200 dark:border-orange-500/20 bg-blue-50/60 dark:bg-orange-500/5' : 'border-slate-200 dark:border-slate-700/50 bg-slate-50/80 dark:bg-slate-800/40'}`}>
              <p className="mb-1 text-[10px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                {formatHeaderLabel(key)}
              </p>
              <p className={`text-base font-extrabold ${isMonetary ? 'text-blue-600 dark:text-orange-400' : 'text-slate-900 dark:text-white'}`}>
                {formatted}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function MiniChart({ result }: { result: AiToolResult }) {
  const { chart, data } = result;
  if (!chart || !Array.isArray(data) || data.length < 2) return null;

  const chartData = data as Record<string, unknown>[];
  const tooltipStyle = { background: '#0F172A', border: '1px solid #334155', borderRadius: 8, fontSize: 11 };

  return (
    <div className="mt-2 rounded-xl border border-slate-700/40 bg-slate-800/30 px-3 pb-1 pt-3">
      <p className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
        {chart.label} - chart view
      </p>
      <ResponsiveContainer width="100%" height={160}>
        {chart.type === 'line' ? (
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
            <XAxis dataKey={chart.xKey} tick={{ fontSize: 9, fill: '#475569' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 9, fill: '#475569' }} axisLine={false} tickLine={false} width={40} tickFormatter={v => `${Number(v) >= 1000 ? `${(Number(v) / 1000).toFixed(0)}k` : v}`} />
            <Tooltip contentStyle={tooltipStyle} labelStyle={{ color: '#94A3B8' }} itemStyle={{ color: '#F97316' }} formatter={(v: unknown) => [formatCurrency(Number(v)), '']} />
            <Line type="monotone" dataKey={chart.yKey} stroke="#F97316" strokeWidth={2} dot={false} activeDot={{ r: 4, fill: '#F97316', stroke: '#fff', strokeWidth: 1.5 }} />
          </LineChart>
        ) : chart.type === 'bar' ? (
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
            <XAxis dataKey={chart.xKey} tick={{ fontSize: 9, fill: '#475569' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 9, fill: '#475569' }} axisLine={false} tickLine={false} width={40} tickFormatter={v => `${Number(v) >= 1000 ? `${(Number(v) / 1000).toFixed(0)}k` : v}`} />
            <Tooltip contentStyle={tooltipStyle} labelStyle={{ color: '#94A3B8' }} itemStyle={{ color: '#F97316' }} formatter={(v: unknown) => [formatCurrency(Number(v)), '']} />
            <Bar dataKey={chart.yKey} radius={[3, 3, 0, 0]}>
              {chartData.map((_, idx) => <Cell key={idx} fill={CHART_COLORS[idx % CHART_COLORS.length]} />)}
            </Bar>
          </BarChart>
        ) : (
          <PieChart>
            <Pie data={chartData} dataKey={chart.yKey} nameKey={chart.xKey} cx="50%" cy="50%" outerRadius={60} innerRadius={25} paddingAngle={2}>
              {chartData.map((_, idx) => <Cell key={idx} fill={CHART_COLORS[idx % CHART_COLORS.length]} />)}
            </Pie>
            <Tooltip contentStyle={tooltipStyle} formatter={(v: unknown) => [formatCurrency(Number(v)), '']} />
            <Legend formatter={v => <span style={{ color: '#64748B', fontSize: 10 }}>{v}</span>} />
          </PieChart>
        )}
      </ResponsiveContainer>
    </div>
  );
}

export function ToolResultBlock({ result }: { result: AiToolResult }) {
  const { data } = result;
  if (Array.isArray(data) && data.length > 0) {
    return (
      <>
        <DataTable data={data as Record<string, unknown>[]} />
        <MiniChart result={result} />
      </>
    );
  }
  if (data && typeof data === 'object' && !Array.isArray(data)) {
    return <KpiCards data={data as Record<string, unknown>} />;
  }
  return <p className="mt-2 text-xs italic text-slate-500">No data returned for this query.</p>;
}

export function AiAnswerText({ text }: { text: string }) {
  const lines = text
    .replace(/#{1,3}\s/g, '')
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .split('\n');

  type Segment = { type: 'table'; lines: string[] } | { type: 'text'; lines: string[] };
  const segments: Segment[] = [];

  for (const line of lines) {
    const isRow = line.trim().startsWith('|');
    const last = segments[segments.length - 1];
    if (isRow) {
      if (last?.type === 'table') last.lines.push(line);
      else segments.push({ type: 'table', lines: [line] });
    } else if (last?.type === 'text') {
      last.lines.push(line);
    } else {
      segments.push({ type: 'text', lines: [line] });
    }
  }

  const parseRow = (row: string) => row.split('|').slice(1, -1).map(c => c.trim());
  const isSeparatorRow = (row: string) => /^\|[\s\-|:]+\|$/.test(row.trim());

  return (
    <div className="space-y-3">
      {segments.map((seg, si) => {
        if (seg.type === 'table') {
          const dataLines = seg.lines.filter(l => l.trim() && !isSeparatorRow(l));
          if (dataLines.length < 1) return null;

          const headers = parseRow(dataLines[0]);
          const dataRows = dataLines.slice(1);

          return (
            <div key={si} className="mt-2 overflow-hidden rounded-xl border border-slate-700/60">
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-slate-700 bg-slate-800/90">
                      {headers.map((h, i) => (
                        <th key={i} className="whitespace-nowrap px-3 py-2.5 text-left font-semibold uppercase tracking-wider text-slate-400">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {dataRows.map((row, ri) => (
                      <tr key={ri} className={`border-b border-slate-800/50 transition-colors hover:bg-slate-700/20 ${ri % 2 === 0 ? 'bg-slate-900/30' : 'bg-slate-800/10'}`}>
                        {parseRow(row).map((cell, ci) => {
                          const isMonetary = /PKR|revenue|sales|amount|total/i.test(headers[ci] ?? '') || /^[A-Z]{2,4}\s/.test(cell);
                          return (
                            <td key={ci} className={`whitespace-nowrap px-3 py-2.5 ${ci === 0 ? 'font-medium text-white' : ''} ${isMonetary ? 'font-semibold text-orange-400' : 'text-slate-300'}`}>
                              {cell}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          );
        }

        const textEls = seg.lines.filter(l => l.trim()).map((line, i) => {
          const isBullet = line.trimStart().startsWith('- ') || line.trimStart().startsWith('• ');
          const content = isBullet ? line.replace(/^[\s\-•]+/, '') : line;
          return isBullet ? (
            <div key={i} className="flex items-start gap-2">
              <span className="mt-2 h-1 w-1 flex-shrink-0 rounded-full bg-orange-400" />
              <span className="text-sm leading-relaxed text-slate-300">{content}</span>
            </div>
          ) : (
            <p key={i} className="text-sm leading-relaxed text-slate-200">{content}</p>
          );
        });

        return textEls.length ? <div key={si} className="space-y-1.5">{textEls}</div> : null;
      })}
    </div>
  );
}
