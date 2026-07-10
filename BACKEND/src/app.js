import express from "express";
import cors from "cors";

import systemRoutes from "./routes/system.routes.js" ;
import vectorRoutes from "./routes/vector.routes.js" ; 
import documentRoutes from "./routes/document.routes.js";
import ragRoutes from "./routes/rag.routes.js";
import visualizationRoutes from "./routes/visualizationRoutes.js";

const app = express();

app.use(cors());

app.use(express.json());

app.use("/api", systemRoutes);

app.use("/api", vectorRoutes);

app.use("/api/documents", documentRoutes);

app.use("/api", ragRoutes);

app.use("/api/visualization", visualizationRoutes);

app.get("/", (req, res) => {

    res.json({

        success: true,

        message: "VectorDB Backend Running"

    });

});

export default app;