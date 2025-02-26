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
import { getPostsBySender } from "@/actions/postsActions";
import Posts, { Post } from "@/components/Posts";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import CommentSection from "@/components/Comments";

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
  const [openPostId, setOpenPostId] = useState<string | null>(null);

  useEffect(() => {
    validateToken();
  }, [navigate]);

  useEffect(() => {
    const fetchData = async () => {
      const token = Cookies.get("Authorization") || "";
      const currentUser = await getUser(token);
      setUser(currentUser.data);
      const userPosts = await getPostsBySender(token);
      setUserPosts(userPosts);
    };
    fetchData();
  }, []);

  const validateToken = () => {
    const token = Cookies.get("Authorization") || "";

    if (!isTokenValid(token)) {
      navigate("/");
    }
  };

  const handleUsernameUpdate = () => {
    setUser({ ...user, username: newUser.username });
    alert("Username updated!");
  };

  const handlePhotoUpdate = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setUser({ ...user, profilePhoto: imageUrl });
    }
  };

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
            {userPosts.map((post) => (
              <Posts key={post._id} setOpenPostId={setOpenPostId} post={post} />
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
