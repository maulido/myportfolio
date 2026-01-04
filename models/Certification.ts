import mongoose, { Schema, Document } from 'mongoose';

export interface ICertification extends Document {
    title: string;
    issuer: string;
    issueDate: Date;
    expiryDate?: Date;
    credentialId?: string;
    credentialUrl?: string;
    imageUrl?: string;
    certificateFileUrl?: string;
    category: string;
    skills: string[];
    description?: string;
}

const CertificationSchema: Schema = new Schema({
    title: { type: String, required: true },
    issuer: { type: String, required: true },
    issueDate: { type: Date, required: true },
    expiryDate: { type: Date },
    credentialId: { type: String },
    credentialUrl: { type: String },
    imageUrl: { type: String },
    certificateFileUrl: { type: String },
    category: { type: String, required: true, default: 'Other' },
    skills: [{ type: String }],
    description: { type: String },
}, {
    timestamps: true
});

export default mongoose.models.Certification || mongoose.model<ICertification>('Certification', CertificationSchema);
