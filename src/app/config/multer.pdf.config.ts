import multer from "multer";
import path from "path";
import fs from "fs";

// Ensure upload folder exists
const uploadDir = path.join(process.cwd(), "upload");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueName =
      Math.random().toString(36).substring(2) +
      "-" +
      Date.now() +
      "-" +
      file.originalname.toLowerCase().replace(/\s+/g, "-");
    cb(null, uniqueName);
  },
});

export const pdfUpload = multer({ storage });
