'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
    Trash2,
    Save,
    Lock,
    Smartphone,
    Plus,
    ChevronDown,
    User,
    Zap,
    Mail,
    Loader2
} from 'lucide-react';

export default function AccountPage() {
    // User Data State
    const [profile, setProfile] = useState({
        username: '',
        email: '',
        driverNumber: 0,
        country: '',
        category: '',
        lastConnection: ''
    });

    const [loading, setLoading] = useState(true);



    // Form States
    const [passwords, setPasswords] = useState({
        old: '',
        new: '',
        confirm: ''
    });

    const categories = ['Vespa Tune Up', 'Sport 150cc', 'Underbone 2T', 'Supermoto'];
    const countries = ['Indonesia', 'Malaysia', 'Singapore', 'Thailand', 'Vietnam'];

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await fetch('/api/auth/me');
                const data = await response.json();
                if (data.success) {
                    setProfile({
                        username: data.user.username || '',
                        email: data.user.email || '',
                        driverNumber: data.user.driverNumber || 0,
                        country: data.user.country || 'Indonesia',
                        category: data.user.category || 'Vespa Tune Up',
                        lastConnection: data.user.lastConnection || 'N/A'
                    });
                } else {
                    console.error('Failed to fetch profile:', data.message);
                }
            } catch (error) {
                console.error('Error fetching profile:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, []);

    const handleProfileUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await fetch('/api/auth/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    driverNumber: profile.driverNumber,
                    country: profile.country,
                    category: profile.category,
                }),
            });

            const data = await response.json();

            if (data.success) {
                alert('Profile updated successfully!');
                // Update local state with server response
                setProfile({
                    ...profile,
                    lastConnection: data.user.lastConnection
                });
            } else {
                alert(data.message || 'Failed to update profile');
            }
        } catch (error) {
            console.error('Profile update error:', error);
            alert('An error occurred while updating profile');
        }
    };

    const handlePasswordChange = (e: React.FormEvent) => {
        e.preventDefault();
        if (passwords.new !== passwords.confirm) {
            alert('New passwords do not match!');
            return;
        }
        alert('Password changed successfully!');
        setPasswords({ old: '', new: '', confirm: '' });
    };
    const handleRemoveAccount = async () => {
        if (confirm('Are you sure you want to remove your account? This action cannot be undone.')) {
            try {
                const response = await fetch('/api/auth/remove-account', {
                    method: 'DELETE',
                });
                const data = await response.json();
                if (data.success) {
                    alert('Account removed successfully.');
                    window.location.href = '/login';
                } else {
                    alert(data.message || 'Failed to remove account.');
                }
            } catch (error) {
                console.error('Remove account error:', error);
                alert('An error occurred during account removal.');
            }
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-10 h-10 text-primary animate-spin" />
                    <p className="text-text-secondary font-racing animate-pulse">LOADING ACCOUNT...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background text-foreground pb-24">
            {/* Header with Carbon Fiber */}

            {/* Main Content */}
            <main className="container mx-auto px-4 py-6">

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* LEFT COLUMN: Profile Info */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* Profile Header Card */}
                        <div className="carbon-bg rounded-xl overflow-hidden border border-border-color shadow-lg">
                            <div className="bg-gradient-to-r from-primary to-highlight p-6 flex flex-col sm:flex-row items-center sm:items-start gap-4 relative">
                                {/* Avatar Circle */}
                                <div className="w-20 h-20 rounded-full bg-background border-4 border-background shadow-xl flex items-center justify-center overflow-hidden shrink-0">
                                    <div className="w-full h-full bg-gradient-to-br from-warning to-highlight relative flex items-center justify-center">
                                        <span className="text-background font-racing text-2xl font-bold">M</span>
                                    </div>
                                </div>

                                <div className="flex-1 text-center sm:text-left z-10">
                                    <h2 className="text-2xl font-racing text-white">{profile.username}</h2>
                                    <p className="text-white/80 text-sm">{profile.email}</p>
                                </div>

                                <div className="absolute bottom-2 right-4 text-xs text-white/60 font-data">
                                    Last: {profile.lastConnection}
                                </div>
                            </div>

                            {/* Account Informations Form */}
                            <div className="p-6">
                                <h3 className="text-lg font-racing text-primary mb-4">ACCOUNT INFORMATION</h3>

                                <form onSubmit={handleProfileUpdate} className="space-y-4">

                                    {/* Username (Read-only) */}
                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-center">
                                        <label className="text-text-secondary font-medium text-sm md:text-right">User Name:</label>
                                        <div className="md:col-span-3">
                                            <input
                                                type="text"
                                                value={profile.username}
                                                readOnly
                                                className="w-full bg-background-secondary border border-border-color text-text-secondary rounded px-3 py-2 cursor-not-allowed focus:outline-none text-sm"
                                            />
                                        </div>
                                    </div>

                                    {/* Email (Read-only) */}
                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-center">
                                        <label className="text-text-secondary font-medium text-sm md:text-right">Email:</label>
                                        <div className="md:col-span-3">
                                            <input
                                                type="text"
                                                value={profile.email}
                                                readOnly
                                                className="w-full bg-background-secondary border border-border-color text-text-secondary rounded px-3 py-2 cursor-not-allowed focus:outline-none text-sm"
                                            />
                                        </div>
                                    </div>

                                    {/* Driver Number */}
                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-center">
                                        <label className="text-text-secondary font-medium text-sm md:text-right">Driver #:</label>
                                        <div className="md:col-span-3">
                                            <input
                                                type="number"
                                                value={profile.driverNumber}
                                                onChange={(e) => setProfile({ ...profile, driverNumber: parseInt(e.target.value) })}
                                                className="w-24 bg-card-bg border border-border-color text-foreground rounded px-3 py-2 focus:outline-none focus:border-primary transition font-data text-sm"
                                            />
                                        </div>
                                    </div>

                                    {/* Country */}
                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-center">
                                        <label className="text-text-secondary font-medium text-sm md:text-right">Country:</label>
                                        <div className="md:col-span-3">
                                            <select
                                                value={profile.country}
                                                onChange={(e) => setProfile({ ...profile, country: e.target.value })}
                                                className="w-full bg-card-bg border border-border-color text-foreground rounded px-3 py-2 focus:outline-none focus:border-primary transition text-sm"
                                            >
                                                {countries.map(c => <option key={c} value={c}>{c}</option>)}
                                            </select>
                                        </div>
                                    </div>

                                    {/* Default Category */}
                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-center">
                                        <label className="text-text-secondary font-medium text-sm md:text-right">Category:</label>
                                        <div className="md:col-span-3 flex gap-2">
                                            <select
                                                value={profile.category}
                                                onChange={(e) => setProfile({ ...profile, category: e.target.value })}
                                                className="flex-1 bg-card-bg border border-border-color text-foreground rounded px-3 py-2 focus:outline-none focus:border-primary transition text-sm"
                                            >
                                                {categories.map(c => <option key={c} value={c}>{c}</option>)}
                                            </select>
                                            <button type="button" className="bg-primary hover:bg-primary-hover text-white p-2 rounded transition">
                                                <Plus className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-border-color mt-6">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                document.cookie = 'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
                                                window.location.href = '/login';
                                            }}
                                            className="bg-background-secondary hover:bg-card-bg text-foreground border border-border-color px-4 py-2 rounded flex items-center justify-center gap-2 transition text-sm font-racing"
                                        >
                                            LOGOUT
                                        </button>

                                        <div className="flex-1"></div>

                                        <button
                                            type="button"
                                            onClick={handleRemoveAccount}
                                            className="text-warning hover:text-warning/80 text-xs underline underline-offset-4"
                                        >
                                            Remove Account
                                        </button>

                                        <button
                                            type="submit"
                                            className="bg-primary hover:bg-primary-hover text-white px-6 py-2 rounded flex items-center justify-center gap-2 transition shadow-md text-sm font-racing"
                                        >
                                            <Save className="w-4 h-4" />
                                            SAVE CHANGES
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>

                    </div>

                    {/* RIGHT COLUMN: Settings & Devices */}
                    <div className="space-y-6">

                        {/* Change Password Card */}
                        <div className="carbon-bg rounded-xl overflow-hidden shadow-lg border border-border-color">
                            <div className="p-4 border-b border-border-color flex items-center justify-between">
                                <h3 className="text-base font-racing flex items-center gap-2 text-foreground">
                                    <Lock className="w-4 h-4 text-primary" />
                                    CHANGE PASSWORD
                                </h3>
                                <ChevronDown className="w-4 h-4 text-text-secondary" />
                            </div>
                            <div className="p-4">
                                <form onSubmit={handlePasswordChange} className="space-y-3">
                                    <div>
                                        <label className="block text-text-secondary text-xs mb-1">Old password:</label>
                                        <input
                                            type="password"
                                            value={passwords.old}
                                            onChange={(e) => setPasswords({ ...passwords, old: e.target.value })}
                                            className="w-full bg-background-secondary border border-border-color rounded px-3 py-2 text-foreground focus:outline-none focus:border-primary transition text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-text-secondary text-xs mb-1">New password:</label>
                                        <input
                                            type="password"
                                            value={passwords.new}
                                            onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                                            className="w-full bg-background-secondary border border-border-color rounded px-3 py-2 text-foreground focus:outline-none focus:border-primary transition text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-text-secondary text-xs mb-1">Confirm password:</label>
                                        <input
                                            type="password"
                                            value={passwords.confirm}
                                            onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                                            className="w-full bg-background-secondary border border-border-color rounded px-3 py-2 text-foreground focus:outline-none focus:border-primary transition text-sm"
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        className="w-full bg-primary hover:bg-primary-hover text-white py-2 rounded mt-2 transition font-racing text-sm"
                                    >
                                        CHANGE PASSWORD
                                    </button>
                                </form>
                            </div>
                        </div>

                        {/* Connection Status Card */}
                        <div className="carbon-bg rounded-xl overflow-hidden shadow-lg border border-border-color">
                            <div className="p-4 border-b border-border-color flex items-center justify-between">
                                <h3 className="text-base font-racing flex items-center gap-2 text-foreground">
                                    <Smartphone className="w-4 h-4 text-primary" />
                                    CONNECTION STATUS
                                </h3>
                                <div className={`w-2 h-2 rounded-full ${profile.lastConnection !== 'N/A' && new Date(profile.lastConnection).getTime() > Date.now() - 24 * 60 * 60 * 1000 ? 'bg-highlight shadow-[0_0_8px_#00aced]' : 'bg-text-secondary'}`}></div>
                            </div>
                            <div className="p-6 text-center">
                                {profile.lastConnection !== 'N/A' ? (
                                    <div className="space-y-2">
                                        <div className="inline-flex items-center justify-center p-3 rounded-full bg-background-secondary border border-border-color mb-2">
                                            <Zap className="w-6 h-6 text-highlight" />
                                        </div>
                                        <h4 className="text-foreground font-racing text-lg">DEVICE SYNCED</h4>
                                        <p className="text-text-secondary text-xs">
                                            Last active: <span className="text-highlight font-mono">{new Date(profile.lastConnection).toLocaleString()}</span>
                                        </p>
                                        <div className="mt-4 pt-4 border-t border-border-color">
                                            <Link href="/devices" className="text-xs text-primary hover:underline">
                                                Manage Device Settings &rarr;
                                            </Link>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        <div className="inline-flex items-center justify-center p-3 rounded-full bg-background-secondary border border-border-color mb-2 opacity-50">
                                            <Smartphone className="w-6 h-6 text-text-secondary" />
                                        </div>
                                        <h4 className="text-text-secondary font-racing text-lg">NO DEVICE SYNCED</h4>
                                        <p className="text-text-secondary text-xs">
                                            Connect your device to WiFi and perform a sync to see it here.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                    </div>
                </div>

                {/* Footer */}
                <div className="mt-8 text-center text-text-secondary text-xs">
                    Much Racing - 2026 - <Link href="/contact" className="text-primary hover:underline">Contact us</Link>
                </div>
            </main>

        </div>
    );
}
