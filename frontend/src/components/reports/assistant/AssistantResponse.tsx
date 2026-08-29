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
import { chartTheme, chartSeries, chartTickStyle, chartTooltipStyle, chartTooltipLabelStyle } from '@/lib/chartTheme';

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
    <div className="mt-3 overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-border bg-secondary/80">
              <th className="w-7 px-3 py-2.5 text-left font-bold text-muted-foreground/70">#</th>
              {headers.map(h => (
                <th key={h} className="whitespace-nowrap px-3 py-2.5 text-left font-extrabold uppercase tracking-wider text-muted-foreground">
                  {formatHeaderLabel(h)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => (
              <tr key={i} className={`border-b border-border dark:border-border/50 transition-colors hover:bg-muted dark:hover:bg-muted/40 ${i % 2 === 0 ? 'bg-white dark:bg-muted/30' : 'bg-muted/50'}`}>
                <td className="px-3 py-2.5 font-mono text-muted-foreground/70">{i + 1}</td>
                {headers.map((h, hi) => {
                  const val = row[h];
                  const formatted = formatCellValue(h, val);
                  const isMonetary = h.toLowerCase().includes('pkr') || h.toLowerCase().includes('revenue') || h.toLowerCase().includes('avg');
                  const pct = maxByKey[h] > 0 ? Math.round((Number(val) / maxByKey[h]) * 100) : 0;

                  return (
                    <td key={h} className={`whitespace-nowrap px-3 py-2.5 ${hi === 0 ? 'font-extrabold text-foreground' : ''} ${isMonetary ? 'font-extrabold text-primary' : 'text-muted-foreground font-medium'}`}>
                      {isMonetary && data.length > 1 ? (
                        <div className="flex items-center gap-2">
                          <span>{formatted}</span>
                          <div className="h-1.5 w-12 flex-shrink-0 overflow-hidden rounded-full bg-secondary">
                            <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${pct}%` }} />
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
        <p className="text-2xs uppercase font-bold tracking-wider text-muted-foreground/70">
          {period.startDate} to {period.endDate}
        </p>
      )}
      <div className="grid grid-cols-2 gap-2">
        {entries.map(([key, value]) => {
          const formatted = formatCellValue(key, value);
          const isMonetary = key.toLowerCase().includes('pkr') || key.toLowerCase().includes('revenue');

          return (
            <div key={key} className={`rounded-xl border px-3 py-3 ${isMonetary ? 'border-info-border bg-primary/60 dark:bg-warning/5' : 'border-border bg-muted/80'}`}>
              <p className="mb-1 text-2xs font-extrabold uppercase tracking-wider text-muted-foreground">
                {formatHeaderLabel(key)}
              </p>
              <p className={`text-base font-extrabold ${isMonetary ? 'text-primary' : 'text-foreground'}`}>
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
  const tooltipStyle = chartTooltipStyle;

  return (
    <div className="mt-2 rounded-xl border border-border/40 bg-muted/30 px-3 pb-1 pt-3">
      <p className="mb-3 text-2xs font-semibold uppercase tracking-wider text-muted-foreground">
        {chart.label} - chart view
      </p>
      <ResponsiveContainer width="100%" height={160}>
        {chart.type === 'line' ? (
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.grid} />
            <XAxis dataKey={chart.xKey} tick={chartTickStyle} axisLine={false} tickLine={false} />
            <YAxis tick={chartTickStyle} axisLine={false} tickLine={false} width={40} tickFormatter={v => `${Number(v) >= 1000 ? `${(Number(v) / 1000).toFixed(0)}k` : v}`} />
            <Tooltip contentStyle={tooltipStyle} labelStyle={chartTooltipLabelStyle} itemStyle={{ color: chartSeries[0] }} formatter={(v: unknown) => [formatCurrency(Number(v)), '']} />
            <Line type="monotone" dataKey={chart.yKey} stroke={chartSeries[0]} strokeWidth={2} dot={false} activeDot={{ r: 4, fill: chartSeries[0], stroke: '#fff', strokeWidth: 1.5 }} />
          </LineChart>
        ) : chart.type === 'bar' ? (
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.grid} />
            <XAxis dataKey={chart.xKey} tick={chartTickStyle} axisLine={false} tickLine={false} />
            <YAxis tick={chartTickStyle} axisLine={false} tickLine={false} width={40} tickFormatter={v => `${Number(v) >= 1000 ? `${(Number(v) / 1000).toFixed(0)}k` : v}`} />
            <Tooltip contentStyle={tooltipStyle} labelStyle={chartTooltipLabelStyle} itemStyle={{ color: chartSeries[0] }} formatter={(v: unknown) => [formatCurrency(Number(v)), '']} />
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
            <Legend formatter={v => <span style={{ color: chartTheme.axis, fontSize: 11 }}>{v}</span>} />
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
  return <p className="mt-2 text-xs italic text-muted-foreground">No data returned for this query.</p>;
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
            <div key={si} className="mt-2 overflow-hidden rounded-xl border border-border/60">
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-border bg-muted/90">
                      {headers.map((h, i) => (
                        <th key={i} className="whitespace-nowrap px-3 py-2.5 text-left font-semibold uppercase tracking-wider text-muted-foreground/70">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {dataRows.map((row, ri) => (
                      <tr key={ri} className={`border-b border-border/50 transition-colors hover:bg-muted/20 ${ri % 2 === 0 ? 'bg-muted/30' : 'bg-muted/10'}`}>
                        {parseRow(row).map((cell, ci) => {
                          const isMonetary = /PKR|revenue|sales|amount|total/i.test(headers[ci] ?? '') || /^[A-Z]{2,4}\s/.test(cell);
                          return (
                            <td key={ci} className={`whitespace-nowrap px-3 py-2.5 ${ci === 0 ? 'font-medium text-white' : ''} ${isMonetary ? 'font-semibold text-warning' : 'text-muted-foreground'}`}>
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
              <span className="mt-2 h-1 w-1 flex-shrink-0 rounded-full bg-warning" />
              <span className="text-sm leading-relaxed text-muted-foreground">{content}</span>
            </div>
          ) : (
            <p key={i} className="text-sm leading-relaxed text-foreground">{content}</p>
          );
        });

        return textEls.length ? <div key={si} className="space-y-1.5">{textEls}</div> : null;
      })}
    </div>
  );
}
