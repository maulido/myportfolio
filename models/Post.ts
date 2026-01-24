import mongoose, { Schema, Document } from 'mongoose';

export interface IPost extends Document {
    title: string;
    slug: string;
    content: string;
    excerpt: string;
    category: string;
    tags: string[];
    published: boolean;
    coverImage?: string;
    views: number;
    likes: number;
    createdAt: Date;
}

const PostSchema: Schema = new Schema({
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    content: { type: String, required: true },
    excerpt: { type: String, required: true },
    category: { type: String, default: 'General' },
    tags: { type: [String], default: [] },
    published: { type: Boolean, default: true },
    coverImage: { type: String },
    views: { type: Number, default: 0 },
    likes: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now },
});

// Indexes for query optimization
PostSchema.index({ published: 1, createdAt: -1 }); // For listing published posts
PostSchema.index({ category: 1, published: 1 }); // For category filtering
PostSchema.index({ slug: 1 }); // Already unique, but explicit for clarity

export default mongoose.models.Post || mongoose.model<IPost>('Post', PostSchema);
