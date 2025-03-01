import { Heart, MessageCircle } from "lucide-react";
import { Comment } from "@/components/Comments";
import config from "@/config";

interface User {
  _id: string;
  username: string;
  email: string;
  password: string;
  profilePhotoUrl: string;
}

export interface Post {
  _id: string;
  author: User;
  title: string;
  body: string;
  image?: string;
  comments: Comment[];
  likes: string[];
}

export default function Posts({
  setOpenComment,
  post,
}: {
  setOpenComment: (postId: string | null) => void;
  post: Post;
}) {
  return (
    <div
      key={post._id}
      className="p-4 bg-gray-100 rounded-lg flex items-center flex-col"
    >
      <h2 className="text-lg font-bold">{post.title}</h2>
      {
        post.image && (
          <img
            src={`${config.SERVER_URL}/${post.image}`}
            height={200}
            width={100}
            className="rounded-lg"
          />
        )
      }
      <p className="text-gray-700">{post.body}</p>
      <p className="text-sm text-gray-500">By {post.author.username}</p>
      {/* should be post.author but some objects don't have and it crushes for some reason */}
      <div className="flex items-center space-x-4 mt-2">
        <div className="flex items-center space-x-1 cursor-pointer">
          <Heart className="w-5 h-5 text-red-500" />
          <span>{post.likes.length}</span>
        </div>
        <div
          className="flex items-center space-x-1 cursor-pointer"
          onClick={() => setOpenComment(post._id)}
        >
          <MessageCircle className="w-5 h-5 text-blue-500" />
          <span>{post.comments.length}</span>
          {/* comments length doesn't update when adding a comment */}
        </div>
      </div>
    </div>
  );
}
