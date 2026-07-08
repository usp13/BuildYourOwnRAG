export function manhattanDistance(a, b) {
  if (a.length !== b.length) {
    throw new Error("Vector dimensions must match");
  }

  let sum = 0;

  for (let i = 0; i < a.length; i++) {
    sum += Math.abs(a[i] - b[i]);
  }

  return sum;
}