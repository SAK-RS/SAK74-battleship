export type Message = {
  type: string;
  data: string;
};

export type WsWithId = WebSocket & {
  id: string;
};

export enum messTypes {
  REG = "reg",
  CREATE_ROOM = "create_room",
  CREATE_GAME = "create_game",
  ROOM_UPDATE = "update_room",
  ADD_TO_ROOM = "add_user_to_room",
  SHIPS_ADD = "add_ships",
  START_GAME = "start_game",
  TURN = "turn",
  ATTACK = "attack",
  WINNERS_UPDATE = "update_winners",
  RANDOM_ATTACK = "randomAttack",
  GAME_FINISH = "finish",
}

export const BOARD_SIZE = 10;
