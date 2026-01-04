import mongoose, { Schema, Document } from 'mongoose';

export interface IMedia extends Document {
    fileName: string;
    fileUrl: string;
    fileSize: number;
    fileType: string;
    uploadedBy?: string;
    usedIn?: string[];
    tags?: string[];
    createdAt: Date;
    updatedAt: Date;
}

const MediaSchema = new Schema<IMedia>(
    {
        fileName: {
            type: String,
            required: [true, 'File name is required'],
            trim: true
        },
        fileUrl: {
            type: String,
            required: [true, 'File URL is required'],
            trim: true
        },
        fileSize: {
            type: Number,
            required: [true, 'File size is required']
        },
        fileType: {
            type: String,
            required: [true, 'File type is required'],
            enum: ['image', 'pdf', 'document', 'other']
        },
        uploadedBy: {
            type: String
        },
        usedIn: [{
            type: String
        }],
        tags: [{
            type: String,
            trim: true
        }]
    },
    {
        timestamps: true
    }
);

// Indexes
MediaSchema.index({ fileName: 'text' });
MediaSchema.index({ fileType: 1 });
MediaSchema.index({ createdAt: -1 });

export default mongoose.models.Media || mongoose.model<IMedia>('Media', MediaSchema);
