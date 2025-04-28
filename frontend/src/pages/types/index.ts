/* eslint-disable @typescript-eslint/no-explicit-any */
export interface IFetch {
	get: (url: string) => Promise<any>;
	post: (url: string, data: any) => Promise<any>;
	put: (url: string, data: any) => Promise<any>;
	delete: (url: string) => Promise<any>;
}
/* eslint-enable @typescript-eslint/no-explicit-any */

export interface SignupData {
	email: string;
	password: string;
	name: string;
	isVendor: boolean;
}

export interface LoginData {
	email: string;
	password: string;
}

export interface LoginResponse {
	data: {
		token: string;
		uid: string;
		email: string;
		name: string;
		isVendor: boolean;
	};
}

export interface SignupResponse {
	data: {
		token: string;
		uid: string;
		email: string;
		name: string;
		isVendor: boolean;
	};
}

export type Item = {
	iid: string;
	vid: string;
	name: string;
	pictureurl: string;
	description: string;
	category: CATEGORIES;
	quantity: number;
	cost: number;
};

export type NewItem = Omit<Item, "iid" | "vid">;

export enum CATEGORIES {
	FASHION = "FASHION",
	BOOKS_SUPPLIES = "BOOKS_SUPPLIES",
	SERVICES = "SERVICES",
	ELECTRONICS = "ELECTRONICS",
}

export enum USER_TYPE {
	VENDOR = "vendor",
	BUYER = "buyer",
}

export type User = {
	token: string;
	uid: string;
	email: string;
	name: string;
	user_type: USER_TYPE;
};

export type ResponseMsg = {
	msg: string;
};

export type Transaction = {
	name: string;
	amt: number;
	t_time: string;
};
