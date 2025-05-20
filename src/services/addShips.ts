import { GameBoard, PlayerId, ShipType } from "../data/games";
import { sendStartGameMess, sendTurnMess } from "../messages";

export const shipsAdd = (game: GameBoard, data: string) => {
  const { indexPlayer, ships } = JSON.parse(data) as {
    ships: ShipType[];
    indexPlayer: PlayerId;
  };

  game.addShips(indexPlayer, ships);
  if (Array.from(game.players.values()).every((player) => player.ready)) {
    // start the game
    game.players.forEach((player, id) => {
      sendStartGameMess(player.ws, player.ships, id);
    });

    // send shot order
    game.players.forEach(({ ws }) => {
      sendTurnMess(ws, game.currentTurn!);
    });
  }
};
