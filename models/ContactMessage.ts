import mongoose, { Schema, Document } from 'mongoose';

export interface IContactMessage extends Document {
    name: string;
    email: string;
    message: string;
    read: boolean;
    ip?: string;
    createdAt: Date;
    updatedAt: Date;
}

const ContactMessageSchema: Schema = new Schema(
    {
        name: { type: String, required: true, trim: true },
        email: { type: String, required: true, trim: true, lowercase: true },
        message: { type: String, required: true, trim: true },
        read: { type: Boolean, default: false },
        ip: { type: String, default: '' },
    },
    { timestamps: true }
);

export default mongoose.models.ContactMessage || mongoose.model<IContactMessage>('ContactMessage', ContactMessageSchema);
