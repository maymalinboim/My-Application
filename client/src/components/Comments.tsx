import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getCommentsByPost, addCommentToPost } from "@/actions/postsActions";

export interface Comment {
  _id: string;
  body: string;
}

export default function CommentSection({ postId }: { postId: string }) {
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
    } catch (error) {
      console.error("Error adding comment:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
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
    </div>
  );
}
