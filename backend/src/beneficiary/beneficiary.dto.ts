export interface BeneficiaryDTO {
	name: string;
	birthDate: number;
	gender: "MALE" | "FEMALE" | "OTHER";
	generalRecord: string | null;
	personalRecord: string | null;
	motherName: string | null;
	referee: string | null;

	address?: {
		space?: string | null;
		number?: string | null;
		complement?: string | null;
		neighborhood?: string | null;
		city?: string | null;
		state?: string | null;
		zip?: string | null;
	};

	comorbidities: string[];

	phoneNumbers: string[];

	responsible: {
		document: string;
	};

	voterCard?: {
		registration?: string | null;
		section?: string | null;
		zone?: string | null;
	};
}
