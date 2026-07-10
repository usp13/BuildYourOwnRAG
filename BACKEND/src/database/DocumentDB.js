import crypto from "crypto";
import HNSW from "../algorithms/hnsw/HNSW.js";
import ChunkService from "../services/ChunkService.js";

class DocumentDB {
  constructor() {
    this.documents = new Map();

    this.index = new HNSW({
      dimensions: 768,
    }); 
  }

  async insertDocument(
    title,
    text,
    embeddingFn
  ) {
    const chunks =
      ChunkService.chunkText(text);

    const inserted = [];

    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];

      const embedding =
        await embeddingFn(chunk);

      const id =
        crypto.randomUUID();

      const doc = {
        id,
        title,
        chunkIndex: i,
        text: chunk,
        vector: embedding,
      };

      this.documents.set(
        id,
        doc
      );

      this.index.insert(doc);

      inserted.push(doc);
    }

    return inserted;
  }

  search(
    embedding,
    k = 3
  ) {
    return this.index.search(
      embedding,
      k
    );
  }



  searchByEmbedding(embedding, k = 3) {
    return this.index.search(
        embedding,
        k
    );
  }




  list() {
    return [
      ...this.documents.values()
    ];
  }

  get(id) {
      return this.documents.get(id);
  }

  exists(id) {
      return this.documents.has(id);
  }

  count() {
      return this.documents.size;
  }

  stats() {
      return {
          totalChunks: this.documents.size,
          dimensions: 768,
          hnsw: this.index.stats()
      };
  }

  remove(id) {
    this.documents.delete(id);
  }
}

export default DocumentDB;