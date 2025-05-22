import { Request, Response } from "express";

import { BeneficiaryDTO } from "./beneficiary.dto";

import * as Service from "./beneficiary.service";

export async function createBeneficiary(request: Request, response: Response): Promise<void> {
	const result = await Service.createBeneficiary(request.body as BeneficiaryDTO);
	
	response.status(result.statusCode).json(result);
}

export async function readBeneficiary(request: Request, response: Response): Promise<void> {
	const result = await Service.readBeneficiary(request.params.id, request.user?.document!);

	response.status(result.statusCode).json(result);
}

export async function updateBeneficiary(request: Request, response: Response): Promise<void> {
	const result = await Service.updateBeneficiary(
		request.params.id,
		request.body as BeneficiaryDTO,
		request.user?.document!
	);

	response.status(result.statusCode).json(result);
}
