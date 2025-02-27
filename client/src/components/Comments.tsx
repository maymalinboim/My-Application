import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getCommentsByPost, addCommentToPost } from "@/actions/postsActions";

export interface Comment {
  _id: string;
  body: string;
}

export default function CommentSection({
  postId,
  setOpen,
}: // onAdd,
{
  postId: string;
  setOpen: (state: string | null) => void;
  // onAdd: (updatedComments: Comment[]) => void;
}) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchComments = async () => {
      if (postId) {
        const commentsOfPost = await getCommentsByPost(postId);
        setComments(commentsOfPost);
      }
    };
    fetchComments();
  }, [postId]);

  const addComment = async () => {
    if (newComment.trim() === "") return;

    setLoading(true);
    try {
      await addCommentToPost(postId, newComment);
      setNewComment("");

      const updatedComments = await getCommentsByPost(postId);
      setComments(updatedComments);
      // onAdd(updatedComments);
    } catch (error) {
      console.error("Error adding comment:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={Boolean(postId)} onOpenChange={() => setOpen(null)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Comments</DialogTitle>
        </DialogHeader>
        <div className="space-y-2">
          {comments.map((comment) => (
            <div key={comment._id} className="border-b pb-2">
              <strong>{comment._id}:</strong> {comment.body}
            </div>
          ))}
        </div>
        <div className="mt-4 flex space-x-2">
          <Input
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a comment..."
            disabled={loading}
          />
          <Button onClick={addComment} disabled={loading}>
            {loading ? "Posting..." : "Post"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
