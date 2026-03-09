import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';

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

        // TODO: Verify if the slot is actually free (to prevent race conditions) before inserting.
        // For MVP, simplistic validation:
        if (!stadiumId || !date || !startTime || !duration) {
            return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
        }

        const stadium = await prisma.stadium.findUnique({ where: { id: stadiumId } });
        if (!stadium) {
            return NextResponse.json({ error: 'Stadium not found.' }, { status: 404 });
        }

        const bookingDate = new Date(date);
        const startOfDay = new Date(bookingDate.setHours(0, 0, 0, 0));
        const endOfDay = new Date(bookingDate.setHours(23, 59, 59, 999));

        // Simple overlapping check
        const existingBookings = await prisma.booking.findMany({
            where: {
                stadiumId,
                date: { gte: startOfDay, lte: endOfDay },
                startTime: startTime,
                status: { in: ['ACCEPTED', 'PENDING'] }
            }
        });

        if (existingBookings.length > 0) {
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
