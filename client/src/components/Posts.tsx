import { useEffect, useState } from "react";
import { Heart, MessageCircle } from "lucide-react";
import Cookies from "js-cookie";
import config from "@/config";
import { Post } from "@/models/postModel";
import { addLikeToPost, deleteLikeFromPost } from "@/actions/postsActions";
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
      await deleteLikeFromPost(post._id);
    } else {
      await addLikeToPost(post._id);
    }

    setLiked(!liked);
    fetchAndUpdatePost(post._id);
  };

  return (
    <div
      key={post._id}
      className="w-lg min-w-[400px] bg-white border border-gray-200 rounded-lg shadow-lg dark:bg-gray-800 dark:border-gray-700 flex flex-col justify-between"
    >
      {post.image && (
        <img
          className="rounded-t-lg"
          src={`${config.SERVER_URL}/${post.image}`}
          alt=""
          width={500}
          height={250}
        />
      )}
      <div className="flex flex-col flex-grow p-6 pt-2">
        <div className="flex-grow">
          <h3 className="text-lg font-bold text-left">{post.title}</h3>
          <p className="text-gray-700 text-left">{post.body}</p>
          <p className="text-sm text-gray-500 text-left">
            By {post.author?.username}
          </p>
        </div>
        <div className="flex items-center space-x-4 mt-2">
          <div
            className="flex items-center space-x-1 cursor-pointer"
            onClick={onLikeClicked}
          >
            {liked ? (
              <Heart className="w-5 h-5 text-red-400" fill="currentColor" />
            ) : (
              <Heart className="w-5 h-5 text-red-400" />
            )}
            <span>{post.likes.length}</span>
          </div>
          <div
            className="flex items-center space-x-1 cursor-pointer"
            onClick={() => setOpenComment(post._id)}
          >
            <MessageCircle className="w-5 h-5 text-blue-600" />
            <span>{post?.comments.length}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
