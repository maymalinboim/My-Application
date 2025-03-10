import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import UploadProfile from "@/components/UploadProfile";
import { Label } from "@/components/ui/label";
import {
  getUser,
  updateUser,
  getAllUsersNames,
} from "@/actions/profileActions";
import Cookies from "js-cookie";
import { isTokenValid } from "@/utils/authUtils";
import { useNavigate } from "react-router-dom";
import {
  deletePost,
  getPostsById,
  getPostsBySender,
} from "@/actions/postsActions";
import Posts from "@/components/Posts";
import CommentSection from "@/components/Comments";
import Paging from "@/components/Paging";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical } from "lucide-react";
import EditPostModal from "@/components/EditPost";
import { Post } from "@/models/postModel";

interface User {
  username: string;
  email: string;
  password: string;
  profilePhotoUrl: string;
}

const initialUser: User = {
  username: "",
  email: "",
  password: "",
  profilePhotoUrl: "",
};

export default function ProfilePage() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User>(initialUser);
  const [newUsername, setNewUsername] = useState<string>(user.username);
  const [image, setImage] = useState<File | null>(null);
  const [userPosts, setUserPosts] = useState<Post[]>([]);
  const [openComment, setOpenComment] = useState<string | null>(null);
  const [openEdit, setOpenEdit] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [allUsernames, setAllUsernames] = useState<string[]>([]);

  const postsPerPage = 5;
  const token = Cookies.get("Authorization") || "";

  const fetchPosts = async () => {
    const userPosts = await getPostsBySender(token);
    setUserPosts(userPosts);
  };

  useEffect(() => {
    validateToken();
  }, [navigate]);

  useEffect(() => {
    const fetchData = async () => {
      await getUserDetails();
      await fetchPosts();
      const allUsers = await getAllUsersNames();
      setAllUsernames(
        allUsers.filter((name: string) => name !== user.username)
      );
    };
    fetchData();
  }, []);

  const validateToken = () => {
    if (!isTokenValid(token)) {
      navigate("/");
    }
  };

  const getUserDetails = async () => {
    const currentUser = await getUser(token);
    const { username, email, password, profilePhoto } = currentUser.data;
    setUser({ username, email, password, profilePhotoUrl: profilePhoto });
  };

  const fetchAndUpdatePost = async (postId: string) => {
    const updatedPost = await getPostsById(postId);

    setUserPosts((prev) =>
      prev.map((post) => (post._id === postId ? updatedPost : post))
    );
  };

  const handleSave = () => {
    if (newUsername || image) {
      updateUser(token, newUsername, image);
      getUserDetails();
    }
  };

  const handleDeletePost = async (postId: string) => {
    await deletePost(postId);
    await fetchPosts();
  };

  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = userPosts.slice(indexOfFirstPost, indexOfLastPost);

  return (
    <div className="p-6 space-x-8 flex h-fit w-full justify-around">
      <Card className="h-fit w-1/2">
        <CardHeader>
          <CardTitle>Profile</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center gap-3 justify-around">
          <UploadProfile
            username={user.username}
            setImage={setImage}
            imageUrl={user.profilePhotoUrl}
          />
          <div className="space-y-4 w-1/2">
            <div>
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={newUsername}
                placeholder={user.username}
                onChange={(e) => setNewUsername(e.target.value)}
              />
              {allUsernames.includes(newUsername) &&
                !(newUsername === user.username) && (
                  <p className="text-red-500 text-xs w-fit ml-1 mt-1">
                    Username is taken
                  </p>
                )}
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" value={user.email} disabled />
            </div>

            <Button
              className="w-full"
              onClick={handleSave}
              disabled={
                (!newUsername && !image) ||
                (allUsernames.includes(newUsername) &&
                  !(newUsername === user.username))
              }
            >
              Save Changes
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="w-1/2 h-full">
        <CardHeader>
          <CardTitle>Your Posts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {currentPosts.map((post) => (
              <div className="relative" key={post._id}>
                <Posts
                  setOpenComment={setOpenComment}
                  post={post}
                  fetchAndUpdatePost={fetchAndUpdatePost}
                />
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant={"secondary"}
                      className="p-2 absolute top-0 right-0 shadow-none"
                    >
                      <MoreVertical size={20} />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => setOpenEdit(post._id)}>
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleDeletePost(post._id)}
                    >
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ))}
          </div>
          <Paging
            totalPages={Math.ceil(userPosts.length / postsPerPage)}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
          />
        </CardContent>
      </Card>

      {openEdit && (
        <EditPostModal
          postId={openEdit}
          setOpen={setOpenEdit}
          fetchPosts={fetchPosts}
        />
      )}
      {openComment && (
        <CommentSection
          postId={openComment}
          setOpen={setOpenComment}
          fetchAndUpdatePost={fetchAndUpdatePost}
        />
      )}
    </div>
  );
}
