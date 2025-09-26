import express from "express";
import cors from "cors";
import helmet from "helmet";
import { setupMetrics } from "./backend.metrics";

import UserRoutes from "./user/user.routes";
import BeneficiaryRoutes from "./beneficiary/beneficiary.routes";

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(helmet());

setupMetrics(app);

app.use("/api", UserRoutes);
app.use("/api", BeneficiaryRoutes);

export default app;
