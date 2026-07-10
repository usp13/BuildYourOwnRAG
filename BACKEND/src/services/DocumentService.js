import crypto from "crypto";
import TextChunker from "../utils/TextChunker.js";

class DocumentService {

    constructor(documentDB, ollama) {

        this.documentDB = documentDB;

        this.ollama = ollama;

        this.chunker = new TextChunker(250, 50);
    }

    async insertDocument(title, text) {

        if (!title)
            throw new Error("Title is required");

        if (!text)
            throw new Error("Text is required");

        const chunks = this.chunker.chunk(text);

        const insertedChunks = [];

        for (let i = 0; i < chunks.length; i++) {

            const chunkText = chunks[i];

            const embedding =
                await this.ollama.embed(chunkText);

            const chunk = {

                id: crypto.randomUUID(),

                title,

                chunkIndex: i,

                text: chunkText,

                vector: embedding

            };

            this.documentDB.insert(chunk);

            insertedChunks.push(chunk);
        }

        return {

            title,

            totalChunks: insertedChunks.length,

            chunks: insertedChunks

        };
    }

}

export default DocumentService;