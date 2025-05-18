import { httpServer } from "./src/http_server";
import { startWssServer } from "./src/wss_server";
import { handleError } from "./src/services/handleError";

const HTTP_PORT = 8181;
const WSS_PORT = 3000;

console.log(`Start static http server on the ${HTTP_PORT} port!`);
httpServer.listen(HTTP_PORT);
const wss = startWssServer(WSS_PORT);

process.on("SIGINT", async () => {
  console.log("Process was terminated");
  await handleError("Server was terminated");
  httpServer.close(() => {
    console.log("HTTP server closed");
    wss.close(() => {
      console.log("WebSocket server closed");
      process.exit(0);
    });
  });
});
