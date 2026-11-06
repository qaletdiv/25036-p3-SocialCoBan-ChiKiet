import "reflect-metadata";
import { createServer } from "node:http";
import { env } from "@/config/env";
import { AppDataSource } from "@/config/data-source";
import { createApp } from "@/app";
import { realtimeGateway } from "@/realtime/realtime.gateway";
import { conversationService } from "@/services/conversation.service";

const bootstrap = async (): Promise<void> => {
  await AppDataSource.initialize();
  console.log("Database connected");

  const httpServer = createServer(createApp());
  realtimeGateway.init(httpServer, {
    onTyping: (userId, payload) => conversationService.relayTyping(userId, payload),
  });

  httpServer.listen(env.port, () => {
    console.log(`API listening on http://localhost:${env.port}`);
  });
};

bootstrap().catch((error: unknown) => {
  console.error("Failed to start server", error);
  process.exit(1);
});
