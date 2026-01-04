"use client";

import { useState } from "react";
import { Trash2, Check, X, AlertTriangle } from "lucide-react";

export interface BulkAction {
    id: string;
    label: string;
    icon: React.ReactNode;
    variant: 'default' | 'success' | 'warning' | 'danger';
    onClick: (selectedIds: string[]) => Promise<void>;
}

interface BulkActionsProps {
    selectedIds: string[];
    totalCount: number;
    onSelectAll: () => void;
    onDeselectAll: () => void;
    actions: BulkAction[];
}

export function BulkActions({
    selectedIds,
    totalCount,
    onSelectAll,
    onDeselectAll,
    actions
}: BulkActionsProps) {
    const [loading, setLoading] = useState(false);

    const handleAction = async (action: BulkAction) => {
        if (selectedIds.length === 0) {
            alert('Please select at least one item');
            return;
        }

        const confirmed = confirm(`Are you sure you want to ${action.label.toLowerCase()} ${selectedIds.length} item(s)?`);
        if (!confirmed) return;

        setLoading(true);
        try {
            await action.onClick(selectedIds);
        } catch (error) {
            console.error('Bulk action error:', error);
            alert('An error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const variantClasses = {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        success: 'bg-green-600 text-white hover:bg-green-700',
        warning: 'bg-yellow-600 text-white hover:bg-yellow-700',
        danger: 'bg-destructive text-destructive-foreground hover:bg-destructive/90'
    };

    if (selectedIds.length === 0) return null;

    return (
        <div className="sticky top-0 z-10 bg-card/95 backdrop-blur-sm border-b border-primary/20 p-4 mb-4">
            <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <span className="text-sm font-medium">
                        {selectedIds.length} of {totalCount} selected
                    </span>
                    {selectedIds.length === totalCount ? (
                        <button
                            onClick={onDeselectAll}
                            className="text-sm text-primary hover:underline"
                        >
                            Deselect All
                        </button>
                    ) : (
                        <button
                            onClick={onSelectAll}
                            className="text-sm text-primary hover:underline"
                        >
                            Select All ({totalCount})
                        </button>
                    )}
                </div>

                <div className="flex items-center gap-2">
                    {actions.map((action) => (
                        <button
                            key={action.id}
                            onClick={() => handleAction(action)}
                            disabled={loading}
                            className={`inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-9 px-4 ${variantClasses[action.variant]}`}
                        >
                            {action.icon}
                            <span className="ml-2">{action.label}</span>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}

// Preset actions for common use cases
export const bulkDeleteAction = (onDelete: (ids: string[]) => Promise<void>): BulkAction => ({
    id: 'delete',
    label: 'Delete',
    icon: <Trash2 className="h-4 w-4" />,
    variant: 'danger',
    onClick: onDelete
});

export const bulkApproveAction = (onApprove: (ids: string[]) => Promise<void>): BulkAction => ({
    id: 'approve',
    label: 'Approve',
    icon: <Check className="h-4 w-4" />,
    variant: 'success',
    onClick: onApprove
});

export const bulkRejectAction = (onReject: (ids: string[]) => Promise<void>): BulkAction => ({
    id: 'reject',
    label: 'Reject',
    icon: <X className="h-4 w-4" />,
    variant: 'danger',
    onClick: onReject
});

export const bulkSpamAction = (onSpam: (ids: string[]) => Promise<void>): BulkAction => ({
    id: 'spam',
    label: 'Mark Spam',
    icon: <AlertTriangle className="h-4 w-4" />,
    variant: 'warning',
    onClick: onSpam
});
