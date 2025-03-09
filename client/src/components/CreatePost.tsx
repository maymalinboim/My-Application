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
import UploadImage from "./UploadImage";

export interface NewPost {
  title: string;
  body: string;
  image?: string;
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
  const [image, setImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    const { title, body } = postDetails;
    if (!title || !body) return alert("Title and body are required!");

    setLoading(true);
    const newPost = await createPost(title, body, image);
    setLoading(false);
    onCreate(newPost);
    setOpen(false);
    setPostDetails({
      title: "",
      body: "",
    });
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

       <UploadImage setImage={setImage}/>
        <Button onClick={handleSubmit} disabled={loading}>
          {loading ? "Posting..." : "Create Post"}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
