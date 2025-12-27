import mongoose, { Schema, Document } from 'mongoose';

export interface ICertification extends Document {
    title: string;
    issuer: string;
    date: Date;
    credentialUrl: string;
    imageUrl: string;
    createdAt: Date;
}

const CertificationSchema: Schema = new Schema({
    title: { type: String, required: true },
    issuer: { type: String, required: true },
    date: { type: Date, required: true },
    credentialUrl: { type: String },
    imageUrl: { type: String }, // Optional logo/badge
    createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Certification || mongoose.model<ICertification>('Certification', CertificationSchema);
