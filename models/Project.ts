import mongoose, { Schema, Document } from 'mongoose';

export interface IProject extends Document {
    title: string;
    description: string;
    tags: string[];
    github: string;
    demo?: string;
    image?: string;
    createdAt: Date;
}

const ProjectSchema: Schema = new Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    tags: { type: [String], default: [] },
    github: { type: String, required: true },
    demo: { type: String },
    image: { type: String },
    createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Project || mongoose.model<IProject>('Project', ProjectSchema);
