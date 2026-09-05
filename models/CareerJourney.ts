import mongoose, { Schema, Document } from 'mongoose';

export interface ICareerJourney extends Document {
    type: 'work' | 'education' | 'achievement';
    title: string;
    title_id?: string;
    organization: string;
    companyLogo?: string;
    location?: string;
    startDate: Date;
    endDate?: Date;
    current: boolean;
    description: string;
    description_id?: string;
    skills: string[];
    achievements?: string[];
    achievements_id?: string[];
    responsibilities?: string[];
    responsibilities_id?: string[];
    createdAt: Date;
    updatedAt: Date;
}

const CareerJourneySchema = new Schema<ICareerJourney>(
    {
        type: {
            type: String,
            enum: ['work', 'education', 'achievement'],
            required: [true, 'Type is required'],
            default: 'work'
        },
        title: {
            type: String,
            required: [true, 'Title is required'],
            trim: true
        },
        title_id: {
            type: String,
            trim: true
        },
        organization: {
            type: String,
            required: [true, 'Organization is required'],
            trim: true
        },
        companyLogo: {
            type: String,
            trim: true
        },
        location: {
            type: String,
            trim: true
        },
        startDate: {
            type: Date,
            required: [true, 'Start date is required']
        },
        endDate: {
            type: Date
        },
        current: {
            type: Boolean,
            default: false
        },
        description: {
            type: String,
            required: [true, 'Description is required']
        },
        description_id: {
            type: String
        },
        skills: {
            type: [String],
            default: []
        },
        achievements: {
            type: [String],
            default: []
        },
        achievements_id: {
            type: [String],
            default: []
        },
        responsibilities: {
            type: [String],
            default: []
        },
        responsibilities_id: {
            type: [String],
            default: []
        }
    },
    {
        timestamps: true
    }
);

// Indexes for query optimization
CareerJourneySchema.index({ type: 1, startDate: -1 });
CareerJourneySchema.index({ startDate: -1 });

export default mongoose.models.CareerJourney || mongoose.model<ICareerJourney>('CareerJourney', CareerJourneySchema);

