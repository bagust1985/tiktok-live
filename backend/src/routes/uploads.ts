import { Elysia } from "elysia";
import { existsSync, readFileSync } from "fs";
import { join } from "path";

export default new Elysia().get("/avatars/:filename", async ({ params, set }) => {
  try {
    const { filename } = params;

    // Prevent path traversal
    if (filename.includes("..") || filename.includes("/") || filename.includes("\\")) {
      set.status = 400;
      return {
        success: false,
        message: "Invalid filename",
      };
    }

    const filePath = join(process.cwd(), "public", "uploads", "avatars", filename);

    // Check if file exists
    if (!existsSync(filePath)) {
      set.status = 404;
      return {
        success: false,
        message: "File tidak ditemukan",
      };
    }

    // Read file
    const file = readFileSync(filePath);

    // Determine content type based on extension
    const extension = filename.split(".").pop()?.toLowerCase();
    let contentType = "image/jpeg"; // default
    if (extension === "png") contentType = "image/png";
    if (extension === "gif") contentType = "image/gif";
    if (extension === "webp") contentType = "image/webp";

    // Return file with proper headers
    return new Response(file, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error: any) {
    console.error("Serve file error:", error);
    set.status = 500;
    return {
      success: false,
      message: "Terjadi kesalahan",
    };
  }
});

