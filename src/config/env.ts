import { config } from "dotenv";

// Initialising dotenv to read .env file
config();

export const env = {
  mongoServer: process.env.MONGO_SERVER,
  awsAccessKeyId: process.env.AWS_ACCESS_KEY_ID,
  awsSecretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
};
