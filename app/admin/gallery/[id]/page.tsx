"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";

export default function EditGalleryItemPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        imageUrl: "",
        category: "General",
        date: "",
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchItem = async () => {
            try {
                const res = await fetch(`/api/gallery/${id}`);
                const data = await res.json();
                if (data.success) {
                    setFormData({
                        title: data.data.title,
                        description: data.data.description,
                        imageUrl: data.data.imageUrl,
                        category: data.data.category,
                        date: data.data.date.split('T')[0],
                    });
                }
            } catch (error) {
                console.error("Failed to fetch gallery item", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchItem();
    }, [id]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const res = await fetch(`/api/gallery/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (res.ok) {
                router.push("/admin");
            } else {
                alert("Failed to update image");
            }
        } catch (error) {
            console.error(error);
            alert("An error occurred");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    }

    return (
        <div className="min-h-screen bg-background/50 p-8">
            <div className="max-w-4xl mx-auto space-y-8">
                <div className="flex items-center gap-4">
                    <Link href="/admin">
                        <button className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 w-10">
                            <ArrowLeft className="h-4 w-4" />
                        </button>
                    </Link>
                    <h1 className="text-3xl font-bold tracking-tight">Edit Gallery Image</h1>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8 rounded-xl border border-primary/10 bg-card/10 backdrop-blur-sm p-8">
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <label className="text-sm font-medium leading-none">Title</label>
                            <input
                                required
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                className="flex h-10 w-full rounded-md border border-input/50 bg-background/50 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                placeholder="Image Title"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium leading-none">Category</label>
                            <input
                                required
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                                className="flex h-10 w-full rounded-md border border-input/50 bg-background/50 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                placeholder="Event, Project, etc."
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium leading-none">Image URL</label>
                        <input
                            required
                            name="imageUrl"
                            value={formData.imageUrl}
                            onChange={handleChange}
                            className="flex h-10 w-full rounded-md border border-input/50 bg-background/50 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            placeholder="https://example.com/image.jpg"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium leading-none">Date</label>
                        <input
                            type="date"
                            required
                            name="date"
                            value={formData.date}
                            onChange={handleChange}
                            className="flex h-10 w-full rounded-md border border-input/50 bg-background/50 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium leading-none">Description</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows={3}
                            className="flex w-full rounded-md border border-input/50 bg-background/50 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            placeholder="Description of the image..."
                        />
                    </div>

                    <div className="flex justify-end pt-4">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 min-w-[120px]"
                        >
                            {isSubmitting ? "Updating..." : (
                                <>
                                    <Save className="mr-2 h-4 w-4" />
                                    Update Image
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
