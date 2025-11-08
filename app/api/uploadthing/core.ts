import { createUploadthing, type FileRouter } from "uploadthing/next";
import { auth } from "@/app/api/auth/[...nextauth]/route";

const f = createUploadthing();

export const ourFileRouter = {
  imageUploader: f({ image: { maxFileSize: "4MB", maxFileCount: 10 } })
    .middleware(async ({ req }) => {
      try {
        // Use the new auth() helper from NextAuth v5
        const session = await auth();
        
        if (!session || !session.user) {
          console.error("UploadThing: No session found");
          throw new Error("Unauthorized - Please sign in");
        }
        
        console.log("UploadThing: Authorized user:", session.user.id);
        return { userId: session.user.id };
      } catch (error) {
        console.error("UploadThing middleware error:", error);
        throw new Error("Unauthorized - Please sign in to upload images");
      }
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Upload complete for userId:", metadata?.userId);
      console.log("File URL:", file.url);
      return { uploadedBy: metadata?.userId };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;

