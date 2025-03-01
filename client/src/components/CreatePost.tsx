import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { createPost } from "@/actions/postsActions";

export interface NewPost {
  title: string;
  body: string;
  image?: string; //link?
}

export default function CreatePostModal({
  open,
  setOpen,
  onCreate,
}: {
  open: boolean;
  setOpen: (state: boolean) => void;
  onCreate: (newPost: any) => void;
}) {
  const [postDetails, setPostDetails] = useState<NewPost>({
    title: "",
    body: "",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    const { title, body } = postDetails;
    if (!title || !body) return alert("Title and body are required!");

    setLoading(true);
    const newPost = await createPost(title, body);
    setLoading(false);
    onCreate(newPost);
    setOpen(false);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPostDetails({ ...postDetails, image: URL.createObjectURL(file) });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create a New Post</DialogTitle>
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
          {loading ? "Posting..." : "Create Post"}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
