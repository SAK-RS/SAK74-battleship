import { randomUUID } from "node:crypto";

export interface UserType {
  name: string;
  password: string;
  wins: number;
}
type WinnerType = Pick<UserType, "name" | "wins">;

class UsersData {
  users: Map<string, UserType> = new Map();
  winners: WinnerType[] = [];
  addUser({ name, password }: Pick<UserType, "name" | "password">) {
    let searchedId: string | undefined;
    if ((searchedId = this.getUserIdByname(name))) {
      const user = this.validatePassword(searchedId, password);
      if (user) {
        return { ...user, id: searchedId };
      } else {
        throw new WrongPasswordError();
      }
    }
    const user = { name, password, wins: 0 };
    const id = randomUUID();
    this.users.set(id, user);
    return { ...user, id };
  }

  getUserById(id: string) {
    return this.users.get(id);
  }

  private getUserIdByname(name: string) {
    const user = Array.from(this.users.entries()).find(
      ([, user]) => user.name === name
    );
    return user ? user[0] : undefined;
  }

  private validatePassword(id: string, password: string) {
    const user = this.users.get(id);
    return user?.password === password ? user : undefined;
  }

  updateWinner(_id: string) {
    const user = this.getUserById(_id);
    if (user) {
      const winner = this.winners.find((winner) => winner.name === user?.name);
      if (!winner) {
        this.winners.push({ name: user.name, wins: 1 });
      } else {
        winner.wins += 1;
      }
    }
  }
}

export default new UsersData();

export class WrongPasswordError extends Error {
  message: string = "Wrong password";
}
