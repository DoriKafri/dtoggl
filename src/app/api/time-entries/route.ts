import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const start = searchParams.get('start');
  const end = searchParams.get('end');

  const where: Record<string, unknown> = {
    userId: session.id,
    workspaceId: session.workspaceId,
  };

  if (start && end) {
    where.start = { gte: new Date(start), lte: new Date(end) };
  }

  const entries = await prisma.timeEntry.findMany({
    where,
    include: {
      project: { include: { client: true } },
      tags: { include: { tag: true } },
    },
    orderBy: { start: 'desc' },
  });

  return NextResponse.json(entries);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { description, start, stop, projectId, billable, tagIds } = body;

  const startDate = new Date(start || new Date());
  const stopDate = stop ? new Date(stop) : null;
  const duration = stopDate ? Math.floor((stopDate.getTime() - startDate.getTime()) / 1000) : null;

  const entry = await prisma.timeEntry.create({
    data: {
      description: description || '',
      start: startDate,
      stop: stopDate,
      duration,
      billable: billable || false,
      userId: session.id,
      workspaceId: session.workspaceId,
      projectId: projectId || null,
      tags: tagIds?.length ? {
        create: tagIds.map((tagId: string) => ({ tagId })),
      } : undefined,
    },
    include: {
      project: { include: { client: true } },
      tags: { include: { tag: true } },
    },
  });

  return NextResponse.json(entry);
}
