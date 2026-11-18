export type { Room } from "./Room";

export interface Message {
  id: string;
  roomId: string;
  userId: string;
  content: string;
  createdAt: Date;
  authorUsername?: string;
}
