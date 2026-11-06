"use client";

import { useEffect, useState } from "react";
import { createChatSocket, type ChatSocket } from "@/lib/chat-socket";

// reconnectCount increases after every re-established connection so consumers can resync missed events
export const useChatSocket = () => {
  const [socket, setSocket] = useState<ChatSocket | null>(null);
  const [reconnectCount, setReconnectCount] = useState(0);

  useEffect(() => {
    const instance = createChatSocket();
    let hasConnected = false;

    instance.on("connect", () => {
      if (hasConnected) setReconnectCount((count) => count + 1);
      hasConnected = true;
    });
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSocket(instance);

    return () => {
      instance.disconnect();
      setSocket(null);
    };
  }, []);

  return { socket, reconnectCount };
};
