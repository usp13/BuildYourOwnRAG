import HNSWNode from "./HNSWNode.js";
import { getDistance } from "../metrics/index.js";


// Skeleton of HNSW
class HNSW {

//   constructor({
//     M = 8,
//     efConstruction = 200,
//     efSearch = 50,
//     dimensions = 16
//   } = {}) {
//     this.M = M;
//     this.efConstruction = efConstruction;
//     this.efSearch = efSearch;
//     this.dimensions = dimensions;

//     this.nodes = new Map();

//     this.entryPoint = null;
//     this.maxLevel = -1;
//   }

constructor({
  M = 8,
  efConstruction = 200,
  efSearch = 50,
  dimensions = 16,
  metric = "cosine"
} = {}) {
  this.M = M;
  this.efConstruction = efConstruction;
  this.efSearch = efSearch;
  this.dimensions = dimensions;

  this.metric = metric;
  this.distance = getDistance(metric);

  this.nodes = new Map();

  this.entryPoint = null;
  this.maxLevel = -1;
}
   
    distanceBetween(a, b) {
  return this.distance(
    a.item.vector,
    b.item.vector
  );
}
  

// Greedy Search 

  greedySearch(queryVector, entryNode, level) {
  let current = entryNode;

  while (true) {
    let changed = false;

    const currentDist =
      this.distance(
        queryVector,
        current.item.vector
      );

    const neighbors =
      current.neighbors.get(level);

    for (const neighborId of neighbors) {
      const neighbor =
        this.nodes.get(neighborId);

      const dist =
        this.distance(
          queryVector,
          neighbor.item.vector
        );

      if (dist < currentDist) {
        current = neighbor;
        changed = true;
        break;
      }
    }

    if (!changed) {
      break;
    }
  }

  return current;
}

  

// Search Layer 

searchLayer(
  queryVector,
  entryNode,
  ef,
  level
) {
  const visited = new Set();

  const candidates = [];
  const results = [];

  const dist = this.distance(
    queryVector,
    entryNode.item.vector
  );

  candidates.push({
    node: entryNode,
    distance: dist,
  });

  results.push({
    node: entryNode,
    distance: dist,
  });

  visited.add(
    entryNode.item.id
  );

  while (candidates.length > 0) {
    candidates.sort(
      (a, b) =>
        a.distance - b.distance
    );

    const current =
      candidates.shift();

    const worst =
      results.length < ef
        ? Infinity
        : results[
            results.length - 1
          ].distance;

    if (current.distance > worst) {
      break;
    }

    const neighbors =
      current.node.neighbors.get(level);

    for (const neighborId of neighbors) {
      if (
        visited.has(neighborId)
      ) {
        continue;
      }

      visited.add(neighborId);

      const neighbor =
        this.nodes.get(neighborId);

      const dist =
        this.distance(
          queryVector,
          neighbor.item.vector
        );

      if (
        results.length < ef ||
        dist <
          results[
            results.length - 1
          ].distance
      ) {
        const obj = {
          node: neighbor,
          distance: dist,
        };

        candidates.push(obj);

        results.push(obj);

        results.sort(
          (a, b) =>
            a.distance -
            b.distance
        );

        if (
          results.length > ef
        ) {
          results.pop();
        }
      }
    }
  }

  return results;
}


  connectNodes(nodeA, nodeB, level) {
  nodeA.neighbors.get(level).add(nodeB.item.id);
  nodeB.neighbors.get(level).add(nodeA.item.id);

  // Keep only M neighbors
  if (nodeA.neighbors.get(level).size > this.M) {
    this.pruneNeighbors(nodeA, level);
  }

  if (nodeB.neighbors.get(level).size > this.M) {
    this.pruneNeighbors(nodeB, level);
  }
}





 pruneNeighbors(node, level) {
  const neighbors = [
    ...node.neighbors.get(level)
  ];

  const scored = neighbors.map(id => {
    const neighbor = this.nodes.get(id);

    return {
      id,
      distance: this.distance(
        node.item.vector,
        neighbor.item.vector
      )
    };
  });

  scored.sort(
    (a, b) => a.distance - b.distance
  );

  const keep = scored
    .slice(0, this.M)
    .map(x => x.id);

  node.neighbors.set(
    level,
    new Set(keep)
  );
}


    insert(item) {
  const level = this.randomLevel();

  const node = new HNSWNode(
    item,
    level
  );

  this.nodes.set(item.id, node);

  //
  // first node
  //
  if (!this.entryPoint) {
    this.entryPoint = node;
    this.maxLevel = level;
    return;
  }

  let current = this.entryPoint;

  //
  // descend from top layers
  //
  for (
    let l = this.maxLevel;
    l > level;
    l--
  ) {
    current = this.greedySearch(
      item.vector,
      current,
      l
    );
  }

  //
  // connect at each layer
  //
  for (
    let l = Math.min(
      level,
      this.maxLevel
    );
    l >= 0;
    l--
  ) {
    const candidates =
      this.searchLayer(
        item.vector,
        current,
        this.efConstruction,
        l
      );

    candidates.sort(
      (a, b) =>
        a.distance - b.distance
    );

    const neighbors =
      candidates.slice(0, this.M);

    for (const n of neighbors) {
      this.connectNodes(
        node,
        n.node,
        l
      );
    }
  }

  //
  // update entry point
  //
  if (level > this.maxLevel) {
    this.entryPoint = node;
    this.maxLevel = level;
  }
}

    stats() {
  let edges = 0;

  for (const node of this.nodes.values()) {
    for (const set of node.neighbors.values()) {
      edges += set.size;
    }
  }

  return {
    nodes: this.nodes.size,
    levels: this.maxLevel + 1,
    edges
  };
}

// KNN SEARCH Implementation

    search(queryVector, k = 5) {
  if (!this.entryPoint) {
    return [];
  }

  let current = this.entryPoint;

  //
  // Greedy descent
  //
  for (
    let level = this.maxLevel;
    level > 0;
    level--
  ) {
    current = this.greedySearch(
      queryVector,
      current,
      level
    );
  }

  //
  // Beam search at layer 0
  //
  const results =
    this.searchLayer(
      queryVector,
      current,
      this.efSearch,
      0
    );

  results.sort(
    (a, b) =>
      a.distance - b.distance
  );

  return results
    .slice(0, k)
    .map(r => ({
      ...r.node.item,
      distance: r.distance
    }));
}

    

  randomLevel() {
    let level = 0;

    while (Math.random() < 0.5) {
      level++;
    }

    return level;
  }

  size() {
    return this.nodes.size;
  }

  getNode(id) {
    return this.nodes.get(id);
  }

  getAll() {
    return [...this.nodes.values()];
  }
}

export default HNSW;