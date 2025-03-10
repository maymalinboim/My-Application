import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import { isTokenValid } from "@/utils/authUtils";
import { getAllPosts, getPostsById } from "@/actions/postsActions";
import Posts from "@/components/Posts";
import CommentSection from "@/components/Comments";
import CreatePostModal from "@/components/CreatePost";
import { Loader2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import Paging from "@/components/Paging";
import { Post } from "@/models/postModel";
import { getPostFromRestApi } from "@/actions/restPhotos";
import BasicPost from "@/components/BasicPost";

export default function HomePage() {
  const [openComment, setOpenComment] = useState<string | null>(null);
  const [openCreate, setOpenCreate] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [dbPosts, setDbPosts] = useState<Post[]>([]);
  const [generatedPosts, setGeneratedPosts] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 8;
  const navigate = useNavigate();

  useEffect(() => {
    validateToken();
  }, [navigate]);

  useEffect(() => {
    const fetchPosts = async () => {
      const posts = (await getAllPosts()).map((post: Post) => ({
        ...post,
        type: "db",
      }));
      setDbPosts(posts);
    };
    fetchPosts();
  }, []);

  useEffect(() => {
    const fetchGeneratedPhotos = async () => {
      if (dbPosts.length === 0) return;
      setIsLoading(true);
      const perPage = Math.max(
        0,
        postsPerPage - (dbPosts.length - (currentPage - 1) * postsPerPage)
      );

      const newGeneratedPosts = await getPostFromRestApi(perPage, currentPage);

      setGeneratedPosts(newGeneratedPosts);
      setIsLoading(false);
    };

    fetchGeneratedPhotos();
  }, [currentPage, dbPosts]);

  const fetchAndUpdatePost = async (postId: string) => {
    const updatedPost = await getPostsById(postId);
    setDbPosts((prev) =>
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
    setDbPosts([newPost, ...dbPosts]);
    setOpenCreate(false);
  };

  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const combinedPosts = [...dbPosts, ...generatedPosts].slice(
    indexOfFirstPost,
    indexOfLastPost
  );

  return (
    <div className="flex justify-center">
      <div className="space-y-6 h-full">
        {isLoading ? (
          <div className="fixed inset-0 flex items-center justify-center bg-white/80 z-50">
            <Loader2 className="animate-spin h-12 w-12 text-red-500" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 p-6">
            {combinedPosts.map((post, index) =>
              post.type === "db" ? (
                <Posts
                  key={post._id}
                  setOpenComment={setOpenComment}
                  post={post}
                  fetchAndUpdatePost={fetchAndUpdatePost}
                />
              ) : (
                <BasicPost
                  key={index}
                  author={post.photographer}
                  image={post.src.large}
                  title={post.alt}
                />
              )
            )}
          </div>
        )}
        {!isLoading && (
          <Paging
            totalPages={50}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
          />
        )}

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
