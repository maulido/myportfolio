import mongoose, { Schema, Document } from 'mongoose';

export interface IGalleryItem extends Document {
    title: string;
    description: string;
    imageUrl: string;
    category: string;
    date: Date;
    createdAt: Date;
}

const GalleryItemSchema: Schema = new Schema({
    title: { type: String, required: true },
    description: { type: String },
    imageUrl: { type: String, required: true },
    category: { type: String, default: "General" },
    date: { type: Date, default: Date.now },
    createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.GalleryItem || mongoose.model<IGalleryItem>('GalleryItem', GalleryItemSchema);
