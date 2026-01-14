import { Router } from "express";
import { ServiceController } from "../controllers/index.js";
import { dynamicAuth } from "../middlewares/auth.middlewares.js";

export const serviceRouter = Router();

serviceRouter.post("/add", ServiceController.addService);
serviceRouter.get("/getall",dynamicAuth, ServiceController.getAllService);
serviceRouter.get("/getbyslug/:slug",dynamicAuth, ServiceController.getServiceBySlug);
serviceRouter.delete("/remove/:title", ServiceController.removeService);
serviceRouter.put("/update/:oldTitle", ServiceController.updateServiceByTitle);
