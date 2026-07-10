import {
    vectorDB,
    documentDB,
    ollama
} from "../config/database.js";

export const getStatus = async (req, res) => {

    try {

        const online =
            await ollama.health();

        res.json({

            success: true,

            ollama: online,

            embedModel: ollama.embedModel,

            generationModel: ollama.genModel

        });

    }

    catch (err) {

        res.status(500).json({

            success: false,

            message: err.message

        });

    }

};

export const getStats = (req, res) => {

    res.json({

        success: true,

        demoVectors:
            vectorDB.stats(),

        documents:
            documentDB.list().length

    });

};

// export const getHNSWInfo = (req, res) => {

//     res.json({

//         success: true,

//         hnsw:
//             vectorDB.hnsw.info()

//     });

// };

export const getHNSWInfo = (req, res) => {

    try {

        const stats = vectorDB.stats();

        res.json({

            success: true,

            hnsw: stats.hnsw

        });

    }

    catch (err) {

        res.status(500).json({

            success: false,

            message: err.message

        });

    }

};