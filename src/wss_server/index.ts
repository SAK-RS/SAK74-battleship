import { WebSocketServer } from "ws";
import { randomUUID } from "node:crypto";
import { handleError } from "../services/handleError";
import clients from "./clients";

export const startWssServer = (port: number) => {
  const wss = new WebSocketServer({ port });
  wss.on("listening", () => {
    console.log(`WebSocket server is listening on port ${port}`);
  });
  wss.on("error", async (err) => {
    await handleError(err instanceof Error ? err.message : "Unknown error");
  });

  wss.on("connection", (ws, req) => {
    console.log(`Ws Server is connected on ${req.headers.host}`);
    const id = randomUUID();
    console.log("Client ID: ", id);
    clients.set(id, ws);
    ws.on("message", (mess) => {
      console.log(id, mess.toString());
    });
    ws.on("close", () => {
      console.log(`Client ${id} disconnected`);
      clients.delete(id);
    });
    ws.on("error", (err) => {
      console.log("Client error", err);
      ws.close();
    });
  });

  return wss;
};
