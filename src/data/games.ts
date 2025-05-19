import { sendAttackMess, sendFinishGameMess, sendTurnMess } from "../messages";
import { WsWithId } from "../types";
import { randomUUID } from "node:crypto";
import usersData from "./users";
import { BOARD_SIZE } from "../_setup";

export type PlayerId = string;

type PlayerType = {
  ships: ShipType[];
  ready: boolean;
  ws: WsWithId;
  shots: { x: number; y: number }[];
};

export type ShipType = {
  position: {
    x: number;
    y: number;
  };
  direction: boolean;
  length: number;
  type: "small" | "medium" | "large" | "huge";
};

type GameId = string;

export type StatusType = "miss" | "killed" | "shot";

export class GameBoard {
  gameId: GameId;
  constructor(player1: WsWithId, player2: WsWithId) {
    this.gameId = randomUUID();
    const firstPlayerId = randomUUID();
    this.players.set(firstPlayerId, {
      ready: false,
      ships: [],
      ws: player1,
      shots: [],
    });
    this.players.set(randomUUID(), {
      ready: false,
      ships: [],
      ws: player2,
      shots: [],
    });
    this.currentTurn = firstPlayerId;
  }
  players: Map<PlayerId, PlayerType> = new Map();

  addShips(idx: PlayerId, ships: ShipType[]) {
    this.players.set(idx, {
      ...this.players.get(idx)!,
      ships,
      ready: true,
    });
  }

  currentTurn?: PlayerId;
  changeCurrentTurn() {
    const [id1, id2] = Array.from(this.players.keys());
    this.currentTurn = this.currentTurn === id1 ? id2 : id1;
    return this.currentTurn;
  }

  private getPlayers() {
    const [id1, id2] = Array.from(this.players.keys());

    return {
      active: this.players.get(this.currentTurn!)!,
      opposite: this.players.get(this.currentTurn === id1 ? id2 : id1)!,
    };
  }

  attack(x: number, y: number) {
    const { active, opposite } = this.getPlayers();
    if (active.shots.some((el) => el.x === x && el.y === y)) {
      return;
    }
    opposite.shots.push({ x, y });
    let status: StatusType = "miss";
    opposite.ships.forEach((ship, shipIdx) => {
      for (let piece = 0; piece < ship.length; piece += 1) {
        const pieceX = ship.position.x + (ship.direction ? 0 : piece);
        const pieceY = ship.position.y + (ship.direction ? piece : 0);
        if (pieceX === x && pieceY === y) {
          status = "shot";
          switch (ship.type) {
            case "huge":
              ship.type = "large";
              break;
            case "large":
              ship.type = "medium";
              break;
            case "medium":
              ship.type = "small";
              break;
            case "small":
              status = "killed";
              this.sendKilledStatusForShip(ship, shipIdx);
              return;
            default:
          }
          break;
        }
      }
    });
    // send attack mess
    if (status === "miss" || status === "shot") {
      this.players.forEach(({ ws }) => {
        sendAttackMess(ws, { x, y }, status, this.currentTurn!);
      });
      // sent turn mess
      if (status === "miss") {
        const currentPlayer = this.changeCurrentTurn();
        this.players.forEach(({ ws }) => {
          sendTurnMess(ws, currentPlayer);
        });
      }
    }
  }

  randomAttack() {
    let rndShot: { x: number; y: number };
    do {
      rndShot = getRandomShot();
    } while (
      this.players
        .get(this.currentTurn!)!
        .shots.some((el) => el.x === rndShot.x && el.y === rndShot.y)
    );
    this.attack(rndShot.x, rndShot.y);
  }

  private sendKilledStatusForShip(ship: ShipType, shipIdx: number) {
    for (let piece = 0; piece < ship.length; piece += 1) {
      const pieceX = ship.position.x + (ship.direction ? 0 : piece);
      const pieceY = ship.position.y + (ship.direction ? piece : 0);
      this.players.forEach(({ ws }) => {
        sendAttackMess(
          ws,
          { x: pieceX, y: pieceY },
          "killed",
          this.currentTurn!
        );
      });
    }
    // send status 'miss' for all around
    this.sendMissStatusAround(ship);
    const { opposite } = this.getPlayers();
    opposite.ships.splice(shipIdx, 1);
    if (!opposite.ships.length) {
      this.finishGame();
    }
  }

  private sendMissStatusAround(ship: ShipType) {
    const squares: { x: number; y: number }[] = [];
    function pushIfExist(x: number, y: number) {
      if (x >= 0 && y >= 0 && x < BOARD_SIZE && y < BOARD_SIZE) {
        squares.push({ x, y });
      }
    }
    let prevX = ship.position.x,
      prevY = ship.position.y;
    if (ship.direction) {
      for (let i = -1; i < 2; i += 1) {
        pushIfExist(prevX + i, prevY - 1);
        pushIfExist(prevX + i, prevY + ship.length);
      }
    } else {
      for (let i = -1; i < 2; i += 1) {
        pushIfExist(prevX - 1, prevY + i);
        pushIfExist(prevX + ship.length, prevY + i);
      }
    }
    for (let i = 0; i < ship.length; i += 1) {
      const posX = ship.direction ? prevX : prevX + i;
      const posY = ship.direction ? prevY + i : prevY;
      for (let i = -1; i < 2; i += 2) {
        ship.direction
          ? pushIfExist(posX + i, posY)
          : pushIfExist(posX, posY + i);
      }
    }
    squares.forEach(({ x, y }) => {
      const { active } = this.getPlayers();
      const shots = active.shots;
      if (!active.shots.some((el) => el.x === x && el.y === y)) {
        shots.push({ x, y });
      }
      this.players.forEach(({ ws }) => {
        sendAttackMess(ws, { x, y }, "miss", this.currentTurn!);
      });
    });
  }

  private finishGame() {
    this.players.forEach(({ ws }) => {
      sendFinishGameMess(ws, this.currentTurn!);
    });
    usersData.updateWinner(this.currentTurn!);
    // games = games.filter((g) => g.gameId !== this.gameId);
  }
}

const getRandomShot = () => ({
  x: Math.round(Math.random() * (BOARD_SIZE - 1)),
  y: Math.round(Math.random() * (BOARD_SIZE - 1)),
});
