"use client";

import { useState } from "react";
import { Edit, Save, X } from "lucide-react";
import { motion } from "framer-motion";

interface AboutMeEditorProps {
    initialData: {
        paragraph1: string;
        paragraph2: string;
    };
    onSave: (data: { paragraph1: string; paragraph2: string }) => Promise<void>;
}

export default function AboutMeEditor({ initialData, onSave }: AboutMeEditorProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [editData, setEditData] = useState(initialData);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await onSave(editData);
            setIsEditing(false);
        } catch (error) {
            console.error("Failed to save:", error);
            alert("Failed to save About Me content");
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancel = () => {
        setEditData(initialData);
        setIsEditing(false);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card/40 backdrop-blur-md border border-primary/10 rounded-2xl p-6"
        >
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold">About Me Content</h3>
                {!isEditing && (
                    <button
                        onClick={() => setIsEditing(true)}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                    >
                        <Edit className="h-4 w-4" />
                        Edit
                    </button>
                )}
            </div>

            {isEditing ? (
                <div className="space-y-4">
                    <div>
                        <label className="text-sm font-medium text-muted-foreground mb-2 block">
                            Paragraph 1
                        </label>
                        <textarea
                            value={editData.paragraph1}
                            onChange={(e) => setEditData({ ...editData, paragraph1: e.target.value })}
                            rows={4}
                            className="w-full rounded-lg border border-input/50 bg-background/50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                            placeholder="First paragraph..."
                        />
                    </div>
                    <div>
                        <label className="text-sm font-medium text-muted-foreground mb-2 block">
                            Paragraph 2
                        </label>
                        <textarea
                            value={editData.paragraph2}
                            onChange={(e) => setEditData({ ...editData, paragraph2: e.target.value })}
                            rows={4}
                            className="w-full rounded-lg border border-input/50 bg-background/50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                            placeholder="Second paragraph..."
                        />
                    </div>
                    <div className="flex gap-2 justify-end">
                        <button
                            onClick={handleCancel}
                            disabled={isSaving}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-input hover:bg-accent transition-colors disabled:opacity-50"
                        >
                            <X className="h-4 w-4" />
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors disabled:opacity-50"
                        >
                            <Save className="h-4 w-4" />
                            {isSaving ? "Saving..." : "Save Changes"}
                        </button>
                    </div>
                </div>
            ) : (
                <div className="space-y-4 text-sm text-muted-foreground">
                    <p className="leading-relaxed">{initialData.paragraph1}</p>
                    <p className="leading-relaxed">{initialData.paragraph2}</p>
                </div>
            )}
        </motion.div>
    );
}
