class HNSWNode {
  constructor(item, level) {
    this.item = item;
    this.level = level;

    // layer -> Set of neighbor ids
    this.neighbors = new Map();

    for (let i = 0; i <= level; i++) {
      this.neighbors.set(i, new Set());
    }
  }
}

export default HNSWNode;