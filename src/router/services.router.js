import { Router } from "express";
import { ServiceController } from "../controllers/index.js";

export const serviceRouter = Router();

serviceRouter.post("/add", ServiceController.addService);
serviceRouter.get("/getall", ServiceController.getAllService);
serviceRouter.get("/getbyslug/:slug", ServiceController.getServiceBySlug);
serviceRouter.delete("/remove/:title", ServiceController.removeService);
serviceRouter.put("/update/:oldTitle", ServiceController.updateServiceByTitle);
