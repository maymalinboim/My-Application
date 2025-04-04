import config from "@/config";
import { User } from "@/models/userModel";
import { decodeToken } from "@/utils/authUtils";
import axios from "axios";

export const getUser = async (token: string) => {
  const { userId } = decodeToken(token);
  const res = await axios.get(`${config.SERVER_URL}/users/${userId}`, {
    withCredentials: true,
  });

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

  return res.status === 201;
};

export const getAllUsersNames = async () => {
  const res = await axios.get(`${config.SERVER_URL}/users`, {
    withCredentials: true,
  });
  
  return res.data.map((user: User) => user.username);
};
