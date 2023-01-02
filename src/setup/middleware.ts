import { json, urlencoded } from "express";
import cors from "cors";

import Router from "@api/routes";

export const initializeMiddlewares = (app: any): void => {
  app.use(cors())
  app.use(urlencoded({ extended: true }));
  app.use(json());

  // Initialising routes
  app.use("/", Router);
};
