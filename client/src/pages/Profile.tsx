import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { getUser } from "@/actions/profileActions";
import Cookies from "js-cookie";

interface User {
  username: string;
  email: string;
  password: string;
  profilePhoto: string;
}

const initialUser: User = {
  username: "john_doe",
  email: "john@example.com",
  password: "123",
  profilePhoto: "https://via.placeholder.com/150",
};

const userPosts = [
  "Just finished a new project!",
  "Exploring the mountains this weekend.",
  "React + Tailwind = ❤️",
];

export default function ProfilePage() {
  const [user, setUser] = useState<User>(initialUser);
  const [newUsername, setNewUsername] = useState<string>(user.username);

  const token = Cookies.get("Authorization") || "";
  getUser(token).then((data) => console.log(data));

  const handleUsernameUpdate = () => {
    setUser({ ...user, username: newUsername });
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
    <div className="p-6 space-x-8 flex w-full justify-around">
      <Card className="h-fit w-1/2">
        <CardHeader>
          <CardTitle>Profile</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center gap-3 justify-around">
          <Avatar className="w-32 h-32">
            <AvatarImage src={user.profilePhoto} alt="Profile Photo" />
            <AvatarFallback>JD</AvatarFallback>
          </Avatar>

          <div className="space-y-4 w-1/2">
            <div>
              <Label htmlFor="username">Username:</Label>
              <Input
                id="username"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="email">Email:</Label>
              <Input id="email" value={user.email} disabled={true} />
            </div>
            <div>
              <Label htmlFor="password">Password:</Label>
              <Input id="password" value={user.password} disabled={true} />
            </div>
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

      <Card className="w-1/2">
        <CardHeader>
          <CardTitle>Your Posts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {userPosts.map((post, index) => (
              <div
                key={index}
                className="p-4 bg-gray-100 rounded-lg flex items-center flex-col"
              >
                <img
                  src="https://cdn.pixabay.com/photo/2023/08/18/15/02/dog-8198719_640.jpg"
                  height={200}
                  width={100}
                />
                {post}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
