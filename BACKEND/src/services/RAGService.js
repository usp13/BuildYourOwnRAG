class RAGService {
    constructor(documentDB, ollama) {
        this.documentDB = documentDB;
        this.ollama = ollama;
    }

    async ask(question, k = 3) {

        // Step 1
        const embedding =
            await this.ollama.embed(question);

        // Step 2
        const retrieved =
            this.documentDB.search(
                embedding,
                k
            );

        // Step 3
        const context =
            retrieved
                .map(doc =>
                    `[${doc.title}]\n${doc.text}`
                )
                .join("\n\n-----------------\n\n");

        // Step 4
        const prompt = `You are a helpful AI assistant.

Answer ONLY using the context below.

If the answer is not present,
reply with:

"I couldn't find that information in the provided documents."

Context:

${context}

Question:

${question}

Answer:
`;

        // Step 5
        const answer =
            await this.ollama.generate(prompt);

        return {

            answer,

            context: retrieved

        };

    }
}

export default RAGService;