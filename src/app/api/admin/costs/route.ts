import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { stadiumId, amount, category, date, description } = body;

        if (!amount || !category || !date) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const cost = await prisma.cost.create({
            data: {
                stadiumId: stadiumId || null,
                amount: parseFloat(amount),
                category,
                date: new Date(date),
                description
            }
        });

        return NextResponse.json({ success: true, cost });
    } catch (error) {
        console.error('Cost API Error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
