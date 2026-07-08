import dotenv from "dotenv";

import VectorDB from "../database/VectorDB.js";
import DocumentDB from "../database/DocumentDB.js";

import OllamaService from "../services/OllamaService.js";
import RAGService from "../services/RAGService.js";

import { loadDemoData } from "../data/loadDemoData.js";

dotenv.config();

const vectorDB = new VectorDB();

loadDemoData(vectorDB);

const ollama = new OllamaService();

const documentDB = new DocumentDB();

const ragService = new RAGService(
    documentDB,
    ollama
);

export {

    vectorDB,

    documentDB,

    ollama,

    ragService

};