import { MAX_ROOMS_AMOUNT } from "../_setup";

interface UserInRoom {
  name: string;
  index: string;
}

class Room {
  constructor(user: UserInRoom) {
    this.roomUsers.push(user);
  }
  roomUsers: UserInRoom[] = [];
}

type RoomId = number;

class Rooms {
  private rooms: Map<number, Room> = new Map();
  createRoom(userName: string, userIdx: string) {
    let _id: RoomId;
    do {
      _id = Math.round(Math.random() * MAX_ROOMS_AMOUNT);
    } while (this.rooms.has(_id));

    this.rooms.set(
      _id,
      new Room({
        name: userName,
        index: userIdx,
      })
    );
  }

  getRoomById(id: RoomId) {
    return this.rooms.get(id);
  }

  getRooms() {
    return Array.from(this.rooms.entries()).map(([id, room]) => ({
      roomId: id,
      roomUsers: room.roomUsers,
    }));
  }

  addPlayer(roomId: RoomId, userName: string, userIdx: string) {
    this.rooms.get(roomId)?.roomUsers.push({ name: userName, index: userIdx });
  }

  removeRoom(roomId: RoomId) {
    this.rooms.delete(roomId);
  }
}

export default new Rooms();
