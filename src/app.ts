import express from "express";
import { initializeMiddlewares } from "@setup/middleware";
import { connectToDatabase } from "@setup/db";
import { initializeApolloServer } from "@setup/apolloserver";

const main = async (): Promise<void> => {
  const app = express();
  const PORT = 1337;

  // Connecting to database
  await connectToDatabase();

  // Initialising middlewares and routes
  initializeMiddlewares(app);

  // Initialising apollo server
  await initializeApolloServer(app);

  app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
  });
};

main().catch((err) => {
  console.log("Something went wrong!");
  console.log(err);
});
