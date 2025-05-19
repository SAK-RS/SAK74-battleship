import { GameBoard } from "../data/games";
import rooms from "../data/rooms";
import users from "../data/users";
import { createUpdateRoomMess, sendToAll } from "../messages";
import { sendErrorMessage } from "../services/handleError";
import { WsWithId } from "../types";
import { clients } from "../wss_server/clients";

export const createRoom = (ws: WsWithId) => {
  if (ws.id) {
    const user = users.getUserById(ws.id);
    if (user) {
      rooms.createRoom(user?.name, ws.id);
    }
  }
  sendToAll(createUpdateRoomMess());
};

export const addToRoom = (ws: WsWithId, roomId: number) => {
  console.log({ roomId });

  if (!ws.id) {
    return;
  }
  const user = users.getUserById(ws.id);
  const room = rooms.getRoomById(roomId);

  if (!user || !room) {
    return;
  }
  if (room.roomUsers[0].index === ws.id) {
    sendErrorMessage(ws, "You can not connect to your room!");
    return;
  }
  rooms.addPlayer(roomId, user.name, ws.id);

  const [user1] = room.roomUsers;

  const ws1 = clients.find((client) => client.id === user1.index);
  if (!ws1) {
    return;
  }
  rooms.removeRoom(roomId);
  sendToAll(createUpdateRoomMess());
  const game = new GameBoard(ws1, ws);
};
