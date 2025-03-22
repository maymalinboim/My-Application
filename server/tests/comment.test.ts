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
  let commentId: string;

  beforeAll(async () => {
    app = await appPromise;
    await Post.deleteMany();
  });

  afterAll((done) => {
    mongoose.connection.close();
    done();
  });

  test("Create comment for post", async () => {
    const userDemo = {
      username: "testComment",
      email: "testComment@gmail.com",
      password: "testComment123",
      profilePhoto: "images/dog-8198719_640.jpg",
    };
    const registerResponse = await request(app)
      .post("/users/register")
      .send(userDemo)
      .set("Content-Type", "application/json");
    authToken = registerResponse.body.accessToken;

    const postDemo = {
      title: "Test post for comment",
      body: "post!",
    };
    const postResponse = await request(app)
      .post("/posts")
      .send(postDemo)
      .set("Cookie", [`Authorization=Bearer ${authToken}`])
      .set("Content-Type", "application/json");

    postId = postResponse.body._id;

    const commentDemo = {
      body: "test comment!",
      postId: postId,
    };

    const response = await request(app)
      .post("/comments")
      .send(commentDemo)
      .set("Cookie", [`Authorization=Bearer ${authToken}`])
      .set("Content-Type", "application/json");
    commentId = response.body.comments[0]._id;
    expect(response.statusCode).toEqual(201);
  });

  test("Get all comments", async () => {
    const response = await request(app)
      .get("/comments")
      .set("Cookie", [`Authorization=Bearer ${authToken}`]);
    expect(response.statusCode).toEqual(200);
  });

  test("Get all comments for post", async () => {
    const response = await request(app)
      .get(`/comments/postId/${postId}`)
      .set("Cookie", [`Authorization=Bearer ${authToken}`]);
    expect(response.statusCode).toEqual(200);
  });

  test("Get comment by id", async () => {
    const response = await request(app)
      .get(`/comments/commentId/?id=${commentId}&postId=${postId}`)
      .set("Cookie", [`Authorization=Bearer ${authToken}`]);
    expect(response.statusCode).toEqual(200);
  });

  test("Update post by id", async () => {
    const updatedComment = {
      body: "comment update!",
      postId: postId,
    };
    const response = await request(app)
      .put(`/comments/${commentId}`)
      .send(updatedComment)
      .set("Content-Type", "application/json")
      .set("Cookie", [`Authorization=Bearer ${authToken}`]);
    expect(response.statusCode).toEqual(201);
  });

  test("Delete comment by id", async () => {
    const commentToDelete = {
      id: commentId,
      postId: postId,
    };
    const response = await request(app)
      .delete(`/comments`)
      .send(commentToDelete)
      .set("Cookie", [`Authorization=Bearer ${authToken}`]);
    expect(response.statusCode).toEqual(200);
  });
});
