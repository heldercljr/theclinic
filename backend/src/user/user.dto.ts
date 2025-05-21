export interface UserDTO {
	responsibleDocument: string;

	userName: string;
	userDocument: string;
	userPassWord: string;
}

export interface UserAuthenticationDTO {
	userDocument: string;
	userPassWord: string;
}

export interface UserPayloadDTO {
	name: string;
	document: string;
}

export interface PassWordUpdateDTO {
	document: string;
	oldPassWord: string;
	newPassWord: string;
}
