import config from "@/config";
import { decodeToken } from "@/utils/authUtils";
import axios from "axios";

export const getAllPosts = async () => {
  const res = await axios.get(`${config.SERVER_URL}/posts`, {
    withCredentials: true,
  });

  return res.data;
};

export const getPostsBySender = async (token: string) => {
  const { userId } = decodeToken(token);

  const res = await axios.get(`${config.SERVER_URL}/posts/sender/${userId}`, {
    withCredentials: true,
  });

  return res.data;
};

export const createPost = async (title: string, body: string) => {
  const res = await axios.post(
    `${config.SERVER_URL}/posts`,
    {
      title,
      body,
    },
    {
      withCredentials: true,
    }
  );

  return res.data;
};

export const getCommentsByPost = async (postId: string) => {
  const res = await axios.get(
    `${config.SERVER_URL}/comments/postId/${postId}`,
    {
      withCredentials: true,
    }
  );

  return res.data;
};

export const addCommentToPost = async (postId: string, comment: string) => {
  const res = await axios.post(
    `${config.SERVER_URL}/comments`,
    {
      body: comment,
      postId,
    },
    {
      withCredentials: true,
    }
  );

  return res.status === 201;
};
