import express from "express";
import { initializeMiddlewares } from "@setup/middleware";
import { connectToDatabase } from "@setup/db";
import { initializeApolloServer } from "@setup/apolloserver";
import { initializeRedis } from "@setup/redis";
import http from "http";
import { SocketController } from "@setup/socketController";

const main = async (): Promise<void> => {
  const app = express();
  const PORT = 1337;

  // Connecting to database
  await connectToDatabase();

  // Initialize redis
  await initializeRedis();

  // Initialising middlewares and routes
  initializeMiddlewares(app);

  // Initialising apollo server
  await initializeApolloServer(app);

  // Initialising socket server

  const server = http.createServer(app);

  server.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);

    const socketController = new SocketController();

    try {
      socketController.init(server);
    } catch (error: any) {
      console.log(
        " 🛑 Socket server not connected to the server: ",
        error.message
      );
    }
  });
};

main().catch((err) => {
  console.log("Something went wrong!");
  console.log(err);
});
