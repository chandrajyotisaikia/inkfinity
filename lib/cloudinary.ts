import { v2 as cloudinary } from "cloudinary";

const CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;
const API_KEY = process.env.CLOUDINARY_API_KEY;
const API_SECRET = process.env.CLOUDINARY_API_SECRET;

export function assertCloudinaryConfigured() {
  const missing = [];
  if (!CLOUD_NAME) missing.push("CLOUDINARY_CLOUD_NAME");
  if (!API_KEY) missing.push("CLOUDINARY_API_KEY");
  if (!API_SECRET) missing.push("CLOUDINARY_API_SECRET");

  if (missing.length > 0) {
    throw new Error(
      Cloudinary is not configured. Missing environment variable(s): ${missing.join(", ")}
    );
  }
}

cloudinary.config({
  cloud_name: CLOUD_NAME,
  api_key: API_KEY,
  api_secret: API_SECRET,
});

export default cloudinary;
