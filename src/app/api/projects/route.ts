import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const projects = await prisma.project.findMany({
    where: { workspaceId: session.workspaceId },
    include: { client: true, _count: { select: { timeEntries: true } } },
    orderBy: { name: 'asc' },
  });

  return NextResponse.json(projects);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { name, color, billable, clientId, estimate } = await req.json();

  const project = await prisma.project.create({
    data: {
      name,
      color: color || '#E74C3C',
      billable: billable || false,
      clientId: clientId || null,
      estimate: estimate || null,
      workspaceId: session.workspaceId,
    },
    include: { client: true },
  });

  return NextResponse.json(project);
}
