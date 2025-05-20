import type { WebSocket } from "ws";
import { sendToAll } from "../messages";
import { clients } from "../wss_server/clients";

export const handleError = async (reason: string) => {
  await sendToAll(JSON.stringify({ type: "error", reason }));
  clients.forEach((ws) => {
    ws.close();
  });
};

export const sendErrorMessage = (ws: WebSocket, reason: string) => {
  ws.send(JSON.stringify({ type: "error", reason }));
};
