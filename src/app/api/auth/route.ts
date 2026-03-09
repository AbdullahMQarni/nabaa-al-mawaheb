import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
    try {
        const { phone } = await request.json();

        if (!phone) {
            return NextResponse.json({ error: 'Phone number is required' }, { status: 400 });
        }

        // Upsert user based on phone
        const user = await prisma.user.upsert({
            where: { phoneNumber: phone },
            update: {}, // Do nothing if it exists
            create: { phoneNumber: phone },
        });

        // Simple session management for MVP: Set a cookie with the user ID
        (await cookies()).set('session_userId', user.id, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 60 * 60 * 24 * 30, // 30 days
            path: '/',
        });

        return NextResponse.json({ success: true, user });
    } catch (error) {
        console.error('Auth Error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
