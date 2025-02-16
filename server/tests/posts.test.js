const request = require("supertest");
    const app = require("../app.js"); // import your express app
    const mongoose = require("mongoose");
    const { Post, User } = require("../db/dbUtils");
    const jwt = require("jsonwebtoken");
    const { generateToken } = require("../handlers/authUtils");
    
    // Mocking Mongoose Models
    jest.mock("../db/dbUtils");
    
    // Mock jwt methods
    jest.mock("jsonwebtoken");
    
    describe("Posts API", () => {
      let userToken;
      let mockUser;
    
      beforeAll(() => {
        userToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2Nzg1Mzg0Nzg1MTYxNTA2Y2ZlNTY0YmMiLCJpYXQiOjE3MzY3ODM5NDMsImV4cCI6MTczNjg3MDM0M30.BXVTHSgkOl3uTUp7oNR_arGT-noQkyjOUvfUk2y_9QE'
    
        // Mock jwt.verify method
        jwt.verify.mockImplementation(() => ({ userId: mockUser._id }));
      });
    
      beforeEach(() => {
        // Reset any mocks
        Post.create.mockReset();
        Post.find.mockReset();
        User.findById.mockReset();
        jwt.verify.mockReset();
      });
    
      describe("POST /posts", () => {
        it("should create a new post", async () => {
          // Arrange
          const newPostData = {
            title: "Test Post Title",
            body: "Test body content of the post",
          };
    
          // Mock the user fetching part of the post creation
          User.findById.mockResolvedValue(mockUser);
          Post.prototype.save.mockResolvedValue({
            ...newPostData,
            author: mockUser._id,
            _id: "post123",
          });
    
          // Act
          const response = await request(app)
            .post("/posts")
            .set("Authorization", `Bearer ${userToken}`)
            .send(newPostData);
    
          // Assert
          expect(response.status).toBe(201);
          expect(response.body.title).toBe(newPostData.title);
          expect(response.body.body).toBe(newPostData.body);
        });
    
        it("should return 400 if title or body is missing", async () => {
          const newPostData = { title: "", body: "" };
    
          const response = await request(app)
            .post("/posts")
            .set("Authorization", `Bearer ${userToken}`)
            .send(newPostData);
    
          expect(response.status).toBe(400);
          expect(response.body.error).toBe("Please provide title, and body");
        });
    
        it("should return 404 if user not found", async () => {
          User.findById.mockResolvedValue(null); // Simulate user not found
    
          const newPostData = {
            title: "Test Post Title",
            body: "Test body content of the post",
          };
    
          const response = await request(app)
            .post("/posts")
            .set("Authorization", `Bearer ${userToken}`)
            .send(newPostData);
    
          expect(response.status).toBe(404);
          expect(response.body.error).toBe("User not found");
        });
      });
    
      describe("GET /posts", () => {
        it("should return all posts", async () => {
          // Mock posts data
          const mockPosts = [
            { title: "Post 1", body: "Content 1", _id: "1" },
            { title: "Post 2", body: "Content 2", _id: "2" },
          ];
    
          Post.find.mockResolvedValue(mockPosts);
    
          const response = await request(app).get("/posts");
    
          expect(response.status).toBe(200);
          expect(response.body.length).toBe(2);
          expect(response.body[0].title).toBe("Post 1");
        });
    
        it("should return 500 if an error occurs", async () => {
          Post.find.mockRejectedValue(new Error("Database error"));
    
          const response = await request(app).get("/posts");
    
          expect(response.status).toBe(500);
          expect(response.body.error).toBe("An error occurred while fetching posts");
        });
      });
    
      describe("GET /posts/:id", () => {
        it("should return a post by ID", async () => {
          const postData = { title: "Test Post", body: "Test Content", _id: "post123" };
          Post.findById.mockResolvedValue(postData);
    
          const response = await request(app).get("/posts/post123");
    
          expect(response.status).toBe(200);
          expect(response.body.title).toBe("Test Post");
          expect(response.body.body).toBe("Test Content");
        });
    
        it("should return 404 if post not found", async () => {
          Post.findById.mockResolvedValue(null); // Simulate post not found
    
          const response = await request(app).get("/posts/post123");
    
          expect(response.status).toBe(404);
          expect(response.body.error).toBe("Post not found");
        });
      });
    
      describe("PUT /posts/:id", () => {
        it("should update a post", async () => {
          const postId = "post123";
          const updatedPostData = { title: "Updated Title", body: "Updated Body" };
          const updatedPost = { ...updatedPostData, _id: postId };
    
          Post.findOne.mockResolvedValue(updatedPost);
    
          const response = await request(app)
            .put(`/posts/${postId}`)
            .set("Authorization", `Bearer ${userToken}`)
            .send(updatedPostData);
    
          expect(response.status).toBe(200);
          expect(response.body.title).toBe(updatedPostData.title);
          expect(response.body.body).toBe(updatedPostData.body);
        });
    
        it("should return 400 if update data is missing", async () => {
          const response = await request(app)
            .put("/posts/post123")
            .set("Authorization", `Bearer ${userToken}`)
            .send({}); // No title or body
    
          expect(response.status).toBe(400);
          expect(response.body.error).toBe("Please provide post id and update details");
        });
    
        it("should return 404 if post not found", async () => {
          Post.findOne.mockResolvedValue(null); // Simulate post not found
    
          const updatedPostData = { title: "Updated Title", body: "Updated Body" };
    
          const response = await request(app)
            .put("/posts/post123")
            .set("Authorization", `Bearer ${userToken}`)
            .send(updatedPostData);
    
          expect(response.status).toBe(404);
          expect(response.body.error).toBe("Post not found");
        });
      });
    
      describe("DELETE /posts/:id", () => {
        it("should delete a post", async () => {
          const postId = "post123";
          const postToDelete = { _id: postId, title: "Test Post", body: "Test Body", author: mockUser._id };
    
          Post.findById.mockResolvedValue(postToDelete);
          Post.findByIdAndDelete.mockResolvedValue(postToDelete);
    
          const response = await request(app)
            .delete(`/posts/${postId}`)
            .set("Authorization", `Bearer ${userToken}`);
    
          expect(response.status).toBe(200);
          expect(response.body.message).toBe("Post deleted successfully");
        });
    
        it("should return 404 if post not found", async () => {
          Post.findById.mockResolvedValue(null); // Simulate post not found
    
          const response = await request(app)
            .delete("/posts/post123")
            .set("Authorization", `Bearer ${userToken}`);
    
          expect(response.status).toBe(404);
          expect(response.body.error).toBe("Post not found");
        });
      });
    });
    