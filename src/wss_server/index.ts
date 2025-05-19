import { WebSocketServer } from "ws";
import { handleError } from "../services/handleError";
import { clients } from "./clients";
import { styleText } from "node:util";
import { Message, messTypes, WsWithId } from "../types";
import { regHandler } from "../handlers/reg.handler";
import { UserType } from "../data/users";
import { addToRoom, createRoom } from "../handlers/room.handler";

export const startWssServer = (port: number) => {
  const wss = new WebSocketServer({ port });
  wss.on("listening", () => {
    console.log(`WebSocket server is listening on port ${port}`);
  });
  wss.on("error", async (err) => {
    await handleError(err instanceof Error ? err.message : "Unknown error");
  });

  wss.on("connection", (ws: WsWithId, req) => {
    console.log(`Ws Server is connected on ${req.headers.host}`);
    clients.push(ws);
    ws.on("message", async (mess) => {
      const command = JSON.parse(mess.toString()) as Message;
      console.log(styleText("blue", "incomming <-- ") + command.type);
      console.log("ID ", ws.id);

      switch (command.type) {
        case messTypes.REG:
          regHandler(
            JSON.parse(command.data) as Pick<UserType, "name" | "password">,
            ws
          );
          break;
        case messTypes.CREATE_ROOM:
          createRoom(ws);
          break;
        case messTypes.ADD_TO_ROOM:
          addToRoom(
            ws,
            (JSON.parse(command.data) as { indexRoom: number }).indexRoom
          );
          break;
      }
    });
    ws.on("close", () => {
      console.log(`Client ${ws.id} disconnected`);
      const clientId = clients.findIndex(({ id }) => id === ws.id);
      clients.splice(clientId, 1);
    });
    ws.on("error", (err) => {
      console.log("Client error", err);
      ws.close();
    });
  });

  return wss;
};
