import mongoose, { Schema, Document } from 'mongoose';

export interface ISettings extends Document {
    key: string;
    value: any;
    aboutMe?: {
        paragraph1: string;
        paragraph2: string;
    };
}

const SettingsSchema: Schema = new Schema({
    key: { type: String, required: true, unique: true },
    value: { type: Schema.Types.Mixed, required: true },
    aboutMe: {
        paragraph1: { type: String, default: '' },
        paragraph2: { type: String, default: '' }
    }
}, {
    timestamps: true
});

export default mongoose.models.Settings || mongoose.model<ISettings>('Settings', SettingsSchema);
