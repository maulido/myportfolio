import mongoose, { Schema, Document } from 'mongoose';

export interface INewsletter extends Document {
    email: string;
    name?: string;
    subscribed: boolean;
    subscribedAt: Date;
    unsubscribedAt?: Date;
}

const NewsletterSchema: Schema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    name: { type: String },
    subscribed: { type: Boolean, default: true },
    subscribedAt: { type: Date, default: Date.now },
    unsubscribedAt: { type: Date },
}, {
    timestamps: true
});

// Index for subscriber queries
NewsletterSchema.index({ subscribed: 1, createdAt: -1 });

export default mongoose.models.Newsletter || mongoose.model<INewsletter>('Newsletter', NewsletterSchema);
