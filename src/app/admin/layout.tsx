import { Suspense } from "react";
import Link from "next/link";
import "./admin.css";
import AdminSearch from "@/components/AdminSearch";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="admin-layout" dir="ltr"> {/* Forcing LTR for admin based on mockup screenshot */}
            {/* ... sidebar ... */}
            <aside className="admin-sidebar">
                {/* ... brand ... */}
                <div className="admin-brand">
                    <div className="brand-icon">
                        <span style={{ color: 'white', fontWeight: 'bold' }}>🛡️</span>
                    </div>
                    <div>
                        <div style={{ fontWeight: 800, color: '#1a247f', lineHeight: 1.2 }}>Nabaa</div>
                        <div style={{ fontSize: '0.65rem', fontWeight: 600, color: '#64748b', letterSpacing: '0.05em' }}>COMMAND CENTER</div>
                    </div>
                </div>

                <nav className="admin-nav">
                    <Link href="/admin" className="admin-nav-link active">
                        <span>⊞</span> Dashboard
                    </Link>
                    <Link href="/admin/queue" className="admin-nav-link">
                        <span>📅</span> Bookings
                    </Link>
                    <Link href="#" className="admin-nav-link">
                        <span>📊</span> Analytics
                    </Link>
                    <Link href="/admin/costs" className="admin-nav-link">
                        <span>💰</span> Costs
                    </Link>
                    <Link href="/admin/stadiums" className="admin-nav-link" style={{ marginTop: '32px' }}>
                        <span>🏟️</span> Stadiums
                    </Link>
                </nav>

                <div className="admin-support-card">
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#eef2ff', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
                        🎧
                    </div>
                    <div style={{ fontWeight: 700, fontSize: '0.875rem', marginBottom: '8px', color: '#0f172a' }}>SUPPORT</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '16px' }}>Need assistance with your portal?</div>
                    <button style={{ width: '100%', padding: '8px', backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer' }}>Contact Us</button>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="admin-main-wrapper">
                {/* Topbar */}
                <header className="admin-topbar">
                    <Suspense fallback={<div className="search-bar">Loading search...</div>}>
                        <AdminSearch />
                    </Suspense>
                    <div className="topbar-actions">
                        <button className="icon-btn">🔔</button>
                        <button className="icon-btn">⚙️</button>
                        <div className="user-profile">
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ fontWeight: 700, fontSize: '0.875rem', color: '#0f172a' }}>Admin User</div>
                                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Super Admin</div>
                            </div>
                            <div className="avatar">A</div>
                        </div>
                    </div>
                </header>

                <main className="admin-main">
                    {children}
                </main>

                {/* Mobile Bottom Navigation */}
                <nav className="admin-mobile-nav">
                    <Link href="/admin" className="mobile-nav-link active">
                        <span>⊞</span>
                        <span>Dash</span>
                    </Link>
                    <Link href="/admin/queue" className="mobile-nav-link">
                        <span>📅</span>
                        <span>Bookings</span>
                    </Link>
                    <Link href="/admin/costs" className="mobile-nav-link">
                        <span>💰</span>
                        <span>Costs</span>
                    </Link>
                    <Link href="/admin/stadiums" className="mobile-nav-link">
                        <span>🏟️</span>
                        <span>Stadiums</span>
                    </Link>
                </nav>
            </div>
        </div>
    );
}
