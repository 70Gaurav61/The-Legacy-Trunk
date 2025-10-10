import dotenv from "dotenv";
dotenv.config(); // Load .env variables


import multer from "multer";
import multerS3 from "multer-s3";
import s3 from "../../config/aws.js";

const bucketName = process.env.S3_BUCKET_NAME;

const fileFilter = (req, file, cb) => {
  const allowed = ["image/", "video/", "application/pdf"];
  if (!allowed.some(type => file.mimetype.startsWith(type))) {
    return cb(new Error("Unsupported file type"), false);
  }
  cb(null, true);
};

export const upload = multer({
  storage: multerS3({
    s3,
    bucket: bucketName,
    acl: "public-read", // files will be publicly readable
    metadata: (req, file, cb) => {
      cb(null, { fieldName: file.fieldname });
    },
    key: (req, file, cb) => {
      const filename = `${Date.now()}-${file.originalname}`;
      cb(null, filename);
    },
  }),
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});
