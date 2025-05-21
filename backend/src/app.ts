import express from "express";
import cors, { CorsOptions } from "cors";
import helmet from "helmet";

import UserRoutes from "./user/user.routes";

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(helmet());

app.use("/api", UserRoutes);

export default app;
