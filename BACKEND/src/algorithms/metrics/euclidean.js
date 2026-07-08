export function euclideanDistance(a, b) {
  if (a.length !== b.length) {
    throw new Error("Vector dimensions must match");
  }

  let sum = 0;

  for (let i = 0; i < a.length; i++) {
    const diff = a[i] - b[i];
    sum += diff * diff;
  }

  return Math.sqrt(sum);
}