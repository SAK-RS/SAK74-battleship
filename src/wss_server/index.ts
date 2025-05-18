import { WebSocketServer } from "ws";
import { randomUUID } from "node:crypto";
import { handleError } from "../services/handleError";
import clients from "./clients";
import { styleText } from "node:util";
import { Message, messTypes } from "../types";
import { regHandler } from "../handlers/reg.handler";
import { UserType } from "../data/users";

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
    ws.on("message", async (mess) => {
      const command = JSON.parse(mess.toString()) as Message;
      console.log(styleText("blue", "incomming <-- ") + command.type);
      // console.log("Command: ", command);

      switch (command.type) {
        case messTypes.REG:
          await regHandler(
            JSON.parse(command.data) as Pick<UserType, "name" | "password">,
            ws
            // id
          );
          break;
      }
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
