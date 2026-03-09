import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import QueueClient from './QueueClient';

export default async function AdminQueue({
    searchParams
}: {
    searchParams: Promise<{ search?: string }>
}) {
    const { search } = await searchParams;

    const allBookings = await prisma.booking.findMany({
        include: { stadium: true, user: true },
        orderBy: { createdAt: 'desc' },
    });

    const filteredBookings = allBookings.filter((b: any) => {
        if (!search) return true;
        const s = search.toLowerCase();
        const matchesStadium = b.stadium?.name?.toLowerCase().includes(s);
        const matchesUserName = b.user?.name?.toLowerCase().includes(s);
        const matchesPhone = b.user?.phoneNumber?.toLowerCase().includes(s);
        const matchesSport = b.sportType?.toLowerCase().includes(s);
        const matchesStatus = b.status?.toLowerCase().includes(s);
        return matchesStadium || matchesUserName || matchesPhone || matchesSport || matchesStatus;
    });

    return (
        <div>
            <div className="admin-page-header">
                <div>
                    <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>Booking Management Queue</h1>
                    <p style={{ color: '#64748b', fontSize: '1rem' }}>Handle your incoming appointment requests and client inquiries</p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: '24px', border: '1px solid #e2e8f0', backgroundColor: 'white', color: '#0f172a', fontWeight: 600, cursor: 'pointer' }}>
                        <span>≡</span> Filter
                    </button>
                    <button style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 24px', borderRadius: '24px', border: 'none', backgroundColor: '#1a247f', color: 'white', fontWeight: 600, cursor: 'pointer' }}>
                        <span>+</span> Manual Booking
                    </button>
                </div>
            </div>

            <QueueClient initialBookings={filteredBookings} />
        </div>
    );
}
