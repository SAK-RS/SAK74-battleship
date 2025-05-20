import type { WebSocket } from "ws";
import { Message, messTypes } from "../types";

import { GameBoard } from "../data/games";
import { shipsAdd } from "../services/addShips";

export function gameHandler(game: GameBoard, mess: WebSocket.RawData) {
  const command = JSON.parse(mess.toString()) as Message;
  switch (command.type) {
    case messTypes.SHIPS_ADD:
      shipsAdd(game, command.data);
      break;
    case messTypes.ATTACK:
      const { x, y } = JSON.parse(command.data) as { x: number; y: number };
      game.attack(x, y);
      break;
    case messTypes.RANDOM_ATTACK:
      game.randomAttack();
      break;
  }
}
