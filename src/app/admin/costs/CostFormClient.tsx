"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import RiyalIcon from '@/components/RiyalIcon';

export default function CostFormClient({ stadiums }: { stadiums: any[] }) {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        stadiumId: '',
        amount: '',
        category: 'صيانة', // Maintenance
        date: new Date().toISOString().split('T')[0],
        description: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const res = await fetch('/api/admin/costs', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                alert("تم تسجيل التكلفة بنجاح!");
                setFormData({ ...formData, amount: '', description: '' }); // Reset partial state
                router.refresh();
            } else {
                alert("فشل في التسجيل، تأكد من صحة المدخلات.");
            }
        } catch (err) {
            alert("خطأ في الاتصال");
        }

        setIsSubmitting(false);
    };

    return (
        <div className="admin-card">
            <h3 style={{ color: 'var(--primary)', marginBottom: '16px' }}>تسجيل مصروف جديد</h3>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

                <div>
                    <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>الملعب</label>
                    <select
                        className="input-field"
                        style={{ padding: '12px', fontSize: '1rem' }}
                        value={formData.stadiumId}
                        onChange={e => setFormData({ ...formData, stadiumId: e.target.value })}
                    >
                        <option value="">عام (لا يخص ملعب محدد)</option>
                        {stadiums.map(st => (
                            <option key={st.id} value={st.id}>{st.name}</option>
                        ))}
                    </select>
                </div>

                <div style={{ display: 'flex', gap: '16px' }}>
                    <div style={{ flex: 1 }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '8px', color: 'var(--text-muted)' }}>التكلفة <RiyalIcon width={16} height={16} /> *</label>
                        <input
                            type="number"
                            className="input-field"
                            style={{ padding: '12px', fontSize: '1rem' }}
                            required
                            value={formData.amount}
                            onChange={e => setFormData({ ...formData, amount: e.target.value })}
                            min="0"
                            step="0.01"
                        />
                    </div>
                    <div style={{ flex: 1 }}>
                        <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>التاريخ *</label>
                        <input
                            type="date"
                            className="input-field"
                            style={{ padding: '12px', fontSize: '1rem' }}
                            required
                            value={formData.date}
                            onChange={e => setFormData({ ...formData, date: e.target.value })}
                        />
                    </div>
                </div>

                <div>
                    <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>نوع المصروف *</label>
                    <select
                        className="input-field"
                        style={{ padding: '12px', fontSize: '1rem' }}
                        value={formData.category}
                        onChange={e => setFormData({ ...formData, category: e.target.value })}
                    >
                        <option value="صيانة">صيانة</option>
                        <option value="نظافة">نظافة</option>
                        <option value="تطوير">تطوير</option>
                        <option value="رواتب">رواتب واستحقاقات</option>
                        <option value="أخرى">أخرى</option>
                    </select>
                </div>

                <button type="submit" className="btn btn-accent" disabled={isSubmitting}>
                    {isSubmitting ? 'جاري التسجيل...' : 'حفظ المصروف'}
                </button>

            </form>
        </div>
    );
}
