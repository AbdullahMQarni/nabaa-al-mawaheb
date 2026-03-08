"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SplashLogin() {
    const router = useRouter();
    const [phone, setPhone] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    const handleKeyPress = (key: string) => {
        setError("");
        if (key === 'backspace') {
            setPhone(prev => prev.slice(0, -1));
        } else {
            setPhone(prev => {
                if (prev.length < 9) return prev + key;
                return prev;
            });
        }
    };

    const handleContinue = async () => {
        setError("");
        const phoneRegex = /^[0-9]{9,15}$/;
        if (!phoneRegex.test(phone)) {
            setError("الرجاء إدخال رقم هاتف صحيح");
            return;
        }

        setIsLoading(true);
        // Format to a complete +966 number for the backend MVP
        const fullPhone = `+966${phone}`;
        localStorage.setItem("userPhone", fullPhone);

        try {
            const res = await fetch("/api/auth", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ phone: fullPhone })
            });

            if (res.ok) {
                router.push("/dashboard");
            } else {
                setError("حدث خطأ أثناء تسجيل الدخول");
                setIsLoading(false);
            }
        } catch (err) {
            setError("تعذر الاتصال بالخادم");
            setIsLoading(false);
        }
    };

    const colors = {
        primary: "#1a247f",
        bgLight: "#f6f6f8",
        orange: "#fb923c",
        textDark: "#0f172a"
    };

    const formatPhoneNumber = (digits: string) => {
        // 5X XXX XXXX format visually
        let formatted = "";
        if (digits.length > 0) {
            formatted += digits.substring(0, 2);
        }
        if (digits.length > 2) {
            formatted += " " + digits.substring(2, 5);
        }
        if (digits.length > 5) {
            formatted += " " + digits.substring(5, 9);
        }
        return formatted || "5X XXX XXXX";
    };

    return (
        <div className="mobile-container" style={{ display: 'flex', flexDirection: 'column', direction: 'rtl' }}>

            {/* Header */}
            <header className="login-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div className="login-logo">
                        <span>⚽</span>
                    </div>
                    <span style={{ fontWeight: 800, fontSize: '1.25rem' }}>نبع المواهب</span>
                </div>
                <div style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '50%', fontSize: '0.875rem', fontWeight: 'bold' }}>
                    i
                </div>
            </header>

            {/* Main Content */}
            <main className="login-content">

                <div style={{ marginBottom: '40px' }}>
                    <h1 className="login-title">أهلاً بك</h1>
                    <p className="login-subtitle">ادخل رقم جوالك للبدء في حجز الملعب</p>
                </div>

                {/* Input Display Area */}
                <div style={{ marginBottom: '32px' }}>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '12px', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                        رقم الجوال
                    </label>
                    <div className="phone-input-container">
                        <span style={{ color: '#94a3b8', fontWeight: 600, fontSize: '1.25rem' }}>+966</span>
                        <span style={{ color: phone.length > 0 ? 'var(--text-dark)' : '#cbd5e1', fontWeight: 800, fontSize: '1.5rem', flex: 1 }}>
                            {formatPhoneNumber(phone)}
                        </span>
                    </div>
                    {error && <p style={{ color: 'var(--danger)', marginTop: '12px', fontSize: '0.875rem', textAlign: 'center', fontWeight: '500' }}>{error}</p>}
                </div>

                {/* Keypad */}
                <div className="keypad">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                        <button
                            key={num}
                            onClick={() => handleKeyPress(num.toString())}
                            className="keypad-btn"
                        >
                            {num}
                        </button>
                    ))}
                    <div className="keypad-btn special" style={{ visibility: 'hidden' }}></div>
                    <button
                        onClick={() => handleKeyPress('0')}
                        className="keypad-btn"
                    >
                        0
                    </button>
                    <button
                        onClick={() => handleKeyPress('backspace')}
                        className="keypad-btn special"
                    >
                        ⌫
                    </button>
                </div>

                {/* Continue Button */}
                <div style={{ marginTop: 'auto', paddingTop: '40px' }}>
                    <button
                        onClick={handleContinue}
                        disabled={isLoading || phone.length < 9}
                        className="continue-btn"
                    >
                        {isLoading ? "جاري التحميل..." : "استمرار"}
                        <span style={{ fontSize: '1.5rem', direction: 'ltr' }}>→</span>
                    </button>
                </div>

                {/* Footer */}
                <div style={{ textAlign: 'center', marginTop: '32px' }}>
                    <p style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                        © 2024 ملاعب نبع المواهب الرياضية
                    </p>
                </div>
            </main>

        </div>
    );
}
