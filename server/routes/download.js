const express = require("express");
const path = require("path");
const fs = require("fs-extra");
const archiver = require("archiver");

const router = express.Router();

// Download individual thumbnail
router.get("/:thumbnailId", async (req, res) => {
  try {
    const { thumbnailId } = req.params;
    const uploadPath = path.join(__dirname, "../uploads");

    // Find the thumbnail file
    const files = await fs.readdir(uploadPath);
    const thumbnailFile = files.find((f) => f.startsWith(thumbnailId));

    if (!thumbnailFile) {
      return res.status(404).json({ error: "Thumbnail not found" });
    }

    const thumbnailPath = path.join(uploadPath, thumbnailFile);

    // Check if file exists
    if (!(await fs.pathExists(thumbnailPath))) {
      return res.status(404).json({ error: "Thumbnail file not found" });
    }

    // Set headers for download
    res.setHeader("Content-Type", "image/png");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${thumbnailFile}"`
    );

    // Stream the file
    const fileStream = fs.createReadStream(thumbnailPath);
    fileStream.pipe(res);
  } catch (error) {
    console.error("Download error:", error);
    res.status(500).json({
      error: "Failed to download thumbnail",
      message: error.message,
    });
  }
});

// Download all thumbnails as ZIP
router.get("/all/:sessionId", async (req, res) => {
  try {
    const { sessionId } = req.params;
    const uploadPath = path.join(__dirname, "../uploads");

    // Load session data
    const sessionPath = path.join(uploadPath, `${sessionId}.json`);

    if (!(await fs.pathExists(sessionPath))) {
      return res.status(404).json({ error: "Session not found" });
    }

    const sessionData = await fs.readJson(sessionPath);

    if (!sessionData.thumbnails || sessionData.thumbnails.length === 0) {
      return res.status(404).json({ error: "No thumbnails found in session" });
    }

    // Create ZIP file
    const zipFilename = `thumbnails_${sessionId}.zip`;
    const zipPath = path.join(uploadPath, zipFilename);

    const output = fs.createWriteStream(zipPath);
    const archive = archiver("zip", {
      zlib: { level: 9 }, // Maximum compression
    });

    // Listen for archive events
    output.on("close", () => {
      console.log(`ZIP created: ${archive.pointer()} total bytes`);
    });

    archive.on("error", (err) => {
      throw err;
    });

    // Pipe archive data to the file
    archive.pipe(output);

    // Add thumbnails to ZIP
    for (const thumbnail of sessionData.thumbnails) {
      const thumbnailPath = path.join(uploadPath, thumbnail.filename);

      if (await fs.pathExists(thumbnailPath)) {
        const displayName = `${thumbnail.format}_${thumbnail.id}.png`;
        archive.file(thumbnailPath, { name: displayName });
      }
    }

    // Add session info as text file
    const sessionInfo = {
      sessionId: sessionData.sessionId,
      originalFile: sessionData.originalFile.filename,
      userInput: sessionData.userInput,
      generatedAt: sessionData.generatedAt,
      thumbnailCount: sessionData.thumbnails.length,
      thumbnails: sessionData.thumbnails.map((t) => ({
        id: t.id,
        format: t.format,
        dimensions: t.dimensions,
        filename: t.filename,
      })),
    };

    archive.append(JSON.stringify(sessionInfo, null, 2), {
      name: "session_info.json",
    });

    // Finalize the archive
    await archive.finalize();

    // Wait for the output stream to finish
    await new Promise((resolve, reject) => {
      output.on("close", resolve);
      output.on("error", reject);
    });

    // Set headers for ZIP download
    res.setHeader("Content-Type", "application/zip");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${zipFilename}"`
    );

    // Stream the ZIP file
    const zipStream = fs.createReadStream(zipPath);
    zipStream.pipe(res);

    // Clean up ZIP file after streaming
    zipStream.on("end", async () => {
      try {
        await fs.remove(zipPath);
      } catch (cleanupError) {
        console.error("Failed to cleanup ZIP file:", cleanupError);
      }
    });
  } catch (error) {
    console.error("ZIP download error:", error);
    res.status(500).json({
      error: "Failed to create ZIP file",
      message: error.message,
    });
  }
});

