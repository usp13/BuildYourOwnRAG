import { getDistance } from "../metrics/index.js";

class BruteForce {
  constructor() {
    this.items = [];
  }

  insert(item) {
    this.items.push(item);
  }

  remove(id) {
    this.items = this.items.filter((item) => item.id !== id);
  }

  search(queryVector, k = 5, metric = "cosine") {
    const distance = getDistance(metric);

    const results = [];

    for (const item of this.items) {
      results.push({
        ...item,
        distance: distance(queryVector, item.vector),
      });
    }

    results.sort((a, b) => a.distance - b.distance);

    return results.slice(0, k);
  }

  getAll() {
    return this.items;
  }

  size() {
    return this.items.length;
  }

  clear() {
    this.items = [];
  }
}

export default BruteForce;