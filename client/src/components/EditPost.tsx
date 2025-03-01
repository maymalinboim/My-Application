import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { editPost, getPostsById } from "@/actions/postsActions";
import { NewPost } from "./CreatePost";

export default function EditPostModal({
  postId,
  setOpen,
  fetchPosts,
}: {
  postId: string;
  setOpen: (state: string | null) => void;
  fetchPosts: () => void;
}) {
  const [postDetails, setPostDetails] = useState<NewPost>({
    title: "",
    body: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchPostDetails = async () => {
      const post = await getPostsById(postId);
      const { title, body } = post;
      setPostDetails({ title, body });
    };
    fetchPostDetails();
  }, []);

  const handleSubmit = async () => {
    const { title, body } = postDetails;

    setLoading(true);
    await editPost(postId, title, body);
    await fetchPosts();
    setLoading(false);
    setOpen(null);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPostDetails({ ...postDetails, image: URL.createObjectURL(file) });
    }
  };

  return (
    <Dialog open={Boolean(postId)} onOpenChange={() => setOpen(null)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit post</DialogTitle>
        </DialogHeader>

        <Input
          placeholder="Post Title"
          value={postDetails.title}
          onChange={(e) =>
            setPostDetails({ ...postDetails, title: e.target.value })
          }
        />

        <Textarea
          placeholder="Write about your post..."
          value={postDetails.body}
          onChange={(e) =>
            setPostDetails({ ...postDetails, body: e.target.value })
          }
        />

        <Input type="file" accept="image/*" onChange={handleImageUpload} />

        {postDetails.image && (
          <img
            src={postDetails.image}
            alt="Preview"
            className="w-fit h-40 object-cover rounded-lg mt-2"
          />
        )}

        <Button onClick={handleSubmit} disabled={loading}>
          {loading ? "Updating..." : "Edit Post"}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
