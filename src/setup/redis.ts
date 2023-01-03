import { createClient } from "redis";

export const redisClient = createClient();

export const initializeRedis = async () => {
  redisClient
    .connect()
    .then(() => {
      console.log("🚀 Redis client connected");
    })
    .catch((err) => {
      console.log("🛑 Redis client not connected to the server: ", err.message);
    });
};
