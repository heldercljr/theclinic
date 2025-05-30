import { BeneficiaryDTO } from "./beneficiary.dto";
import { ResponseDTO } from "../shared/interfaces/response.dto";
import { PaginationDTO } from "../shared/interfaces/pagination.dto";
import {
	AuditRepository,
	Beneficiary,
	BeneficiaryRepository,
	User,
	UserRepository
} from "../connection";

export async function createBeneficiary(dto: BeneficiaryDTO): Promise<ResponseDTO<BeneficiaryDTO>> {
	try {
		const responsible: User | null = await UserRepository.findUnique({
			where: {
				document: dto.responsible.document
			}
		});

		if (!responsible) {
			return { message: "Responsável não encontrado", statusCode: 404 };
		}

		const beneficiary: Beneficiary | null = await BeneficiaryRepository.findFirst({
			where: {
				OR: [
					{ generalRecord: dto.generalRecord },
					{ personalRecord: dto.personalRecord },
					{ healthCard: dto.healthCard },
				]
			},
			include: {
				address: true,
				comorbidities: true,
				phoneNumbers: true,
				voterCard: true,
				responsible: true
			}
		});

		if (beneficiary) {
			return { message: "Beneficiário já cadastrado", statusCode: 409 };
		}

		await BeneficiaryRepository.create({
			data: {
				name: dto.name,
				birthDate: new Date(dto.birthDate),
				gender: dto.gender,
				generalRecord: dto.generalRecord,
				personalRecord: dto.personalRecord,
				healthCard: dto.healthCard,
				motherName: dto.motherName,
				referee: dto.referee,

				address: { create: dto.address },

				comorbidities: {
					createMany: {
						data: dto.comorbidities.map((comorbidity) => ({ name: comorbidity }))
					}
				},

				phoneNumbers: {
					createMany: {
						data: dto.phoneNumbers.map((phone) => ({ number: phone }))
					}
				},

				responsible: { connect: { document: responsible.document } },

				voterCard: { create: dto.voterCard }
			}
		});

		const message: string = `Beneficiário ${dto.name.split(" ")[0]} cadastrado`;

		await AuditRepository.create({
			data: {
				description: message,
				type: "BENEFICIARY_CREATION",
				user: { connect: { document: responsible.document } }
			}
		});

		return { message, statusCode: 201 };
	} catch (error: any) {
		return { message: error.message, statusCode: 500 };
	}
}

async function getBeneficiaryById(id: string): Promise<Beneficiary | null> {
	return BeneficiaryRepository.findUnique({
		where: { id },
		include: {
			address: {
				select: {
					space: true,
					number: true,
					complement: true,
					neighborhood: true,
					city: true,
					state: true,
					zip: true
				}
			},
			comorbidities: {
				select: {
					name: true
				}
			},
			phoneNumbers: {
				select: {
					number: true
				}
			},
			voterCard: {
				select: {
					registration: true,
					section: true,
					zone: true
				}
			},
			responsible: {
				select: {
					document: true
				}
			}
		}
	});
}

export async function readBeneficiary(id: string, userDocument: string): Promise<ResponseDTO<BeneficiaryDTO>> {
	try {
		const beneficiary: Beneficiary | null = await getBeneficiaryById(id);

		if (!beneficiary) {
			return { message: "Beneficiário não encontrado", statusCode: 404 };
		}

		const dto: BeneficiaryDTO = {
			id: beneficiary.id,
			name: beneficiary.name,
			birthDate: beneficiary.birthDate.getTime(),
			gender: beneficiary.gender,
			generalRecord: beneficiary.generalRecord,
			personalRecord: beneficiary.personalRecord,
			healthCard: beneficiary.healthCard,
			motherName: beneficiary.motherName,
			referee: beneficiary.referee,
			address: {
				space: beneficiary.address?.space,
				number: beneficiary.address?.number,
				complement: beneficiary.address?.complement,
				neighborhood: beneficiary.address?.neighborhood,
				city: beneficiary.address?.city,
				state: beneficiary.address?.state,
				zip: beneficiary.address?.zip
			},
			comorbidities: beneficiary.comorbidities.map((comorbidity) => comorbidity.name),
			phoneNumbers: beneficiary.phoneNumbers.map((phone) => phone.number),
			responsible: {
				document: beneficiary.responsible.document,
			},
			voterCard: {
				registration: beneficiary.voterCard?.registration,
				section: beneficiary.voterCard?.section,
				zone: beneficiary.voterCard?.zone
			}
		};

		const message: string = `Beneficiário ${beneficiary.name.split(" ")[0]} acessado`;

		await AuditRepository.create({
			data: {
				description: message,
				type: "BENEFICIARY_READ",
				user: { connect: { document: userDocument } }
			}
		});

		return { data: dto, message, statusCode: 200 };
	} catch (error: any) {
		return { message: error.message, statusCode: 500 };
	}
}

