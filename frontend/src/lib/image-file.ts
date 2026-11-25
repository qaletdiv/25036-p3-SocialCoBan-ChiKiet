export const IMAGE_MAX_BYTES = 5 * 1024 * 1024;
export const IMAGE_ACCEPT = "image/jpeg,image/png,image/webp,image/gif";

const IMAGE_TYPES = new Set(IMAGE_ACCEPT.split(","));

export const validateImageFile = (file: File): string | null => {
  if (!IMAGE_TYPES.has(file.type)) return "Ảnh không đúng định dạng. Chỉ nhận JPG, PNG, WEBP hoặc GIF.";
  if (file.size > IMAGE_MAX_BYTES) return "Ảnh không được lớn hơn 5 MB.";
  return null;
};
