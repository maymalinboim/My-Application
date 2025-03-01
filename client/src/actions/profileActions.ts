import config from "@/config";
import { decodeToken } from "@/utils/authUtils";
import axios from "axios";

export const getUser = async (token: string) => {
  const { userId } = decodeToken(token);
  console.log("userId:", userId);

  const res = await axios.get(`${config.SERVER_URL}/users/${userId}`,
    {
      withCredentials: true,
    }
  );

  return res;
};

export const updateUser = async (token: string, username: string, profilePhoto: File | null) => {
  const { userId } = decodeToken(token);

  const formData = new FormData();
  profilePhoto && formData.append("profileImage", profilePhoto);
  formData.append("username", username);

  const res = await axios.put(
    `${config.SERVER_URL}/users/${userId}`,
    formData,
    {
      headers: { "Content-Type": "multipart/form-data" },
      withCredentials: true,
    },
  );

  alert("Image uploaded successfully!");
  console.log("Image URL:", res.data.imageUrl);

  console.log(res);
  return res.status === 201;
};
