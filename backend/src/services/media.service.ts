import { v2 as cloudinary, type TransformationOptions } from "cloudinary";
import { env } from "@/config/env";
import { IMAGE_URL_MAX_LENGTH } from "@/constants/media.constants";
import { AppError } from "@/utils/app-error";

cloudinary.config({
  cloud_name: env.cloudinary.cloudName,
  api_key: env.cloudinary.apiKey,
  api_secret: env.cloudinary.apiSecret,
  secure: true,
});

const AVATAR_TRANSFORMATION: TransformationOptions = {
  width: 512,
  height: 512,
  crop: "fill",
  gravity: "auto",
  fetch_format: "auto",
  quality: "auto",
};

const POST_TRANSFORMATION: TransformationOptions = {
  width: 1600,
  height: 1600,
  crop: "limit",
  fetch_format: "auto",
  quality: "auto",
};

const upload = (buffer: Buffer, folder: string, transformation: TransformationOptions): Promise<string> =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: "image", unique_filename: true, transformation },
      (error, result) => {
        if (error || !result?.secure_url) {
          reject(AppError.imageUploadFailed());
          return;
        }
        if (result.secure_url.length > IMAGE_URL_MAX_LENGTH) {
          void cloudinary.uploader.destroy(result.public_id);
          reject(AppError.imageUploadFailed());
          return;
        }
        resolve(result.secure_url);
      },
    );
    stream.end(buffer);
  });

export const mediaService = {
  uploadAvatar(file: Buffer): Promise<string> {
    return upload(file, "kircle/avatars", AVATAR_TRANSFORMATION);
  },

  uploadPostImage(file: Buffer): Promise<string> {
    return upload(file, "kircle/posts", POST_TRANSFORMATION);
  },
};
