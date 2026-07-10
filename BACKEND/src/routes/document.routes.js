import express from "express";

import {

    insertDocument,

    getDocuments,

    deleteDocument

} from "../controllers/document.controller.js";

const router = express.Router();

router.post("/", insertDocument);

router.get("/", getDocuments);

router.delete("/:id", deleteDocument);

export default router;