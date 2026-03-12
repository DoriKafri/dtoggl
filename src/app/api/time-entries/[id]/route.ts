import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const { description, start, stop, projectId, billable, tagIds } = body;

  const updateData: Record<string, unknown> = {};
  if (description !== undefined) updateData.description = description;
  if (start !== undefined) updateData.start = new Date(start);
  if (stop !== undefined) {
    updateData.stop = stop ? new Date(stop) : null;
    if (stop && start) {
      updateData.duration = Math.floor((new Date(stop).getTime() - new Date(start).getTime()) / 1000);
    } else if (stop) {
      const existing = await prisma.timeEntry.findUnique({ where: { id } });
      if (existing) {
        updateData.duration = Math.floor((new Date(stop).getTime() - existing.start.getTime()) / 1000);
      }
    }
  }
  if (projectId !== undefined) updateData.projectId = projectId || null;
  if (billable !== undefined) updateData.billable = billable;

  if (tagIds !== undefined) {
    await prisma.timeEntryTag.deleteMany({ where: { timeEntryId: id } });
    if (tagIds.length > 0) {
      await prisma.timeEntryTag.createMany({
        data: tagIds.map((tagId: string) => ({ timeEntryId: id, tagId })),
      });
    }
  }

  const entry = await prisma.timeEntry.update({
    where: { id, userId: session.id },
    data: updateData,
    include: {
      project: { include: { client: true } },
      tags: { include: { tag: true } },
    },
  });

  return NextResponse.json(entry);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  await prisma.timeEntry.delete({ where: { id, userId: session.id } });
  return NextResponse.json({ success: true });
}
