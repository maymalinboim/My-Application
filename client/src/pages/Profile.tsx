import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import UploadProfile from "@/components/ui/upload";
import { Label } from "@/components/ui/label";
import { getUser, updateUser } from "@/actions/profileActions";
import Cookies from "js-cookie";
import { isTokenValid } from "@/utils/authUtils";
import { useNavigate } from "react-router-dom";
import config from "@/config";

interface User {
  username: string;
  email: string;
  password: string;
  profilePhotoUrl?: string;
}

const initialUser: User = {
  username: "",
  email: "",
  password: "",
  profilePhotoUrl: "",
};

const userPosts = [
  "Just finished a new project!",
  "Exploring the mountains this weekend.",
  "React + Tailwind = ❤️",
];

export default function ProfilePage() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User>(initialUser);
  const [newUsername, setNewUsername] = useState<string>(user.username);
  const [image, setImage] = useState<File | null>(null);
  const token = Cookies.get("Authorization") || "";

  useEffect(() => {
    validateToken();
  }, [navigate]);

  useEffect(() => {
    getUserDetails();
  }, []);

  const validateToken = () => {
    if (!isTokenValid(token)) {
      navigate("/");
    }
  };

  const getUserDetails = async () => {
    const currentUser = await getUser(token);
    const { username, email, password, profilePhoto } = currentUser.data;
    setUser({ username, email, password, profilePhotoUrl: `${config.SERVER_URL}/${profilePhoto}` });
  }

  const handleSave = () => {
    if (newUsername || image) {
      updateUser(token, newUsername, image);
      getUserDetails();
    }
  }

  // const handleUpload = async () => {
  //   if (!image) return alert("Please select an image");

  //   setUploading(true);
  //   const formData = new FormData();
  //   formData.append("profileImage", image);

  //   try {
  //     const response = await axios.post<{ imageUrl: string }>(
  //       `${config.SERVER_URL}/api/upload`,
  //       formData,
  //       {
  //         headers: { "Content-Type": "multipart/form-data" },
  //       }
  //     );

  //     alert("Image uploaded successfully!");
  //     console.log("Image URL:", response.data.imageUrl);
  //   } catch (error) {
  //     console.error("Upload failed", error);
  //     alert("Upload failed!");
  //   } finally {
  //     setUploading(false);
  //   }
  // };

  return (
    <div className="p-6 space-x-8 flex w-full justify-around">
      <Card className="h-fit w-1/2">
        <CardHeader>
          <CardTitle>Profile</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center gap-3 justify-around">
          <UploadProfile username={user.username} setImage={setImage} imageUrl={user.profilePhotoUrl} />
          <div className="space-y-4 w-1/2">
            <div>
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={newUsername}
                placeholder={user.username}
                onChange={(e) => setNewUsername(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                value={user.email}
                disabled
              />
            </div>
            {/* <div>
              <Label htmlFor="photo">Update Photo:</Label>
              <Input id="photo" type="file" onChange={handlePhotoUpdate} />
            </div> */}

            <Button className="w-full" onClick={handleSave} disabled={newUsername || image ? false : true}>
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
