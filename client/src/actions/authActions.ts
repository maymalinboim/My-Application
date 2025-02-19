import config from "@/config";
import axios from "axios";

export const loginUser = async (username: string, password: string) => {
  const res = await axios.post(
    `${config.SERVER_URL}/users/login`,
    {
      username,
      password,
    },
    {
      withCredentials: true,
    }
  );
  return res.status === 201;
};

export const registerUser = async (
  username: string,
  email: string,
  password: string
) => {
  const res = await axios.post(
    `${config.SERVER_URL}/users/register`,
    {
      username,
      email,
      password,
    },
    {
      withCredentials: true,
    }
  );
  return res.status === 201;
};
