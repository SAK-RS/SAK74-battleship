export type Message<T = string> = {
  type: string;
  data: {
    [key: string]: T;
  };
};