// Get thumbnail info
router.get("/info/:thumbnailId", async (req, res) => {
  try {
    const { thumbnailId } = req.params;
    const uploadPath = path.join(__dirname, "../uploads");

    const files = await fs.readdir(uploadPath);
    const thumbnailFile = files.find((f) => f.startsWith(thumbnailId));

    if (!thumbnailFile) {
      return res.status(404).json({ error: "Thumbnail not found" });
    }

    const thumbnailPath = path.join(uploadPath, thumbnailFile);
    const stats = await fs.stat(thumbnailPath);

    // Try to find session data for this thumbnail
    const sessionFiles = files.filter((f) => f.endsWith(".json"));
    let sessionInfo = null;

    for (const sessionFile of sessionFiles) {
      try {
        const sessionData = await fs.readJson(
          path.join(uploadPath, sessionFile)
        );
        const thumbnail = sessionData.thumbnails?.find(
          (t) => t.id === thumbnailId
        );
        if (thumbnail) {
          sessionInfo = {
            sessionId: sessionData.sessionId,
            userInput: sessionData.userInput,
            prompt: thumbnail.prompt,
          };
          break;
        }
      } catch (err) {
        // Continue searching other session files
      }
    }

    const thumbnailInfo = {
      id: thumbnailId,
      filename: thumbnailFile,
      size: stats.size,
      url: `/uploads/${thumbnailFile}`,
      createdAt: stats.birthtime.toISOString(),
      sessionInfo,
    };

    res.json({
      success: true,
      thumbnail: thumbnailInfo,
    });
  } catch (error) {
    console.error("Get thumbnail info error:", error);
    res.status(500).json({
      error: "Failed to get thumbnail info",
      message: error.message,
    });
  }
});

// Copy thumbnail URL to clipboard (returns URL for frontend to copy)
router.get("/copy/:thumbnailId", async (req, res) => {
  try {
    const { thumbnailId } = req.params;
    const uploadPath = path.join(__dirname, "../uploads");

    const files = await fs.readdir(uploadPath);
    const thumbnailFile = files.find((f) => f.startsWith(thumbnailId));

    if (!thumbnailFile) {
      return res.status(404).json({ error: "Thumbnail not found" });
    }

    const baseUrl = req.protocol + "://" + req.get("host");
    const thumbnailUrl = `${baseUrl}/uploads/${thumbnailFile}`;

    res.json({
      success: true,
      url: thumbnailUrl,
      message: "URL ready to copy to clipboard",
    });
  } catch (error) {
    console.error("Copy URL error:", error);
    res.status(500).json({
      error: "Failed to generate copy URL",
      message: error.message,
    });
  }
});

// Share thumbnail (creates a shareable link)
router.post("/share/:thumbnailId", async (req, res) => {
  try {
    const { thumbnailId } = req.params;
    const { shareType = "public" } = req.body;

    const uploadPath = path.join(__dirname, "../uploads");
    const files = await fs.readdir(uploadPath);
    const thumbnailFile = files.find((f) => f.startsWith(thumbnailId));

    if (!thumbnailFile) {
      return res.status(404).json({ error: "Thumbnail not found" });
    }

    const baseUrl = req.protocol + "://" + req.get("host");
    const shareUrl = `${baseUrl}/api/download/${thumbnailId}`;

    // In a real app, you might want to create a proper sharing system
    // with expiration dates, access controls, etc.

    res.json({
      success: true,
      shareUrl,
      shareType,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
      message: "Share link created successfully",
    });
  } catch (error) {
    console.error("Share error:", error);
    res.status(500).json({
      error: "Failed to create share link",
      message: error.message,
    });
  }
});

module.exports = router;
