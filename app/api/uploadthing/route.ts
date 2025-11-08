import { createRouteHandler } from "uploadthing/next";

import { ourFileRouter } from "./core";

// UploadThing automatically reads UPLOADTHING_TOKEN from environment variables
// Make sure you have UPLOADTHING_TOKEN in your .env file
export const { GET, POST } = createRouteHandler({
  router: ourFileRouter,
});

