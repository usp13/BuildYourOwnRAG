import KDNode from "./KDNode.js";
import { getDistance } from "../metrics/index.js";

class KDTree {
  constructor(dimensions = 16) {
    this.root = null;
    this.dimensions = dimensions;
    this.items = [];
  }

  insert(item) {
    this.items.push(item);
    this.root = this.build(this.items, 0);
  }

  remove(id) {
    this.items = this.items.filter((item) => item.id !== id);
    this.root = this.build(this.items, 0);
  }

  clear() {
    this.items = [];
    this.root = null;
  }

  size() {
    return this.items.length;
  }

  getAll() {
    return this.items;
  }

  build(points, depth = 0) {
    if (points.length === 0) {
      return null;
    }

    const axis = depth % this.dimensions;

    const sorted = [...points].sort(
      (a, b) => a.vector[axis] - b.vector[axis]
    );

    const median = Math.floor(sorted.length / 2);

    const node = new KDNode(
      sorted[median],
      axis
    );

    node.left = this.build(
      sorted.slice(0, median),
      depth + 1
    );

    node.right = this.build(
      sorted.slice(median + 1),
      depth + 1
    );

    return node;
  }

  search(queryVector, k = 5, metric = "euclidean") {
    const distance = getDistance(metric);

    const best = [];

    const searchRecursive = (node) => {
      if (!node) return;

      const dist = distance(
        queryVector,
        node.item.vector
      );

      best.push({
        ...node.item,
        distance: dist,
      });

      best.sort(
        (a, b) => a.distance - b.distance
      );

      if (best.length > k) {
        best.pop();
      }

      const axis = node.axis;
      const diff =
        queryVector[axis] -
        node.item.vector[axis];

      const near =
        diff < 0 ? node.left : node.right;

      const far =
        diff < 0 ? node.right : node.left;

      searchRecursive(near);

      const worst =
        best.length < k
          ? Infinity
          : best[best.length - 1].distance;

      if (Math.abs(diff) < worst) {
        searchRecursive(far);
      }
    };

    searchRecursive(this.root);

    return best;
  }
}

export default KDTree;