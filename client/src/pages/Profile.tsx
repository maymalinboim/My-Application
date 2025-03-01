import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { getUser } from "@/actions/profileActions";
import Cookies from "js-cookie";
import { isTokenValid } from "@/utils/authUtils";
import { useNavigate } from "react-router-dom";
import { deletePost, getPostsBySender } from "@/actions/postsActions";
import Posts, { Post } from "@/components/Posts";
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

interface User {
  username: string;
  email: string;
  password?: string;
  profilePhoto: string;
}

const initialUser: User = {
  username: "",
  email: "",
  password: "",
  profilePhoto: "",
};

export default function ProfilePage() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User>(initialUser);
  const [newUser, setNewUser] = useState<User>(user);
  const [userPosts, setUserPosts] = useState<Post[]>([]);
  const [openComment, setOpenComment] = useState<string | null>(null);
  const [openEdit, setOpenEdit] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

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
      const currentUser = await getUser(token);
      setUser(currentUser.data);
      await fetchPosts();
    };
    fetchData();
  }, []);

  const validateToken = () => {
    if (!isTokenValid(token)) {
      navigate("/");
    }
  };

  const handleUsernameUpdate = () => {
    setUser({ ...user, username: newUser.username });
    alert("Username updated!");
  };

  const handleDeletePost = async (postId: string) => {
    await deletePost(postId);
    await fetchPosts();
  };

  // const handlePhotoUpdate = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   const file = e.target.files?.[0];
  //   if (file) {
  //     const imageUrl = URL.createObjectURL(file);
  //     setUser({ ...user, profilePhoto: imageUrl });
  //   }
  // };

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
          <Avatar className="w-32 h-32">
            <AvatarImage src={user.profilePhoto} alt="Profile Photo" />
            <AvatarFallback>{user.username[0]?.toUpperCase()}</AvatarFallback>
          </Avatar>

          <div className="space-y-4 w-1/2">
            <div>
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={newUser.username}
                placeholder={user.username}
                onChange={(e) =>
                  setNewUser({ ...newUser, username: e.target.value })
                }
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                value={newUser.email}
                placeholder={user.email}
                onChange={(e) =>
                  setNewUser({ ...newUser, email: e.target.value })
                }
              />
            </div>
            {newUser?.password && (
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={newUser.password}
                  placeholder={"**********"}
                  onChange={(e) =>
                    setNewUser({ ...newUser, password: e.target.value })
                  }
                />
              </div>
            )}
            {/* <div>
              <Label htmlFor="photo">Update Photo:</Label>
              <Input id="photo" type="file" onChange={handlePhotoUpdate} />
            </div> */}

            <Button className="w-full" onClick={handleUsernameUpdate}>
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
                <Posts setOpenComment={setOpenComment} post={post} />
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
            posts={userPosts}
            postsPerPage={postsPerPage}
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
        <CommentSection postId={openComment} setOpen={setOpenComment} />
      )}
    </div>
  );
}
