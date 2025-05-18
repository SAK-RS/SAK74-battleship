import WebSocket from "ws";
import { messTypes } from "./types";
import { styleText } from "util";
import usersData from "./data/users";

const sendMesassage: <T>(ws: WebSocket, type: messTypes, data: T) => void = (
  ws,
  type,
  data
) => {
  const mess = JSON.stringify({
    type,
    data: typeof data === "object" ? JSON.stringify(data) : data,
    id: 0,
  }); // todo: remove
  console.log({ mess, data }); // todo: remove
  ws.send(
    JSON.stringify({
      type,
      data: typeof data === "object" ? JSON.stringify(data) : data,
      id: 0,
    })
  );
  console.log(styleText("yellow", "outgoing --> ") + type);
};

export const sendRegMess = (
  ws: WebSocket,
  name: string,
  index: string,
  error?: string
) => {
  sendMesassage(ws, messTypes.REG, {
    name,
    index,
    error: Boolean(error),
    ...(error && { errorText: error }),
  });
};

export const createWinnersUpdateMess = () =>
  JSON.stringify({
    type: messTypes.WINNERS_UPDATE,
    data: JSON.stringify(usersData.winners),
    id: 0,
  });
