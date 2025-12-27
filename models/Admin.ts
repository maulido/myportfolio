import mongoose, { Schema, Document } from 'mongoose';

export interface IAdmin extends Document {
    username: string;
    password: string;
    name: string;
    email: string;
    createdAt: Date;
    updatedAt: Date;
}

const AdminSchema: Schema = new Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
}, {
    timestamps: true
});

export default mongoose.models.Admin || mongoose.model<IAdmin>('Admin', AdminSchema);
