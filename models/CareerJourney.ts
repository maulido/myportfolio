import mongoose, { Schema, Document } from 'mongoose';

export interface ICareerJourney extends Document {
    type: 'work' | 'education' | 'achievement';
    title: string;
    organization: string;
    companyLogo?: string;
    location?: string;
    startDate: Date;
    endDate?: Date;
    current: boolean;
    description: string;
    skills: string[];
    achievements?: string[];
    responsibilities?: string[];
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
        skills: {
            type: [String],
            default: []
        },
        achievements: {
            type: [String],
            default: []
        },
        responsibilities: {
            type: [String],
            default: []
        }
    },
    {
        timestamps: true
    }
);

export default mongoose.models.CareerJourney || mongoose.model<ICareerJourney>('CareerJourney', CareerJourneySchema);

