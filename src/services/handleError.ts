import clients from "../wss_server/clients";
import { sendToAll } from "./sendToAll";

export const handleError = async (reason: string) => {
  await sendToAll(JSON.stringify({ type: "error", reason }));
  clients.forEach((ws) => {
    ws.close();
  });
};
