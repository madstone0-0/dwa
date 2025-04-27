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