export async function listBeneficiaries(
	filters: Partial<BeneficiaryDTO> = {},
	pagination: PaginationDTO = { page: 1, limit: 10, orderBy: { name: "asc" } },
	userDocument: string
): Promise<ResponseDTO<BeneficiaryDTO[]>> {
	try {
		const beneficiaries: Beneficiary[] = await BeneficiaryRepository.findMany({
			orderBy: pagination.orderBy,
			skip: (pagination.page - 1) * pagination.limit,
			take: pagination.limit,
			where: {
				...(filters.name && { name: { contains: filters.name } }),
				...(filters.birthDate && { birthDate: new Date(filters.birthDate) }),
				...(filters.gender && { gender: filters.gender }),
				...(filters.generalRecord && { generalRecord: filters.generalRecord }),
				...(filters.personalRecord && { personalRecord: filters.personalRecord }),
				...(filters.healthCard && { healthCard: filters.healthCard }),
				...(filters.motherName && { motherName: { contains: filters.motherName } }),
				...(filters.referee && { referee: { contains: filters.referee } }),
				...(filters.address && {
					address: {
						is: {
							...(filters.address.space && { space: { contains: filters.address.space } }),
							...(filters.address.number && { number: filters.address.number }),
							...(filters.address.complement && { complement: { contains: filters.address.complement } }),
							...(filters.address.neighborhood && { neighborhood: { contains: filters.address.neighborhood } }),
							...(filters.address.city && { city: { contains: filters.address.city } }),
							...(filters.address.state && { state: filters.address.state }),
							...(filters.address.zip && { zip: filters.address.zip }),
						}
					}
				}),
				...(filters.comorbidities && filters.comorbidities.length > 0 && {
					comorbidities: { some: { name: { in: filters.comorbidities } } }
				}),
				...(filters.phoneNumbers && filters.phoneNumbers.length > 0 && {
					phoneNumbers: { some: { number: { in: filters.phoneNumbers } } }
				}),
				...(filters.responsible && filters.responsible.document && {
					responsible: { is: { document: filters.responsible.document } }
				}),
				...(filters.voterCard && {
					voterCard: {
						is: {
							...(filters.voterCard.registration && { registration: filters.voterCard.registration }),
							...(filters.voterCard.section && { section: filters.voterCard.section }),
							...(filters.voterCard.zone && { zone: filters.voterCard.zone })
						}
					}
				})
			},
			include: {
				address: true,
				comorbidities: true,
				phoneNumbers: true,
				voterCard: true,
				responsible: true
			}
		});

		const dto: BeneficiaryDTO[] = beneficiaries.map((beneficiary) => ({
			id: beneficiary.id,
			name: beneficiary.name,
			birthDate: beneficiary.birthDate.getTime(),
			gender: beneficiary.gender,
			generalRecord: beneficiary.generalRecord,
			personalRecord: beneficiary.personalRecord,
			motherName: beneficiary.motherName,
			referee: beneficiary.referee,
			address: {
				space: beneficiary.address?.space,
				number: beneficiary.address?.number,
				complement: beneficiary.address?.complement,
				neighborhood: beneficiary.address?.neighborhood,
				city: beneficiary.address?.city,
				state: beneficiary.address?.state,
				zip: beneficiary.address?.zip
			},
			comorbidities: beneficiary.comorbidities.map((comorbidity) => comorbidity.name),
			phoneNumbers: beneficiary.phoneNumbers.map((phone) => phone.number),
			responsible: { document: beneficiary.responsible.document },
			voterCard: {
				registration: beneficiary.voterCard?.registration,
				section: beneficiary.voterCard?.section,
				zone: beneficiary.voterCard?.zone,
			}
		}));

		const message: string = `${dto.length} beneficiários acessados`;

		await AuditRepository.create({
			data: {
				description: message,
				type: "BENEFICIARY_READ",
				user: { connect: { document: userDocument } }
			}
		});

		return {data: dto, message, statusCode: 200};
	} catch (error: any) {
		return {message: error.message, statusCode: 500};
	}
}

export async function updateBeneficiary(
	id: string,
	dto: BeneficiaryDTO,
	userDocument: string
): Promise<ResponseDTO<BeneficiaryDTO>> {
	try {
		const beneficiary: Beneficiary | null = await getBeneficiaryById(id);

		if (!beneficiary) {
			return { message: "Beneficiário não encontrado", statusCode: 404 };
		}

		await BeneficiaryRepository.delete({ where: { id } });

		await BeneficiaryRepository.create({
			data: {
				id,
				name: dto.name,
				birthDate: new Date(dto.birthDate),
				gender: dto.gender,
				generalRecord: dto.generalRecord,
				personalRecord: dto.personalRecord,
				healthCard: dto.healthCard,
				motherName: dto.motherName,
				referee: dto.referee,

				address: { create: dto.address },

				comorbidities: {
					createMany: {
						data: dto.comorbidities.map((comorbidity) => ({ name: comorbidity }))
					}
				},

				phoneNumbers: {
					createMany: {
						data: dto.phoneNumbers.map((phone) => ({ number: phone }))
					}
				},

				responsible: { connect: { document: beneficiary.responsible.document } },

				voterCard: { create: dto.voterCard }
			}
		});

		const message: string = `Beneficiário ${dto.name.split(" ")[0]} atualizado`;

		await AuditRepository.create({
			data: {
				description: message,
				type: "BENEFICIARY_UPDATE",
				user: { connect: { document: userDocument } }
			}
		});

		return { message, statusCode: 200 };
	} catch (error: any) {
		return { message: error.message, statusCode: 500 };
	}
}

export async function deleteBeneficiary(id: string, userDocument: string): Promise<ResponseDTO<BeneficiaryDTO>> {
	try {
		const beneficiary: Beneficiary | null = await getBeneficiaryById(id);

		if (!beneficiary) {
			return { message: "Beneficiary not found", statusCode: 404 };
		}

		await BeneficiaryRepository.delete({ where: { id } });

		const message: string = `Beneficiary ${beneficiary.name.split(" ")[0]} deleted`;

		await AuditRepository.create({
			data: {
				description: message,
				type: "BENEFICIARY_DELETION",
				user: { connect: { document: userDocument } }
			}
		});

		return { message, statusCode: 204 };
	} catch (error: any) {
		return { message: error.message, statusCode: 500 };
	}
}
