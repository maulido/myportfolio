import mongoose, { Schema, Document } from 'mongoose';

export interface IGuestbookEntry extends Document {
    name: string;
    email?: string;
    website?: string;
    message: string;
    approved: boolean;
    spam: boolean;
    ipAddress?: string;
    createdAt: Date;
    updatedAt: Date;
}

const GuestbookEntrySchema = new Schema<IGuestbookEntry>(
    {
        name: {
            type: String,
            required: [true, 'Name is required'],
            trim: true,
            maxlength: [100, 'Name cannot exceed 100 characters']
        },
        email: {
            type: String,
            trim: true,
            lowercase: true
        },
        website: {
            type: String,
            trim: true
        },
        message: {
            type: String,
            required: [true, 'Message is required'],
            maxlength: [500, 'Message cannot exceed 500 characters']
        },
        approved: {
            type: Boolean,
            default: false
        },
        spam: {
            type: Boolean,
            default: false
        },
        ipAddress: {
            type: String
        }
    },
    {
        timestamps: true
    }
);

// Indexes
GuestbookEntrySchema.index({ approved: 1, createdAt: -1 });
GuestbookEntrySchema.index({ spam: 1 });

export default mongoose.models.GuestbookEntry || mongoose.model<IGuestbookEntry>('GuestbookEntry', GuestbookEntrySchema);
