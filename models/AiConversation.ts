import mongoose, { Schema, Document } from 'mongoose';

export interface IAiConversationMessage {
    id?: string;
    sender: 'visitor' | 'bot' | 'admin';
    senderName: string;
    content: string;
    timestamp: Date;
}

export interface IAiConversation extends Document {
    sessionId: string;
    visitorName: string;
    visitorContact?: string;
    isLead: boolean;
    category: string;
    status: 'active' | 'replied' | 'archived';
    unreadByAdmin: boolean;
    unreadByVisitor: boolean;
    messages: IAiConversationMessage[];
    lastMessage: string;
    lastMessageAt: Date;
    ip?: string;
    userAgent?: string;
    createdAt: Date;
    updatedAt: Date;
}

const AiConversationMessageSchema = new Schema(
    {
        sender: {
            type: String,
            required: true,
            enum: ['visitor', 'bot', 'admin'],
            default: 'visitor'
        },
        senderName: { type: String, default: 'Pengunjung' },
        content: { type: String, required: true, trim: true },
        timestamp: { type: Date, default: Date.now }
    },
    { _id: true }
);

const AiConversationSchema: Schema = new Schema(
    {
        sessionId: { type: String, required: true, unique: true, index: true },
        visitorName: { type: String, default: 'Pengunjung Web', trim: true },
        visitorContact: { type: String, default: '', trim: true },
        isLead: { type: Boolean, default: false, index: true },
        category: {
            type: String,
            default: 'general',
            enum: ['recruitment', 'skills', 'projects', 'certifications', 'experience', 'contact', 'general']
        },
        status: {
            type: String,
            default: 'active',
            enum: ['active', 'replied', 'archived']
        },
        unreadByAdmin: { type: Boolean, default: true, index: true },
        unreadByVisitor: { type: Boolean, default: false },
        messages: [AiConversationMessageSchema],
        lastMessage: { type: String, default: '' },
        lastMessageAt: { type: Date, default: Date.now, index: true },
        ip: { type: String, default: '' },
        userAgent: { type: String, default: '' }
    },
    { timestamps: true }
);

AiConversationSchema.index({ status: 1, lastMessageAt: -1 });

export default mongoose.models.AiConversation || mongoose.model<IAiConversation>('AiConversation', AiConversationSchema);
