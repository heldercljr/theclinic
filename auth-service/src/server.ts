import express from "express";
import dotenv from "dotenv";
import validateTokenRouter from "./auth.routes.js";

dotenv.config();
const app = express();
app.use(express.json());

const PORT = Number(process.env.PORT) || 4000;
const HOST = String(process.env.HOST) || "127.0.0.1";

app.use(validateTokenRouter);

app.listen(PORT, HOST, () => {
    console.log(`Auth Service is running on ${HOST}:${PORT} since ${new Date().toLocaleString()}`);
});
