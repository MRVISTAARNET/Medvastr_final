const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
]);

// NOTE: While we allow multiple formats for product images, 
// system banners (homepage, categories) MUST be uploaded as .jpg 
// to match the dynamic loading logic in the storefront.
const ALLOWED_EXT = new Set(["jpg", "jpeg", "png", "webp"]);

const MAX_BYTES = 5 * 1024 * 1024;

/** Returns an error message, or null if valid. */
export function validateImageUpload(file: File): string | null {
  if (!file || file.size === 0) return "Please select a file.";
  if (file.size > MAX_BYTES) return "Image must be 5MB or smaller.";

  const ext = file.name.split(".").pop()?.toLowerCase() || "";
  if (!ALLOWED_EXT.has(ext)) {
    return "Invalid extension. Please use JPG, JPEG, PNG, or WEBP (JPG preferred).";
  }
  if (!ALLOWED_TYPES.has(file.type)) {
    return "Invalid image file type.";
  }
  if (file.name.includes("..") || file.name.includes("/") || file.name.includes("\\")) {
    return "Invalid file name.";
  }
  return null;
}

export const MAX_UPLOAD_BYTES = MAX_BYTES;
