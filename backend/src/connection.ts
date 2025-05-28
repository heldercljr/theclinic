import {
	PrismaClient,
	Address,
	Appointment,
	Audit,
	Beneficiary as SimpleBeneficiary,
	Comorbidity,
	Gender,
	PhoneNumber,
	Solicitation,
	Speciality,
	User,
	VoterCard
} from "@prisma/client";

const {
	address: AddressRepository,
	appointment: AppointmentRepository,
	audit: AuditRepository,
	beneficiary: BeneficiaryRepository,
	solicitation: SolicitationRepository,
	speciality: SpecialityRepository,
	user: UserRepository
} = new PrismaClient();

type Beneficiary = SimpleBeneficiary & {
	address: Omit<Address, "id" | "beneficiaryId"> | null;
	comorbidities: Omit<Comorbidity, "id" | "beneficiaryId">[];
	phoneNumbers: Omit<PhoneNumber, "id" | "beneficiaryId">[];
	responsible: Pick<User, "document">;
	voterCard: Omit<VoterCard, "id" | "beneficiaryId"> | null;
};

export {
	Address, AddressRepository,
	Appointment, AppointmentRepository,
	Audit, AuditRepository,
	Beneficiary, BeneficiaryRepository,
	Comorbidity,
	Gender,
	PhoneNumber,
	Solicitation, SolicitationRepository,
	Speciality, SpecialityRepository,
	User, UserRepository,
	VoterCard
};
