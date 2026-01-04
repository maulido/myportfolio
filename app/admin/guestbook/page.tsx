"use client";

import { useState, useEffect } from "react";
import { Check, X, Trash2, AlertTriangle } from "lucide-react";

interface GuestbookEntry {
    _id: string;
    name: string;
    email?: string;
    website?: string;
    message: string;
    approved: boolean;
    spam: boolean;
    createdAt: string;
}

export default function AdminGuestbookPage() {
    const [pendingEntries, setP endingEntries] = useState<GuestbookEntry[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPendingEntries();
    }, []);

    const fetchPendingEntries = async () => {
        try {
            const response = await fetch('/api/guestbook/pending');
            const data = await response.json();
            if (data.success) {
                setPendingEntries(data.data);
            }
        } catch (error) {
            console.error('Error fetching pending entries:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (id: string) => {
        try {
            const response = await fetch(`/api/guestbook/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ approved: true, spam: false })
            });

            if (response.ok) {
                setPendingEntries(prev => prev.filter(entry => entry._id !== id));
            } else {
                alert('Failed to approve entry');
            }
        } catch (error) {
            console.error('Error approving entry:', error);
            alert('An error occurred');
        }
    };

    const handleReject = async (id: string) => {
        if (!confirm('Are you sure you want to reject this entry?')) return;

        try {
            const response = await fetch(`/api/guestbook/${id}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                setPendingEntries(prev => prev.filter(entry => entry._id !== id));
            } else {
                alert('Failed to delete entry');
            }
        } catch (error) {
            console.error('Error deleting entry:', error);
            alert('An error occurred');
        }
    };

    const handleMarkSpam = async (id: string) => {
        try {
            const response = await fetch(`/api/guestbook/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ approved: false, spam: true })
            });

            if (response.ok) {
                setPendingEntries(prev => prev.filter(entry => entry._id !== id));
            } else {
                alert('Failed to mark as spam');
            }
        } catch (error) {
            console.error('Error marking spam:', error);
            alert('An error occurred');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-background/50 p-8 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background/50 p-8">
            <div className="max-w-6xl mx-auto space-y-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight mb-2">Guestbook Moderation</h1>
                    <p className="text-muted-foreground">
                        Review and approve pending guestbook entries
                    </p>
                </div>

                {pendingEntries.length === 0 ? (
                    <div className="text-center py-16 border border-dashed border-border rounded-lg">
                        <Check className="h-12 w-12 mx-auto mb-4 text-green-500" />
                        <p className="text-xl font-semibold mb-2">All caught up!</p>
                        <p className="text-muted-foreground">
                            No pending entries to review
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="text-sm text-muted-foreground">
                            {pendingEntries.length} pending {pendingEntries.length === 1 ? 'entry' : 'entries'}
                        </div>

                        {pendingEntries.map((entry) => (
                            <div
                                key={entry._id}
                                className="border border-primary/20 rounded-xl p-6 bg-card/40 backdrop-blur-sm space-y-4"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <span className="font-semibold">{entry.name}</span>
                                            {entry.website && (
                                                <a
                                                    href={entry.website}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-xs text-primary hover:underline"
                                                >
                                                    {entry.website}
                                                </a>
                                            )}
                                        </div>
                                        {entry.email && (
                                            <div className="text-sm text-muted-foreground">
                                                {entry.email}
                                            </div>
                                        )}
                                        <div className="text-xs text-muted-foreground">
                                            {new Date(entry.createdAt).toLocaleString()}
                                        </div>
                                    </div>
                                </div>

                                <div className="border-t border-border pt-4">
                                    <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">
                                        {entry.message}
                                    </p>
                                </div>

                                <div className="flex items-center gap-2 pt-2">
                                    <button
                                        onClick={() => handleApprove(entry._id)}
                                        className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 bg-green-600 text-white hover:bg-green-700 h-9 px-4"
                                    >
                                        <Check className="mr-2 h-4 w-4" />
                                        Approve
                                    </button>
                                    <button
                                        onClick={() => handleMarkSpam(entry._id)}
                                        className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 bg-yellow-600 text-white hover:bg-yellow-700 h-9 px-4"
                                    >
                                        <AlertTriangle className="mr-2 h-4 w-4" />
                                        Mark Spam
                                    </button>
                                    <button
                                        onClick={() => handleReject(entry._id)}
                                        className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 bg-destructive text-destructive-foreground hover:bg-destructive/90 h-9 px-4"
                                    >
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
