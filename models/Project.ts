import mongoose, { Schema, Document } from 'mongoose';

export interface IProject extends Document {
    title: string;
    title_id?: string;
    slug: string;
    description: string;
    description_id?: string;
    category: string;
    problemStatement?: string;
    problemStatement_id?: string;
    solutionApproach?: string;
    solutionApproach_id?: string;
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
    title_id: { type: String },
    slug: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    description_id: { type: String },
    category: { type: String, required: true, default: "Uncategorized" },
    problemStatement: { type: String },
    problemStatement_id: { type: String },
    solutionApproach: { type: String },
    solutionApproach_id: { type: String },
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

// Indexes for query optimization
ProjectSchema.index({ featured: -1, createdAt: -1 });
ProjectSchema.index({ category: 1, createdAt: -1 });

export default mongoose.models.Project || mongoose.model<IProject>('Project', ProjectSchema);
