import express from "express";
import { getVisualization } from "../controllers/visualizationController.js";

const router = express.Router();

router.get("/", getVisualization);

export default router;