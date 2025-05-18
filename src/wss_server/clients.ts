import { UUID } from "crypto";
import { WebSocket } from "ws";

const clients = new Map<UUID, WebSocket>();
export default clients;
