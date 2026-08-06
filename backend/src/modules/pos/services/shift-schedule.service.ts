import prisma from '../../../shared/lib/prisma';
import { toBigInt } from '../../../shared/utils/bigint';

type LocalParts = {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
};

const DEFAULT_TIMEZONE = 'Asia/Karachi';

function minutesFromTime(value: string): number {
  const match = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(value);
  if (!match) throw new Error(`Invalid shift time: ${value}`);
  return Number(match[1]) * 60 + Number(match[2]);
}

function localParts(date: Date, timeZone: string): LocalParts {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(date);

  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value ?? 0);
  return {
    year: get('year'),
    month: get('month'),
    day: get('day'),
    hour: get('hour'),
    minute: get('minute'),
  };
}

function dateKey(parts: Pick<LocalParts, 'year' | 'month' | 'day'>): string {
  return [
    String(parts.year).padStart(4, '0'),
    String(parts.month).padStart(2, '0'),
    String(parts.day).padStart(2, '0'),
  ].join('-');
}

function previousDateKey(parts: LocalParts): string {
  const utc = Date.UTC(parts.year, parts.month - 1, parts.day);
  return new Date(utc - 86_400_000).toISOString().slice(0, 10);
}

function isWithinShift(nowMinutes: number, startMinutes: number, endMinutes: number): boolean {
  if (startMinutes === endMinutes) return true;
  if (startMinutes < endMinutes) return nowMinutes >= startMinutes && nowMinutes < endMinutes;
  return nowMinutes >= startMinutes || nowMinutes < endMinutes;
}

export class ShiftScheduleService {
  static async branchTimezone(branchId: string | bigint): Promise<string> {
    const branch = await prisma.branch.findUnique({
      where: { id: toBigInt(branchId) },
      select: { orgId: true },
    });
    if (!branch) return DEFAULT_TIMEZONE;

    const config = await prisma.orgConfig.findUnique({
      where: { orgId: branch.orgId },
      select: { timezone: true },
    });
    return config?.timezone || DEFAULT_TIMEZONE;
  }

  /**
   * Resolve current shift and business date for a branch.
   *
   * Pass `orgId` when the caller already has it (e.g. ManagerOverviewService)
   * to skip the duplicate branch→orgId lookup and save one roundtrip.
   * orgConfig and shiftTemplates are fetched in parallel.
   */
  static async resolveCurrent(branchId: string | bigint, at = new Date(), orgId?: bigint) {
    const branchBigInt = toBigInt(branchId);

    // If orgId not supplied, fetch it first (single query); then run orgConfig +
    // shiftTemplates in parallel.  This eliminates the old 3-sequential-roundtrip
    // chain (branch → orgConfig → shiftTemplates) by reducing it to 2 phases.
    const resolvedOrgId = orgId ?? (await prisma.branch.findUnique({
      where:  { id: branchBigInt },
      select: { orgId: true },
    }))?.orgId;

    const [config, shifts] = await Promise.all([
      resolvedOrgId
        ? prisma.orgConfig.findUnique({ where: { orgId: resolvedOrgId }, select: { timezone: true } })
        : Promise.resolve(null),
      prisma.shiftTemplate.findMany({
        where:   { branchId: branchBigInt, isActive: true },
        orderBy: [{ sortOrder: 'asc' }, { startTime: 'asc' }],
      }),
    ]);

    const timeZone = config?.timezone || DEFAULT_TIMEZONE;

    const parts = localParts(at, timeZone);
    const nowMinutes = parts.hour * 60 + parts.minute;
    const shift = shifts.find((candidate) =>
      isWithinShift(nowMinutes, minutesFromTime(candidate.startTime), minutesFromTime(candidate.endTime)),
    ) ?? null;

    const crossesMidnight = shift
      ? minutesFromTime(shift.startTime) > minutesFromTime(shift.endTime)
      : false;
    const businessDateKey = shift && crossesMidnight && nowMinutes < minutesFromTime(shift.endTime)
      ? previousDateKey(parts)
      : dateKey(parts);

    return {
      shift,
      hasShifts: shifts.length > 0,
      timeZone,
      businessDateKey,
      businessDate: new Date(`${businessDateKey}T00:00:00.000Z`),
    };
  }
}
