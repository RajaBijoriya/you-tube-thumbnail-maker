const express = require("express");
const path = require("path");
const fs = require("fs-extra");
const { v4: uuidv4 } = require("uuid");

const geminiImageService = require("../services/gemini-image");

const router = express.Router();

// Generate thumbnails
router.post("/", async (req, res) => {
  try {
    const {
      fileId,
      videoType,
      style,
      mood,
      photoPlacement,
      formats = ["horizontal"],
      generateCount = 1,
    } = req.body;

    if (!fileId || !videoType || !style || !mood || !photoPlacement) {
      return res.status(400).json({
        error: "Missing required fields",
        required: ["fileId", "videoType", "style", "mood", "photoPlacement"],
      });
    }

    // Find the uploaded file
    const uploadPath = path.join(__dirname, "../uploads");
    const files = await fs.readdir(uploadPath);
    const userFile = files.find((f) => f.startsWith(fileId));

    if (!userFile) {
      return res.status(404).json({ error: "Uploaded file not found" });
    }

    const userImagePath = path.join(uploadPath, userFile);

    // Generate simple prompt
    const prompt = `${videoType} video thumbnail, ${style} style`;

    // Generate single thumbnail using Gemini
    console.log("🎨 Generating thumbnail with Gemini...");
    const result = await geminiImageService.generateThumbnail(prompt, userImagePath, "horizontal");

    const thumbnails = [{
      id: result.filePath.split('_')[0],
      format: formats[0],
      filePath: result.filePath,
      url: `/uploads/${result.filePath}`,
      prompt
    }];

    // Create session data
    const sessionId = uuidv4();
    const sessionData = {
      sessionId,
      originalFile: {
        id: fileId,
        filename: userFile,
        url: `/uploads/${userFile}`,
      },
      userInput: {
        videoType,
        style,
        mood,
        photoPlacement,
        formats,
        generateCount,
      },
      enhancedPrompt: enhancedPromptData,
      promptVariations,
      thumbnails,
      generatedAt: new Date().toISOString(),
    };

    // Save session data (in a real app, you'd use a database)
    const sessionPath = path.join(__dirname, "../uploads", `${sessionId}.json`);
    await fs.writeJson(sessionPath, sessionData);

    res.json({
      success: true,
      message: "Thumbnails generated successfully",
      sessionId,
      thumbnails: thumbnails.map((t) => ({
        id: t.id,
        format: t.format,
        dimensions: t.dimensions,
        url: t.url,
        prompt: t.prompt,
      })),
      enhancedPrompt: enhancedPromptData,
      promptVariations,
    });
  } catch (error) {
    console.error("Generation error:", error);
    res.status(500).json({
      error: "Failed to generate thumbnails",
      message: error.message,
    });
  }
});

// Regenerate thumbnails with different prompts
router.post("/regenerate", async (req, res) => {
  try {
    const { sessionId, newPrompts } = req.body;

    if (!sessionId) {
      return res.status(400).json({ error: "Session ID is required" });
    }

    // Load session data
    const sessionPath = path.join(__dirname, "../uploads", `${sessionId}.json`);

    if (!(await fs.pathExists(sessionPath))) {
      return res.status(404).json({ error: "Session not found" });
    }

    const sessionData = await fs.readJson(sessionPath);
    const userImagePath = path.join(
      __dirname,
      "../uploads",
      sessionData.originalFile.filename
    );

    // Generate new thumbnails
    const newThumbnails = await deepAIImageService.generateMultipleThumbnails(
      newPrompts || sessionData.promptVariations,
      userImagePath,
      sessionData.userInput.formats
    );

    // Update session data
    sessionData.thumbnails = [...sessionData.thumbnails, ...newThumbnails];
    sessionData.regeneratedAt = new Date().toISOString();

    await fs.writeJson(sessionPath, sessionData);

    res.json({
      success: true,
      message: "Thumbnails regenerated successfully",
      newThumbnails: newThumbnails.map((t) => ({
        id: t.id,
        format: t.format,
        dimensions: t.dimensions,
        url: t.url,
        prompt: t.prompt,
      })),
    });
  } catch (error) {
    console.error("Regeneration error:", error);
    res.status(500).json({
      error: "Failed to regenerate thumbnails",
      message: error.message,
    });
  }
});

// Edit specific thumbnail
router.post("/edit/:thumbnailId", async (req, res) => {
  try {
    const { thumbnailId } = req.params;
    const { editPrompt } = req.body;

    if (!editPrompt) {
      return res.status(400).json({ error: "Edit prompt is required" });
    }

    // Find the thumbnail file
    const uploadPath = path.join(__dirname, "../uploads");
    const files = await fs.readdir(uploadPath);
    const thumbnailFile = files.find((f) => f.startsWith(thumbnailId));

    if (!thumbnailFile) {
      return res.status(404).json({ error: "Thumbnail not found" });
    }

    const thumbnailPath = path.join(uploadPath, thumbnailFile);

    // Edit the thumbnail
    const editedThumbnail = await deepAIImageService.editThumbnail(
      thumbnailPath,
      editPrompt
    );

    res.json({
      success: true,
      message: "Thumbnail edited successfully",
      thumbnail: {
        id: editedThumbnail.id,
        url: editedThumbnail.url,
        editedAt: editedThumbnail.editedAt,
      },
    });
  } catch (error) {
    console.error("Edit error:", error);
    res.status(500).json({
      error: "Failed to edit thumbnail",
      message: error.message,
    });
  }
});

// Get session data
router.get("/session/:sessionId", async (req, res) => {
  try {
    const { sessionId } = req.params;
    const sessionPath = path.join(__dirname, "../uploads", `${sessionId}.json`);

    if (!(await fs.pathExists(sessionPath))) {
      return res.status(404).json({ error: "Session not found" });
    }

    const sessionData = await fs.readJson(sessionPath);

    res.json({
      success: true,
      session: {
        sessionId,
        originalFile: sessionData.originalFile,
        userInput: sessionData.userInput,
        thumbnails: sessionData.thumbnails,
        generatedAt: sessionData.generatedAt,
      },
    });
  } catch (error) {
    console.error("Get session error:", error);
    res.status(500).json({
      error: "Failed to get session data",
      message: error.message,
    });
  }
});

// Analyze thumbnail quality
router.post("/analyze/:thumbnailId", async (req, res) => {
  try {
    const { thumbnailId } = req.params;

    // Find the thumbnail file
    const uploadPath = path.join(__dirname, "../uploads");
    const files = await fs.readdir(uploadPath);
    const thumbnailFile = files.find((f) => f.startsWith(thumbnailId));

    if (!thumbnailFile) {
      return res.status(404).json({ error: "Thumbnail not found" });
    }

    const thumbnailPath = path.join(uploadPath, thumbnailFile);

    // Analyze the thumbnail
    const analysis = await deepAIImageService.analyzeImage(thumbnailPath);

    res.json({
      success: true,
      analysis,
      thumbnailId,
    });
  } catch (error) {
    console.error("Analysis error:", error);
    res.status(500).json({
      error: "Failed to analyze thumbnail",
      message: error.message,
    });
  }
});

module.exports = router;
