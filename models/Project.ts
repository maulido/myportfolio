import mongoose, { Schema, Document } from 'mongoose';

export interface IProject extends Document {
    title: string;
    description: string;
    tags: string[];
    github: string;
    demo?: string;
    image?: string;
    featured?: boolean;
    status?: string;
    caseStudy?: {
        problem: string;
        solution: string;
        challenges: string[];
        results: {
            metric: string;
            value: string;
            description?: string;
        }[];
        screenshots?: string[];
        codeSnippets?: {
            language: string;
            code: string;
            description: string;
            filename?: string;
        }[];
        technologies?: {
            name: string;
            purpose: string;
        }[];
        teamSize?: number;
        duration?: string;
        role?: string;
    };
}

const ProjectSchema = new Schema({
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String, required: true },
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
    screenshots: [String],
    codeSnippets: [{
        language: String,
        code: String,
        description: String,
        filename: String,
    }],
    technologies: [{
        name: String,
        purpose: String,
    }],
    teamSize: Number,
    duration: String,
    role: String,
},
}, {
    timestamps: true
});

export default mongoose.models.Project || mongoose.model<IProject>('Project', ProjectSchema);
