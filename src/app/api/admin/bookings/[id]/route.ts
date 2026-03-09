import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const id = (await params).id;
        const body = await request.json();
        const { action, reason } = body;

        if (!['ACCEPT', 'REJECT'].includes(action)) {
            return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
        }

        if (action === 'REJECT' && !reason) {
            return NextResponse.json({ error: 'Rejection reason is mandatory' }, { status: 400 });
        }

        const updated = await prisma.booking.update({
            where: { id },
            data: {
                status: action === 'ACCEPT' ? 'ACCEPTED' : 'REJECTED',
                rejectionReason: action === 'REJECT' ? reason : null
            }
        });

        return NextResponse.json({ success: true, booking: updated });
    } catch (error) {
        console.error('Admin API Error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
