import mongoose, { Schema, Document } from 'mongoose';

export interface IAiChatLog extends Document {
    query: string;
    responseSnippet: string;
    category: string;
    isLead: boolean;
    leadContact?: string;
    latencyMs: number;
    provider: string;
    aiModel: string;
    ip?: string;
    cached: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const AiChatLogSchema: Schema = new Schema(
    {
        query: { type: String, required: true, trim: true },
        responseSnippet: { type: String, default: '', trim: true },
        category: {
            type: String,
            default: 'general',
            enum: ['recruitment', 'skills', 'projects', 'certifications', 'experience', 'contact', 'general']
        },
        isLead: { type: Boolean, default: false, index: true },
        leadContact: { type: String, default: '', trim: true },
        latencyMs: { type: Number, default: 0 },
        provider: { type: String, default: 'gemini' },
        aiModel: { type: String, default: 'gemini-flash-lite-latest' },
        ip: { type: String, default: '' },
        cached: { type: Boolean, default: false }
    },
    { timestamps: true }
);

// Helpful index for dashboard analytics
AiChatLogSchema.index({ createdAt: -1 });
AiChatLogSchema.index({ category: 1, createdAt: -1 });

export default mongoose.models.AiChatLog || mongoose.model<IAiChatLog>('AiChatLog', AiChatLogSchema);
