"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.pdfUpload = void 0;
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
// Ensure upload folder exists
const uploadDir = path_1.default.join(process.cwd(), "upload");
if (!fs_1.default.existsSync(uploadDir)) {
    fs_1.default.mkdirSync(uploadDir, { recursive: true });
}
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const ext = path_1.default.extname(file.originalname);
        const uniqueName = Math.random().toString(36).substring(2) +
            "-" +
            Date.now() +
            "-" +
            file.originalname.toLowerCase().replace(/\s+/g, "-");
        cb(null, uniqueName);
    },
});
exports.pdfUpload = (0, multer_1.default)({ storage });
