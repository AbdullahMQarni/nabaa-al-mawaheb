import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function GET() {
    try {
        const stadiums = await prisma.stadium.findMany({
            orderBy: { createdAt: 'desc' }
        });
        return NextResponse.json(stadiums);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch stadiums' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();

        const newStadium = await prisma.stadium.create({
            data: {
                name: body.name,
                description: body.description || '',
                locationUrl: body.locationUrl || '',
                imageUrl: body.imageUrl || '',
                pricePerHour: parseFloat(body.pricePerHour),
                capacity: parseInt(body.capacity),
                isActive: body.isActive ?? true
            }
        });

        return NextResponse.json(newStadium, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to create stadium' }, { status: 500 });
    }
}
