import mongoose from 'mongoose';

async function dbConnect() {
    // Suppress noise during build if MONGODB_URI is missing
    const isBuild = process.env.NODE_ENV === 'production' && !process.env.MONGODB_URI;
    const MONGODB_URI = process.env.MONGODB_URI || (isBuild ? "" : "mongodb://localhost:27017/portfolio_db");

    if (!MONGODB_URI && !isBuild) {
        throw new Error(
            'Please define the MONGODB_URI environment variable inside .env.local'
        );
    }

    if (!MONGODB_URI) return null; // Exit silently during build if no URI

    /**
     * Global is used here to maintain a cached connection across hot reloads
     * in development. This prevents connections growing exponentially
     * during API Route usage.
     */
    let cached = (global as any).mongoose;

    if (!cached) {
        cached = (global as any).mongoose = { conn: null, promise: null };
    }

    if (cached.conn) {
        return cached.conn;
    }

    if (!cached.promise) {
        const opts = {
            bufferCommands: false,
        };

        cached.promise = mongoose.connect(MONGODB_URI!, opts).then((mongoose) => {
            return mongoose;
        });
    }

    try {
        cached.conn = await cached.promise;
    } catch (e) {
        cached.promise = null;
        throw e;
    }

    return cached.conn;
}

export default dbConnect;
