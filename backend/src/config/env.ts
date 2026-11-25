import "dotenv/config";

const requireEnv = (key: string): string => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
};

const toNumber = (key: string, fallback: number): number => {
  const raw = process.env[key];
  if (!raw) return fallback;
  const parsed = Number(raw);
  if (Number.isNaN(parsed)) {
    throw new Error(`Environment variable ${key} must be a number`);
  }
  return parsed;
};

export const env = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  isProduction: process.env.NODE_ENV === "production",
  port: toNumber("PORT", 4000),
  db: {
    host: process.env.DB_HOST ?? "localhost",
    port: toNumber("DB_PORT", 3306),
    username: process.env.DB_USERNAME ?? "root",
    password: process.env.DB_PASSWORD ?? "",
    name: process.env.DB_NAME ?? "kircle",
  },
  jwt: {
    secret: requireEnv("JWT_SECRET"),
    expiresInSeconds: toNumber("JWT_EXPIRES_IN_SECONDS", 7 * 24 * 60 * 60),
  },
  email: {
    service: requireEnv("EMAIL_SERVICE"),
    user: requireEnv("EMAIL_USER"),
    password: requireEnv("EMAIL_PASSWORD"),
  },
  clientOrigin: process.env.CLIENT_ORIGIN ?? "http://localhost:3000",
  cloudinary: {
    cloudName: requireEnv("CLOUDINARY_CLOUD_NAME"),
    apiKey: requireEnv("CLOUDINARY_API_KEY"),
    apiSecret: requireEnv("CLOUDINARY_API_SECRET"),
  },
  google: {
    clientId: requireEnv("GOOGLE_CLIENT_ID"),
    clientSecret: requireEnv("GOOGLE_CLIENT_SECRET"),
    redirectUri: process.env.GOOGLE_REDIRECT_URI ?? "http://localhost:4000/api/auth/google/callback",
  },
} as const;
