import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import { isTokenValid } from "@/utils/authUtils";
import { getAllPosts, getPostsById } from "@/actions/postsActions";
import Posts from "@/components/Posts";
import CommentSection from "@/components/Comments";
import CreatePostModal from "@/components/CreatePost";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import Paging from "@/components/Paging";
import { Post } from "@/models/postModel";

export default function HomePage() {
  const [openComment, setOpenComment] = useState<string | null>(null);
  const [openCreate, setOpenCreate] = useState(false);
  const [allPosts, setAllPosts] = useState<Post[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 8;
  const navigate = useNavigate();

  useEffect(() => {
    validateToken();
  }, [navigate]);

  useEffect(() => {
    const fetchPosts = async () => {
      const posts = await getAllPosts();
      setAllPosts(posts);
    };
    fetchPosts();
  }, []);

  const fetchAndUpdatePost = async (postId: string) => {
    const updatedPost = await getPostsById(postId);

    setAllPosts((prev) =>
      prev.map((post) => (post._id === postId ? updatedPost : post))
    );
  };

  const validateToken = () => {
    const token = Cookies.get("Authorization") || "";

    if (!isTokenValid(token)) {
      navigate("/");
    }
  };

  const handleCreatePost = (newPost: Post) => {
    setAllPosts([newPost, ...allPosts]);
    setOpenCreate(false);
  };

  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = allPosts.slice(indexOfFirstPost, indexOfLastPost);

  return (
    <div className="flex justify-center">
      <div className="space-y-6 h-full">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 p-6">
          {currentPosts.map((post) => (
            <Posts
              key={post._id}
              setOpenComment={setOpenComment}
              post={post}
              fetchAndUpdatePost={fetchAndUpdatePost}
            />
          ))}
        </div>
        <Paging
          posts={allPosts}
          postsPerPage={postsPerPage}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
        />

        <Button
          className="fixed bottom-6 right-6 w-14 h-14 rounded-full flex items-center justify-center shadow-lg bg-red-500 hover:bg-red-400 border-0 text-white"
          onClick={() => setOpenCreate(true)}
        >
          <Plus className="w-6 h-6" />
        </Button>

        <CreatePostModal
          open={openCreate}
          setOpen={setOpenCreate}
          onCreate={handleCreatePost}
        />

        {openComment && (
          <CommentSection
            postId={openComment}
            setOpen={setOpenComment}
            fetchAndUpdatePost={fetchAndUpdatePost}
          />
        )}
      </div>
    </div>
  );
}
