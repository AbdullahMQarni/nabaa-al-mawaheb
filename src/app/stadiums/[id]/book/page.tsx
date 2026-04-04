import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Wizard from './Wizard';

export default async function BookStadium({
    params
}: {
    params: Promise<{ id: string }>
}) {
    const id = (await params).id;

    // Try to find the stadium in the DB
    let stadium = await prisma.stadium.findUnique({
        where: { id: id }
    });

    // Fallback to mock data if it's the mock ID from home page (for MVP demo purposes)
    if (!stadium && id.startsWith('mock-')) {
        stadium = {
            id,
            name: id === 'mock-1' ? 'ملعب النبع الأولمبي' : 'الصالة الداخلية',
            description: '...',
            locationUrl: '',
            imageUrl: '',
            pricePerHour: id === 'mock-1' ? 150 : 200,
            capacity: id === 'mock-1' ? 10 : 12,
            category: 'FOOTBALL',
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date()
        };
    } else if (!stadium) {
        notFound();
    }

    if (!stadium.isActive) {
        notFound();
    }

    return (
        <div style={{ backgroundColor: '#f6f6f8', minHeight: '100vh', direction: 'ltr' }}>
            <Wizard stadium={stadium} />
        </div>
    );
}
