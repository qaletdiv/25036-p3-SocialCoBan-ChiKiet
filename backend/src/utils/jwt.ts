import jwt from "jsonwebtoken";
import { env } from "@/config/env";
import { SESSION_REVOCATION_TTL_SECONDS } from "@/constants/auth.constants";

const SESSION_REVOCATION_TYPE = "session-revocation";

interface DecodedPayload {
  sub: string;
  iat: number;
  typ?: string;
}

const decode = (token: string): DecodedPayload => {
  const decoded = jwt.verify(token, env.jwt.secret);
  if (typeof decoded === "string" || typeof decoded.sub !== "string" || typeof decoded.iat !== "number") {
    throw new Error("Invalid token payload");
  }
  return { sub: decoded.sub, iat: decoded.iat, typ: typeof decoded.typ === "string" ? decoded.typ : undefined };
};

export const signAccessToken = (userId: string): string =>
  jwt.sign({}, env.jwt.secret, { subject: userId, expiresIn: env.jwt.expiresInSeconds });

export const verifyAccessToken = (token: string): { userId: string; issuedAt: number } => {
  const payload = decode(token);
  if (payload.typ) throw new Error("Not an access token");
  return { userId: payload.sub, issuedAt: payload.iat };
};

export const signSessionRevocationToken = (userId: string): string =>
  jwt.sign({ typ: SESSION_REVOCATION_TYPE }, env.jwt.secret, {
    subject: userId,
    expiresIn: SESSION_REVOCATION_TTL_SECONDS,
  });

export const verifySessionRevocationToken = (token: string): string => {
  const payload = decode(token);
  if (payload.typ !== SESSION_REVOCATION_TYPE) throw new Error("Not a session revocation token");
  return payload.sub;
};
