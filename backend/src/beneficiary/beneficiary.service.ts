import { BeneficiaryDTO } from "./beneficiary.dto";
import { ResponseDTO } from "../interfaces/response.dto";
import {
	Address,
	AuditRepository,
	Beneficiary,
	BeneficiaryRepository,
	User,
	UserRepository,
	VoterCard
} from "../connection";

export async function createBeneficiary(dto: BeneficiaryDTO): Promise<ResponseDTO<BeneficiaryDTO>> {
	try {
		const responsible: User | null = await UserRepository.findUnique({
			where: {
				document: dto.responsible.document
			}
		});

		if (!responsible) {
			return { message: "Responsible not found", statusCode: 404 };
		}

		const beneficiary: Beneficiary | null = await BeneficiaryRepository.findFirst({
			where: {
				OR: [ { generalRecord: dto.generalRecord }, { personalRecord: dto.personalRecord } ]
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
			return { message: "Beneficiary already exists", statusCode: 409 };
		}

		await BeneficiaryRepository.create({
			data: {
				name: dto.name,
				birthDate: new Date(dto.birthDate),
				gender: dto.gender,
				generalRecord: dto.generalRecord,
				personalRecord: dto.personalRecord,
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

		const message: string = `Beneficiary ${dto.name.split(" ")[0]} created`;

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
			return { message: "Beneficiary not found", statusCode: 404 };
		}

		const dto: BeneficiaryDTO = {
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
			responsible: {
				document: beneficiary.responsible.document,
			},
			voterCard: {
				registration: beneficiary.voterCard?.registration,
				section: beneficiary.voterCard?.section,
				zone: beneficiary.voterCard?.zone
			}
		};

		const message: string = `Beneficiary ${beneficiary.name.split(" ")[0]} read`;

		await AuditRepository.create({
			data: {
				description: message,
				type: "BENEFICIARY_READ",
				user: { connect: { document: userDocument } }
			}
		});

		return { data: dto, statusCode: 200 };
	} catch (error: any) {
		return { message: error.message, statusCode: 500 };
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
			return { message: "Beneficiary not found", statusCode: 404 };
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

		const message: string = `Beneficiary ${dto.name.split(" ")[0]} updated`;

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
