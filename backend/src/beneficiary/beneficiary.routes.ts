import { Router } from "express";

import * as Controller from "./beneficiary.controller";

import { authenticateToken } from "../shared/middlewares/authentication.middleware";

const router: Router = Router();

router.post("/beneficiaries", authenticateToken, Controller.createBeneficiary);
router.get("/beneficiaries/:id", authenticateToken, Controller.readBeneficiary);
router.post("/beneficiaries/list", authenticateToken, Controller.listBeneficiaries);
router.put("/beneficiaries/:id", authenticateToken, Controller.updateBeneficiary);
router.delete("/beneficiaries/:id", authenticateToken, Controller.deleteBeneficiary);

export default router;
