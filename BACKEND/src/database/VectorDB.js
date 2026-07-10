import BruteForce from "../algorithms/bruteforce/BruteForce.js";
import KDTree from "../algorithms/kdtree/KDTree.js";
import HNSW from "../algorithms/hnsw/HNSW.js";
import { performance } from "node:perf_hooks";

class VectorDB {
  constructor(dimensions = 16) {
    this.dimensions = dimensions;

    this.bruteforce = new BruteForce()
    this.kdtree = new KDTree(
      dimensions
    );

    this.hnsw = new HNSW({
      dimensions
    });

    this.items = new Map();
  }

  insert(item) {
    if (
      !item.id ||
      !item.vector
    ) {
      throw new Error(
        "Invalid item"
      );
    }

    if (
      item.vector.length !==
      this.dimensions
    ) {
      throw new Error(
        `Expected ${this.dimensions} dimensions`
      );
    }

    this.items.set(
      item.id,
      item
    );

    this.bruteforce.insert(
      item
    );

    this.kdtree.insert(
      item
    );

    this.hnsw.insert(
      item
    );
  }

  remove(id) {
    this.items.delete(id);

    this.bruteforce.remove(
      id
    );

    this.kdtree.remove(
      id
    );

    //  HNSW delete will be implemented later
    
  }

  search(
    vector,
    k = 5,
    metric = "cosine",
    algo = "hnsw"
  ) {
    switch (
      algo.toLowerCase()
    ) {
      case "bruteforce":
        return this.bruteforce.search(
          vector,
          k,
          metric
        );

      case "kdtree":
        return this.kdtree.search(
          vector,
          k,
          metric
        );

      case "hnsw":
        return this.hnsw.search(
          vector,
          k
        );

      default:
        throw new Error(
          `Unknown algorithm: ${algo}`
        );
    }
  }



  getAll() {
    return [
      ...this.items.values()
    ];
  }

  size() {
    return this.items.size;
  }

  stats() {
    return {
      totalVectors:
        this.items.size,

      dimensions:
        this.dimensions,

      hnsw:
        this.hnsw.stats(),

      kdTreeSize:
        this.kdtree.size(),

      bruteForceSize:
        this.bruteforce.size()
    };
  }

    // Return all vectors
    getItems() {
        return Array.from(this.items.values());
    }

    // Return a single vector by id
    getItem(id) {
        return this.items.get(id);
    }

    // Check if a vector exists
    exists(id) {
        return this.items.has(id);
    }

    // Return total number of vectors
    count() {
        return this.items.size;
    }




  getHNSWInfo() {
    return this.hnsw.stats();
  }



  benchmark(vector, k = 5, metric = "cosine") {

    const algorithms = [
        "bruteforce",
        "kdtree",
        "hnsw"
    ];

    const output = [];

    for (const algo of algorithms) {

        const start = performance.now();

        const results =
            this.search(
                vector,
                k,
                metric,
                algo
            );

        const end = performance.now();

        output.push({

            algorithm: algo,

            time: Number(
                (end - start).toFixed(3)
            ),

            results

        });

    }

    return output;
}

}

export default VectorDB;