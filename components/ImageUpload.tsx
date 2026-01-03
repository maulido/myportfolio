"use client";

import { UploadButton, UploadDropzone } from "@uploadthing/react";
import type { OurFileRouter } from "@/app/api/uploadthing/core";
import { useState } from "react";
import { X, Upload, CheckCircle2 } from "lucide-react";
import Image from "next/image";

interface ImageUploadProps {
    value?: string;
    onChange: (url: string) => void;
    endpoint?: "imageUploader" | "galleryUploader";
    multiple?: boolean;
}

export default function ImageUpload({ value, onChange, endpoint = "imageUploader", multiple = false }: ImageUploadProps) {
    const [uploading, setUploading] = useState(false);
    const [uploadedUrl, setUploadedUrl] = useState(value || "");

    const handleRemove = () => {
        setUploadedUrl("");
        onChange("");
    };

    return (
        <div className="space-y-4">
            {uploadedUrl && !multiple ? (
                <div className="relative w-full h-64 rounded-lg overflow-hidden border border-primary/10 group">
                    <Image
                        src={uploadedUrl}
                        alt="Uploaded image"
                        fill
                        className="object-cover"
                    />
                    <button
                        type="button"
                        onClick={handleRemove}
                        className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                    >
                        <X className="h-4 w-4" />
                    </button>
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                        <div className="flex items-center gap-2 text-white text-sm">
                            <CheckCircle2 className="h-4 w-4" />
                            <span>Image uploaded successfully</span>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="border-2 border-dashed border-primary/20 rounded-lg p-8 text-center hover:border-primary/40 transition-colors">
                    <UploadDropzone<OurFileRouter, typeof endpoint>
                        endpoint={endpoint}
                        onClientUploadComplete={(res) => {
                            if (res && res[0]) {
                                const url = res[0].url;
                                setUploadedUrl(url);
                                onChange(url);
                                setUploading(false);
                            }
                        }}
                        onUploadError={(error: Error) => {
                            alert(`Upload failed: ${error.message}`);
                            setUploading(false);
                        }}
                        onUploadBegin={() => {
                            setUploading(true);
                        }}
                        appearance={{
                            container: "w-full",
                            uploadIcon: "text-primary",
                            label: "text-sm text-muted-foreground",
                            allowedContent: "text-xs text-muted-foreground",
                            button: "bg-primary text-white hover:bg-primary/90 transition-colors ut-ready:bg-primary ut-uploading:bg-primary/50",
                        }}
                        content={{
                            uploadIcon: () => <Upload className="h-10 w-10 mb-4 text-primary" />,
                            label: () => (
                                <div className="space-y-2">
                                    <p className="text-sm font-medium">
                                        {uploading ? "Uploading..." : "Drop image here or click to upload"}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        Max file size: 4MB
                                    </p>
                                </div>
                            ),
                            button: ({ ready, isUploading }) => {
                                if (isUploading) return "Uploading...";
                                if (ready) return "Choose File";
                                return "Getting ready...";
                            },
                        }}
                    />
                </div>
            )}

            {/* Alternative: Simple Button Upload */}
            {!uploadedUrl && (
                <div className="flex justify-center">
                    <UploadButton<OurFileRouter, typeof endpoint>
                        endpoint={endpoint}
                        onClientUploadComplete={(res) => {
                            if (res && res[0]) {
                                const url = res[0].url;
                                setUploadedUrl(url);
                                onChange(url);
                            }
                        }}
                        onUploadError={(error: Error) => {
                            alert(`Upload failed: ${error.message}`);
                        }}
                        appearance={{
                            button: "bg-primary text-white hover:bg-primary/90 transition-colors px-6 py-2 rounded-lg text-sm font-medium",
                            allowedContent: "hidden",
                        }}
                    />
                </div>
            )}
        </div>
    );
}
