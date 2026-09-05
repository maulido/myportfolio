import mongoose, { Schema, Document } from 'mongoose';

export interface IGuestbookEntry extends Document {
    name: string;
    email?: string;
    website?: string;
    message: string;
    approved: boolean;
    spam: boolean;
    pinned: boolean;
    likes: number;
    adminReply?: string;
    adminRepliedAt?: Date;
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
        pinned: {
            type: Boolean,
            default: false
        },
        likes: {
            type: Number,
            default: 0
        },
        adminReply: {
            type: String,
            trim: true,
            maxlength: [500, 'Reply cannot exceed 500 characters']
        },
        adminRepliedAt: {
            type: Date
        },
        ipAddress: {
            type: String
        }
    },
    {
        timestamps: true
    }
);

// Indexes for query optimization
GuestbookEntrySchema.index({ approved: 1, spam: 1, createdAt: -1 }); // Compound index for public queries
GuestbookEntrySchema.index({ ipAddress: 1, createdAt: -1 }); // For rate limiting checks
GuestbookEntrySchema.index({ spam: 1, approved: 1 }); // For admin filtering

export default mongoose.models.GuestbookEntry || mongoose.model<IGuestbookEntry>('GuestbookEntry', GuestbookEntrySchema);
