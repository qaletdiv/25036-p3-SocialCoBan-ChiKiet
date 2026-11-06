import type { Server as HttpServer } from "node:http";
import { Server } from "socket.io";
import { env } from "@/config/env";
import { AUTH_COOKIE_NAME } from "@/constants/auth.constants";
import { TYPING_EVENT_MIN_INTERVAL_MS } from "@/constants/message.constants";
import { authService } from "@/services/auth.service";
import type { ClientToServerEvents, ServerToClientEvents, SocketData, TypingPayload } from "@/types/chat.types";

type ChatServer = Server<ClientToServerEvents, ServerToClientEvents, Record<string, never>, SocketData>;

export interface RealtimeHandlers {
  onTyping: (userId: string, payload: TypingPayload) => Promise<void>;
}

let io: ChatServer | null = null;

const userRoom = (userId: string): string => `user:${userId}`;

const readCookie = (header: string | undefined, name: string): string | null => {
  if (!header) return null;
  for (const part of header.split(";")) {
    const separator = part.indexOf("=");
    if (separator > 0 && part.slice(0, separator).trim() === name) {
      return decodeURIComponent(part.slice(separator + 1).trim());
    }
  }
  return null;
};

const isTypingPayload = (value: unknown): value is TypingPayload => {
  if (typeof value !== "object" || value === null) return false;
  const { conversationId, isTyping } = value as Record<string, unknown>;
  return typeof conversationId === "string" && /^\d{1,20}$/.test(conversationId) && typeof isTyping === "boolean";
};

export const realtimeGateway = {
  init(httpServer: HttpServer, handlers: RealtimeHandlers): void {
    io = new Server(httpServer, {
      cors: { origin: env.clientOrigin, credentials: true },
      // Cookie auth must not be usable from other origins
      allowRequest: (req, callback) => callback(null, req.headers.origin === env.clientOrigin),
    });

    io.use(async (socket, next) => {
      const token = readCookie(socket.handshake.headers.cookie, AUTH_COOKIE_NAME);
      if (!token) {
        next(new Error("Authentication required"));
        return;
      }

      try {
        socket.data.userId = await authService.authenticate(token);
        socket.data.lastTypingAt = 0;
        next();
      } catch {
        next(new Error("Authentication required"));
      }
    });

    io.on("connection", (socket) => {
      void socket.join(userRoom(socket.data.userId));

      socket.on("typing", (payload: unknown) => {
        const now = Date.now();
        if (!isTypingPayload(payload) || now - socket.data.lastTypingAt < TYPING_EVENT_MIN_INTERVAL_MS) return;

        socket.data.lastTypingAt = now;
        handlers.onTyping(socket.data.userId, payload).catch(() => undefined);
      });
    });
  },

  emitToUser<Event extends keyof ServerToClientEvents>(
    userId: string,
    event: Event,
    ...payload: Parameters<ServerToClientEvents[Event]>
  ): void {
    io?.to(userRoom(userId)).emit(event, ...payload);
  },

  disconnectUser(userId: string): void {
    io?.in(userRoom(userId)).disconnectSockets(true);
  },
};
