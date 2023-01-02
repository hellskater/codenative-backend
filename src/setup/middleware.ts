import { json, urlencoded } from "express";
import cors from "cors";

import Router from "@api/routes";

export const initializeMiddlewares = (app: any): void => {
  const corsOptions = {
    origin: "*",
    credentials: true, //access-control-allow-credentials:true
    optionSuccessStatus: 200,
  };
  app.use(cors(corsOptions));
  app.use(urlencoded({ extended: true }));
  app.use(json());

  // Initialising routes
  app.use("/", Router);
};
