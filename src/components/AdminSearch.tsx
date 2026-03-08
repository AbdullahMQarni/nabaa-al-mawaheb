"use client";

import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';

export default function AdminSearch() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [query, setQuery] = useState(searchParams.get('search') || '');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (query.trim()) {
            router.push(`/admin/queue?search=${encodeURIComponent(query.trim())}`);
        } else {
            router.push('/admin/queue');
        }
    };

    return (
        <form onSubmit={handleSearch} className="search-bar" style={{ display: 'flex', alignItems: 'center' }}>
            <span style={{ color: '#94a3b8' }}>🔍</span>
            <input
                type="text"
                placeholder="Search bookings, users, or reports..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                style={{ border: 'none', outline: 'none', background: 'transparent', width: '100%', padding: '8px' }}
            />
        </form>
    );
}
