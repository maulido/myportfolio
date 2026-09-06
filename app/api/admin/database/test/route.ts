import { NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnect, { getDatabaseInfo, maskMongoUri } from "@/lib/db";
import { requireAuth } from "@/lib/auth-helpers";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
    const authResult = await requireAuth();
    if (authResult instanceof NextResponse) return authResult;

    try {
        const body = await req.json().catch(() => ({}));
        const customUri = body?.uri?.trim();

        const startTime = Date.now();

        if (customUri) {
            // Test custom URI in an isolated connection so active pool is never interrupted
            const testConn = mongoose.createConnection(customUri, {
                serverSelectionTimeoutMS: 6000,
                connectTimeoutMS: 6000,
                socketTimeoutMS: 10000,
                family: 4,
            });

            try {
                await testConn.asPromise();

                if (!testConn.db) {
                    throw new Error("Koneksi database tidak berhasil dibuat.");
                }

                // Ping the database
                await testConn.db.admin().ping();
                const latencyMs = Date.now() - startTime;

                const collections = await testConn.db.listCollections().toArray();
                const host = testConn.host || "unknown";
                const dbName = testConn.name || "unknown";

                await testConn.close();

                return NextResponse.json({
                    success: true,
                    isCustomUri: true,
                    latencyMs,
                    host,
                    databaseName: dbName,
                    collectionsCount: collections.length,
                    maskedUri: maskMongoUri(customUri),
                    message: `Koneksi berhasil! Database '${dbName}' merespon dalam ${latencyMs}ms (${collections.length} koleksi ditemukan).`
                });
            } catch (err: unknown) {
                try {
                    await testConn.close();
                } catch {
                    // Ignore close error on failed connection
                }
                const rawError = err instanceof Error ? err.message : String(err);
                // Sanitize error to avoid leaking password in URL if present in error message
                const sanitizedError = maskMongoUri(rawError);
                return NextResponse.json({
                    success: false,
                    isCustomUri: true,
                    error: `Gagal terhubung ke URI: ${sanitizedError}`
                }, { status: 400 });
            }
        }

        // Test active server database connection
        await dbConnect();
        const activeConn = mongoose.connection;
        if (!activeConn.db) {
            return NextResponse.json({
                success: false,
                error: "Database Mongoose aktif belum siap atau belum terhubung."
            }, { status: 500 });
        }

        await activeConn.db.admin().ping();
        const latencyMs = Date.now() - startTime;
        const info = getDatabaseInfo();
        const collections = await activeConn.db.listCollections().toArray();

        return NextResponse.json({
            success: true,
            isCustomUri: false,
            latencyMs,
            host: info.host,
            databaseName: info.name,
            readyState: info.status,
            collectionsCount: collections.length,
            isConfiguredViaEnv: info.isConfiguredViaEnv,
            maskedUri: info.maskedEnvUri,
            message: `Koneksi aktif ke '${info.name}' (${info.host}) normal. Ping latency: ${latencyMs}ms.`
        });
    } catch (error: unknown) {
        console.error("Database connection test error:", error);
        const rawError = error instanceof Error ? error.message : "Kesalahan koneksi database";
        return NextResponse.json({
            success: false,
            error: maskMongoUri(rawError)
        }, { status: 500 });
    }
}
