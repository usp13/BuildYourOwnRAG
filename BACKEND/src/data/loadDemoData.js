import demoVectors from "./demoVectors.js";

export function loadDemoData(db) {
  for (const item of demoVectors) {
    db.insert(item);
  }

  console.log(
    `Loaded ${demoVectors.length} demo vectors`
  );
}