import WebSocket from "ws";
import { WsWithId } from "../types";
import { randomUUID } from "node:crypto";

type PlayerType = {
  ships: ShipType[];
  ready: boolean;
  ws: WebSocket;
};

type ShipType = {
  position: {
    x: number;
    y: number;
  };
  direction: boolean;
  length: number;
  type: "small" | "medium" | "large" | "huge";
};

type GameId = string;

export class GameBoard {
  gameId: GameId;
  constructor(player1: WsWithId, player2: WsWithId) {
    this.gameId = randomUUID();
    this.players.push(
      { ready: false, ships: [], ws: player1 },
      { ready: false, ships: [], ws: player2 }
    );
  }
  players: PlayerType[] = [];

  // addPlayer(ws:WsWithId) {}
}
