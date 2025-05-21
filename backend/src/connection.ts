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

const prisma = new PrismaClient();

const AddressRepository = prisma.address;
const AppointmentRepository = prisma.appointment;
const AuditRepository = prisma.audit;
const BeneficiaryRepository = prisma.beneficiary;
const SolicitationRepository = prisma.solicitation;
const SpecialityRepository = prisma.speciality;
const UserRepository = prisma.user;

type Beneficiary = SimpleBeneficiary & {
	address: Omit<Address, "id" | "beneficiaryId"> | null;
	comorbidities: Omit<Comorbidity, "id" | "beneficiaryId">[];
	phoneNumbers: Omit<PhoneNumber, "id" | "beneficiaryId">[];
	responsible: Pick<User, "document" | "name">;
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
