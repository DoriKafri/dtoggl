import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const running = await prisma.timeEntry.findFirst({
    where: { userId: session.id, stop: null },
    include: {
      project: { include: { client: true } },
      tags: { include: { tag: true } },
    },
  });

  return NextResponse.json(running);
}

export async function POST() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // Stop any running entries
  const running = await prisma.timeEntry.findFirst({
    where: { userId: session.id, stop: null },
  });

  if (running) {
    const now = new Date();
    await prisma.timeEntry.update({
      where: { id: running.id },
      data: {
        stop: now,
        duration: Math.floor((now.getTime() - running.start.getTime()) / 1000),
      },
    });

    const stopped = await prisma.timeEntry.findUnique({
      where: { id: running.id },
      include: {
        project: { include: { client: true } },
        tags: { include: { tag: true } },
      },
    });
    return NextResponse.json({ stopped: true, entry: stopped });
  }

  return NextResponse.json({ stopped: false });
}
