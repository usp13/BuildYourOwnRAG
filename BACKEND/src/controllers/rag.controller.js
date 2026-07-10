import PromptBuilder from "../utils/PromptBuilder.js";
import { documentDB, ollama } from "../config/database.js";

export const askAI = async (req, res) => {

    try {

        const {

            question,

            k = 3

        } = req.body;

        if (!question) {

            return res.status(400).json({

                success: false,

                message: "Question is required"

            });

        }

        // Step 1
        const embedding =
            await ollama.embed(question);

        // Step 2
        const chunks =
            documentDB.searchByEmbedding(
                embedding,
                Number(k)
            );

        // Step 3
        const prompt =
            PromptBuilder.build(
                question,
                chunks
            );

        // Step 4
        const answer =
            await ollama.generate(
                prompt
            );

        res.json({

            success: true,

            question,

            answer,

            sources: chunks

        });

    }

    catch (err) {

        res.status(500).json({

            success: false,

            message: err.message

        });

    }

};