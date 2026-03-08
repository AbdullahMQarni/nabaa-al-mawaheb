"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import RiyalIcon from '@/components/RiyalIcon';

export default function QueueClient({ initialBookings }: { initialBookings: any[] }) {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState("all");
    const [rejectModal, setRejectModal] = useState<{ isOpen: boolean; bookingId: string; reason: string }>({ isOpen: false, bookingId: '', reason: '' });

    const handleAction = async (id: string, action: 'ACCEPT' | 'REJECT', reason?: string) => {
        try {
            const res = await fetch(`/api/admin/bookings/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action, reason })
            });
            if (res.ok) {
                setRejectModal({ isOpen: false, bookingId: '', reason: '' });
                router.refresh();
            } else {
                const error = await res.json();
                alert(error.error || "Action could not be executed");
            }
        } catch (e) {
            alert("Connection error");
        }
    };

    const pendingBookings = initialBookings.filter(b => b.status === "PENDING");
    const urgentBookings = pendingBookings.filter(b => {
        const bookingDate = new Date(b.date);
        const today = new Date();
        return bookingDate.getDate() === today.getDate() && bookingDate.getMonth() === today.getMonth();
    });

    const displayBookings = activeTab === "all" ? initialBookings :
        activeTab === "urgent" ? urgentBookings :
            pendingBookings; // upcoming or pending

    return (
        <div>
            {/* Tabs */}
            <div className="queue-tabs">
                <button
                    onClick={() => setActiveTab("all")}
                    className={`queue-tab ${activeTab === "all" ? "active" : ""}`}
                >
                    All Requests ({initialBookings.length})
                </button>
                <button
                    onClick={() => setActiveTab("urgent")}
                    className={`queue-tab ${activeTab === "urgent" ? "active" : ""}`}
                >
                    Urgent <span style={{ backgroundColor: '#ef4444', color: 'white', padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem' }}>{urgentBookings.length}</span>
                </button>
                <button
                    onClick={() => setActiveTab("upcoming")}
                    className={`queue-tab ${activeTab === "upcoming" ? "active" : ""}`}
                >
                    Upcoming
                </button>
            </div>

            {/* List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {displayBookings.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>No requests match this filter.</div>
                ) : (
                    displayBookings.map(b => {
                        const isUrgent = activeTab === "urgent" || (activeTab === "all" && b.status === "PENDING" && new Date(b.date).getDate() === new Date().getDate());

                        return (
                            <div key={b.id} className={`queue-card ${isUrgent ? 'urgent' : ''}`}>
                                {/* Avatar column */}
                                <div className={`queue-card-avatar ${isUrgent ? 'urgent' : ''}`}>
                                    <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: '#cbd5e1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', color: 'white', fontWeight: 'bold' }}>
                                        {b.user?.phoneNumber ? b.user.phoneNumber.slice(-2) : '?'}
                                    </div>
                                </div>

                                {/* Content column */}
                                <div className="queue-card-content">
                                    <div>
                                        {isUrgent ? (
                                            <div style={{ display: 'inline-block', backgroundColor: '#fef2f2', color: '#ef4444', padding: '4px 12px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.05em', marginBottom: '12px', marginRight: '12px' }}>
                                                ! URGENT RESPONSE
                                            </div>
                                        ) : (
                                            <div style={{ display: 'inline-block', backgroundColor: '#eff6ff', color: '#1a247f', padding: '4px 12px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.05em', marginBottom: '12px', marginRight: '12px' }}>
                                                NEW REQUEST
                                            </div>
                                        )}
                                        <span style={{ fontSize: '0.875rem', color: '#94a3b8', fontWeight: 500 }}>• Received recently</span>

                                        <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            {b.user?.phoneNumber || 'Unregistered Client'}
                                        </h3>
                                        <div style={{ color: '#64748b', fontSize: '0.9rem', fontWeight: 500, marginBottom: '16px' }}>
                                            {b.stadium?.name} - {b.sportType}
                                        </div>

                                        <div className="queue-card-meta">
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <span>📅</span> {new Date(b.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <span>⏰</span> {b.startTime} ({b.duration}m)
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <span>📍</span> {b.stadium?.name}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Right Column */}
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '16px' }}>
                                        <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#1a247f', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            {b.totalPrice.toFixed(2)} <RiyalIcon width={24} height={24} />
                                        </div>

                                        {b.status === 'PENDING' ? (
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '120px' }}>
                                                <button onClick={() => handleAction(b.id, 'ACCEPT')} style={{ backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '24px', padding: '10px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                                    ✓ Accept
                                                </button>
                                                <button onClick={() => setRejectModal({ isOpen: true, bookingId: b.id, reason: '' })} style={{ backgroundColor: 'white', color: '#ef4444', border: '1px solid #fca5a5', borderRadius: '24px', padding: '10px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                                    ✕ Reject
                                                </button>
                                            </div>
                                        ) : (
                                            <div style={{ padding: '8px 24px', borderRadius: '24px', backgroundColor: '#f1f5f9', fontWeight: 600, fontSize: '0.875rem', color: b.status === "ACCEPTED" ? "#10b981" : "#ef4444" }}>
                                                {b.status}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {displayBookings.length > 0 && (
                <div style={{ textAlign: 'center', marginTop: '24px' }}>
                    <button style={{ background: 'transparent', border: 'none', color: '#64748b', fontWeight: 600, cursor: 'pointer' }}>Show 10 more requests ⌄</button>
                </div>
            )}

            {/* Reject Modal */}
            {rejectModal.isOpen && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div style={{ backgroundColor: 'white', padding: '32px', borderRadius: '24px', width: '400px', maxWidth: '90%' }}>
                        <h3 style={{ marginBottom: '8px', fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>Reject Request</h3>
                        <p style={{ color: '#64748b', marginBottom: '24px', fontSize: '0.9rem' }}>Please provide a reason to the client for rejecting this booking.</p>
                        <textarea
                            style={{ width: '100%', minHeight: '120px', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '24px', fontFamily: 'inherit', resize: 'vertical' }}
                            value={rejectModal.reason}
                            onChange={e => setRejectModal({ ...rejectModal, reason: e.target.value })}
                            placeholder="E.g., The stadium is already booked for a private event..."
                        />
                        <div style={{ display: 'flex', gap: '12px' }}>
                            <button style={{ flex: 1, padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0', backgroundColor: 'white', fontWeight: 600, cursor: 'pointer' }} onClick={() => setRejectModal({ isOpen: false, bookingId: '', reason: '' })}>Cancel</button>
                            <button style={{ flex: 1, padding: '12px', borderRadius: '12px', border: 'none', backgroundColor: '#ef4444', color: 'white', fontWeight: 600, cursor: rejectModal.reason ? 'pointer' : 'not-allowed', opacity: rejectModal.reason ? 1 : 0.5 }} onClick={() => handleAction(rejectModal.bookingId, 'REJECT', rejectModal.reason)} disabled={!rejectModal.reason}>Confirm Reject</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
