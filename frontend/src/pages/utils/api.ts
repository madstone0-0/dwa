import { setLocalStorage } from ".";
import { CartItem, Item, LoginData, ResponseMsg, SignupResponse, Transaction } from "../types";
import { fetch } from "./Fetch";
import { User } from "pages/types";

export const health = async () => {
    try {
        const res = await fetch.get<{ msg: string }>("health");
        const data = res;
        return data.msg;
    } catch (e) {
        throw e;
    }
};

export const ping = async () => {
    try {
        const res = await fetch.get<{ msg: string }>("auth/ping");
        return res.msg;
    } catch (e) {
        throw e;
    }
};

export const getAllItems = async () => {
    try {
        const res = await fetch.get<{ items: Item[] }>("items/all");
        const data = res;
        return data.items;
    } catch (e) {
        throw e;
    }
};

export const getVendorItems = async (user: User) => {
    try {
        const { uid: vid } = user;
        const res = await fetch.get<{ items: Item[] }>(`vendor/item/${vid}`);
        const data = res;
        return data.items;
    } catch (e) {
        throw e;
    }
};

export const updateItem = async (item: Partial<Item>) => {
    try {
        const res = await fetch.put<ResponseMsg>(`vendor/item/update`, item);
        const data = res;
        return data.msg;
    } catch (e) {
        throw e;
    }
};

export const deleteItem = async (iid: string) => {
    try {
        const res = await fetch.delete<ResponseMsg>(`vendor/item/delete/${iid}`);
        const data = res;
        return data.msg;
    } catch (e) {
        throw e;
    }
};

export const getTransactions = async (vid: string) => {
    try {
        const res = await fetch.get<{ transactions: Transaction[] }>(`vendor/transactions/${vid}`);
        const data = res;
        return data.transactions;
    } catch (e) {
        throw e;
    }
};

export const getBuyerCart = async (bid: string) => {
    try {
        const res = await fetch.get<{ items: CartItem[] }>(`buyer/cart/${bid}`);
        return res.items;
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
    try {
        const res = await fetch.post<User>("auth/user/login", credentials);
        console.log({ res });
        if (res) {
            setLocalStorage("user", res);
        }
        return res;
    } catch (e) {
        throw e;
    }
};
