import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { NextResponse } from 'next/server';
import RiyalIcon from '@/components/RiyalIcon';

export default async function AdminDashboard() {
    const today = new Date();
    const startOfToday = new Date(today.setHours(0, 0, 0, 0));
    const endOfToday = new Date(today.setHours(23, 59, 59, 999));

    // Count metrics
    const totalBookingsToday = await prisma.booking.count({
        where: { createdAt: { gte: startOfToday, lte: endOfToday } }
    });

    const totalBookings = await prisma.booking.count();
    const pendingBookings = await prisma.booking.count({ where: { status: 'PENDING' } });
    const acceptedBookings = await prisma.booking.count({ where: { status: 'ACCEPTED' } });
    const rejectedBookings = await prisma.booking.count({ where: { status: 'REJECTED' } });

    // Financial data
    const acceptedBookingsData = await prisma.booking.findMany({
        where: { status: 'ACCEPTED' },
        select: { totalPrice: true }
    });
    const totalRevenue = acceptedBookingsData.reduce((sum, booking) => sum + booking.totalPrice, 0);

    const costsData = await prisma.cost.findMany({ select: { amount: true } });
    const operatingCosts = costsData.reduce((sum, cost) => sum + cost.amount, 0);

    const netProfit = totalRevenue - operatingCosts;
    const profitMargin = totalRevenue > 0 ? ((netProfit / totalRevenue) * 100).toFixed(1) : 0;
    const costPercentage = totalRevenue > 0 ? ((operatingCosts / totalRevenue) * 100).toFixed(1) : 0;

    // Formatting tools
    const formatCurrency = (amount: number) => new Intl.NumberFormat('en-US').format(amount);

    // Recent Activity
    const recentActivity = await prisma.booking.findMany({
        orderBy: { createdAt: 'desc' },
        take: 4,
        include: { user: true, stadium: true }
    });

    const formatTimeAgo = (date: Date) => {
        const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
        let interval = seconds / 31536000;
        if (interval > 1) return Math.floor(interval) + " years ago";
        interval = seconds / 2592000;
        if (interval > 1) return Math.floor(interval) + " months ago";
        interval = seconds / 86400;
        if (interval > 1) return Math.floor(interval) + " days ago";
        interval = seconds / 3600;
        if (interval > 1) return Math.floor(interval) + " hours ago";
        interval = seconds / 60;
        if (interval > 1) return Math.floor(interval) + " minutes ago";
        return Math.floor(seconds) + " seconds ago";
    };

    // Booking Trends (Last 7 Days)
    const last7Days = Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        d.setHours(0, 0, 0, 0);
        return d;
    });

    // Sort array so oldest is first, up to today
    last7Days.sort((a, b) => a.getTime() - b.getTime());

    const weeklyBookings = await prisma.booking.findMany({
        where: { createdAt: { gte: last7Days[0] } },
        select: { createdAt: true }
    });

    const bookingsPerDay = last7Days.map(day => {
        const nextDay = new Date(day);
        nextDay.setDate(day.getDate() + 1);
        return weeklyBookings.filter(b => b.createdAt >= day && b.createdAt < nextDay).length;
    });

    const maxBookingsDay = Math.max(...bookingsPerDay, 1);
    const trendHeights = bookingsPerDay.map(count => Math.round((count / maxBookingsDay) * 100) + '%');

    // Rates based on total bookings
    const acceptedRate = totalBookings > 0 ? Math.round((acceptedBookings / totalBookings) * 100) : 0;
    const rejectedRate = totalBookings > 0 ? Math.round((rejectedBookings / totalBookings) * 100) : 0;

    return (
        <div>
            <div className="animate-fade-in" style={{ marginBottom: '40px' }}>
                <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>Dashboard Overview</h1>
                <p style={{ color: '#64748b', fontSize: '1.125rem' }}>Real-time summary of Nabaa Al-Mawaheb operations and performance.</p>
            </div>

            {/* Top Stat Cards */}
            <div className="stats-grid">
                <div className="stat-card animate-slide-up stagger-1" style={{ borderLeft: '4px solid #f1f5f9', borderTop: 'none', padding: '32px 24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
                        <div style={{ width: '48px', height: '48px', backgroundColor: '#eef2ff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', color: '#1a247f' }}>
                            🎫
                        </div>
                    </div>
                    <div style={{ color: '#64748b', fontWeight: 600, fontSize: '0.875rem', marginBottom: '8px' }}>Total Bookings</div>
                    <div style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a' }}>{formatCurrency(totalBookings)}</div>
                </div>

                <div className="stat-card animate-slide-up stagger-2" style={{ borderLeft: 'none', padding: '32px 24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
                        <div style={{ width: '48px', height: '48px', backgroundColor: '#fff7ed', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', color: '#fb923c' }}>
                            ⏳
                        </div>
                        <span style={{ backgroundColor: '#fff7ed', color: '#c2410c', padding: '4px 12px', borderRadius: '24px', fontSize: '0.875rem', fontWeight: 600 }}>Requires Attention</span>
                    </div>
                    <div style={{ color: '#64748b', fontWeight: 600, fontSize: '0.875rem', marginBottom: '8px' }}>Pending Reply</div>
                    <div style={{ fontSize: '2rem', fontWeight: 800, color: '#c2410c' }}>{formatCurrency(pendingBookings)}</div>
                </div>

                <div className="stat-card animate-slide-up stagger-3" style={{ borderLeft: 'none', padding: '32px 24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
                        <div style={{ width: '48px', height: '48px', backgroundColor: '#ecfdf5', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', color: '#10b981' }}>
                            ✓
                        </div>
                        <span style={{ backgroundColor: '#ecfdf5', color: '#059669', padding: '4px 12px', borderRadius: '24px', fontSize: '0.875rem', fontWeight: 600 }}>{acceptedRate}% Rate</span>
                    </div>
                    <div style={{ color: '#64748b', fontWeight: 600, fontSize: '0.875rem', marginBottom: '8px' }}>Accepted</div>
                    <div style={{ fontSize: '2rem', fontWeight: 800, color: '#059669' }}>{formatCurrency(acceptedBookings)}</div>
                </div>

                <div className="stat-card animate-slide-up stagger-4" style={{ borderLeft: 'none', padding: '32px 24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
                        <div style={{ width: '48px', height: '48px', backgroundColor: '#fef2f2', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', color: '#ef4444' }}>
                            ✕
                        </div>
                        <span style={{ backgroundColor: '#fef2f2', color: '#dc2626', padding: '4px 12px', borderRadius: '24px', fontSize: '0.875rem', fontWeight: 600 }}>{rejectedRate}% Rate</span>
                    </div>
                    <div style={{ color: '#64748b', fontWeight: 600, fontSize: '0.875rem', marginBottom: '8px' }}>Rejected</div>
                    <div style={{ fontSize: '2rem', fontWeight: 800, color: '#dc2626' }}>{formatCurrency(rejectedBookings)}</div>
                </div>
            </div>

            {/* Financial Sections */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <div className="dashboard-section-title" style={{ marginBottom: 0 }}>
                    <span style={{ color: '#1a247f' }}>💳</span> Financial Metrics
                </div>
                <button style={{ background: 'transparent', border: 'none', color: '#1a247f', fontWeight: 700, cursor: 'pointer' }}>Download Report</button>
            </div>

            {/* Financial Cards */}
            <div className="admin-finance-grid">
                {/* Total Revenue */}
                <div className="stat-card" style={{ backgroundColor: '#1a247f', color: 'white', border: 'none' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                        <div style={{ width: '40px', height: '40px', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>📈</div>
                        <span style={{ fontWeight: 600, fontSize: '0.875rem', letterSpacing: '0.05em' }}>TOTAL REVENUE</span>
                    </div>
                    <div style={{ fontSize: '3rem', fontWeight: 800, marginBottom: '24px', display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                        {formatCurrency(totalRevenue)} <span style={{ fontSize: '0.6em' }}><RiyalIcon width={40} height={40} /></span>
                    </div>
                    <div style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.8)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        ↑ Confirmed bookings.
                    </div>
                </div>

                {/* Operating Costs */}
                <div className="stat-card">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                        <div style={{ width: '40px', height: '40px', backgroundColor: '#f1f5f9', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem' }}>🧾</div>
                        <span style={{ fontWeight: 600, fontSize: '0.875rem', color: '#64748b', letterSpacing: '0.05em' }}>OPERATING COSTS</span>
                    </div>
                    <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#0f172a', marginBottom: '24px', display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                        {formatCurrency(operatingCosts)} <span style={{ fontSize: '0.6em', color: '#64748b' }}><RiyalIcon width={32} height={32} /></span>
                    </div>
                    <div style={{ width: '100%', height: '6px', backgroundColor: '#e2e8f0', borderRadius: '3px', marginBottom: '12px' }}>
                        <div style={{ width: `${Math.min(Number(costPercentage), 100)}% `, height: '100%', backgroundColor: '#1a247f', borderRadius: '3px' }}></div>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{costPercentage}% of total revenue allocated to costs</div>
                </div>

                {/* Net Profit */}
                <div className="stat-card">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                        <div style={{ width: '40px', height: '40px', backgroundColor: '#ecfdf5', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem' }}>💵</div>
                        <span style={{ fontWeight: 600, fontSize: '0.875rem', color: '#64748b', letterSpacing: '0.05em' }}>NET PROFIT</span>
                    </div>
                    <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#059669', marginBottom: '24px', display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                        {formatCurrency(netProfit)} <span style={{ fontSize: '0.6em' }}><RiyalIcon width={32} height={32} /></span>
                    </div>
                    <div style={{ fontSize: '0.875rem', color: '#059669', fontWeight: 600 }}>
                        {netProfit > 0 ? `✓ Healthy ${profitMargin}% Margin` : '⚠ No Profit Yet'}
                    </div>
                </div>
            </div>

            {/* Bottom Row - Charts & Recent Activity */}
            <div className="admin-charts-grid">
                <div className="stat-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>Booking Trends (Last 7 Days)</h3>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <button style={{ padding: '6px 16px', borderRadius: '20px', border: 'none', backgroundColor: '#1a247f', color: 'white', fontWeight: 600, fontSize: '0.875rem' }}>Weekly</button>
                        </div>
                    </div>
                    {/* Chart bars */}
                    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: '300px', paddingBottom: '20px', gap: '16px' }}>
                        {trendHeights.map((h, i) => (
                            <div key={i} style={{ flex: 1, backgroundColor: i === trendHeights.length - 1 ? '#1a247f' : '#cbd5e1', height: h === '0%' ? '5%' : h, borderRadius: '8px 8px 0 0', position: 'relative', transition: 'height 0.3s ease' }}>
                                <div style={{ position: 'absolute', bottom: '-24px', left: 0, right: 0, textAlign: 'center', fontSize: '0.75rem', color: '#64748b' }}>
                                    {last7Days[i].toLocaleDateString('en-US', { weekday: 'short' })}
                                </div>
                                <div style={{ position: 'absolute', top: '-20px', left: 0, right: 0, textAlign: 'center', fontSize: '0.75rem', fontWeight: 600, color: i === trendHeights.length - 1 ? '#1a247f' : '#64748b' }}>
                                    {bookingsPerDay[i] > 0 ? bookingsPerDay[i] : ''}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="stat-card" style={{ padding: '32px 24px' }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginBottom: '32px' }}>Recent Activity</h3>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                        {recentActivity.length > 0 ? recentActivity.map((activity) => (
                            <div key={activity.id} style={{ display: 'flex', gap: '16px' }}>
                                <div style={{
                                    width: '36px', height: '36px', borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    ...(activity.status === 'ACCEPTED' ? { backgroundColor: '#ecfdf5', color: '#059669' } : {}),
                                    ...(activity.status === 'PENDING' ? { backgroundColor: '#fff7ed', color: '#ea580c' } : {}),
                                    ...(activity.status === 'REJECTED' ? { backgroundColor: '#fef2f2', color: '#ef4444' } : {})
                                }}>
                                    {activity.status === 'ACCEPTED' ? '✓' : activity.status === 'PENDING' ? '⏳' : '✕'}
                                </div>
                                <div>
                                    <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: '4px' }}>
                                        Booking {activity.status.toLowerCase()}
                                    </div>
                                    <div style={{ fontSize: '0.875rem', color: '#64748b' }}>
                                        {formatTimeAgo(activity.createdAt)} by {activity.user?.name || activity.user?.phoneNumber || 'User'}
                                    </div>
                                </div>
                            </div>
                        )) : (
                            <div style={{ color: '#64748b', fontSize: '0.875rem' }}>No recent activity.</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
