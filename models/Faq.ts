import mongoose, { Schema, Document } from 'mongoose';

export interface IFaq extends Document {
    question: string;
    question_id?: string;
    answer: string;
    answer_id?: string;
    category?: string;
    order: number;
    published: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const FaqSchema = new Schema<IFaq>(
    {
        question: {
            type: String,
            required: [true, 'Question (EN) is required'],
            trim: true
        },
        question_id: {
            type: String,
            trim: true
        },
        answer: {
            type: String,
            required: [true, 'Answer (EN) is required'],
            trim: true
        },
        answer_id: {
            type: String,
            trim: true
        },
        category: {
            type: String,
            default: 'General',
            trim: true
        },
        order: {
            type: Number,
            default: 0
        },
        published: {
            type: Boolean,
            default: true
        }
    },
    {
        timestamps: true
    }
);

FaqSchema.index({ order: 1, createdAt: 1 });

export default mongoose.models.Faq || mongoose.model<IFaq>('Faq', FaqSchema);
