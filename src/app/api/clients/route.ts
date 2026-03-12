import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const clients = await prisma.client.findMany({
    where: { workspaceId: session.workspaceId },
    include: { _count: { select: { projects: true } } },
    orderBy: { name: 'asc' },
  });

  return NextResponse.json(clients);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { name } = await req.json();
  const client = await prisma.client.create({
    data: { name, workspaceId: session.workspaceId },
  });

  return NextResponse.json(client);
}
