import { Prisma } from "@prisma/client";

export interface PaginationDTO {
	page: number;
	limit: number;
	orderBy?: Prisma.BeneficiaryOrderByWithRelationInput;
}
