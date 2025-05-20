import usersData, { WrongPasswordError, type UserType } from "../data/users";
import {
  createUpdateRoomMess,
  createWinnersUpdateMess,
  sendRegMess,
  sendToAll,
} from "../messages";
import { WsWithId } from "../types";
import { clients } from "../wss_server/clients";

export const regHandler = async (
  user: Pick<UserType, "name" | "password">,
  ws: WsWithId
) => {
  try {
    const { name, id } = usersData.addUser(user);
    if (clients.some((client) => client.id === id)) {
      sendRegMess(ws, name, id, "This user is already logged!");
      return;
    }
    ws.id = id;
    sendRegMess(ws, name, id);
    sendToAll(createWinnersUpdateMess());
    sendToAll(createUpdateRoomMess());
  } catch (err) {
    sendRegMess(
      ws,
      user.name,
      "",
      err instanceof WrongPasswordError ? err.message : "Unknown error"
    );
  }
};
