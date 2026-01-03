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

// Add index for better query performance
AnalyticsSchema.index({ type: 1, identifier: 1 });

export default mongoose.models.Analytics || mongoose.model('Analytics', AnalyticsSchema);
