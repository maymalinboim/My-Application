import { useEffect, useState } from "react";
import { Heart, MessageCircle } from "lucide-react";
import Cookies from "js-cookie";
import config from "@/config";
import { Post } from "@/models/postModel";
import { addLikeToPost, deleteLikeFromPost, getPostsById } from "@/actions/postsActions";
import { getUser } from "@/actions/profileActions";

export default function Posts({
  setOpenComment,
  post,
  fetchAndUpdatePost,
}: {
  setOpenComment: (postId: string | null) => void;
  post: Post;
  fetchAndUpdatePost: (postId: string) => void;
}) {
  const [liked, setLiked] = useState<boolean>(false);
  const token = Cookies.get("Authorization") || "";

  useEffect(() => {
    const fetchData = async () => {
      const currentUser = await getUser(token);
      setLiked(post.likes?.includes(currentUser.data?._id));
    };

    fetchData();
  }, []);

  const onLikeClicked = async () => {
    if (liked) {
      await deleteLikeFromPost(post._id)
    } else {
      await addLikeToPost(post._id);
    }

    setLiked(!liked);
    fetchAndUpdatePost(post._id);
  }

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
      <div className="flex items-center space-x-4 mt-2">
        <div
          className="flex items-center space-x-1 cursor-pointer"
          onClick={onLikeClicked}
        >
          {
            liked ?
              <Heart className="w-5 h-5 text-red-500" fill="currentColor" />
              :
              <Heart className="w-5 h-5 text-red-500" />
          }
          <span>{post.likes.length}</span>
        </div>
        <div
          className="flex items-center space-x-1 cursor-pointer"
          onClick={() => setOpenComment(post._id)}
        >
          <MessageCircle className="w-5 h-5 text-blue-500" />
          <span>{post?.comments.length}</span>
        </div>
      </div>
    </div>
  );
}
