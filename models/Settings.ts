import mongoose, { Schema, Document } from 'mongoose';

export interface ISettings extends Document {
    key: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    value: any;
    aboutMe?: {
        paragraph1: string;
        paragraph2: string;
        profilePhotoUrl?: string;
        name?: string;
        title?: string;
        location?: string;
        email?: string;
        phone?: string;
        socialLinks?: {
            github?: string;
            linkedin?: string;
            twitter?: string;
            website?: string;
            instagram?: string;
        };
        stats?: {
            yearsExperience?: number;
            projectsCompleted?: number;
            technologiesMastered?: number;
            certificationsEarned?: number;
        };
    };
}

const SettingsSchema: Schema = new Schema({
    key: { type: String, required: true, unique: true },
    value: { type: Schema.Types.Mixed, required: true },
    aboutMe: {
        paragraph1: { type: String, default: '' },
        paragraph2: { type: String, default: '' },
        profilePhotoUrl: { type: String, default: '' },
        name: { type: String, default: '' },
        title: { type: String, default: '' },
        location: { type: String, default: '' },
        email: { type: String, default: '' },
        phone: { type: String, default: '' },
        socialLinks: {
            github: { type: String, default: '' },
            linkedin: { type: String, default: '' },
            twitter: { type: String, default: '' },
            website: { type: String, default: '' },
            instagram: { type: String, default: '' }
        },
        stats: {
            yearsExperience: { type: Number, default: 0 },
            projectsCompleted: { type: Number, default: 0 },
            technologiesMastered: { type: Number, default: 0 },
            certificationsEarned: { type: Number, default: 0 }
        }
    }
}, {
    timestamps: true
});

export default mongoose.models.Settings || mongoose.model<ISettings>('Settings', SettingsSchema);
