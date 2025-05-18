import WebSocket from "ws";
import usersData, { WrongPasswordError, type UserType } from "../data/users";
import { createWinnersUpdateMess, sendRegMess } from "../messages";
import { sendToAll } from "../services/sendToAll";

export const regHandler = async (
  user: Pick<UserType, "name" | "password">,
  ws: WebSocket
  // id: string
) => {
  try {
    const { name, id } = usersData.addUser(user);
    sendRegMess(ws, name, id);
    await sendToAll(createWinnersUpdateMess());
  } catch (err) {
    sendRegMess(
      ws,
      user.name,
      "",
      err instanceof WrongPasswordError ? err.message : "Unknown error"
    );
  }
};
