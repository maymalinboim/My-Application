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
import UploadImage from "./UploadImage";

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
  const [image, setImage] = useState<File | null>(null);

  useEffect(() => {
    const fetchPostDetails = async () => {
      const post = await getPostsById(postId);
      const { title, body, image } = post;
      setPostDetails({ title, body, image });
    };
    fetchPostDetails();
  }, []);

  const handleSubmit = async () => {
    const { title, body } = postDetails;

    setLoading(true);
    await editPost(postId, title, body, image);
    await fetchPosts();
    setLoading(false);
    setOpen(null);
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

        <UploadImage setImage={setImage} imageUrl={postDetails.image}/>

        <Button onClick={handleSubmit} disabled={loading}>
          {loading ? "Updating..." : "Edit Post"}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
