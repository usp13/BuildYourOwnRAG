import { cosineDistance } from "./cosine.js";
import { euclideanDistance } from "./euclidean.js";
import { manhattanDistance } from "./manhattan.js";

export function getDistance(metric) {
  switch (metric.toLowerCase()) {
    case "cosine":
      return cosineDistance;

    case "euclidean":
      return euclideanDistance;

    case "manhattan":
      return manhattanDistance;

    default:
      throw new Error(`Unknown metric: ${metric}`);
  }
}