import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const id = (await params).id;
        const { searchParams } = new URL(request.url);
        const dateQuery = searchParams.get('date');

        if (!dateQuery) {
            return NextResponse.json({ error: 'Date is required' }, { status: 400 });
        }

        const searchDate = new Date(dateQuery);
        const startOfDay = new Date(searchDate.setHours(0, 0, 0, 0));
        const endOfDay = new Date(searchDate.setHours(23, 59, 59, 999));

        // Fetch all ACCEPTED or PENDING bookings for this stadium on this date
        // (We block slot if it's pending to prevent double booking race conditions)
        const bookings = await prisma.booking.findMany({
            where: {
                stadiumId: id,
                date: {
                    gte: startOfDay,
                    lte: endOfDay,
                },
                status: {
                    in: ['ACCEPTED', 'PENDING']
                }
            },
            select: {
                startTime: true,
                duration: true
            }
        });

        return NextResponse.json({ bookings });
    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
