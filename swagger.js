const swaggerJsdoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Node-Postgress-Express API Documentation",
      version: "1.0.0",
      description: "Documentation for Node-Postgress-Express API",
      contact: {
        name: "API Support",
        email: "yachint.tlc@gmail.com",
      },
    },
    servers: [
      {
        url: "/",
        description: "Current server",
      },
    ],
  },
  apis: ["./routes/*.js"],
};

const specs = swaggerJsdoc(options);
module.exports = specs;
