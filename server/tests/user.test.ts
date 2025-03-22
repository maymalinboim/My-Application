import request from "supertest";
import appPromise from "../app";
import { User } from "../models/models";
import mongoose from "mongoose";
import { Express } from "express";
import { verifyAccessToken } from "../handlers/authUtils";

describe("User API tests", () => {
  var app: Express;
  let authToken: string;

  beforeAll(async () => {
    app = await appPromise;
    await User.deleteMany();
  });

  afterAll((done) => {
    mongoose.connection.close();
    done();
  });

  test("Register user", async () => {
    const userDemo = {
      username: "test",
      email: "test@gmail.com",
      password: "test123",
      profilePhoto: "images/dog-8198719_640.jpg",
    };
    const response = await request(app)
      .post("/users/register")
      .send(userDemo)
      .set("Content-Type", "application/json");
    authToken = response.body.accessToken;
    expect(response.statusCode).toEqual(201);
  });

  test("Logout user", async () => {
    const response = await request(app)
      .post("/users/logout")
      .set("Cookie", [`Authorization=Bearer ${authToken}`]);
    expect(response.statusCode).toEqual(200);
  });

  test("Login user", async () => {
    const userDemo = {
      username: "test",
      password: "test123",
    };
    const response = await request(app)
      .post("/users/login")
      .send(userDemo)
      .set("Content-Type", "application/json");
    authToken = response.body.accessToken;
    expect(response.statusCode).toEqual(201);
  });

  test("Get all users", async () => {
    const response = await request(app)
      .get("/users")
      .set("Cookie", [`Authorization=Bearer ${authToken}`]);
    expect(response.statusCode).toEqual(200);
  });

  test("Get user by id", async () => {
    const decodedToken = verifyAccessToken(authToken);
    const response = await request(app)
      .get(`/users/${decodedToken?.userId}`)
      .set("Cookie", [`Authorization=Bearer ${authToken}`]);
    expect(response.statusCode).toEqual(200);
  });

  test("Update user by id", async () => {
    const decodedToken = verifyAccessToken(authToken);
    const updatedUser = {
      username: "test2",
      email: "test2@gmail.com",
      password: "test123",
    };
    const response = await request(app)
      .put(`/users/${decodedToken?.userId}`)
      .send(updatedUser)
      .set("Content-Type", "application/json")
      .set("Cookie", [`Authorization=Bearer ${authToken}`]);
    expect(response.statusCode).toEqual(200);
  });

  test("Delete user by id", async () => {
    const decodedToken = verifyAccessToken(authToken);
    const response = await request(app)
      .delete(`/users/${decodedToken?.userId}`)
      .set("Cookie", [`Authorization=Bearer ${authToken}`]);
    expect(response.statusCode).toEqual(200);
  });
});
