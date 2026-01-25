import { createUploadthing, type FileRouter, UTFiles } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";

const f = createUploadthing();

// Real authentication using NextAuth
const auth = async () => {
    const session = await getServerSession(authOptions);
    return session?.user ? { id: session.user.email || "user" } : null;
};

// Helper function to generate readable filename
const generateReadableFilename = (originalName: string): string => {
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 8);
    const ext = originalName.split('.').pop();
    const baseName = originalName.split('.').slice(0, -1).join('.').replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
    return `${baseName}-${timestamp}-${randomStr}.${ext}`;
};

// FileRouter for your app, can contain multiple FileRoutes
export const ourFileRouter = {
    // Define as many FileRoutes as you like, each with a unique routeSlug
    imageUploader: f({ image: { maxFileSize: "4MB", maxFileCount: 1 } })
        // Set permissions and file types for this FileRoute
        .middleware(async ({ files }) => {
            // This code runs on your server before upload
            const user = await auth();

            // If you throw, the user will not be able to upload
            if (!user) throw new UploadThingError("Unauthorized");

            // Generate custom filenames for uploaded files
            const fileOverrides = files.map((file) => ({
                name: generateReadableFilename(file.name),
            }));

            // Whatever is returned here is accessible in onUploadComplete as `metadata`
            return { userId: user.id, [UTFiles]: fileOverrides };
        })
        .onUploadComplete(async ({ metadata, file }) => {
            // This code RUNS ON YOUR SERVER after upload
            // The file.name now contains our custom readable filename

            // Log to server logs only in development
            if (process.env.NODE_ENV === 'development') {
                console.log("Upload complete for userId:", metadata.userId);
                console.log("Custom filename:", file.name);
                console.log("Unique file key:", file.key);
                console.log("file url", file.url);
            }

            // !!! Whatever is returned here is sent to the clientside `onClientUploadComplete` callback
            return { uploadedBy: metadata.userId, url: file.url, key: file.key, fileName: file.name };
        }),

    // Multiple image uploader for gallery
    galleryUploader: f({ image: { maxFileSize: "4MB", maxFileCount: 10 } })
        .middleware(async ({ files }) => {
            const user = await auth();
            if (!user) throw new UploadThingError("Unauthorized");

            // Generate custom filenames for all uploaded files
            const fileOverrides = files.map((file) => ({
                name: generateReadableFilename(file.name),
            }));

            return { userId: user.id, [UTFiles]: fileOverrides };
        })
        .onUploadComplete(async ({ metadata, file }) => {
            if (process.env.NODE_ENV === 'development') {
                console.log("Gallery upload complete for userId:", metadata.userId);
                console.log("Custom filename:", file.name);
                console.log("Unique file key:", file.key);
            }
            return { uploadedBy: metadata.userId, url: file.url, key: file.key, fileName: file.name };
        }),

    // Certificate PDF uploader
    certificateUploader: f({ pdf: { maxFileSize: "8MB", maxFileCount: 1 } })
        .middleware(async ({ files }) => {
            const user = await auth();
            if (!user) throw new UploadThingError("Unauthorized");

            // Generate custom filenames for uploaded certificate
            const fileOverrides = files.map((file) => ({
                name: generateReadableFilename(file.name),
            }));

            return { userId: user.id, [UTFiles]: fileOverrides };
        })
        .onUploadComplete(async ({ metadata, file }) => {
            if (process.env.NODE_ENV === 'development') {
                console.log("Certificate upload complete for userId:", metadata.userId);
                console.log("Custom filename:", file.name);
                console.log("Unique file key:", file.key);
            }
            return { uploadedBy: metadata.userId, url: file.url, key: file.key, fileName: file.name };
        }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
