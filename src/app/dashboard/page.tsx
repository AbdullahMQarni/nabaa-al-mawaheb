import { PrismaClient } from '@prisma/client';
import { cookies } from 'next/headers';
import Link from 'next/link';
import BookingCard from './BookingCard';

const prisma = new PrismaClient();

export default async function Dashboard() {
    const cookieStore = await cookies();
    const userId = cookieStore.get('session_userId')?.value;

    let bookings: any[] = [];

    if (userId) {
        bookings = await prisma.booking.findMany({
            where: { userId },
            include: { stadium: true },
            orderBy: { createdAt: 'desc' }
        });
    }

    const pendingCount = bookings.filter(b => b.status === 'PENDING').length;
    const acceptedCount = bookings.filter(b => b.status === 'ACCEPTED').length;

    return (
        <div className="mobile-container" style={{ display: 'flex', flexDirection: 'column' }}>
            <header className="login-header" style={{ borderBottomLeftRadius: 0, borderBottomRightRadius: 0 }}>
                <h1 style={{ fontWeight: 800, fontSize: '1.5rem' }}>حجوزاتي</h1>
                <Link href="/home" style={{ color: 'var(--accent)', fontWeight: '800' }}>
                    الرئيسية
                </Link>
            </header>

            <div className="login-content" style={{ padding: '32px 20px' }}>

                {/* Simple Stats */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '32px' }}>
                    <div className="card" style={{ padding: '20px', textAlign: 'center', marginBottom: 0, border: '1px solid #eef2ff' }}>
                        <div style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--accent)', marginBottom: '4px' }}>{pendingCount}</div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: '600' }}>قيد الانتظار</div>
                    </div>
                    <div className="card" style={{ padding: '20px', textAlign: 'center', marginBottom: 0, border: '1px solid #eef2ff' }}>
                        <div style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--success)', marginBottom: '4px' }}>{acceptedCount}</div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: '600' }}>مؤكدة</div>
                    </div>
                </div>

                {bookings.length === 0 ? (
                    <div style={{ textAlign: 'center', marginTop: '64px', padding: '40px 20px' }}>
                        <div style={{ fontSize: '4rem', marginBottom: '24px' }}>⚽</div>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '32px', fontSize: '1.1rem' }}>لا توجد لديك حجوزات حالياً</p>
                        <Link href="/home" className="continue-btn" style={{ textDecoration: 'none' }}>
                            احجز الآن
                        </Link>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        {bookings.map(booking => (
                            <BookingCard key={booking.id} booking={booking} />
                        ))}
                    </div>
                )}

            </div>
        </div>
    );
}
