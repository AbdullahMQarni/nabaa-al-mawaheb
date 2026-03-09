import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const id = (await params).id;
        const cookieStore = await cookies();
        const userId = cookieStore.get('session_userId')?.value;

        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { action } = await request.json();

        if (action === 'CANCEL') {
            // Allow canceling only if it's PENDING or ACCEPTED by this user
            const booking = await prisma.booking.findUnique({ where: { id } });

            if (!booking || booking.userId !== userId) {
                return NextResponse.json({ error: 'Not found or unauthorized' }, { status: 403 });
            }

            const updated = await prisma.booking.update({
                where: { id },
                data: { status: 'CANCELLED', cancellationReason: 'الغاء من قبل العميل' }
            });

            return NextResponse.json({ success: true, booking: updated });
        }

        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
