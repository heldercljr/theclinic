import express from "express";
import { setupMetrics } from "./auth.metrics.js";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

setupMetrics(app);

export default app;