import { Heart, MessageCircle } from "lucide-react";
import { Comment } from "@/components/Comments";

export interface Post {
  _id: string;
  author: string;
  title: string;
  body: string;
  comments: Comment[];
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
      <img
        // src={post.imageUrl}
        src={
          "https://cdn.pixabay.com/photo/2023/08/18/15/02/dog-8198719_640.jpg"
        }
        height={200}
        width={100}
        className="rounded-lg"
      />
      <p className="text-gray-700">{post.body}</p>
      <p className="text-sm text-gray-500">Author: {post._id}</p>
      {/* should be post.author but some objects don't have and it crushes for some reason */}
      <div className="flex items-center space-x-4 mt-2">
        <div className="flex items-center space-x-1 cursor-pointer">
          <Heart className="w-5 h-5 text-red-500" />
          <span>10</span>
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
