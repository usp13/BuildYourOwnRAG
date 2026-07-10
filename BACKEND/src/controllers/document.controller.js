import { documentDB, ollama } from "../config/database.js";


// POST /api/documents

export const insertDocument = async (req, res) => {

    try {

        const { title, text } = req.body;

        if (!title || !text) {

            return res.status(400).json({

                success: false,

                message: "Title and text are required"

            });

        }

        const inserted = await documentDB.insertDocument(

            title,

            text,

            async (chunk) => await ollama.embed(chunk)

        );

        res.status(201).json({

            success: true,

            title,

            totalChunks: inserted.length,

            documents: inserted

        });

    }

    catch (err) {

        res.status(500).json({

            success: false,

            message: err.message

        });

    }

};


// GET /api/documents

export const getDocuments = (req, res) => {

    try {

        res.json({

            success: true,

            count: documentDB.count(),

            documents: documentDB.list()

        });

    }

    catch (err) {

        res.status(500).json({

            success: false,

            message: err.message

        });

    }

};


// DELETE /api/documents/:id

export const deleteDocument = (req, res) => {

    try {

        const { id } = req.params;

        if (!documentDB.exists(id)) {

            return res.status(404).json({

                success: false,

                message: "Document not found"

            });

        }

        documentDB.remove(id);

        res.json({

            success: true,

            message: "Document deleted"

        });

    }

    catch (err) {

        res.status(500).json({

            success: false,

            message: err.message

        });

    }

};