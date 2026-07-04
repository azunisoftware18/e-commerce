import multer from "multer";
import path from "path";
import fs from "fs";

const uploadsDir = process.env.UPLOAD_DIR || "public/uploads";

// create folders
const pdfDir = path.join(uploadsDir, "pdfs");
const thumbDir = path.join(uploadsDir, "thumbnails");
const imageDir = path.join(uploadsDir, "images");

[pdfDir, thumbDir, imageDir].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
  if (file.fieldname === "pdf") {
    cb(null, pdfDir);
  } else if (
  file.fieldname === "frontImage" ||
  file.fieldname === "backImage" ||
  file.fieldname === "leftImage" ||
  file.fieldname === "rightImage"
) {
  cb(null, imageDir);
} else if (
    file.fieldname === "thumbnail" ||
    file.fieldname === "image"
  ) {
    cb(null, thumbDir); // optional (agar thumbnail alag chahiye)
  } else {
    return cb(new Error("Invalid field"), null);
  }
},
  filename: function (req, file, cb) {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + "-" + unique + ext);
  },
});

const fileFilter = (req, file, cb) => {
  if (file.fieldname === "pdf") {
    if (file.mimetype === "application/pdf") {
      return cb(null, true);
    }
    return cb(new Error("Only PDF allowed"));
  }

  if (
  file.fieldname === "thumbnail" ||
  file.fieldname === "image" ||
  file.fieldname === "frontImage" ||
  file.fieldname === "backImage" ||
  file.fieldname === "leftImage" ||
  file.fieldname === "rightImage"
) {
    if (file.mimetype.startsWith("image/")) {
      return cb(null, true);
    }
    return cb(new Error("Only image allowed"));
  }

  return cb(new Error("Invalid field"));
};

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter,
});

export default upload;