import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { hashPassword, createToken } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function POST(req: NextRequest) {
  try {
    const { email, password, name } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: 'Email already in use' }, { status: 409 });
    }

    const passwordHash = await hashPassword(password);

    const user = await prisma.user.create({
      data: { email, passwordHash, name: name || email.split('@')[0] },
    });

    // Create default workspace
    const workspace = await prisma.workspace.create({
      data: {
        name: `${user.name}'s Workspace`,
        members: {
          create: { userId: user.id, role: 'admin' },
        },
      },
    });

    const token = await createToken({
      id: user.id,
      email: user.email,
      name: user.name,
      workspaceId: workspace.id,
    });

    const cookieStore = await cookies();
    cookieStore.set('dtoggl-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });

    return NextResponse.json({ user: { id: user.id, email: user.email, name: user.name }, workspaceId: workspace.id });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
