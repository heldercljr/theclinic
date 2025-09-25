import { PrismaClient, Address, Appointment, Beneficiary as SimpleBeneficiary, Comorbidity, Gender, PhoneNumber, Solicitation, Speciality, User, VoterCard } from "@prisma/client";

const prisma = new PrismaClient();

const AddressRepository = prisma.address;
const AppointmentRepository = prisma.appointment;
const BeneficiaryRepository = prisma.beneficiary;
const SolicitationRepository = prisma.solicitation;
const SpecialityRepository = prisma.speciality;
const UserRepository = prisma.user;

export type BeneficiaryFull = SimpleBeneficiary & {
  address: Omit<Address, "id" | "beneficiaryId"> | null;
  comorbidities: Omit<Comorbidity, "id" | "beneficiaryId">[];
  phoneNumbers: Omit<PhoneNumber, "id" | "beneficiaryId">[];
  responsible: Pick<User, "document">;
  voterCard: Omit<VoterCard, "id" | "beneficiaryId"> | null;
};

export {
  Address, AddressRepository,
  Appointment, AppointmentRepository,
  BeneficiaryRepository,
  Comorbidity,
  Gender,
  PhoneNumber,
  Solicitation, SolicitationRepository,
  Speciality, SpecialityRepository,
  User, UserRepository,
  SimpleBeneficiary
};
