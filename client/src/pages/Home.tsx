import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import { isTokenValid } from "@/utils/authUtils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getAllPosts } from "@/actions/postsActions";
import Posts, { Post } from "@/components/Posts";
import CommentSection from "@/components/Comments";

export default function HomePage() {
  const [openPostId, setOpenPostId] = useState<string | null>(null);
  const [allPosts, setAllPosts] = useState<Post[]>([]);
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

  const validateToken = () => {
    const token = Cookies.get("Authorization") || "";

    if (!isTokenValid(token)) {
      navigate("/");
    }
  };

  return (
    <div className="h-fit w-full flex justify-center">
      <Card className="w-3/4 h-full">
        <CardHeader>
          <CardTitle>All Posts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {allPosts.map((post) => (
              <Posts setOpenPostId={setOpenPostId} post={post} />
            ))}
          </div>
        </CardContent>
      </Card>

      <Dialog
        open={Boolean(openPostId)}
        onOpenChange={() => setOpenPostId(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Comments</DialogTitle>
          </DialogHeader>
          {openPostId && <CommentSection postId={openPostId} />}
        </DialogContent>
      </Dialog>
    </div>
  );
}
