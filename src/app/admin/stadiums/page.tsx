"use client";
import { useState, useEffect } from "react";
import RiyalIcon from '@/components/RiyalIcon';

export default function StadiumsManager() {
    const [stadiums, setStadiums] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
    const [formData, setFormData] = useState({
        id: '',
        name: '',
        description: '',
        pricePerHour: 100,
        capacity: 10,
        imageUrl: '',
        locationUrl: '',
        isActive: true
    });

    useEffect(() => {
        fetchStadiums();
    }, []);

    const fetchStadiums = async () => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/admin/stadiums');
            if (res.ok) {
                const data = await res.json();
                setStadiums(data);
            }
        } catch (error) {
            console.error(error);
        }
        setIsLoading(false);
    };

    const openCreateModal = () => {
        setModalMode('create');
        setFormData({
            id: '', name: '', description: '', pricePerHour: 100, capacity: 10, imageUrl: '', locationUrl: '', isActive: true
        });
        setIsModalOpen(true);
    };

    const openEditModal = (stadium: any) => {
        setModalMode('edit');
        setFormData({ ...stadium });
        setIsModalOpen(true);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const url = modalMode === 'create' ? '/api/admin/stadiums' : `/api/admin/stadiums/${formData.id}`;
            const method = modalMode === 'create' ? 'POST' : 'PATCH';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                setIsModalOpen(false);
                fetchStadiums();
            } else {
                alert("Failed to save stadium.");
            }
        } catch (error) {
            alert("Connection error.");
        }
        setIsSaving(false);
    };

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`Are you sure you want to delete ${name}? This action cannot be undone.`)) return;

        try {
            const res = await fetch(`/api/admin/stadiums/${id}`, { method: 'DELETE' });
            if (res.ok) {
                fetchStadiums();
            } else {
                const data = await res.json();
                alert(data.error || "Failed to delete stadium.");
            }
        } catch (error) {
            alert("Connection error.");
        }
    };

    return (
        <div>
            <div className="admin-page-header">
                <div>
                    <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>Stadiums Manager</h1>
                    <p style={{ color: '#64748b', fontSize: '1rem' }}>Create, update, and manage your facilities.</p>
                </div>
                <button onClick={openCreateModal} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 24px', borderRadius: '24px', border: 'none', backgroundColor: '#1a247f', color: 'white', fontWeight: 600, cursor: 'pointer' }}>
                    <span>+</span> Add New Stadium
                </button>
            </div>

            {isLoading ? (
                <div style={{ color: '#64748b', textAlign: 'center', padding: '40px' }}>Loading facilities...</div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
                    {stadiums.length === 0 ? (
                        <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', backgroundColor: 'white', borderRadius: '16px', border: '1px dashed #cbd5e1', color: '#64748b' }}>
                            No stadiums found. Add your first stadium to get started.
                        </div>
                    ) : (
                        stadiums.map(stadium => (
                            <div key={stadium.id} style={{ backgroundColor: 'white', borderRadius: '16px', overflow: 'hidden', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                                <div style={{ height: '160px', backgroundColor: '#f1f5f9', backgroundImage: `url(${stadium.imageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center', position: 'relative' }}>
                                    {!stadium.isActive && (
                                        <div style={{ position: 'absolute', top: '12px', left: '12px', backgroundColor: '#ef4444', color: 'white', padding: '4px 8px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 600 }}>INACTIVE</div>
                                    )}
                                </div>
                                <div style={{ padding: '20px' }}>
                                    <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: '#0f172a', marginBottom: '4px' }}>{stadium.name}</h3>
                                    <p style={{ color: '#64748b', fontSize: '0.875rem', marginBottom: '16px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{stadium.description || 'No description'}</p>

                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', paddingBottom: '20px', borderBottom: '1px solid #e2e8f0' }}>
                                        <div>
                                            <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600 }}>PRICE / HR</div>
                                            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1a247f', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                {stadium.pricePerHour} <RiyalIcon width={20} height={20} />
                                            </div>
                                        </div>
                                        <div>
                                            <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600 }}>CAPACITY</div>
                                            <div style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>{stadium.capacity}</div>
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <button onClick={() => openEditModal(stadium)} style={{ flex: 1, padding: '8px', borderRadius: '8px', border: '1px solid #e2e8f0', backgroundColor: 'transparent', cursor: 'pointer', fontWeight: 600, color: '#0f172a' }}>Edit</button>
                                        <button onClick={() => handleDelete(stadium.id, stadium.name)} style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', backgroundColor: '#fef2f2', color: '#ef4444', cursor: 'pointer', fontWeight: 600 }}>Delete</button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            {/* Modal */}
            {isModalOpen && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div style={{ backgroundColor: 'white', padding: '32px', borderRadius: '24px', width: '500px', maxWidth: '90%', maxHeight: '90vh', overflowY: 'auto' }}>
                        <h3 style={{ marginBottom: '24px', fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>
                            {modalMode === 'create' ? 'Add New Stadium' : 'Edit Stadium'}
                        </h3>

                        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', fontWeight: 600, color: '#64748b' }}>Stadium Name</label>
                                <input type="text" required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '1rem', outline: 'none' }} />
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', fontWeight: 600, color: '#64748b' }}>Description</label>
                                <textarea required value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '1rem', outline: 'none', minHeight: '80px', fontFamily: 'inherit' }} />
                            </div>

                            <div style={{ display: 'flex', gap: '16px' }}>
                                <div style={{ flex: 1 }}>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '8px', fontSize: '0.875rem', fontWeight: 600, color: '#64748b' }}>Price / Hour <RiyalIcon width={16} height={16} /></label>
                                    <input type="number" required value={formData.pricePerHour} onChange={e => setFormData({ ...formData, pricePerHour: parseFloat(e.target.value) })} style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '1rem', outline: 'none' }} />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', fontWeight: 600, color: '#64748b' }}>Capacity</label>
                                    <input type="number" required value={formData.capacity} onChange={e => setFormData({ ...formData, capacity: parseInt(e.target.value) })} style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '1rem', outline: 'none' }} />
                                </div>
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', fontWeight: 600, color: '#64748b' }}>Image URL</label>
                                <input type="url" placeholder="https://..." value={formData.imageUrl} onChange={e => setFormData({ ...formData, imageUrl: e.target.value })} style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '1rem', outline: 'none' }} />
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', fontWeight: 600, color: '#64748b' }}>Location Maps URL</label>
                                <input type="url" placeholder="https://maps.google.com/..." value={formData.locationUrl} onChange={e => setFormData({ ...formData, locationUrl: e.target.value })} style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '1rem', outline: 'none' }} />
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '8px' }}>
                                <input type="checkbox" id="isActive" checked={formData.isActive} onChange={e => setFormData({ ...formData, isActive: e.target.checked })} style={{ width: '20px', height: '20px', cursor: 'pointer' }} />
                                <label htmlFor="isActive" style={{ fontWeight: 600, color: '#0f172a', cursor: 'pointer' }}>Stadium is active and available for booking</label>
                            </div>

                            <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                                <button type="button" onClick={() => setIsModalOpen(false)} style={{ flex: 1, padding: '14px', borderRadius: '12px', border: '1px solid #e2e8f0', backgroundColor: 'white', fontWeight: 600, cursor: 'pointer', fontSize: '1rem' }}>Cancel</button>
                                <button type="submit" disabled={isSaving} style={{ flex: 1, padding: '14px', borderRadius: '12px', border: 'none', backgroundColor: '#1a247f', color: 'white', fontWeight: 600, cursor: isSaving ? 'not-allowed' : 'pointer', fontSize: '1rem', opacity: isSaving ? 0.7 : 1 }}>{isSaving ? 'Saving...' : 'Save Stadium'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
