import express from "express";

import {

    getItems,

    searchVectors,

       semanticSearch,

    insertVector,

    deleteVector,

    benchmark

} from "../controllers/vector.controller.js";

const router = express.Router();

router.get("/items", getItems);

router.get("/search", searchVectors);

router.post("/search", semanticSearch); 

router.post("/insert", insertVector);

router.delete("/delete/:id", deleteVector);

router.get("/benchmark", benchmark);

export default router;