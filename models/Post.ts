import mongoose, { Schema, Document } from 'mongoose';

export interface IPost extends Document {
    title: string;
    title_id?: string;
    slug: string;
    content: string;
    content_id?: string;
    excerpt: string;
    excerpt_id?: string;
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
    title_id: { type: String },
    slug: { type: String, required: true, unique: true },
    content: { type: String, required: true },
    content_id: { type: String },
    excerpt: { type: String, required: true },
    excerpt_id: { type: String },
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
// PostSchema.index({ slug: 1 }); // Removed: Duplicate index

export default mongoose.models.Post || mongoose.model<IPost>('Post', PostSchema);
