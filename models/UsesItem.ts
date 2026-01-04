import mongoose, { Schema, Document } from 'mongoose';

export interface IUsesItem extends Document {
    name: string;
    category: string;
    description: string;
    url?: string;
    imageUrl?: string;
    featured: boolean;
    order: number;
    createdAt: Date;
    updatedAt: Date;
}

const UsesItemSchema = new Schema<IUsesItem>(
    {
        name: {
            type: String,
            required: [true, 'Name is required'],
            trim: true
        },
        category: {
            type: String,
            required: [true, 'Category is required'],
            enum: ['Hardware', 'Software', 'Services', 'Desk Setup', 'Other'],
            default: 'Other'
        },
        description: {
            type: String,
            required: [true, 'Description is required']
        },
        url: {
            type: String,
            trim: true
        },
        imageUrl: {
            type: String,
            trim: true
        },
        featured: {
            type: Boolean,
            default: false
        },
        order: {
            type: Number,
            default: 0
        }
    },
    {
        timestamps: true
    }
);

// Index for sorting
UsesItemSchema.index({ category: 1, order: 1 });

export default mongoose.models.UsesItem || mongoose.model<IUsesItem>('UsesItem', UsesItemSchema);
