import mongoose, { Schema, Document } from 'mongoose';

export interface IProject extends Document {
    title: string;
    slug: string;
    description: string;
    category: string;
    problemStatement?: string;
    solutionApproach?: string;
    imageUrl?: string;
    architectureDiagram?: string;
    screenshots?: string[];
    technologies: string[];
    githubUrl?: string;
    liveUrl?: string;
    demoUrl?: string;
    caseStudyUrl?: string;
    featured?: boolean;
    relatedProjects?: mongoose.Types.ObjectId[];
    createdAt?: Date;
    updatedAt?: Date;
}

const ProjectSchema = new Schema({
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    category: { type: String, required: true, default: "Uncategorized" },
    problemStatement: { type: String },
    solutionApproach: { type: String },
    imageUrl: { type: String },
    architectureDiagram: { type: String },
    screenshots: [{ type: String }],
    technologies: [{ type: String }],
    githubUrl: { type: String },
    liveUrl: { type: String },
    demoUrl: { type: String },
    caseStudyUrl: { type: String },
    featured: { type: Boolean, default: false },
    relatedProjects: [{ type: Schema.Types.ObjectId, ref: 'Project' }],
}, {
    timestamps: true
});

export default mongoose.models.Project || mongoose.model<IProject>('Project', ProjectSchema);
