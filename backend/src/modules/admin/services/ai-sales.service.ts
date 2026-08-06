// =============================================================================
// AI Sales Service — all analytics queries live here; no business logic leaks
// to the frontend. Uses OpenAI tool-calling: the model picks which queries to
// run, we execute them against Prisma, feed results back, get a final answer.
//
// Model:  gpt-4o-mini  (cheapest + best quality for analytics)
// Voice:  whisper-1    (transcription + auto-translation to English)
// =============================================================================

import OpenAI, { toFile }   from 'openai';
import { Readable }          from 'stream';
import prisma                from '../../../shared/lib/prisma';
import { env }               from '../../../config/env';

// ── OpenAI client (lazy — only instantiated when key is present) ──────────────

function getClient(): OpenAI {
  if (!env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY is not configured. Add it to your .env file.');
  }
  return new OpenAI({ apiKey: env.OPENAI_API_KEY });
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const paisa = (p: number | bigint | null | undefined): number =>
  Math.round(Number(p ?? 0)) / 100;

function dateRange(start: string, end: string) {
  return {
    gte: new Date(`${start}T00:00:00.000Z`),
    lte: new Date(`${end}T23:59:59.999Z`),
  };
}

function branchFilter(branchId?: string) {
  return branchId ? { branchId: BigInt(branchId) } : {};
}

// ── Analytics functions — each maps to one OpenAI tool ───────────────────────

async function getSalesSummary(
  startDate: string,
  endDate:   string,
  branchId?: string,
) {
  const where = {
    isActive:      true,
    paymentStatus: 'paid',
    date:          dateRange(startDate, endDate),
    ...branchFilter(branchId),
  };

  const agg = await prisma.invoice.aggregate({
    where,
    _sum:   { grandTotalPaisa: true, totalDiscountPaisa: true, taxPaisa: true },
    _count: { id: true },
    _avg:   { grandTotalPaisa: true },
  });

  return {
    totalRevenuePKR:   paisa(agg._sum.grandTotalPaisa),
    totalOrders:       agg._count.id,
    avgOrderValuePKR:  paisa(agg._avg.grandTotalPaisa),
    totalDiscountPKR:  paisa(agg._sum.totalDiscountPaisa),
    totalTaxPKR:       paisa(agg._sum.taxPaisa),
    period:            { startDate, endDate },
  };
}

async function getTopProducts(
  startDate: string,
  endDate:   string,
  limit      = 10,
  branchId?: string,
) {
  const rows = await prisma.invoiceItem.groupBy({
    by:    ['productName'],
    where: {
      isActive: true,
      invoice:  {
        isActive:      true,
        paymentStatus: 'paid',
        date:          dateRange(startDate, endDate),
        ...branchFilter(branchId),
      },
    },
    _sum:   { lineTotalPaisa: true, quantity: true },
    _count: { id: true },
    orderBy: { _sum: { lineTotalPaisa: 'desc' } },
    take:    limit,
  });

  return rows.map(r => ({
    product:    r.productName,
    revenuePKR: paisa(r._sum.lineTotalPaisa),
    quantity:   r._sum.quantity ?? 0,
    orders:     r._count.id,
  }));
}

async function getSalesByCategory(
  startDate: string,
  endDate:   string,
  branchId?: string,
) {
  const rows = await prisma.invoiceItem.groupBy({
    by:    ['category'],
    where: {
      isActive: true,
      invoice:  {
        isActive:      true,
        paymentStatus: 'paid',
        date:          dateRange(startDate, endDate),
        ...branchFilter(branchId),
      },
    },
    _sum:   { lineTotalPaisa: true, quantity: true },
    _count: { id: true },
    orderBy: { _sum: { lineTotalPaisa: 'desc' } },
  });

  return rows.map(r => ({
    category:   r.category,
    revenuePKR: paisa(r._sum.lineTotalPaisa),
    quantity:   r._sum.quantity ?? 0,
    orders:     r._count.id,
  }));
}

async function getSalesByDay(
  startDate: string,
  endDate:   string,
  branchId?: string,
) {
  const where = {
    isActive:      true,
    paymentStatus: 'paid',
    date:          dateRange(startDate, endDate),
    ...branchFilter(branchId),
  };

  const invoices = await prisma.invoice.findMany({
    where,
    select: { date: true, grandTotalPaisa: true },
    orderBy: { date: 'asc' },
  });

  // Group by day
  const map = new Map<string, { revenuePKR: number; orders: number }>();
  for (const inv of invoices) {
    const day = inv.date.toISOString().slice(0, 10);
    const cur = map.get(day) ?? { revenuePKR: 0, orders: 0 };
    map.set(day, {
      revenuePKR: cur.revenuePKR + paisa(inv.grandTotalPaisa),
      orders:     cur.orders + 1,
    });
  }

  return Array.from(map.entries()).map(([date, v]) => ({ date, ...v }));
}

async function getSalesByHour(
  startDate: string,
  endDate:   string,
  branchId?: string,
) {
  const where = {
    isActive:      true,
    paymentStatus: 'paid',
    date:          dateRange(startDate, endDate),
    ...branchFilter(branchId),
  };

  const invoices = await prisma.invoice.findMany({
    where,
    select: { date: true, grandTotalPaisa: true },
  });

  const map = new Map<number, { revenuePKR: number; orders: number }>();
  for (let h = 0; h < 24; h++) map.set(h, { revenuePKR: 0, orders: 0 });

  for (const inv of invoices) {
    const hour = inv.date.getHours();
    const cur  = map.get(hour)!;
    map.set(hour, {
      revenuePKR: cur.revenuePKR + paisa(inv.grandTotalPaisa),
      orders:     cur.orders + 1,
    });
  }

  return Array.from(map.entries())
    .sort((a, b) => a[0] - b[0])
    .map(([hour, v]) => ({ hour: `${String(hour).padStart(2, '0')}:00`, ...v }));
}

async function getPaymentMethodSplit(
  startDate: string,
  endDate:   string,
  branchId?: string,
) {
  const rows = await prisma.invoice.groupBy({
    by:    ['paymentMethod'],
    where: {
      isActive:      true,
      paymentStatus: 'paid',
      date:          dateRange(startDate, endDate),
      ...branchFilter(branchId),
    },
    _sum:   { grandTotalPaisa: true },
    _count: { id: true },
  });

  return rows.map(r => ({
    method:     r.paymentMethod,
    revenuePKR: paisa(r._sum.grandTotalPaisa),
    orders:     r._count.id,
  }));
}

async function getOrderTypeSplit(
  startDate: string,
  endDate:   string,
  branchId?: string,
) {
  const rows = await prisma.invoice.groupBy({
    by:    ['orderType'],
    where: {
      isActive:      true,
      paymentStatus: 'paid',
      date:          dateRange(startDate, endDate),
      ...branchFilter(branchId),
    },
    _sum:   { grandTotalPaisa: true },
    _count: { id: true },
  });

  return rows.map(r => ({
    type:       r.orderType,
    revenuePKR: paisa(r._sum.grandTotalPaisa),
    orders:     r._count.id,
  }));
}

async function getBranchComparison(startDate: string, endDate: string) {
  const rows = await prisma.invoice.groupBy({
    by:    ['branchId'],
    where: {
      isActive:      true,
      paymentStatus: 'paid',
      date:          dateRange(startDate, endDate),
    },
    _sum:   { grandTotalPaisa: true },
    _count: { id: true },
    _avg:   { grandTotalPaisa: true },
    orderBy: { _sum: { grandTotalPaisa: 'desc' } },
  });

  // Fetch branch names
  const branchIds = rows.map(r => r.branchId);
  const branches  = await prisma.branch.findMany({
    where:  { id: { in: branchIds } },
    select: { id: true, name: true, label: true },
  });
  const branchMap = Object.fromEntries(branches.map(b => [String(b.id), b]));

  return rows.map(r => {
    const b = branchMap[String(r.branchId)];
    return {
      branch:         b?.label ?? String(r.branchId),
      branchName:     b?.name  ?? '',
      revenuePKR:     paisa(r._sum.grandTotalPaisa),
      orders:         r._count.id,
      avgOrderPKR:    paisa(r._avg.grandTotalPaisa),
    };
  });
}

async function getCustomerMetrics(
  startDate: string,
  endDate:   string,
  branchId?: string,
) {
  const where = {
    isActive:      true,
    paymentStatus: 'paid',
    date:          dateRange(startDate, endDate),
    ...branchFilter(branchId),
  };

  const [total, withCustomer, newCustomers] = await Promise.all([
    prisma.invoice.count({ where }),
    prisma.invoice.count({ where: { ...where, customerId: { not: null } } }),
    // Customers whose first order falls in this range
    prisma.customer.count({
      where: {
        isActive:    true,
        lastOrderAt: dateRange(startDate, endDate),
      },
    }),
  ]);

  return {
    totalOrders:    total,
    ordersWithLoyalty: withCustomer,
    loyaltyRate:    total > 0 ? Math.round((withCustomer / total) * 100) : 0,
    newCustomersInPeriod: newCustomers,
  };
}

// ── Tool dispatcher — called after OpenAI returns tool-call requests ──────────

const TOOL_MAP: Record<string, (...args: unknown[]) => Promise<unknown>> = {
  getSalesSummary:      (s, e, b) => getSalesSummary(s as string, e as string, b as string | undefined),
  getTopProducts:       (s, e, l, b) => getTopProducts(s as string, e as string, l as number | undefined, b as string | undefined),
  getSalesByCategory:   (s, e, b) => getSalesByCategory(s as string, e as string, b as string | undefined),
  getSalesByDay:        (s, e, b) => getSalesByDay(s as string, e as string, b as string | undefined),
  getSalesByHour:       (s, e, b) => getSalesByHour(s as string, e as string, b as string | undefined),
  getPaymentMethodSplit:(s, e, b) => getPaymentMethodSplit(s as string, e as string, b as string | undefined),
  getOrderTypeSplit:    (s, e, b) => getOrderTypeSplit(s as string, e as string, b as string | undefined),
  getBranchComparison:  (s, e) => getBranchComparison(s as string, e as string),
  getCustomerMetrics:   (s, e, b) => getCustomerMetrics(s as string, e as string, b as string | undefined),
};

async function callTool(name: string, args: Record<string, unknown>): Promise<unknown> {
  const fn = TOOL_MAP[name];
  if (!fn) throw new Error(`Unknown tool: ${name}`);

  // Spread positional params from named args object
  switch (name) {
    case 'getSalesSummary':
      return getSalesSummary(args.startDate as string, args.endDate as string, args.branchId as string | undefined);
    case 'getTopProducts':
      return getTopProducts(args.startDate as string, args.endDate as string, args.limit as number | undefined, args.branchId as string | undefined);
    case 'getSalesByCategory':
      return getSalesByCategory(args.startDate as string, args.endDate as string, args.branchId as string | undefined);
    case 'getSalesByDay':
      return getSalesByDay(args.startDate as string, args.endDate as string, args.branchId as string | undefined);
    case 'getSalesByHour':
      return getSalesByHour(args.startDate as string, args.endDate as string, args.branchId as string | undefined);
    case 'getPaymentMethodSplit':
      return getPaymentMethodSplit(args.startDate as string, args.endDate as string, args.branchId as string | undefined);
    case 'getOrderTypeSplit':
      return getOrderTypeSplit(args.startDate as string, args.endDate as string, args.branchId as string | undefined);
    case 'getBranchComparison':
      return getBranchComparison(args.startDate as string, args.endDate as string);
    case 'getCustomerMetrics':
      return getCustomerMetrics(args.startDate as string, args.endDate as string, args.branchId as string | undefined);
    default:
      return fn(args);
  }
}

// ── OpenAI tool definitions ───────────────────────────────────────────────────

const TOOLS: OpenAI.Chat.ChatCompletionTool[] = [
  {
    type: 'function',
    function: {
      name: 'getSalesSummary',
      description: 'Get overall sales KPIs: total revenue (PKR), order count, average order value, total discounts, and total tax for a date range.',
      parameters: {
        type: 'object',
        properties: {
          startDate: { type: 'string', description: 'Start date YYYY-MM-DD' },
          endDate:   { type: 'string', description: 'End date YYYY-MM-DD' },
          branchId:  { type: 'string', description: 'Optional branch ID to scope the query' },
        },
        required: ['startDate', 'endDate'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'getTopProducts',
      description: 'Get top-selling products ranked by revenue. Returns product name, revenue (PKR), quantity sold, and order count.',
      parameters: {
        type: 'object',
        properties: {
          startDate: { type: 'string', description: 'Start date YYYY-MM-DD' },
          endDate:   { type: 'string', description: 'End date YYYY-MM-DD' },
          limit:     { type: 'number', description: 'Number of top products to return (default 10)' },
          branchId:  { type: 'string', description: 'Optional branch ID to scope the query' },
        },
        required: ['startDate', 'endDate'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'getSalesByCategory',
      description: 'Breakdown sales by product category (burgers, drinks, fries, etc). Returns revenue, quantity and order count per category.',
      parameters: {
        type: 'object',
        properties: {
          startDate: { type: 'string', description: 'Start date YYYY-MM-DD' },
          endDate:   { type: 'string', description: 'End date YYYY-MM-DD' },
          branchId:  { type: 'string', description: 'Optional branch ID to scope the query' },
        },
        required: ['startDate', 'endDate'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'getSalesByDay',
      description: 'Daily sales trend over a date range. Returns date, revenue (PKR), and order count per day. Use for trend/line charts.',
      parameters: {
        type: 'object',
        properties: {
          startDate: { type: 'string', description: 'Start date YYYY-MM-DD' },
          endDate:   { type: 'string', description: 'End date YYYY-MM-DD' },
          branchId:  { type: 'string', description: 'Optional branch ID to scope the query' },
        },
        required: ['startDate', 'endDate'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'getSalesByHour',
      description: 'Hourly sales distribution (00:00 to 23:00). Shows peak trading hours by revenue and order count.',
      parameters: {
        type: 'object',
        properties: {
          startDate: { type: 'string', description: 'Start date YYYY-MM-DD' },
          endDate:   { type: 'string', description: 'End date YYYY-MM-DD' },
          branchId:  { type: 'string', description: 'Optional branch ID to scope the query' },
        },
        required: ['startDate', 'endDate'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'getPaymentMethodSplit',
      description: 'Breakdown of sales by payment method (cash, card, wallet). Returns revenue and order count per method.',
      parameters: {
        type: 'object',
        properties: {
          startDate: { type: 'string', description: 'Start date YYYY-MM-DD' },
          endDate:   { type: 'string', description: 'End date YYYY-MM-DD' },
          branchId:  { type: 'string', description: 'Optional branch ID to scope the query' },
        },
        required: ['startDate', 'endDate'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'getOrderTypeSplit',
      description: 'Breakdown of sales by order type (dine_in, takeaway, delivery). Returns revenue and order count per type.',
      parameters: {
        type: 'object',
        properties: {
          startDate: { type: 'string', description: 'Start date YYYY-MM-DD' },
          endDate:   { type: 'string', description: 'End date YYYY-MM-DD' },
          branchId:  { type: 'string', description: 'Optional branch ID to scope the query' },
        },
        required: ['startDate', 'endDate'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'getBranchComparison',
      description: 'Compare performance across all branches. Returns revenue, order count, and average order value per branch.',
      parameters: {
        type: 'object',
        properties: {
          startDate: { type: 'string', description: 'Start date YYYY-MM-DD' },
          endDate:   { type: 'string', description: 'End date YYYY-MM-DD' },
        },
        required: ['startDate', 'endDate'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'getCustomerMetrics',
      description: 'Customer and loyalty metrics: total orders, orders with loyalty card attached, loyalty capture rate, new customers in period.',
      parameters: {
        type: 'object',
        properties: {
          startDate: { type: 'string', description: 'Start date YYYY-MM-DD' },
          endDate:   { type: 'string', description: 'End date YYYY-MM-DD' },
          branchId:  { type: 'string', description: 'Optional branch ID to scope the query' },
        },
        required: ['startDate', 'endDate'],
      },
    },
  },
];

// ── System prompt ─────────────────────────────────────────────────────────────

function buildSystemPrompt(): string {
  const today = new Date().toISOString().slice(0, 10);
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10);

  return `You are an intelligent sales analyst AI for Crip & Crumbs — a fast-casual restaurant POS system.

You have real-time access to the sales database via the provided tools. Use them to answer questions accurately.

Rules:
- Currency is PKR (Pakistani Rupees). Always format monetary values as "Rs X,XXX" or "Rs X.XX".
- If no date range is specified, default to the last 30 days (${thirtyDaysAgo} to ${today}).
- Today is ${today}.
- Call multiple tools in parallel if the question needs data from more than one source.
- Always provide a clear, concise answer. Include key numbers prominently.
- When relevant, suggest actionable insights (e.g. "Burgers drive 42% of revenue — consider expanding the burger menu").
- If data is empty (no sales in range), say so clearly.
- Format your answer in clear markdown with bullet points or a short table where it helps readability.`;
}

// ── Chart hint — tells the frontend which Recharts component to render ────────

function detectChartHint(toolName: string, data: unknown): AiChartHint | null {
  if (!Array.isArray(data) || data.length === 0) return null;

  switch (toolName) {
    case 'getSalesByDay':
      return { type: 'line', xKey: 'date', yKey: 'revenuePKR', label: 'Daily Revenue (PKR)' };
    case 'getSalesByHour':
      return { type: 'bar', xKey: 'hour', yKey: 'revenuePKR', label: 'Hourly Revenue (PKR)' };
    case 'getTopProducts':
      return { type: 'bar', xKey: 'product', yKey: 'revenuePKR', label: 'Product Revenue (PKR)' };
    case 'getSalesByCategory':
      return { type: 'pie', xKey: 'category', yKey: 'revenuePKR', label: 'Revenue by Category' };
    case 'getPaymentMethodSplit':
      return { type: 'pie', xKey: 'method', yKey: 'revenuePKR', label: 'Revenue by Payment Method' };
    case 'getOrderTypeSplit':
      return { type: 'pie', xKey: 'type', yKey: 'revenuePKR', label: 'Revenue by Order Type' };
    case 'getBranchComparison':
      return { type: 'bar', xKey: 'branch', yKey: 'revenuePKR', label: 'Branch Revenue (PKR)' };
    default:
      return null;
  }
}

// ── Public types ──────────────────────────────────────────────────────────────

export interface AiChartHint {
  type:  'bar' | 'line' | 'pie';
  xKey:  string;
  yKey:  string;
  label: string;
}

export interface AiToolResult {
  tool:  string;
  data:  unknown;
  chart: AiChartHint | null;
}

export interface AiChatResponse {
  answer:      string;
  toolResults: AiToolResult[];
}

// ── Main chat function ────────────────────────────────────────────────────────

export async function chat(
  userQuery:  string,
  history:    { role: 'user' | 'assistant'; content: string }[] = [],
): Promise<AiChatResponse> {
  const openai = getClient();

  const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
    { role: 'system', content: buildSystemPrompt() },
    ...history,
    { role: 'user', content: userQuery },
  ];

  const toolResults: AiToolResult[] = [];
  let iterationLimit = 5; // safety valve against infinite loops

  // Agentic loop — model may call multiple rounds of tools
  while (iterationLimit-- > 0) {
    const response = await openai.chat.completions.create({
      model:       'gpt-4o-mini',
      messages,
      tools:        TOOLS,
      tool_choice: 'auto',
    });

    const choice = response.choices[0];
    messages.push(choice.message);

    // No tool calls — we have the final answer
    if (choice.finish_reason === 'stop' || !choice.message.tool_calls?.length) {
      return {
        answer:      choice.message.content ?? '',
        toolResults,
      };
    }

    // Execute all tool calls in parallel (filter to function-type only)
    type FnToolCall = { type: 'function'; id: string; function: { name: string; arguments: string } };
    const fnCalls = (choice.message.tool_calls as FnToolCall[])
      .filter(tc => tc.type === 'function');

    const toolCallResults = await Promise.all(
      fnCalls.map(async (tc) => {
        const args  = JSON.parse(tc.function.arguments) as Record<string, unknown>;
        const data  = await callTool(tc.function.name, args);
        const chart = detectChartHint(tc.function.name, data);

        toolResults.push({ tool: tc.function.name, data, chart });

        return {
          role:         'tool' as const,
          tool_call_id: tc.id,
          content:      JSON.stringify(data),
        };
      }),
    );

    messages.push(...toolCallResults);
  }

  return { answer: 'Sorry, I could not complete the analysis. Please try a more specific question.', toolResults };
}

// ── Voice transcription (Whisper) ─────────────────────────────────────────────

export async function transcribeAudio(
  audioBuffer: Buffer,
  mimeType:    string,
  filename:    string,
): Promise<string> {
  const openai = getClient();

  // Whisper accepts: mp3, mp4, mpeg, mpga, m4a, wav, webm
  const file = await toFile(
    Readable.from(audioBuffer),
    filename,
    { type: mimeType },
  );

  const result = await openai.audio.transcriptions.create({
    model:    'whisper-1',
    file,
    language: undefined,           // auto-detect any language
    response_format: 'json',
  });

  return result.text;
}
