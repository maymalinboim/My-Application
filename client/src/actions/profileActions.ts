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

export const updateUser = async (token: string, newUsername: string) => {
  const { userId } = decodeToken(token);

  const res = await axios.put(
    `${config.SERVER_URL}/users/${userId}`,
    {
      newUsername,
    },
    {
      withCredentials: true,
    }
  );
  console.log(res);
  return res.status === 201;
};
