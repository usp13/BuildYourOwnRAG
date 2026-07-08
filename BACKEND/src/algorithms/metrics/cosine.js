export function cosineDistance(a, b) {
  if (a.length !== b.length) {
    throw new Error("Vector dimensions must match");
  }

  let dot = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  if (normA === 0 || normB === 0) {
    return 1;
  }

  const similarity = dot / (Math.sqrt(normA) * Math.sqrt(normB));

  return 1 - similarity;
}