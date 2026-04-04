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

        // Also check previous day for bookings that might span past midnight into current day
        const prevDay = new Date(startOfDay);
        prevDay.setDate(prevDay.getDate() - 1);
        const startOfPrevDay = new Date(prevDay.setHours(0, 0, 0, 0));

        // Fetch all ACCEPTED or PENDING bookings for this stadium on current day and previous day
        // (We block slot if it's pending to prevent double booking race conditions)
        const bookings = await prisma.booking.findMany({
            where: {
                stadiumId: id,
                date: {
                    gte: startOfPrevDay,
                    lte: endOfDay,
                },
                status: {
                    in: ['ACCEPTED', 'PENDING']
                }
            },
            select: {
                startTime: true,
                duration: true,
                date: true
            }
        });

        // Filter to only include bookings that affect the current day
        // Include:
        // 1. Bookings on the current day
        // 2. Bookings on previous day that span past midnight (> 1440 minutes total)
        const currentDayStart = startOfDay.getTime();

        const relevantBookings = bookings.filter(booking => {
            const bookingDate = new Date(booking.date);
            bookingDate.setHours(0, 0, 0, 0);
            const bookingTime = bookingDate.getTime();

            // Same day booking - always relevant
            if (bookingTime === currentDayStart) {
                return true;
            }

            // Previous day booking - only relevant if it spans past midnight
            if (bookingTime === currentDayStart - 86400000) {
                const [hours, minutes] = booking.startTime.split(':').map(Number);
                const startMinutes = (hours === 0 && minutes === 0) ? 1440 : hours * 60 + minutes;
                const endMinutes = startMinutes + booking.duration;
                // Spans past midnight if end time > 1440 (24:00)
                return endMinutes > 1440;
            }

            return false;
        });

        return NextResponse.json({ bookings: relevantBookings });
    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
