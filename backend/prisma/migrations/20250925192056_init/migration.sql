-- CreateEnum
CREATE TYPE "AuditType" AS ENUM ('BENEFICIARY_CREATION', 'BENEFICIARY_READ', 'BENEFICIARY_UPDATE', 'BENEFICIARY_DELETION', 'SOLICITATION_CREATION', 'SOLICITATION_UPDATE', 'SOLICITATION_DELETION', 'SPECIALITY_CREATION', 'SPECIALITY_UPDATE', 'SPECIALITY_DELETION', 'USER_CREATION', 'USER_AUTHENTICATION', 'USER_UPDATE', 'USER_DELETION');

-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE', 'OTHER');

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMINISTRATOR', 'EMPLOYEE');

-- CreateEnum
CREATE TYPE "State" AS ENUM ('AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO');

-- CreateTable
CREATE TABLE "Audit" (
    "id" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "type" "AuditType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Audit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Beneficiary" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "birthDate" TIMESTAMP(3) NOT NULL,
    "gender" "Gender" NOT NULL,
    "generalRecord" VARCHAR(15),
    "personalRecord" VARCHAR(11),
    "healthCard" VARCHAR(15),
    "motherName" VARCHAR(100),
    "referee" VARCHAR(100),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "responsibleId" TEXT NOT NULL,

    CONSTRAINT "Beneficiary_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Comorbidity" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(150) NOT NULL,
    "beneficiaryId" TEXT NOT NULL,

    CONSTRAINT "Comorbidity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Solicitation" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "beneficiaryId" TEXT NOT NULL,
    "responsibleId" TEXT NOT NULL,

    CONSTRAINT "Solicitation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Speciality" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(150) NOT NULL,

    CONSTRAINT "Speciality_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Appointment" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "solicitationId" TEXT NOT NULL,
    "specialityId" TEXT NOT NULL,

    CONSTRAINT "Appointment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "name" VARCHAR(100) NOT NULL,
    "document" VARCHAR(11) NOT NULL,
    "passWord" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'EMPLOYEE',

    CONSTRAINT "User_pkey" PRIMARY KEY ("document")
);

-- CreateTable
CREATE TABLE "Address" (
    "id" TEXT NOT NULL,
    "space" VARCHAR(100),
    "number" VARCHAR(10),
    "complement" VARCHAR(50),
    "neighborhood" VARCHAR(50),
    "city" VARCHAR(50),
    "state" "State",
    "zip" VARCHAR(8),
    "beneficiaryId" TEXT,

    CONSTRAINT "Address_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PhoneNumber" (
    "id" TEXT NOT NULL,
    "number" VARCHAR(13) NOT NULL,
    "beneficiaryId" TEXT NOT NULL,

    CONSTRAINT "PhoneNumber_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VoterCard" (
    "id" TEXT NOT NULL,
    "registration" VARCHAR(12),
    "section" VARCHAR(4),
    "zone" VARCHAR(4),
    "beneficiaryId" TEXT,

    CONSTRAINT "VoterCard_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Beneficiary_generalRecord_key" ON "Beneficiary"("generalRecord");

-- CreateIndex
CREATE UNIQUE INDEX "Beneficiary_personalRecord_key" ON "Beneficiary"("personalRecord");

-- CreateIndex
CREATE UNIQUE INDEX "Beneficiary_healthCard_key" ON "Beneficiary"("healthCard");

-- CreateIndex
CREATE UNIQUE INDEX "Solicitation_beneficiaryId_key" ON "Solicitation"("beneficiaryId");

-- CreateIndex
CREATE UNIQUE INDEX "Solicitation_responsibleId_key" ON "Solicitation"("responsibleId");

-- CreateIndex
CREATE UNIQUE INDEX "User_document_key" ON "User"("document");

-- CreateIndex
CREATE UNIQUE INDEX "Address_beneficiaryId_key" ON "Address"("beneficiaryId");

-- CreateIndex
CREATE UNIQUE INDEX "VoterCard_beneficiaryId_key" ON "VoterCard"("beneficiaryId");

-- AddForeignKey
ALTER TABLE "Audit" ADD CONSTRAINT "Audit_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("document") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Beneficiary" ADD CONSTRAINT "Beneficiary_responsibleId_fkey" FOREIGN KEY ("responsibleId") REFERENCES "User"("document") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comorbidity" ADD CONSTRAINT "Comorbidity_beneficiaryId_fkey" FOREIGN KEY ("beneficiaryId") REFERENCES "Beneficiary"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Solicitation" ADD CONSTRAINT "Solicitation_beneficiaryId_fkey" FOREIGN KEY ("beneficiaryId") REFERENCES "Beneficiary"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Solicitation" ADD CONSTRAINT "Solicitation_responsibleId_fkey" FOREIGN KEY ("responsibleId") REFERENCES "User"("document") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_solicitationId_fkey" FOREIGN KEY ("solicitationId") REFERENCES "Solicitation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_specialityId_fkey" FOREIGN KEY ("specialityId") REFERENCES "Speciality"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Address" ADD CONSTRAINT "Address_beneficiaryId_fkey" FOREIGN KEY ("beneficiaryId") REFERENCES "Beneficiary"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PhoneNumber" ADD CONSTRAINT "PhoneNumber_beneficiaryId_fkey" FOREIGN KEY ("beneficiaryId") REFERENCES "Beneficiary"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VoterCard" ADD CONSTRAINT "VoterCard_beneficiaryId_fkey" FOREIGN KEY ("beneficiaryId") REFERENCES "Beneficiary"("id") ON DELETE CASCADE ON UPDATE CASCADE;
