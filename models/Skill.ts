import mongoose, { Schema, Document } from 'mongoose';

export interface ISkill extends Document {
    name: string;
    level: 'Expert' | 'Advanced' | 'Intermediate' | 'Beginner';
    years: number;
    category: string;
    icon: string;
    color?: string;
    order: number;
    createdAt: Date;
    updatedAt: Date;
}

const SkillSchema: Schema = new Schema({
    name: {
        type: String,
        required: [true, 'Skill name is required'],
        trim: true
    },
    level: {
        type: String,
        required: [true, 'Skill level is required'],
        enum: ['Expert', 'Advanced', 'Intermediate', 'Beginner']
    },
    years: {
        type: Number,
        required: [true, 'Years of experience is required'],
        min: [0, 'Years cannot be negative'],
        max: [50, 'Years cannot exceed 50']
    },
    category: {
        type: String,
        required: [true, 'Category is required'],
        trim: true
    },
    icon: {
        type: String,
        required: [true, 'Icon is required'],
        trim: true
    },
    color: {
        type: String,
        trim: true
    },
    order: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

// Index for efficient querying
SkillSchema.index({ category: 1, order: 1 });

export default mongoose.models.Skill || mongoose.model<ISkill>('Skill', SkillSchema);
