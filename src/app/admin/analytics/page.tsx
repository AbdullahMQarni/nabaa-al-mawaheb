export const dynamic = 'force-dynamic';

import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import RiyalIcon from '@/components/RiyalIcon';

export default async function AdminAnalytics() {
    const allBookings = await prisma.booking.findMany({
        where: { status: 'ACCEPTED' },
        include: { stadium: true, user: true }
    });

    const allCosts = await prisma.cost.findMany();

    const totalRevenue = allBookings.reduce((sum, b) => sum + b.totalPrice, 0);
    const totalCosts = allCosts.reduce((sum, c) => sum + c.amount, 0);
    const netProfit = totalRevenue - totalCosts;

    // Payment Status Distribution (For all bookings, not just accepted)
    const fullBookingsForStatus = await prisma.booking.findMany({ select: { paymentStatus: true } });
    const paidCount = fullBookingsForStatus.filter(b => b.paymentStatus === 'PAID').length;
    const pendingCount = fullBookingsForStatus.filter(b => b.paymentStatus === 'PENDING').length;
    const totalPayments = paidCount + pendingCount || 1; // Prevent div/0

    // Top Stadiums by Revenue
    const stadiumRevenue: any = {};
    allBookings.forEach(b => {
        if (!stadiumRevenue[b.stadiumId]) {
            stadiumRevenue[b.stadiumId] = { name: b.stadium?.name, revenue: 0 };
        }
        stadiumRevenue[b.stadiumId].revenue += b.totalPrice;
    });
    const topStadiums = Object.values(stadiumRevenue).sort((a: any, b: any) => b.revenue - a.revenue).slice(0, 5);

    // Top 5 Customers
    const customerRevenue: any = {};
    allBookings.forEach(b => {
        if (!customerRevenue[b.userId]) {
            customerRevenue[b.userId] = { name: b.user?.name || b.user?.phoneNumber, total: 0, count: 0 };
        }
        customerRevenue[b.userId].total += b.totalPrice;
        customerRevenue[b.userId].count += 1;
    });
    const topCustomers = Object.values(customerRevenue).sort((a: any, b: any) => b.total - a.total).slice(0, 5);

    return (
        <div>
            <h1 style={{ color: 'var(--primary)', marginBottom: '8px', fontSize: '2rem' }}>المالية والتحليلات</h1>
            <p style={{ color: 'var(--text-muted)', marginBottom: '32px' }}>نظرة شاملة على الإيرادات والمصروفات</p>

            {/* Main Financial Metrics */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px', marginBottom: '40px' }}>
                <div className="admin-card" style={{ borderTop: '4px solid var(--success)' }}>
                    <div style={{ color: 'var(--text-muted)', marginBottom: '8px' }}>إجمالي الإيرادات</div>
                    <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {totalRevenue} <RiyalIcon width={24} height={24} />
                    </div>
                </div>
                <div className="admin-card">
                    <div style={{ color: 'var(--text-muted)', marginBottom: '8px' }}>إجمالي التكاليف</div>
                    <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {totalCosts} <RiyalIcon width={24} height={24} />
                    </div>
                </div>
                <div className="admin-card">
                    <div style={{ color: 'var(--text-muted)', marginBottom: '8px' }}>صافي الأرباح</div>
                    <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {netProfit} <RiyalIcon width={24} height={24} />
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '24px' }}>
                {/* Payment Status Bar */}
                <div className="admin-card">
                    <h3 style={{ color: 'var(--primary)', marginBottom: '16px' }}>حالات الدفع</h3>
                    <div style={{ width: '100%', height: '24px', backgroundColor: '#eee', borderRadius: '12px', overflow: 'hidden', display: 'flex' }}>
                        <div style={{ width: `${(paidCount / totalPayments) * 100}%`, backgroundColor: 'var(--success)', height: '100%' }}></div>
                        <div style={{ width: `${(pendingCount / totalPayments) * 100}%`, backgroundColor: 'var(--accent)', height: '100%' }}></div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px', fontSize: '0.875rem' }}>
                        <span style={{ color: 'var(--success)', fontWeight: 'bold' }}>مدفوع ({paidCount})</span>
                        <span style={{ color: 'var(--accent)', fontWeight: 'bold' }}>معلق ({pendingCount})</span>
                    </div>
                </div>

                {/* Top Stadiums */}
                <div className="admin-card">
                    <h3 style={{ color: 'var(--primary)', marginBottom: '16px' }}>أعلى الملاعب تحقيقاً للإيرادات</h3>
                    {topStadiums.length === 0 ? <p style={{ color: 'var(--text-muted)' }}>لا توجد بيانات</p> : (
                        <ul style={{ listStyle: 'none', padding: 0 }}>
                            {(topStadiums as any[]).map((st, i) => (
                                <li key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #eee' }}>
                                    <span>{i + 1}. {st.name}</span>
                                    <strong style={{ color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        {st.revenue} <RiyalIcon width={16} height={16} />
                                    </strong>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                {/* Top Customers */}
                <div className="admin-card">
                    <h3 style={{ color: 'var(--primary)', marginBottom: '16px' }}>أفضل 5 عملاء</h3>
                    {topCustomers.length === 0 ? <p style={{ color: 'var(--text-muted)' }}>لا توجد بيانات</p> : (
                        <ul style={{ listStyle: 'none', padding: 0 }}>
                            {(topCustomers as any[]).map((c, i) => (
                                <li key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #eee' }}>
                                    <span>{i + 1}. {c.name} ({c.count} حجوزات)</span>
                                    <strong style={{ color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        {c.total} <RiyalIcon width={16} height={16} />
                                    </strong>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
}
