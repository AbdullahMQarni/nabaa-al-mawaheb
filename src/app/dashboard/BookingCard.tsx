"use client";

import { useState } from 'react';
import RiyalIcon from '@/components/RiyalIcon';
import { useRouter } from "next/navigation";

export default function BookingCard({ booking }: { booking: any }) {
    const router = useRouter();
    const [isCanceling, setIsCanceling] = useState(false);

    const handleCancel = async () => {
        if (!confirm("هل أنت متأكد من رغبتك في إلغاء هذا الحجز؟")) return;

        setIsCanceling(true);
        try {
            const res = await fetch(`/ api / bookings / ${booking.id} `, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'CANCEL' })
            });
            if (res.ok) {
                router.refresh();
            } else {
                alert("عذراً، لم نتمكن من إلغاء الحجز.");
            }
        } catch (e) {
            alert("خطأ في الاتصال");
        }
        setIsCanceling(false);
    };

    const statusClasses: any = {
        'PENDING': 'status-pending',
        'ACCEPTED': 'status-accepted',
        'REJECTED': 'status-rejected',
        'CANCELLED': 'status-cancelled'
    };

    const statusLabels: any = {
        'PENDING': 'قيد الانتظار',
        'ACCEPTED': 'تم القبول',
        'REJECTED': 'مرفوض',
        'CANCELLED': 'ملغي'
    };

    const statusClass = statusClasses[booking.status] || 'status-pending';
    const statusLabel = statusLabels[booking.status] || 'قيد الانتظار';

    return (
        <div className="card" style={{ padding: '0', overflow: 'hidden', border: '1px solid #f1f5f9' }}>
            <div className="booking-card-header">
                <span className={`status-badge ${statusClass}`}>{statusLabel}</span>
                <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)', fontWeight: '500' }}>
                    {new Date(booking.date).toLocaleDateString('ar-SA', { day: 'numeric', month: 'long', year: 'numeric' })}
                </span>
            </div>

            <div className="booking-card-body">
                <h3 style={{ color: 'var(--primary)', marginBottom: '20px', fontSize: '1.25rem', fontWeight: '800' }}>
                    {booking.stadium?.name || "ملعب نبع المواهب"}
                </h3>

                <div className="booking-info-row">
                    <span className="booking-info-label">الموقت:</span>
                    <span className="booking-info-value">{booking.startTime} ({booking.duration} دقيقة)</span>
                </div>
                <div className="booking-info-row">
                    <span className="booking-info-label">الرياضة:</span>
                    <span className="booking-info-value">{booking.sportType} ({booking.playersCount} فرد)</span>
                </div>
                <div className="booking-info-row" style={{ marginBottom: '24px' }}>
                    <span className="booking-info-label">التكلفة الإجمالية:</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span className="booking-info-value" style={{ color: 'var(--accent)', fontSize: '1.25rem' }}>{booking.totalPrice}</span>
                        <RiyalIcon width={20} height={20} />
                    </div>
                </div>

                {booking.rejectionReason && booking.status === 'REJECTED' && (
                    <div style={{ backgroundColor: '#fff1f2', padding: '16px', borderRadius: '12px', marginBottom: '24px', border: '1px solid #ffe4e6' }}>
                        <div style={{ color: 'var(--danger)', fontWeight: '800', fontSize: '0.85rem', marginBottom: '4px' }}>سبب الرفض:</div>
                        <div style={{ color: '#991b1b', fontSize: '0.9rem' }}>{booking.rejectionReason}</div>
                    </div>
                )}

                {(booking.status === 'PENDING' || booking.status === 'ACCEPTED') && (
                    <div style={{ display: 'flex', gap: '12px', borderTop: '1px solid #f1f5f9', paddingTop: '24px' }}>
                        <button
                            onClick={handleCancel}
                            disabled={isCanceling}
                            style={{ flex: 1, padding: '14px', borderRadius: '12px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', color: 'var(--danger)', fontWeight: '700', cursor: 'pointer', transition: 'all 0.2s' }}
                        >
                            {isCanceling ? 'جاري الإلغاء...' : 'إلغاء الحجز'}
                        </button>
                        <button
                            onClick={() => alert("لإعادة الجدولة الرجاء إلغاء الحجز الحالي وحجز موعد جديد.")}
                            style={{ flex: 1, padding: '14px', borderRadius: '12px', backgroundColor: 'var(--primary)', border: 'none', color: 'white', fontWeight: '700', cursor: 'pointer', transition: 'all 0.2s' }}
                        >
                            إعادة جدولة
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
