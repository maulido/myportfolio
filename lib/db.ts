import mongoose from 'mongoose';

interface MongooseCache {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
}

declare global {
     
    var mongoose: MongooseCache | undefined;
}

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
    let cached = global.mongoose;

    if (!cached) {
        cached = global.mongoose = { conn: null, promise: null };
    }

    if (cached.conn) {
        return cached.conn;
    }

    if (!cached.promise) {
        const opts = {
            bufferCommands: false,
            // Connection pool settings for better performance
            maxPoolSize: 10,
            minPoolSize: 2,
            socketTimeoutMS: 45000,
            serverSelectionTimeoutMS: 5000,
            family: 4, // Use IPv4, skip trying IPv6
        };

        cached.promise = mongoose.connect(MONGODB_URI!, opts).then((mongoose) => {
            console.log('✅ MongoDB connected successfully');
            return mongoose;
        }).catch((error) => {
            console.error('❌ MongoDB connection error:', error);
            throw error;
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

export function maskMongoUri(uri?: string): string {
    if (!uri) return "";
    try {
        return uri.replace(/(mongodb(?:\+srv)?:\/\/[^:]+:)([^@]+)(@)/, "$1******$3");
    } catch {
        return "mongodb://***:***@...";
    }
}

export function getDatabaseInfo() {
    const readyStateMap: Record<number, string> = {
        0: "disconnected",
        1: "connected",
        2: "connecting",
        3: "disconnecting",
        99: "uninitialized"
    };
    const state = mongoose.connection.readyState;
    return {
        readyState: state,
        status: readyStateMap[state] || "unknown",
        host: mongoose.connection.host || "unknown",
        port: mongoose.connection.port || 27017,
        name: mongoose.connection.name || "portfolio_db",
        modelsCount: Object.keys(mongoose.models).length,
        isConfiguredViaEnv: Boolean(process.env.MONGODB_URI),
        maskedEnvUri: maskMongoUri(process.env.MONGODB_URI)
    };
}

export default dbConnect;

