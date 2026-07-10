import dotenv from "dotenv";

dotenv.config();

import app from "./app.js";

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {

    console.log("");

    console.log("VectorDB Backend Running");

    console.log(`Port : ${PORT}`);

    console.log(`URL  : http://localhost:${PORT}`);

    

});