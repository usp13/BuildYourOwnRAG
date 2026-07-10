// TESTING BRUTE FORCE 
// import BruteForce from "./algorithms/bruteforce/BruteForce.js";

// const db = new BruteForce();

// db.insert({
//   id: "1",
//   label: "Apple",
//   vector: [1, 2, 3],
// });

// db.insert({
//   id: "2",
//   label: "Banana",
//   vector: [2, 3, 4],
// });

// console.log(
//   db.search([1, 2, 3], 2, "euclidean")
// );

//---------------------------------------------------//

// TESTING KD TREE
// import KDTree from "./algorithms/kdtree/KDTree.js";

// const tree = new KDTree(3);

// tree.insert({
//   id: "1",
//   label: "A",
//   vector: [1, 2, 3],
// });

// tree.insert({
//   id: "2",
//   label: "B",
//   vector: [2, 3, 4],
// });

// tree.insert({
//   id: "3",
//   label: "C",
//   vector: [10, 10, 10],
// });

// console.log(
//   tree.search([1, 2, 3], 2, "euclidean")
// );
//---------------------------------------------//
// TESTING HNSW Basic
// import HNSW from "./algorithms/hnsw/HNSW.js";

// const hnsw = new HNSW();

// console.log(hnsw.randomLevel());
// console.log(hnsw.randomLevel());
// console.log(hnsw.randomLevel());
// console.log(hnsw.randomLevel()); 

// const h = new HNSW();

// console.log(
//   typeof h.greedySearch
// );

// console.log(
//   typeof h.searchLayer
// );



//---------------//
// Testing HNSW 
// import HNSW from "./algorithms/hnsw/HNSW.js";

// const h = new HNSW({
//   dimensions: 3
// });

// h.insert({
//   id: "1",
//   label: "A",
//   vector: [1,2,3]
// });

// h.insert({
//   id: "2",
//   label: "B",
//   vector: [2,3,4]
// });

// h.insert({
//   id: "3",
//   label: "C",
//   vector: [10,10,10]
// });

// h.insert({
//   id: "4",
//   label: "D",
//   vector: [1.1,2.1,3.1]
// });

// console.log(
//   h.stats()
// );

// console.log(
//   h.getNode("1")
// );

// // Verify the graph 
// for (const node of h.getAll()) {
//   console.log(
//     node.item.label,
//     node.neighbors
//   );
// }

//----------------------------------------------//
// Testing KNN SEARCH 
// import HNSW from "./algorithms/hnsw/HNSW.js";

// const h = new HNSW({
//   dimensions: 3,
//   metric: "euclidean"
// });

// h.insert({
//   id: "1",
//   label: "A",
//   vector: [1, 2, 3]
// });

// h.insert({
//   id: "2",
//   label: "B",
//   vector: [2, 3, 4]
// });

// h.insert({
//   id: "3",
//   label: "C",
//   vector: [10, 10, 10]
// });

// h.insert({
//   id: "4",
//   label: "D",
//   vector: [1.1, 2.1, 3.1]
// });

// console.log(
//   h.search(
//     [1, 2, 3],
//     3
//   )
// );

// ALL completely working till custom HNSW Implementation 

//--------------------------------------------------------//

// Testing VectorDB.js
// import VectorDB from "./database/VectorDB.js";

// const db = new VectorDB(3);

// db.insert({
//   id: "1",
//   label: "A",
//   vector: [1, 2, 3]
// });

// db.insert({
//   id: "2",
//   label: "B",
//   vector: [2, 3, 4]
// });

// db.insert({
//   id: "3",
//   label: "C",
//   vector: [10, 10, 10]
// });

// db.insert({
//   id: "4",
//   label: "D",
//   vector: [1.1, 2.1, 3.1]
// });

// console.log(
//   db.search(
//     [1,2,3],
//     3,
//     "euclidean",
//     "hnsw"
//   )
// );

// console.log(
//   db.search(
//     [1,2,3],
//     3,
//     "euclidean",
//     "kdtree"
//   )
// );

// console.log(
//   db.search(
//     [1,2,3],
//     3,
//     "euclidean",
//     "bruteforce"
//   )
// );

// console.log(
//   db.stats()
// );

// Tested VectorDb.js Succesfully 
//-------------------------------------------------------//


// Testing  DEMO DATA VECTOR

// import VectorDB from "./database/VectorDB.js";
// import demoVectors from "./data/demoVectors.js";
// import { loadDemoData } from "./data/loadDemoData.js";

// const db = new VectorDB();

// loadDemoData(db);

// console.log(db.stats());

// console.log(
//   db.search(
//     demoVectors[0].vector,
//     5,
//     "cosine",
//     "hnsw"
//   )
// );

/**
 Current Progress : 
✅ Metrics
✅ BruteForce
✅ KDTree
✅ HNSW
✅ VectorDB
✅ Demo Data
⬜ ChunkService
⬜ OllamaService
⬜ DocumentDB
⬜ RAGService
⬜ REST APIs
⬜ Frontend */

//-----------------------------------------------------------//


// Testing Chunk Service.js
// import ChunkService from "./services/ChunkService.js";

// const text = `
// Artificial intelligence is transforming software development.
// Large language models are capable of generating code.
// Vector databases enable semantic search and retrieval augmented generation.
// `.repeat(100);

// const chunks =
//   ChunkService.chunkText(
//     text,
//     50,
//     10
//   );

// console.log(chunks.length);
// console.log(chunks[0]);



//----------------------------------------------------------//

// Testing Ollama service.js
// import OllamaService from "./services/OllamaService.js";

// const ollama =
//   new OllamaService();

// console.log(
//   await ollama.health()
// );

// const embedding =
//   await ollama.embed(
//     "Hello world"
//   );

// console.log(
//   embedding.length
// );



// Testing RAGservice.js
import DocumentDB from "./database/DocumentDB.js";
import OllamaService from "./services/OllamaService.js";
import RAGService from "./services/RAGService.js";

const ollama = new OllamaService();

const db = new DocumentDB();

await db.insertDocument(

    "Operating Systems",

    `
Operating systems manage
memory,
processes,
files,
and hardware resources.

Virtual memory allows
processes to use more memory
than physically available.

`,

    ollama.embed.bind(ollama)

);

const rag =
    new RAGService(
        db,
        ollama
    );

const result =
    await rag.ask(
        "What is virtual memory?"
    );

console.log(result.answer);

console.log(result.context);