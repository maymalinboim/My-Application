import { User } from "./userModel";

export interface Comment {
    _id: string;
    body: string;
    user: User;
  }