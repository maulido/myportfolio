import mongoose, { Schema, Document } from 'mongoose';

export interface ITestimonial extends Document {
    name: string;
    role: string;
    company: string;
    content: string;
    image?: string;
    createdAt: Date;
}

const TestimonialSchema: Schema = new Schema({
    name: { type: String, required: true },
    role: { type: String, required: true },
    company: { type: String, required: true },
    content: { type: String, required: true },
    image: { type: String },
    createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Testimonial || mongoose.model<ITestimonial>('Testimonial', TestimonialSchema);
