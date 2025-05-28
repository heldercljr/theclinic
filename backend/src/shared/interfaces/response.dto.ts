export interface ResponseDTO<T> {
	data?: T;
	message?: string;
	statusCode: number;
}
