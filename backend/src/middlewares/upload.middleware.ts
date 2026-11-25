import type { RequestHandler } from "express";
import multer from "multer";
import { ALLOWED_IMAGE_TYPES, IMAGE_MAX_BYTES } from "@/constants/media.constants";
import { AppError } from "@/utils/app-error";

const allowedTypes: ReadonlySet<string> = new Set(ALLOWED_IMAGE_TYPES);

const uploader = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: IMAGE_MAX_BYTES, files: 1 },
  fileFilter: (_req, file, callback) => {
    if (!allowedTypes.has(file.mimetype)) {
      callback(AppError.unsupportedImage());
      return;
    }
    callback(null, true);
  },
}).single("image");

export const uploadSingleImage: RequestHandler = (req, res, next) => {
  uploader(req, res, (error: unknown) => {
    if (!error) {
      next();
      return;
    }
    if (error instanceof multer.MulterError && error.code === "LIMIT_FILE_SIZE") {
      next(AppError.imageTooLarge());
      return;
    }
    if (error instanceof AppError) {
      next(error);
      return;
    }
    next(AppError.unsupportedImage());
  });
};
