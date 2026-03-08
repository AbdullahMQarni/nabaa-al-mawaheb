import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const id = (await params).id;
        const body = await req.json();

        const updatedStadium = await prisma.stadium.update({
            where: { id },
            data: {
                name: body.name,
                description: body.description,
                locationUrl: body.locationUrl,
                imageUrl: body.imageUrl,
                pricePerHour: body.pricePerHour ? parseFloat(body.pricePerHour) : undefined,
                capacity: body.capacity ? parseInt(body.capacity) : undefined,
                isActive: body.isActive
            }
        });

        return NextResponse.json(updatedStadium);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update stadium' }, { status: 500 });
    }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const id = (await params).id;

        // In a real app we might soft-delete or check for existing bookings first
        await prisma.stadium.delete({
            where: { id }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete stadium. It might have existing bookings.' }, { status: 500 });
    }
}
