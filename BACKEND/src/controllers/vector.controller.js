import { vectorDB } from "../config/database.js";
import { ollama } from "../config/database.js";

/**
 * GET /api/items
 */
export const getItems = (req, res) => {
    try {

        res.json({
            success: true,
            //count: vectorDB.size(),
            count: vectorDB.count(),
            items: vectorDB.getItems()
        });

    } catch (err) {

        res.status(500).json({
            success: false,
            message: err.message
        });

    }
};

/**
 * GET /api/search
 */
export const searchVectors = (req, res) => {

    try {

        const {

            v,
            k = 5,
            metric = "cosine",
            algo = "hnsw"

        } = req.query;

        if (!v) {

            return res.status(400).json({

                success: false,

                message: "Missing vector"

            });

        }

        const vector =

            v.split(",")

                .map(Number);

        const results =

            vectorDB.search(

                vector,

                Number(k),

                metric,

                algo

            );

        res.json({

            success: true,

            algorithm: algo,

            metric,

            results

        });

    }

    catch (err) {

        res.status(500).json({

            success: false,

            message: err.message

        });

    }

};

/**
 * 
 */

export const semanticSearch = async (req, res) => {

    try {

        const {

            text,

            algorithm = "hnsw",

            metric = "cosine",

            k = 5

        } = req.body;

        if (!text) {

            return res.status(400).json({

                success: false,

                message: "Text is required"

            });

        }

        const embedding =

            await ollama.embed(text);

        const results =

            vectorDB.search(

                embedding,

                Number(k),

                metric,

                algorithm

            );

        res.json({

            success: true,

            query: text,

            algorithm,

            metric,

            results

        });

    }

    catch (err) {

        res.status(500).json({

            success: false,

            message: err.message

        });

    }

};

/**
 * POST /api/insert
 */

export const insertVector = (req, res) => {

    try {

        const item = req.body;

        vectorDB.insert(item);

        res.status(201).json({

            success: true,

            message: "Vector inserted."

        });

    }

    catch (err) {

        res.status(500).json({

            success: false,

            message: err.message

        });

    }

};

/**
 * DELETE /api/delete/:id
 */

export const deleteVector = (req, res) => {

    try {

        const { id } = req.params;

        vectorDB.remove(id);

        res.json({

            success: true,

            message: "Vector deleted."

        });

    }

    catch (err) {

        res.status(500).json({

            success: false,

            message: err.message

        });

    }

};

/**
 * GET /api/benchmark
 */

export const benchmark = (req, res) => {

    try {

        const {

            v,

            k = 5,

            metric = "cosine"

        } = req.query;

        if (!v) {

            return res.status(400).json({

                success: false,

                message: "Missing vector"

            });

        }

        const vector =

            v.split(",")

                .map(Number);

        const output =

            vectorDB.benchmark(

                vector,

                Number(k),

                metric

            );

        res.json({

            success: true,

            benchmark: output

        });

    }

    catch (err) {

        res.status(500).json({

            success: false,

            message: err.message

        });

    }

};