import config from "@/config";
import axios from "axios";

export const getAllPosts = async () => {
  const res = await axios.get(`${config.SERVER_URL}/posts`, {
    withCredentials: true,
  });

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
