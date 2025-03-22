const swaggerJSDoc = require("swagger-jsdoc");

const swaggerDefinition = {
  openapi: "3.0.0",
  info: {
    title: "API Documentation",
    version: "1.0.0",
    description: "This contains API for users, posts and comments",
  },
  servers: [
    {
      url:
        process.env.NODE_ENV === "production"
          ? "https://193.106.55.235"
          : "http://localhost:3000",
    },
  ],
};

const options = {
  swaggerDefinition,
  apis: ["./routes/*.ts"],
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = swaggerSpec;
