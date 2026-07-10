import { documentDB } from "../config/database.js";

const averageVector = (vectors) => {
  if (!vectors.length) return [];

  const dimensions = vectors[0].length;

  const result = new Array(dimensions).fill(0);

  vectors.forEach((vector) => {
    for (let i = 0; i < dimensions; i++) {
      result[i] += vector[i];
    }
  });

  return result.map((value) => value / vectors.length);
};

export const getVisualization = (req, res) => {
  try {
    //const documents = documentDB.getAll();
    const documents = documentDB.list();

    const grouped = {};

    documents.forEach((doc) => {
      if (!grouped[doc.title]) {
        grouped[doc.title] = [];
      }

      grouped[doc.title].push(doc);
    });

    const result = Object.entries(grouped).map(([title, chunks]) => ({
      id: chunks[0].id,
      title,
      chunkCount: chunks.length,
      vector: averageVector(chunks.map((c) => c.vector)),
    }));

    res.json({
      success: true,
      documents: result,
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};