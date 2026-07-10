import express from "express";

import {

    getStatus,

    getStats,

    getHNSWInfo

}

from "../controllers/system.controller.js";

const router = express.Router();

router.get("/status", getStatus);

router.get("/stats", getStats);

router.get("/hnsw-info", getHNSWInfo);

export default router;