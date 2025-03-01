import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  username: string;
  email: string;
  password: string;
  createdAt: Date;
  posts: mongoose.Types.Array<mongoose.Types.ObjectId>;
}

const userSchema = new Schema<IUser>({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String },
  createdAt: { type: Date, default: Date.now },
  posts: [{ type: Schema.Types.ObjectId, ref: "Post" }],
});

export const User = mongoose.model<IUser>("User", userSchema);

export interface IPost extends Document {
  title: string;
  body: string;
  author: mongoose.Types.ObjectId;
  comments: {
    body: string;
    date: Date;
    user: mongoose.Types.ObjectId;
  }[];
  createdAt: Date;
  updatedAt?: Date;
  hidden: boolean;
  meta: {
    votes: number;
    favs: number;
  };
}

const postSchema = new Schema<IPost>({
  title: { type: String, required: true },
  body: { type: String, required: true },
  author: { type: Schema.Types.ObjectId, ref: "User", required: true },
  comments: [
    {
      body: { type: String, required: true },
      date: { type: Date, default: Date.now },
      user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    },
  ],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date },
  hidden: { type: Boolean, default: false },
  meta: {
    votes: { type: Number, default: 0 },
    favs: { type: Number, default: 0 },
  },
});

export const Post = mongoose.model<IPost>("Post", postSchema);
