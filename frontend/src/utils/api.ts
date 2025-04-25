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
