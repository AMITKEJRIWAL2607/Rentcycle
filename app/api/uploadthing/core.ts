import { createUploadthing, type FileRouter } from "uploadthing/next";
import { auth } from "@/app/api/auth/[...nextauth]/route";

const f = createUploadthing();

export const ourFileRouter = {
  imageUploader: f({ image: { maxFileSize: "4MB", maxFileCount: 10 } })
    .middleware(async ({ req }) => {
      try {
        // Use the new auth() helper from NextAuth v5
        // This only runs at runtime when an upload request is made, not during build
        const session = await auth();
        
        // In demo mode, use demo user if no session
        if (!session || !session.user) {
          try {
            const { getDemoUserId } = await import('@/lib/demo-user');
            const demoUserId = await getDemoUserId();
            console.log("UploadThing: Using demo user:", demoUserId);
            return { userId: demoUserId };
          } catch (demoError: any) {
            // If database connection fails, require authentication
            if (demoError?.code === 'P1001' || demoError?.message?.includes("Can't reach database")) {
              console.error("UploadThing: Database unavailable, requiring authentication:", demoError.message);
              throw new Error("Please sign in to upload images - database connection unavailable");
            }
            throw demoError;
          }
        }
        
        console.log("UploadThing: Authorized user:", session.user.id);
        return { userId: session.user.id };
      } catch (error: any) {
        console.error("UploadThing middleware error:", error);
        // If database connection error, require authentication instead of demo user
        if (error?.code === 'P1001' || error?.message?.includes("Can't reach database")) {
          throw new Error("Unauthorized - Please sign in to upload images");
        }
        // In demo mode, try to use demo user as fallback (only at runtime)
        try {
          const { getDemoUserId } = await import('@/lib/demo-user');
          const demoUserId = await getDemoUserId();
          return { userId: demoUserId };
        } catch (demoError: any) {
          // If demo user also fails due to database, require auth
          if (demoError?.code === 'P1001' || demoError?.message?.includes("Can't reach database")) {
            throw new Error("Unauthorized - Please sign in to upload images");
          }
          throw new Error("Unauthorized - Please sign in to upload images");
        }
      }
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Upload complete for userId:", metadata?.userId);
      console.log("File URL:", file.url);
      return { uploadedBy: metadata?.userId };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;

