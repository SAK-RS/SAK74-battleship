import { Message } from "../types";
import { styleText } from "node:util";
import clients from "../wss_server/clients";

export const sendToAll = (message: string) => {
  return new Promise<void>((res) => {
    clients.forEach((ws) => {
      if (ws.readyState === ws.OPEN) {
        ws.send(message);
        console.log(styleText("yellow", "--> "));
        console.log((JSON.parse(message) as Message).type);
      }
    });
    res();
  });
};
