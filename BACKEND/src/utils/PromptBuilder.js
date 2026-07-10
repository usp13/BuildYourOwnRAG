class PromptBuilder {

    static build(question, chunks) {

        const context = chunks
            .map((chunk, index) => {

                return `Document ${index + 1}:\n${chunk.text}`;

            })
            .join("\n\n");

        return `You are an AI assistant.

Answer ONLY using the provided context.

If the answer is not present in the context, say:

"I couldn't find that information in the uploaded documents."

Context:

${context}

Question:

${question}

Answer:`;
    }

}

export default PromptBuilder;