import mongoose, { Schema, Document } from 'mongoose';

export interface IEndorsement extends Document {
    skill: string;
    endorserEmail?: string;
    endorserName?: string;
    endorserIp: string;
    createdAt: Date;
}

const EndorsementSchema: Schema = new Schema({
    skill: { type: String, required: true },
    endorserEmail: { type: String },
    endorserName: { type: String },
    endorserIp: { type: String, required: true },
}, {
    timestamps: true
});

// Index for rate limiting
EndorsementSchema.index({ endorserIp: 1, skill: 1 });

export default mongoose.models.Endorsement || mongoose.model<IEndorsement>('Endorsement', EndorsementSchema);
