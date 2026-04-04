import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';

// Convert time string "HH:MM" to minutes from start of day
function timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    // Handle midnight (00:00) as 1440 minutes (next day)
    if (hours === 0 && minutes === 0) return 1440;
    return hours * 60 + minutes;
}

// Check if two time ranges overlap
function doTimeRangesOverlap(
    start1: number, end1: number,
    start2: number, end2: number
): boolean {
    return start1 < end2 && end1 > start2;
}

export async function POST(request: Request) {
    try {
        const cookieStore = await cookies();
        const userId = cookieStore.get('session_userId')?.value;

        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            return NextResponse.json({ error: 'User not found. Please log in again.' }, { status: 401 });
        }

        const body = await request.json();
        const { stadiumId, date, startTime, duration, sportType, playersCount, totalPrice } = body;

        if (!stadiumId || !date || !startTime || !duration) {
            return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
        }

        const stadium = await prisma.stadium.findUnique({ where: { id: stadiumId } });
        if (!stadium) {
            return NextResponse.json({ error: 'Stadium not found.' }, { status: 404 });
        }
        if (!stadium.isActive) {
            return NextResponse.json({ error: 'This stadium is currently not available for booking.' }, { status: 400 });
        }

        const bookingDate = new Date(date);
        const startOfDay = new Date(bookingDate.setHours(0, 0, 0, 0));
        const endOfDay = new Date(bookingDate.setHours(23, 59, 59, 999));

        // Also check previous day for bookings that might span past midnight
        const prevDay = new Date(bookingDate);
        prevDay.setDate(prevDay.getDate() - 1);
        const startOfPrevDay = new Date(prevDay.setHours(0, 0, 0, 0));

        // Get all bookings for current day and previous day
        const existingBookings = await prisma.booking.findMany({
            where: {
                stadiumId,
                date: {
                    gte: startOfPrevDay,
                    lte: endOfDay
                },
                status: { in: ['ACCEPTED', 'PENDING'] }
            },
            select: {
                startTime: true,
                duration: true,
                date: true
            }
        });

        // Calculate the new booking's time range
        const newStartMinutes = timeToMinutes(startTime);
        const newEndMinutes = newStartMinutes + duration;

        // Check for overlaps with existing bookings
        const hasOverlap = existingBookings.some(booking => {
            const existStartMinutes = timeToMinutes(booking.startTime);
            const existEndMinutes = existStartMinutes + booking.duration;

            // For current day bookings
            const bookingDay = new Date(booking.date);
            bookingDay.setHours(0, 0, 0, 0);
            const currentDay = new Date(startOfDay);

            if (bookingDay.getTime() === currentDay.getTime()) {
                // Same day - direct overlap check
                return doTimeRangesOverlap(newStartMinutes, newEndMinutes, existStartMinutes, existEndMinutes);
            } else {
                // Previous day booking - only matters if it spans past midnight
                // Previous day booking ends at existEndMinutes (which could be > 1440 if it spans midnight)
                // We need to check if it overlaps with our new booking starting at newStartMinutes
                if (existEndMinutes > 1440) {
                    // Booking spans to current day, ends at (existEndMinutes - 1440) minutes into current day
                    const prevDayEndInCurrentDay = existEndMinutes - 1440;
                    return newStartMinutes < prevDayEndInCurrentDay && newEndMinutes > 0;
                }
                return false;
            }
        });

        if (hasOverlap) {
            return NextResponse.json({ error: 'Time slot already booked' }, { status: 409 });
        }

        const booking = await prisma.booking.create({
            data: {
                userId,
                stadiumId,
                date: new Date(date),
                startTime,
                duration,
                sportType,
                playersCount,
                totalPrice,
                status: 'PENDING',
                paymentStatus: 'PENDING'
            }
        });

        return NextResponse.json({ success: true, booking });
    } catch (error) {
        console.error('Booking Error:', error);
        return NextResponse.json({ error: 'Internal server error: ' + (error instanceof Error ? error.message : String(error)) }, { status: 500 });
    }
}
