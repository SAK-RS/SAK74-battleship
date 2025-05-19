import WebSocket from "ws";
import { Message, messTypes } from "./types";
import { styleText } from "util";
import usersData from "./data/users";
import { clients } from "./wss_server/clients";
import roomsData from "./data/rooms";

const sendMesassage: <T>(ws: WebSocket, type: messTypes, data: T) => void = (
  ws,
  type,
  data
) => {
  // const mess = JSON.stringify({
  //   type,
  //   data: typeof data === "object" ? JSON.stringify(data) : data,
  //   id: 0,
  // }); // todo: remove
  // console.log({ mess, data }); // todo: remove
  ws.send(
    JSON.stringify({
      type,
      data: typeof data === "object" ? JSON.stringify(data) : data,
      id: 0,
    })
  );
  console.log(styleText("yellow", "outgoing --> ") + type);
};

export const sendToAll = (message: string) => {
  return new Promise<void>((res) => {
    clients.forEach((ws) => {
      if (ws.readyState === ws.OPEN) {
        ws.send(message);
        const type = (JSON.parse(message) as Message).type;
        console.log(styleText("yellow", "outgoing --> ") + type);
      }
    });
    res();
  });
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

export const createUpdateRoomMess = () =>
  JSON.stringify({
    type: messTypes.ROOM_UPDATE,
    data: JSON.stringify(roomsData.getRooms()),
    id: 0,
  });
