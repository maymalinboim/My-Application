import { User } from "./userModel";
import { Comment } from "./commentModel";

export interface Post {
  _id: string;
  author: User;
  title: string;
  body: string;
  image?: string;
  comments: Comment[];
  likes: string[];
}
