import { createHash, randomBytes } from "node:crypto";

export const generateToken = (): string => randomBytes(32).toString("hex");

export const hashToken = (token: string): string => createHash("sha256").update(token).digest("hex");

export const minutesFromNow = (minutes: number): Date => new Date(Date.now() + minutes * 60 * 1000);
