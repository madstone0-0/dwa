import { Item } from "types";
import { fetch } from "./Fetch";

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

interface SignupData {
    email: string;
    password: string;
    name: string;
    isVendor: boolean;
}

interface LoginData {
    email: string;
    password: string;
}

interface LoginResponse {
    data: {
        token: string;
        uid: string;
        email: string;
        name: string;
        isVendor: boolean;
    }
}

export interface SignupResponse {
    data: {
        token: string;
        uid: string;
        email: string;
        name: string;
        isVendor: boolean;
    }
}

export const signup = async (data: {
    email: string;
    password: string;
    name: string;
    isVendor: boolean;
}): Promise<SignupResponse> => {
    return await fetch.post('/auth/user/signup', data);
};

export const login = async (credentials: LoginData): Promise<LoginResponse> => {
    const res = await fetch.post<LoginResponse>("/auth/user/login", credentials);
    if (res.data) {
        localStorage.setItem('user', JSON.stringify(res.data));
    }
    return res.data;
};