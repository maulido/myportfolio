"use client";

import { useState, useEffect } from "react";
import { Trash2, Copy, ExternalLink } from "lucide-react";
import Image from "next/image";

interface MediaFile {
    _id: string;
    fileName: string;
    fileUrl: string;
    fileSize: number;
    fileType: string;
    createdAt: string;
}

export default function AdminMediaPage() {
    const [files, setFiles] = useState<MediaFile[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        fetchFiles();
    }, []);

    const fetchFiles = async () => {
        try {
            const response = await fetch('/api/media');
            const data = await response.json();
            if (data.success) {
                setFiles(data.data);
            }
        } catch (error) {
            console.error('Error fetching files:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this file?')) return;

        try {
            const response = await fetch(`/api/media/${id}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                setFiles(prev => prev.filter(f => f._id !== id));
            } else {
                alert('Failed to delete file');
            }
        } catch (error) {
            console.error('Error deleting file:', error);
            alert('An error occurred');
        }
    };

    const copyUrl = (url: string) => {
        navigator.clipboard.writeText(url);
        alert('URL copied to clipboard!');
    };

    const formatFileSize = (bytes: number) => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
    };

    const filteredFiles = files.filter(file =>
        file.fileName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="min-h-screen bg-background/50 p-8 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background/50 p-8">
            <div className="max-w-7xl mx-auto space-y-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight mb-2">Media Library</h1>
                    <p className="text-muted-foreground">
                        Manage your uploaded files
                    </p>
                </div>

                {/* Search */}
                <div className="flex items-center gap-4">
                    <input
                        type="text"
                        placeholder="Search files..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="flex h-10 w-full max-w-sm rounded-md border border-input/50 bg-background/50 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    />
                    <div className="text-sm text-muted-foreground">
                        {filteredFiles.length} file(s)
                    </div>
                </div>

                {/* Grid */}
                {filteredFiles.length === 0 ? (
                    <div className="text-center py-16 border border-dashed border-border rounded-lg">
                        <p className="text-muted-foreground">
                            {searchTerm ? 'No files found' : 'No files uploaded yet'}
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredFiles.map((file) => (
                            <div
                                key={file._id}
                                className="border border-primary/20 rounded-xl p-4 bg-card/40 backdrop-blur-sm space-y-3 hover:border-primary/40 transition-colors"
                            >
                                {/* Preview */}
                                {file.fileType === 'image' ? (
                                    <div className="relative w-full h-40 rounded-lg overflow-hidden bg-muted">
                                        <Image
                                            src={file.fileUrl}
                                            alt={file.fileName}
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                ) : (
                                    <div className="w-full h-40 rounded-lg bg-muted flex items-center justify-center">
                                        <ExternalLink className="h-12 w-12 text-muted-foreground" />
                                    </div>
                                )}

                                {/* Info */}
                                <div className="space-y-1">
                                    <p className="font-medium text-sm truncate" title={file.fileName}>
                                        {file.fileName}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {formatFileSize(file.fileSize)} • {new Date(file.createdAt).toLocaleDateString()}
                                    </p>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => copyUrl(file.fileUrl)}
                                        className="flex-1 inline-flex items-center justify-center rounded-md text-xs font-medium bg-primary/10 hover:bg-primary/20 h-8 px-3"
                                    >
                                        <Copy className="h-3 w-3 mr-1" />
                                        Copy URL
                                    </button>
                                    <button
                                        onClick={() => handleDelete(file._id)}
                                        className="inline-flex items-center justify-center rounded-md text-xs font-medium bg-destructive/10 hover:bg-destructive/20 text-destructive h-8 px-3"
                                    >
                                        <Trash2 className="h-3 w-3" />
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
