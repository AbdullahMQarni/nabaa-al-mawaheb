import { prisma } from '@/lib/prisma';
import CostFormClient from './CostFormClient';
import RiyalIcon from '@/components/RiyalIcon';

export default async function CostsPage() {
    const stadiums = await prisma.stadium.findMany({ select: { id: true, name: true } });

    const recentCosts = await prisma.cost.findMany({
        include: { stadium: true },
        orderBy: { date: 'desc' },
        take: 10
    });

    return (
        <div>
            <div className="admin-page-header">
                <div>
                    <h1 style={{ color: 'var(--primary)', marginBottom: '8px', fontSize: '2rem' }}>إدارة التكاليف</h1>
                    <p style={{ color: 'var(--text-muted)' }}>تسجيل المصروفات التشغيلية للملاعب</p>
                </div>
            </div>

            <div className="costs-grid">
                <div>
                    <CostFormClient stadiums={stadiums} />
                </div>

                <div className="admin-card" style={{ minWidth: '300px' }}>
                    <h3 style={{ color: 'var(--primary)', marginBottom: '16px' }}>أحدث المصروفات</h3>
                    {recentCosts.length === 0 ? <p style={{ color: 'var(--text-muted)' }}>لا توجد مصروفات مسجلة.</p> : (
                        <ul style={{ listStyle: 'none', padding: 0 }}>
                            {recentCosts.map(cost => (
                                <li key={cost.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #eee' }}>
                                    <div>
                                        <strong style={{ display: 'block' }}>{cost.category} - {cost.stadium?.name || 'عام'}</strong>
                                        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{new Date(cost.date).toLocaleDateString('ar-SA')}</span>
                                    </div>
                                    <strong style={{ color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        {cost.amount} <RiyalIcon width={16} height={16} />
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
