import mongoose from 'mongoose';

const OTPSchema = new mongoose.Schema({
    email: { type: String, required: true },
    otp: { type: String, required: true },
    createdAt: { type: Date, default: Date.now, expires: 300 } // Expires in 5 minutes
});

// Add index for faster email lookups
OTPSchema.index({ email: 1 });

export default mongoose.models.OTP || mongoose.model('OTP', OTPSchema);
