import config from "@/config";
import { decodeToken } from "@/utils/authUtils";
import axios from "axios";

export const getAllPosts = async () => {
  const res = await axios.get(`${config.SERVER_URL}/posts`, {
    withCredentials: true,
  });

  console.log(res.data);
  
  return res.data;
};

export const getPostsBySender = async (token: string) => {
  const { userId } = decodeToken(token);

  const res = await axios.get(`${config.SERVER_URL}/posts/sender/${userId}`, {
    withCredentials: true,
  });

  return res.data;
};

export const getPostsById = async (postId: string) => {
  const res = await axios.get(`${config.SERVER_URL}/posts/${postId}`, {
    withCredentials: true,
  });

  return res.data;
};

export const createPost = async (title: string, body: string, image: File | null) => {
  const formData = new FormData();
  image && formData.append("image", image);
  formData.append("title", title);
  formData.append("body", body);

  const res = await axios.post(
    `${config.SERVER_URL}/posts`,
    formData,
    {
      headers: { "Content-Type": "multipart/form-data" },
      withCredentials: true,
    },
  );

  return res.data;
};

export const editPost = async (postId: string, title: string, body: string, image: File | null) => {
  const formData = new FormData();
  image && formData.append("image", image);
  formData.append("title", title);
  formData.append("body", body);

  const res = await axios.put(
    `${config.SERVER_URL}/posts/${postId}`,
    formData,
    {
      headers: { "Content-Type": "multipart/form-data" },
      withCredentials: true,
    },
  );

  return res.data;
};

export const deletePost = async (postId: string) => {
  const res = await axios.delete(`${config.SERVER_URL}/posts/${postId}`, {
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
