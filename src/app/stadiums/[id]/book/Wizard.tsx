"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import RiyalIcon from '@/components/RiyalIcon';

// Muted generic color palette matches new globals.css variables roughly
export default function Wizard({ stadium }: { stadium: any }) {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [sport, setSport] = useState("");
    const [playersCounter, setPlayersCounter] = useState(stadium.capacity || 10);
    const [date, setDate] = useState(() => {
        const d = new Date();
        d.setHours(0, 0, 0, 0);
        return d;
    });
    const [time, setTime] = useState("");
    const [duration, setDuration] = useState(60);

    const [bookedSlots, setBookedSlots] = useState<{ startTime: string; duration: number }[]>([]);
    const [loadingSlots, setLoadingSlots] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [showMidnightDialog, setShowMidnightDialog] = useState(false);
    const [pendingDuration, setPendingDuration] = useState<number | null>(null);

    const allSlots = ['16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00', '23:00', '00:00'];
    const sportTypes = [
        { id: 'football', name: 'كرة قدم', icon: '⚽' },
        { id: 'basketball', name: 'كرة سلة', icon: '🏀' },
        { id: 'volleyball', name: 'كرة طائرة', icon: '🏐' },
        { id: 'padel', name: 'بادل', icon: '🎾' }
    ];

    useEffect(() => {
        if (step === 2) {
            fetchBookedSlots();
        }
    }, [date, step]);

    const fetchBookedSlots = async () => {
        setLoadingSlots(true);
        try {
            const res = await fetch(`/api/stadiums/${stadium.id}/slots?date=${date.toISOString()}`);
            if (res.ok) {
                const data = await res.json();
                setBookedSlots(data.bookings || []);
            }
        } catch (e) {
            console.error(e);
        }
        setLoadingSlots(false);
    };

    // Convert time string "HH:MM" to minutes from start of day
    const timeToMinutes = (time: string): number => {
        const [hours, minutes] = time.split(':').map(Number);
        // Handle midnight (00:00) as 1440 minutes (next day)
        if (hours === 0 && minutes === 0) return 1440;
        return hours * 60 + minutes;
    };

    // Check if a slot overlaps with any existing booking's time range
    const isSlotBlocked = (slot: string): boolean => {
        const slotMinutes = timeToMinutes(slot);
        return bookedSlots.some(b => {
            const startMinutes = timeToMinutes(b.startTime);
            const endMinutes = startMinutes + b.duration;
            // Slot is blocked if it falls within [startMinutes, endMinutes)
            return slotMinutes >= startMinutes && slotMinutes < endMinutes;
        });
    };

    // Check if the user's selected time + duration would overlap with existing bookings
    const wouldOverlap = (startTime: string, duration: number): { overlaps: boolean; blockedSlots: string[] } => {
        if (!startTime) return { overlaps: false, blockedSlots: [] };
        
        const newStart = timeToMinutes(startTime);
        const newEnd = newStart + duration;
        const blockedSlots: string[] = [];

        for (const booking of bookedSlots) {
            const existStart = timeToMinutes(booking.startTime);
            const existEnd = existStart + booking.duration;
            
            // Check if new booking overlaps with existing booking
            if (newStart < existEnd && newEnd > existStart) {
                // Add the existing booking's start time to blocked slots list
                if (!blockedSlots.includes(booking.startTime)) {
                    blockedSlots.push(booking.startTime);
                }
            }
        }

        return { overlaps: blockedSlots.length > 0, blockedSlots };
    };

    // Check if booking would extend past midnight
    const extendsPastMidnight = (startTime: string, duration: number): boolean => {
        const endMinutes = timeToMinutes(startTime) + duration;
        return endMinutes > 1440; // 24 * 60 = 1440 minutes
    };

    // Get the maximum duration that fits before midnight
    const getMaxDurationBeforeMidnight = (startTime: string): number => {
        const startMinutes = timeToMinutes(startTime);
        const minutesUntilMidnight = 1440 - startMinutes;
        // Return max of 60 minutes or whatever fits
        return Math.min(60, minutesUntilMidnight);
    };

    const submitBooking = async () => {
        setIsSubmitting(true);
        setError("");
        const totalPrice = (stadium.pricePerHour / 60) * duration;

        try {
            const res = await fetch('/api/bookings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    stadiumId: stadium.id,
                    date: date.toISOString(),
                    startTime: time,
                    duration,
                    sportType: sport || 'كرة قدم',
                    playersCount: playersCounter,
                    totalPrice
                })
            });

            const data = await res.json();

            if (res.ok) {
                router.push('/dashboard');
            } else {
                setError(data.error || "تعذر الحجز، قد يكون الوقت محجوزاً بالفعل");
            }
        } catch (e) {
            setError("خطأ في الاتصال بالخادم");
        }
        setIsSubmitting(false);
    };

    const getWeekDays = () => {
        const days = [];
        for (let i = 0; i < 14; i++) {
            const d = new Date();
            d.setDate(d.getDate() + i);
            d.setHours(0, 0, 0, 0);
            days.push(d);
        }
        return days;
    };

    // UI Colors defined in code.html
    const colors = {
        primary: "#1a247f",
        bgLight: "#f6f6f8",
        orange: "#fb923c"
    };

    return (
        <div style={{ backgroundColor: colors.bgLight, minHeight: '100vh', direction: 'rtl', fontFamily: 'inherit', color: '#0f172a' }}>
            {/* Nav Progress */}
            <nav style={{ position: 'sticky', top: 0, zIndex: 50, backgroundColor: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(8px)', borderBottom: `1px solid ${colors.primary}1a` }}>
                <div style={{ maxWidth: '1024px', margin: '0 auto', padding: '0 16px', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '32px', height: '32px', backgroundColor: colors.primary, borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <span style={{ color: 'white', fontSize: '1.2rem' }}>⚽</span>
                        </div>
                        <span style={{ fontWeight: 'bold', fontSize: '1.25rem', color: colors.primary }}>حجز الملعب</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <span style={{ fontSize: '0.875rem', fontWeight: 500, color: '#64748b' }}>الخطوة {step} من 4</span>
                        <div style={{ width: '128px', height: '8px', backgroundColor: `${colors.primary}1a`, borderRadius: '9999px', overflow: 'hidden' }}>
                            <div style={{ height: '100%', backgroundColor: colors.primary, width: `${(step / 4) * 100}%`, transition: 'width 0.3s' }}></div>
                        </div>
                    </div>
                </div>
            </nav>

            <main style={{ maxWidth: '1024px', margin: '0 auto', padding: '32px 16px', display: 'flex', flexDirection: 'column', gap: '48px' }}>

                {step === 1 && (
                    <section style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: `${colors.primary}1a`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: colors.primary }}>
                                <span style={{ fontWeight: 'bold', fontSize: '1.125rem' }}>1</span>
                            </div>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>اختر الرياضة واللاعبين</h2>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                {sportTypes.slice(0, 4).map(s => (
                                    <button key={s.id} onClick={() => setSport(s.name)} style={{
                                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '32px',
                                        backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                                        border: sport === s.name ? `2px solid ${colors.primary}` : '2px solid transparent',
                                        transition: 'all 0.2s', cursor: 'pointer'
                                    }}>
                                        <span style={{ fontSize: '3rem', marginBottom: '16px', filter: sport === s.name ? 'none' : 'grayscale(0.8) opacity(0.6)' }}>{s.icon}</span>
                                        <span style={{ fontWeight: 600, fontSize: '1.125rem', color: sport === s.name ? colors.primary : '#64748b' }}>{s.name}</span>
                                    </button>
                                ))}
                            </div>
                            <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', border: `1px solid ${colors.primary}1a` }}>
                                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#64748b', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>عدد اللاعبين</label>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
                                    <button onClick={() => setPlayersCounter(Math.min(stadium.capacity * 2, playersCounter + 1))} style={{ width: '48px', height: '48px', borderRadius: '50%', border: `1px solid ${colors.primary}33`, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'transparent', cursor: 'pointer', fontSize: '1.5rem', color: colors.primary }}>+</button>
                                    <div style={{ textAlign: 'center' }}>
                                        <span style={{ fontSize: '2.25rem', fontWeight: 'bold' }}>{playersCounter}</span>
                                        <span style={{ display: 'block', fontSize: '0.875rem', color: '#64748b' }}>لاعبين</span>
                                    </div>
                                    <button onClick={() => setPlayersCounter(Math.max(1, playersCounter - 1))} style={{ width: '48px', height: '48px', borderRadius: '50%', border: `1px solid ${colors.primary}33`, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'transparent', cursor: 'pointer', fontSize: '1.5rem', color: colors.primary }}>-</button>
                                </div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
                            <button onClick={() => setStep(2)} disabled={!sport} style={{
                                padding: '16px 48px', backgroundColor: sport ? colors.primary : '#cbd5e1', color: 'white', borderRadius: '12px', fontWeight: 'bold', fontSize: '1.125rem', border: 'none', cursor: sport ? 'pointer' : 'not-allowed', transition: 'background-color 0.2s'
                            }}>المتابعة للوقت</button>
                        </div>
                    </section>
                )}

                {step === 2 && (
                    <section style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: `${colors.primary}1a`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: colors.primary }}>
                                <span style={{ fontWeight: 'bold', fontSize: '1.125rem' }}>2</span>
                            </div>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>اختر التاريخ والوقت</h2>
                        </div>

                        <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', border: `1px solid ${colors.primary}1a` }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
                                <h3 style={{ fontWeight: 'bold', fontSize: '1.125rem' }}>{date.toLocaleDateString('ar-SA', { month: 'long', year: 'numeric' })}</h3>
                            </div>

                            <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '16px' }}>
                                {getWeekDays().map((d, i) => {
                                    const isSelected = date.getTime() === d.getTime();
                                    return (
                                        <button key={i} onClick={() => { setDate(d); setTime(""); }} style={{
                                            flexShrink: 0, padding: '16px', borderRadius: '12px', minWidth: '80px',
                                            backgroundColor: isSelected ? colors.primary : 'transparent',
                                            color: isSelected ? 'white' : '#0f172a',
                                            border: isSelected ? 'none' : '1px solid #e2e8f0',
                                            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', cursor: 'pointer', transition: 'all 0.2s'
                                        }}>
                                            <span style={{ fontSize: '0.75rem', fontWeight: 500, opacity: isSelected ? 0.9 : 0.5 }}>{d.toLocaleDateString('ar-SA', { weekday: 'short' })}</span>
                                            <span style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>{d.getDate()}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <div style={{ marginTop: '16px' }}>
                            <h3 style={{ fontWeight: 500, color: '#64748b', marginBottom: '16px' }}>الأوقات المتاحة</h3>
                            {loadingSlots ? <p style={{ color: '#64748b' }}>جاري التحميل...</p> : (
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '12px', direction: 'ltr' }}>
                                    {allSlots.map(slot => {
                                        const isBooked = isSlotBlocked(slot);
                                        const isSelected = time === slot;
                                        return (
                                            <button key={slot} disabled={isBooked} onClick={() => setTime(slot)} style={{
                                                padding: '16px 8px', borderRadius: '8px', fontSize: '1rem', fontWeight: 600,
                                                backgroundColor: isBooked ? '#f1f5f9' : (isSelected ? colors.primary : 'white'),
                                                color: isBooked ? '#94a3b8' : (isSelected ? 'white' : '#0f172a'),
                                                border: isBooked ? '2px solid transparent' : (isSelected ? `2px solid ${colors.primary}` : '2px solid white'),
                                                boxShadow: isBooked ? 'none' : '0 1px 2px rgba(0,0,0,0.05)',
                                                textDecoration: isBooked ? 'line-through' : 'none',
                                                cursor: isBooked ? 'not-allowed' : 'pointer', transition: 'all 0.2s'
                                            }}>
                                                {slot}
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '16px' }}>
                            <button onClick={() => setStep(1)} style={{ padding: '16px 32px', border: '1px solid #e2e8f0', backgroundColor: 'white', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer' }}>عودة</button>
                            <button onClick={() => setStep(3)} disabled={!time} style={{
                                padding: '16px 48px', backgroundColor: time ? colors.primary : '#cbd5e1', color: 'white', borderRadius: '12px', fontWeight: 'bold', border: 'none', cursor: time ? 'pointer' : 'not-allowed'
                            }}>المتابعة للمدة</button>
                        </div>
                    </section>
                )}

                {step === 3 && (
                    <section style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: `${colors.primary}1a`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: colors.primary }}>
                                <span style={{ fontWeight: 'bold', fontSize: '1.125rem' }}>3</span>
                            </div>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>حدد مدة اللعب</h2>
                        </div>

                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
                            {[60, 90, 120].map(mins => {
                                // Check overlap for THIS specific duration (mins), not the current state
                                const { overlaps } = wouldOverlap(time, mins);
                                const isPastMidnight = extendsPastMidnight(time, mins);
                                const isDisabled = overlaps;
                                
                                return (
                                    <button 
                                        key={mins} 
                                        onClick={() => {
                                            if (isPastMidnight) {
                                                setPendingDuration(mins);
                                                setShowMidnightDialog(true);
                                            } else if (!overlaps) {
                                                setDuration(mins);
                                            }
                                        }} 
                                        disabled={isDisabled}
                                        style={{
                                            flex: '1 1 200px', padding: '24px 32px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '12px',
                                            backgroundColor: duration === mins ? colors.primary : (isDisabled ? '#f1f5f9' : 'white'),
                                            color: duration === mins ? 'white' : (isDisabled ? '#94a3b8' : '#0f172a'),
                                            border: duration === mins ? 'none' : (isDisabled ? '2px solid transparent' : `1px solid ${colors.primary}33`),
                                            boxShadow: duration === mins ? `0 10px 15px -3px ${colors.primary}33` : 'none',
                                            fontWeight: 'bold', fontSize: '1.125rem', 
                                            cursor: isDisabled ? 'not-allowed' : 'pointer', 
                                            transition: 'all 0.2s',
                                            opacity: isDisabled ? 0.6 : 1,
                                            textDecoration: isDisabled ? 'line-through' : 'none'
                                        }}
                                    >
                                        <span style={{ fontSize: '1.5rem', color: duration === mins ? 'white' : colors.primary }}>⏱️</span>
                                        {mins} دقيقة
                                    </button>
                                );
                            })}
                        </div>

                        {/* Overlap warning message */}
                        {wouldOverlap(time, duration).overlaps && (
                            <div style={{ 
                                padding: '16px', 
                                backgroundColor: '#fef2f2', 
                                border: '1px solid #fecaca', 
                                borderRadius: '12px',
                                color: '#dc2626'
                            }}>
                                <p style={{ fontWeight: 600, marginBottom: '8px' }}>⚠️ لا يمكن حجز هذه المدة</p>
                                <p style={{ fontSize: '0.875rem' }}>
                                    الوقت المختار يتداخل مع حجوزات موجودة: {wouldOverlap(time, duration).blockedSlots.join(', ')}
                                </p>
                                <p style={{ fontSize: '0.875rem', marginTop: '8px' }}>
                                    يرجى اختيار وقت آخر أو مدة أقصر
                                </p>
                            </div>
                        )}

                        {/* Midnight crossover warning */}
                        {extendsPastMidnight(time, duration) && (
                            <div style={{ 
                                padding: '16px', 
                                backgroundColor: '#fffbeb', 
                                border: '1px solid #fcd34d', 
                                borderRadius: '12px',
                                color: '#92400e'
                            }}>
                                <p style={{ fontWeight: 600, marginBottom: '8px' }}>🌙 الحجز يتجاوز منتصف الليل</p>
                                <p style={{ fontSize: '0.875rem' }}>
                                    المدة المختارة تنتهي بعد منتصف الليل. يمكنك حجز الساعة المتبقية فقط أو الاستمرار لل يوم التالي.
                                </p>
                            </div>
                        )}

                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '32px' }}>
                            <button onClick={() => setStep(2)} style={{ padding: '16px 32px', border: '1px solid #e2e8f0', backgroundColor: 'white', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer' }}>عودة</button>
                            <button 
                                onClick={() => {
                                    if (extendsPastMidnight(time, duration)) {
                                        setPendingDuration(duration);
                                        setShowMidnightDialog(true);
                                    } else if (!wouldOverlap(time, duration).overlaps) {
                                        setStep(4);
                                    }
                                }} 
                                disabled={wouldOverlap(time, duration).overlaps}
                                style={{ 
                                    padding: '16px 48px', 
                                    backgroundColor: wouldOverlap(time, duration).overlaps ? '#cbd5e1' : colors.primary, 
                                    color: 'white', 
                                    borderRadius: '12px', 
                                    fontWeight: 'bold', 
                                    border: 'none', 
                                    cursor: wouldOverlap(time, duration).overlaps ? 'not-allowed' : 'pointer' 
                                }}
                            >
                                المتابعة للدفع
                            </button>
                        </div>
                    </section>
                )}

                {step === 4 && (
                    <section style={{ marginTop: '32px', paddingTop: '32px', borderTop: `1px solid ${colors.primary}1a` }}>
                        <div style={{ backgroundColor: 'white', padding: '32px', borderRadius: '24px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)', border: `1px solid ${colors.primary}1a`, position: 'relative', overflow: 'hidden' }}>
                            <div style={{ position: 'absolute', top: 0, left: 0, padding: '32px', opacity: 0.03, pointerEvents: 'none' }}>
                                <span style={{ fontSize: '8rem' }}>🧾</span>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '32px', position: 'relative', zIndex: 10 }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                    <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: colors.primary }}>ملخص الحجز</h3>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <span style={{ fontSize: '1.25rem', color: colors.primary }}>📅</span>
                                            <span style={{ fontWeight: 500 }}>{date.toLocaleDateString('ar-SA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <span style={{ fontSize: '1.25rem', color: colors.primary }}>⏰</span>
                                            <span style={{ fontWeight: 500, direction: 'ltr' }}>{time} ({duration} دقيقة)</span>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <span style={{ fontSize: '1.25rem', color: colors.primary }}>👥</span>
                                            <span style={{ fontWeight: 500 }}>{playersCounter} لاعبين • {sport}</span>
                                        </div>
                                    </div>
                                    {error && <div style={{ marginTop: '16px', padding: '12px', backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', borderRadius: '8px', fontWeight: 500 }}>{error}</div>}
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '24px' }}>
                                    <div style={{ textAlign: 'center' }}>
                                        <p style={{ fontSize: '0.875rem', fontWeight: 500, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>المبلغ الإجمالي</p>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <p style={{ fontSize: '3rem', fontWeight: 900, color: colors.primary, lineHeight: 1 }}>{((stadium.pricePerHour / 60) * duration).toFixed(0)}</p>
                                            <RiyalIcon width={32} height={32} />
                                        </div>
                                    </div>
                                    <button onClick={submitBooking} disabled={isSubmitting} style={{
                                        width: '100%', padding: '24px 32px', backgroundColor: colors.orange, color: 'white', fontWeight: 900, fontSize: '1.25rem', borderRadius: '16px', border: 'none', cursor: isSubmitting ? 'not-allowed' : 'pointer',
                                        boxShadow: `0 10px 15px -3px ${colors.orange}66`, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', transition: 'all 0.2s',
                                        opacity: isSubmitting ? 0.7 : 1
                                    }}>
                                        {isSubmitting ? "جاري التأكيد..." : "تأكيد الحجز النهائي"}
                                        <span style={{ fontSize: '1.5rem' }}>✓</span>
                                    </button>
                                    <button onClick={() => setStep(1)} disabled={isSubmitting} style={{ background: 'transparent', border: 'none', color: '#64748b', textDecoration: 'underline', cursor: 'pointer', fontWeight: 500 }}>
                                        تعديل الحجز
                                    </button>
                                </div>
                            </div>
                        </div>
                    </section>
                )}

                {/* Midnight Crossover Dialog */}
                {showMidnightDialog && (
                    <div style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 100
                    }}>
                        <div style={{
                            backgroundColor: 'white',
                            padding: '32px',
                            borderRadius: '16px',
                            maxWidth: '400px',
                            width: '90%',
                            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)'
                        }}>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '16px', color: colors.primary }}>
                                🌙 الحجز يتجاوز منتصف الليل
                            </h3>
                            <p style={{ color: '#64748b', marginBottom: '24px' }}>
                                حجزك ب duration {pendingDuration} دقيقة بدءاً من الساعة {time} ينتهي بعد منتصف الليل. 
                                يرجى اختيار أحد الخيارات التالية:
                            </p>
                            
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                <button
                                    onClick={() => {
                                        // Reduce to max duration before midnight
                                        const maxDuration = getMaxDurationBeforeMidnight(time);
                                        setDuration(maxDuration);
                                        setShowMidnightDialog(false);
                                        setPendingDuration(null);
                                        // Advance to step 4
                                        setStep(4);
                                    }}
                                    style={{
                                        padding: '16px',
                                        backgroundColor: colors.primary,
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '12px',
                                        fontWeight: 'bold',
                                        cursor: 'pointer',
                                        fontSize: '1rem'
                                    }}
                                >
                                    حجز الساعة المتبقية فقط ({getMaxDurationBeforeMidnight(time)} دقيقة)
                                </button>
                                
                                <button
                                    onClick={() => {
                                        // Keep the full duration - spans to next day
                                        if (pendingDuration) {
                                            setDuration(pendingDuration);
                                        }
                                        setShowMidnightDialog(false);
                                        setPendingDuration(null);
                                        // Advance to step 4 since user confirmed they want to continue to next day
                                        setStep(4);
                                    }}
                                    style={{
                                        padding: '16px',
                                        backgroundColor: 'white',
                                        color: colors.primary,
                                        border: `2px solid ${colors.primary}`,
                                        borderRadius: '12px',
                                        fontWeight: 'bold',
                                        cursor: 'pointer',
                                        fontSize: '1rem'
                                    }}
                                >
                                    الاستمرار لل يوم التالي ({pendingDuration} دقيقة كاملة)
                                </button>
                                
                                <button 
                                    onClick={() => {
                                        setShowMidnightDialog(false);
                                        setPendingDuration(null);
                                    }}
                                    style={{
                                        padding: '12px',
                                        backgroundColor: 'transparent',
                                        color: '#64748b',
                                        border: 'none',
                                        borderRadius: '8px',
                                        cursor: 'pointer',
                                        fontSize: '0.875rem',
                                        textDecoration: 'underline'
                                    }}
                                >
                                    إلغاء
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
