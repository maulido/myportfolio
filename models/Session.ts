import mongoose, { Schema, Document } from 'mongoose';

export interface ISession extends Document {
    sessionId: string;
    startTime: Date;
    lastSeen: Date;
    duration: number; // in seconds
    pageViews: string[];
    userAgent?: string;
    deviceType?: string;
    location?: string;
    isMobile: boolean;
}

const SessionSchema: Schema = new Schema({
    sessionId: { type: String, required: true, unique: true },
    startTime: { type: Date, default: Date.now },
    lastSeen: { type: Date, default: Date.now },
    duration: { type: Number, default: 0 },
    pageViews: [{ type: String }],
    userAgent: { type: String },
    deviceType: { type: String },
    location: { type: String },
    isMobile: { type: Boolean, default: false },
}, { timestamps: true });

// Index for expiring old sessions (optional, but good for performance)
// SessionSchema.index({ lastSeen: 1 }, { expireAfterSeconds: 86400 * 30 }); // 30 days

export default mongoose.models.Session || mongoose.model<ISession>('Session', SessionSchema);
