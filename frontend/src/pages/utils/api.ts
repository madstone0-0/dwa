import {
	Item,
	LoginData,
	ResponseMsg,
	SignupResponse,
	Transaction,
} from "../types";
import { fetch } from "./Fetch";
import { User } from "pages/types";

export const ping = async () => {
	try {
		const res = await fetch.get<{ msg: string }>("health");
		const data = res.data;
		return data.msg;
	} catch (e) {
		throw e;
	}
};

export const getAllItems = async () => {
	try {
		const res = await fetch.get<{ items: Item[] }>("items/all");
		const data = res.data;
		return data.items;
	} catch (e) {
		throw e;
	}
};

export const getVendorItems = async (user: User) => {
	try {
		const { uid: vid } = user;
		const res = await fetch.get<{ items: Item[] }>(`vendor/item/${vid}`);
		const data = res.data;
		return data.items;
	} catch (e) {
		throw e;
	}
};

export const updateItem = async (item: Partial<Item>) => {
	try {
		const res = await fetch.put<ResponseMsg>(`vendor/item/update`, item);
		const data = res.data;
		return data.msg;
	} catch (e) {
		throw e;
	}
};

export const deleteItem = async (iid: string) => {
	try {
		const res = await fetch.delete<ResponseMsg>(`vendor/item/delete/${iid}`);
		const data = res.data;
		return data.msg;
	} catch (e) {
		throw e;
	}
};

export const getTransactions = async (vid: string) => {
	try {
		const res = await fetch.get<{ transactions: Transaction[] }>(
			`vendor/transactions/${vid}`,
		);
		const data = res.data;
		return data.transactions;
	} catch (e) {
		throw e;
	}
};

export const signup = async (data: {
	email: string;
	password: string;
	name: string;
	isVendor: boolean;
}): Promise<SignupResponse> => {
	return await fetch.post("/auth/user/signup", data);
};

export const login = async (credentials: LoginData): Promise<User> => {
	const res = await fetch.post<User>("auth/user/login", credentials);
	if (res.data) {
		localStorage.setItem("user", JSON.stringify(res.data));
	}
	return res.data;
};
