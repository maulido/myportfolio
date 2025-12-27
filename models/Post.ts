import mongoose, { Schema, Document } from 'mongoose';

export interface IPost extends Document {
    title: string;
    slug: string;
    content: string;
    excerpt: string;
    tags: string[];
    coverImage?: string;
    createdAt: Date;
}

const PostSchema: Schema = new Schema({
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    content: { type: String, required: true },
    excerpt: { type: String, required: true },
    tags: { type: [String], default: [] },
    coverImage: { type: String },
    createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Post || mongoose.model<IPost>('Post', PostSchema);
