// import dotenv from "dotenv";
// dotenv.config();
import "dotenv/config";

import multer from "multer";
import cloudinary from "../../config/cloudinary.js";


class CloudinaryCustomStorage {
  constructor(opts) {
    this.getFolder = opts.getFolder;
    this.getType = opts.getType;
  }

  _handleFile(req, file, cb) {
    // console.log("===== CLOUDINARY UPLOAD START =====");
    // console.log("Original name:", file.originalname);
    // console.log("Mimetype:", file.mimetype);

    const isVideo = file.mimetype.startsWith("video");
    const folder = this.getFolder(req, file);
    // console.log("Upload folder:", folder);

    const resource_type = isVideo ? "video" : "auto";

    // console.log("Folder:", folder);
    // console.log("Resource type:", resource_type);

    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type,
        // type: this.getType ? this.getType(req, file) : "upload"
      },
      (error, result) => {
        if (error) {
          console.error("Cloudinary upload error:", error);
          return cb(error);
        }

        // console.log("===== CLOUDINARY SUCCESS =====");
        // console.log("URL:", result.secure_url);
        // console.log("Public ID:", result.public_id);
        // Expose the uploaded URL to file.path so controllers don't need changes
        cb(null, {
          path: result.secure_url,
          filename: result.public_id,
          size: result.bytes,
          mimetype: file.mimetype
        });
      }
    );

    stream.on("error", (err) => {
      // console.error("===== CLOUDINARY STREAM ERROR =====");
      // console.error(err);
      cb(err);
    });
    file.stream.pipe(stream);
  }

  _removeFile(req, file, cb) {
    if (file.filename) {
      cloudinary.uploader.destroy(file.filename, cb);
    } else {
      cb(null);
    }
  }
}


const fileFilter = (req, file, cb) => {
  const allowed = ["image/", "video/", "application/pdf"];
  if (!allowed.some(type => file.mimetype.startsWith(type))) {
    return cb(new Error("Unsupported file type"), false);
  }
  cb(null, true);
};


// PUBLIC UPLOAD (Memories, Avatars, Storage)
// Folder: legacytrunk/imagefolder or legacytrunk/videofolder
const publicStorage = new CloudinaryCustomStorage({
  getFolder: (req, file) => {
    return file.mimetype.startsWith("video") ? "legacytrunk/videofolder" : "legacytrunk/imagefolder";
  }
});

export const upload = multer({
  storage: publicStorage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

// ==========================================
// PRIVATE UPLOAD (Vault files)
// Folder: legacytrunk/vaults/{userId}
// ==========================================
const vaultStorage = new CloudinaryCustomStorage({
  getFolder: (req, file) => `legacytrunk/vaults/${req.user._id}`,
  getType: () => "private"
});

export const uploadVault = multer({
  storage: vaultStorage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});