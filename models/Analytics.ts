import mongoose from 'mongoose';

const AnalyticsSchema = new mongoose.Schema({
    type: {
        type: String,
        required: true,
        enum: ['page_view', 'cv_download', 'project_view', 'blog_view'],
    },
    identifier: {
        type: String, // e.g., 'home', project ID, blog slug
        required: true,
    },
    count: {
        type: Number,
        default: 0,
    },
    lastUpdated: {
        type: Date,
        default: Date.now,
    },
}, { timestamps: true });

export default mongoose.models.Analytics || mongoose.model('Analytics', AnalyticsSchema);
