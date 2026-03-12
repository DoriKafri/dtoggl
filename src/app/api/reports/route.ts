import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const start = searchParams.get('start') || new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const end = searchParams.get('end') || new Date().toISOString();
  const projectId = searchParams.get('projectId');
  const clientId = searchParams.get('clientId');

  const where: Record<string, unknown> = {
    userId: session.id,
    workspaceId: session.workspaceId,
    start: { gte: new Date(start) },
    stop: { lte: new Date(end), not: null },
  };

  if (projectId) where.projectId = projectId;
  if (clientId) where.project = { clientId };

  const entries = await prisma.timeEntry.findMany({
    where,
    include: {
      project: { include: { client: true } },
      tags: { include: { tag: true } },
    },
    orderBy: { start: 'desc' },
  });

  // Calculate summary
  const totalSeconds = entries.reduce((sum, e) => sum + (e.duration || 0), 0);
  const billableSeconds = entries.filter(e => e.billable).reduce((sum, e) => sum + (e.duration || 0), 0);

  // Group by project
  const byProject: Record<string, { name: string; color: string; seconds: number; count: number }> = {};
  entries.forEach(e => {
    const key = e.projectId || 'no-project';
    if (!byProject[key]) {
      byProject[key] = {
        name: e.project?.name || 'No Project',
        color: e.project?.color || '#607D8B',
        seconds: 0,
        count: 0,
      };
    }
    byProject[key].seconds += e.duration || 0;
    byProject[key].count += 1;
  });

  // Group by day
  const byDay: Record<string, { date: string; seconds: number; billableSeconds: number }> = {};
  entries.forEach(e => {
    const day = e.start.toISOString().split('T')[0];
    if (!byDay[day]) {
      byDay[day] = { date: day, seconds: 0, billableSeconds: 0 };
    }
    byDay[day].seconds += e.duration || 0;
    if (e.billable) byDay[day].billableSeconds += e.duration || 0;
  });

  return NextResponse.json({
    totalSeconds,
    billableSeconds,
    billablePercentage: totalSeconds > 0 ? Math.round((billableSeconds / totalSeconds) * 100) : 0,
    entryCount: entries.length,
    byProject: Object.values(byProject),
    byDay: Object.values(byDay).sort((a, b) => a.date.localeCompare(b.date)),
    entries,
  });
}
