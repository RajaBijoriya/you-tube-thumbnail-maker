const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs-extra");
const { v4: uuidv4 } = require("uuid");

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, "../uploads");
    fs.ensureDirSync(uploadPath);
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueId = uuidv4();
    const ext = path.extname(file.originalname);
    cb(null, `${uniqueId}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Invalid file type. Only JPEG, JPG, and PNG files are allowed."
      ),
      false
    );
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024, // 5MB limit
  },
});

// Handle file upload
router.post("/", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const fileInfo = {
      id: path.parse(req.file.filename).name,
      filename: req.file.filename,
      originalName: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      path: req.file.path,
      url: `/uploads/${req.file.filename}`,
      uploadedAt: new Date().toISOString(),
    };

    res.json({
      success: true,
      message: "File uploaded successfully",
      imageId: fileInfo.id,
      file: fileInfo,
    });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({
      error: "Upload failed",
      message: error.message,
    });
  }
});

// Get uploaded file info
router.get("/:fileId", async (req, res) => {
  try {
    const { fileId } = req.params;
    const uploadPath = path.join(__dirname, "../uploads");

    // Find file by ID (filename without extension)
    const files = await fs.readdir(uploadPath);
    const file = files.find((f) => f.startsWith(fileId));

    if (!file) {
      return res.status(404).json({ error: "File not found" });
    }

    const filePath = path.join(uploadPath, file);
    const stats = await fs.stat(filePath);

    const fileInfo = {
      id: fileId,
      filename: file,
      size: stats.size,
      url: `/uploads/${file}`,
      uploadedAt: stats.birthtime.toISOString(),
    };

    res.json({ file: fileInfo });
  } catch (error) {
    console.error("Get file error:", error);
    res.status(500).json({
      error: "Failed to get file info",
      message: error.message,
    });
  }
});

// Delete uploaded file
router.delete("/:fileId", async (req, res) => {
  try {
    const { fileId } = req.params;
    const uploadPath = path.join(__dirname, "../uploads");

    const files = await fs.readdir(uploadPath);
    const file = files.find((f) => f.startsWith(fileId));

    if (!file) {
      return res.status(404).json({ error: "File not found" });
    }

    const filePath = path.join(uploadPath, file);
    await fs.remove(filePath);

    res.json({
      success: true,
      message: "File deleted successfully",
    });
  } catch (error) {
    console.error("Delete file error:", error);
    res.status(500).json({
      error: "Failed to delete file",
      message: error.message,
    });
  }
});

module.exports = router;
