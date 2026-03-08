"use client";

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';

const CATEGORIES = [
    { id: 'ALL', label: 'الكل', icon: '' },
    { id: 'FOOTBALL', label: 'كرة قدم', icon: '⚽' },
    { id: 'BASKETBALL', label: 'كرة سلة', icon: '🏀' },
    { id: 'TENNIS', label: 'تنس', icon: '🎾' },
    { id: 'VOLLEYBALL', label: 'كرة طائرة', icon: '🏐' },
];

export default function SearchAndFilter() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [search, setSearch] = useState(searchParams.get('search') || '');
    const [category, setCategory] = useState(searchParams.get('category') || 'ALL');

    useEffect(() => {
        const params = new URLSearchParams(searchParams.toString());
        if (search) {
            params.set('search', search);
        } else {
            params.delete('search');
        }

        if (category !== 'ALL') {
            params.set('category', category);
        } else {
            params.delete('category');
        }

        // debounce the search somewhat
        const timeout = setTimeout(() => {
            router.push(`/home?${params.toString()}`);
        }, 300);

        return () => clearTimeout(timeout);
    }, [search, category, router, searchParams]);

    return (
        <div className="animate-fade-in" style={{ padding: '24px', backgroundColor: 'white', borderBottom: '1px solid #e2e8f0' }}>
            <div className="home-search-bar">
                <span style={{ color: 'var(--text-muted)', marginLeft: '12px', fontSize: '1.25rem' }}>🔍</span>
                <input
                    type="text"
                    placeholder="ابحث عن الملاعب بالاسم أو الموقع"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            {/* Categories */}
            <div className="category-pills">
                {CATEGORIES.map((cat) => (
                    <button
                        key={cat.id}
                        className={`category-pill ${category === cat.id ? 'active' : ''}`}
                        onClick={() => setCategory(cat.id)}
                    >
                        {cat.icon && <span>{cat.icon} </span>}
                        {cat.label}
                    </button>
                ))}
            </div>
        </div>
    );
}
