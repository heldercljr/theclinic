import express from "express";
import cors, { CorsOptions } from "cors";
import helmet from "helmet";

import UserRoutes from "./user/user.routes";
import BeneficiaryRoutes from "./beneficiary/beneficiary.routes";

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(helmet());

app.use("/api", UserRoutes);
app.use("/api", BeneficiaryRoutes);

export default app;
