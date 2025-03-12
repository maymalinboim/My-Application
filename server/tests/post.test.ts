import request from "supertest";
import appPromise from "../app";
import { Post } from "../models/models";
import mongoose from "mongoose";
import { Express } from "express";
import { verifyAccessToken } from "../handlers/authUtils";

describe("Post API tests", () => {
  var app: Express;
  let authToken: string;
  let postId: string;

  beforeAll(async () => {
    app = await appPromise;
    await Post.deleteMany();
  });

  afterAll((done) => {
    mongoose.connection.close();
    done();
  });

  test("Create post", async () => {
    const userDemo = {
      username: "testPost",
      email: "testPost@gmail.com",
      password: "testPost123",
      profilePhoto: "images/dog-8198719_640.jpg",
    };
    const registerResponse = await request(app)
      .post("/users/register")
      .send(userDemo)
      .set("Content-Type", "application/json");
    authToken = registerResponse.body.accessToken;

    const postDemo = {
      title: "Test post",
      body: "post!",
    };
    const response = await request(app)
      .post("/posts")
      .send(postDemo)
      .set("Cookie", [`Authorization=Bearer ${authToken}`])
      .set("Content-Type", "application/json");
    expect(response.statusCode).toEqual(201);
  });

  test("Get all posts", async () => {
    const response = await request(app)
      .get("/posts")
      .set("Cookie", [`Authorization=Bearer ${authToken}`]);
    expect(response.statusCode).toEqual(200);
  });

  test("Get post by author", async () => {
    const decodedToken = verifyAccessToken(authToken);
    const response = await request(app)
      .get(`/posts/sender/${decodedToken?.userId}`)
      .set("Cookie", [`Authorization=Bearer ${authToken}`]);
    postId = response.body[0]._id;
    expect(response.statusCode).toEqual(200);
  });

  test("Get post by id", async () => {
    const response = await request(app)
      .get(`/posts/${postId}`)
      .set("Cookie", [`Authorization=Bearer ${authToken}`]);
    expect(response.statusCode).toEqual(200);
  });

  test("Update post by id", async () => {
    const decodedToken = verifyAccessToken(authToken);
    const updatedPost = {
      title: "Test post update",
      body: "post update!",
    };
    const response = await request(app)
      .put(`/posts/${postId}`)
      .send(updatedPost)
      .set("Content-Type", "application/json")
      .set("Cookie", [`Authorization=Bearer ${authToken}`]);
    expect(response.statusCode).toEqual(200);
  });

  test("Delete post by id", async () => {
    const response = await request(app)
      .delete(`/posts/${postId}`)
      .set("Cookie", [`Authorization=Bearer ${authToken}`]);
    expect(response.statusCode).toEqual(200);
  });
});
