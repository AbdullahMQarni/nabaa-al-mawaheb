import { Suspense } from 'react';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import Image from 'next/image';
import RiyalIcon from '@/components/RiyalIcon';
import SearchAndFilter from '@/components/SearchAndFilter';

export default async function Home({
    searchParams
}: {
    searchParams: Promise<{ search?: string; category?: string }>
}) {
    const { search, category } = await searchParams;

    const allStadiums = await prisma.stadium.findMany({
        where: { isActive: true },
        orderBy: { createdAt: 'desc' }
    });

    const displayStadiums = allStadiums.filter((s: any) => {
        if (category && category !== 'ALL' && s.category !== category) return false;
        if (search) {
            const lowerSearch = search.toLowerCase();
            const matchesName = s.name.toLowerCase().includes(lowerSearch);
            const matchesDesc = s.description.toLowerCase().includes(lowerSearch);
            if (!matchesName && !matchesDesc) return false;
        }
        return true;
    }).length > 0 ? allStadiums.filter((s: any) => {
        if (category && category !== 'ALL' && s.category !== category) return false;
        if (search) {
            const lowerSearch = search.toLowerCase();
            const matchesName = s.name.toLowerCase().includes(lowerSearch);
            const matchesDesc = s.description.toLowerCase().includes(lowerSearch);
            if (!matchesName && !matchesDesc) return false;
        }
        return true;
    }) : [
        {
            id: 'mock-1',
            name: 'ملعب نبع المواهب الرئيسي',
            description: 'ملعب كرة قدم احترافي',
            locationUrl: 'https://maps.google.com',
            imageUrl: 'https://images.unsplash.com/photo-1518605368461-1ee7c99fb1f2?auto=format&fit=crop&q=80&w=800',
            pricePerHour: 45,
            capacity: 10,
            rating: 4.9,
            category: 'FOOTBALL',
            locationText: 'الرياض، المملكة العربية السعودية'
        },
        {
            id: 'mock-2',
            name: 'الصالة الداخلية لكرة السلة',
            description: 'صالة كرة سلة مميزة',
            locationUrl: 'https://maps.google.com',
            imageUrl: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&q=80&w=800',
            pricePerHour: 35,
            capacity: 10,
            rating: 4.7,
            category: 'BASKETBALL',
            locationText: 'جدة، المملكة العربية السعودية'
        },
        {
            id: 'mock-3',
            name: 'ملعب التنس الملكي',
            description: 'ملعب تنس خارجي',
            locationUrl: 'https://maps.google.com',
            imageUrl: 'https://images.unsplash.com/photo-1622279457486-640c4cb68f51?auto=format&fit=crop&q=80&w=800',
            pricePerHour: 25,
            capacity: 4,
            rating: 4.8,
            category: 'TENNIS',
            locationText: 'الدمام، المملكة العربية السعودية'
        }
    ].filter(s => {
        if (category && category !== 'ALL' && s.category !== category) return false;
        if (search && !s.name.includes(search) && !s.description.includes(search)) return false;
        return true;
    });

    return (
        <div className="mobile-container" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', direction: 'rtl' }}>
            {/* Header Area */}
            <header className="login-header animate-slide-down" style={{ borderBottomLeftRadius: 0, borderBottomRightRadius: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <button style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                        <span style={{ fontSize: '1.5rem' }}>≡</span>
                    </button>
                    <span style={{ fontWeight: 800, fontSize: '1.25rem' }}>نبع المواهب</span>
                </div>
                <div style={{ position: 'relative' }}>
                    <span style={{ fontSize: '1.25rem' }}>🔔</span>
                    <span style={{ position: 'absolute', top: 0, right: 0, width: '8px', height: '8px', backgroundColor: 'var(--accent)', borderRadius: '50%' }}></span>
                </div>
            </header>

            {/* Sub-header / Search & Categories Component */}
            <Suspense fallback={<div style={{ padding: '24px', textAlign: 'center' }}>Loading filters...</div>}>
                <SearchAndFilter />
            </Suspense>

            {/* Main Content */}
            <main style={{ flex: 1, padding: '24px', paddingBottom: '100px' }}>
                <div className="animate-slide-up" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-dark)' }}>
                        {search || (category && category !== 'ALL') ? 'نتائج البحث' : 'الملاعب المتاحة'}
                    </h2>
                    <Link href="/home" style={{ color: 'var(--primary)', fontWeight: 700, fontSize: '0.875rem', textDecoration: 'none' }}>
                        عرض الكل
                    </Link>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    {displayStadiums.length > 0 ? displayStadiums.map((stadium: any, index: number) => (
                        <div key={stadium.id} className={`stadium-card animate-slide-up stagger-${Math.min(index + 1, 6)}`}>
                            {/* Image Header */}
                            <div className="stadium-card-img" style={{ backgroundImage: `url(${stadium.imageUrl})` }}>
                                <div style={{ position: 'absolute', top: '16px', left: '16px', backgroundColor: 'white', padding: '6px 12px', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '4px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                                    <span style={{ color: 'var(--primary)', fontSize: '0.875rem' }}>★</span>
                                    <span style={{ fontWeight: 800, fontSize: '0.875rem', color: 'var(--primary)' }}>{stadium.rating || '4.9'}</span>
                                </div>
                            </div>

                            {/* Card Body */}
                            <div className="stadium-card-body">
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                                    <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--text-dark)' }}>{stadium.name}</h3>
                                    <div style={{ backgroundColor: '#f1f5f9', width: '36px', height: '36px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
                                        <span style={{ color: 'var(--primary)', fontSize: '1.25rem' }}>🗺️</span>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                                    <span style={{ color: 'var(--primary)', fontSize: '0.875rem' }}>📍</span>
                                    <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem', fontWeight: 500 }}>{stadium.locationText || 'الرياض، المملكة العربية السعودية'}</span>
                                </div>

                                <div className="stadium-card-footer">
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <RiyalIcon width={20} height={20} />
                                        <span style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--primary)' }}>{stadium.pricePerHour}</span>
                                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>/ساعة</span>
                                    </div>
                                    <Link href={`/stadiums/${stadium.id}/book`} style={{ backgroundColor: 'var(--primary)', color: 'white', padding: '12px 24px', borderRadius: '12px', fontWeight: 700, textDecoration: 'none', transition: 'filter 0.2s' }}>
                                        احجز الآن
                                    </Link>
                                </div>
                            </div>
                        </div>
                    )) : (
                        <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
                            <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🏟️</div>
                            <p>عذراً، لم نجد نتائج تطابق بحثك</p>
                        </div>
                    )}
                </div>
            </main>

            {/* Bottom Nav */}
            <nav className="client-bottom-nav">
                <Link href="/home" className="client-nav-item active">
                    <span className="nav-icon">🏠</span>
                    <span className="nav-label">الرئيسية</span>
                </Link>
                <Link href="/dashboard" className="client-nav-item">
                    <span className="nav-icon">📅</span>
                    <span className="nav-label">حجوزاتي</span>
                </Link>
                <Link href="#" className="client-nav-item">
                    <span className="nav-icon">👤</span>
                    <span className="nav-label">حسابي</span>
                </Link>
            </nav>
        </div>
    );
}
