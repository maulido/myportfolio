import mongoose, { Schema, Document } from 'mongoose';

export interface IAnalyticsEvent extends Document {
    event: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    properties?: any;
    timestamp: Date;
    userAgent?: string;
    ip?: string;
    createdAt: Date;
    updatedAt: Date;
}

const AnalyticsEventSchema = new Schema({
    event: { type: String, required: true, index: true },
    properties: { type: Schema.Types.Mixed },
    timestamp: { type: Date, default: Date.now, index: true },
    userAgent: { type: String },
    ip: { type: String },
}, { timestamps: true });

export default mongoose.models.AnalyticsEvent || mongoose.model<IAnalyticsEvent>('AnalyticsEvent', AnalyticsEventSchema);
