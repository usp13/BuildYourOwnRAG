class ChunkService {
  static chunkText(
    text,
    chunkSize = 250,
    overlap = 50
  ) {
    if (!text) {
      return [];
    }

    const words = text
      .trim()
      .split(/\s+/);

    const chunks = [];

    let start = 0;

    while (start < words.length) {
      const end = Math.min(
        start + chunkSize,
        words.length
      );

      const chunk = words
        .slice(start, end)
        .join(" ");

      chunks.push(chunk);

      if (end === words.length) {
        break;
      }

      start += chunkSize - overlap;
    }

    return chunks;
  }
}

export default ChunkService;