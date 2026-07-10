class TextChunker {

    constructor(
        chunkSize = 250,
        overlap = 50
    ) {
        this.chunkSize = chunkSize;
        this.overlap = overlap;
    }

    chunk(text) {

        if (!text)
            return [];

        const words = text
            .trim()
            .split(/\s+/);

        const chunks = [];

        let start = 0;

        while (start < words.length) {

            const end =
                Math.min(
                    start + this.chunkSize,
                    words.length
                );

            chunks.push(

                words
                    .slice(start, end)
                    .join(" ")

            );

            if (end === words.length)
                break;

            start =
                end - this.overlap;
        }

        return chunks;
    }

}

export default TextChunker;