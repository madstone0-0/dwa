import axios, {
	AxiosError,
	AxiosInstance,
	AxiosRequestConfig,
	AxiosResponse,
} from "axios";
import { IFetch, User } from "../types";
import { getLocalStorage } from ".";
import { AxiosHeaders } from "node_modules/axios/index.d.cts";
const API_BASE = import.meta.env.VITE_API_BASE;

type ErrorHandlers = Map<number, (error: AxiosError) => void>;

class Fetch implements IFetch {
	private instance: AxiosInstance;
	private static errorHandlers: ErrorHandlers = new Map<
		number,
		(error: AxiosError) => void
	>();

	handleSuccess(res: AxiosResponse) {
		if (res.data && typeof res.data === "object" && "data" in res.data) {
			res.data = res.data.data;
		}
		return res;
	}

	handleError(error: AxiosError) {
		console.error("AxiosError: ", {
			error: error.message,
		});

		if (error.response) {
			const status = error.response.status;
			if (Fetch.errorHandlers.has(status)) {
				const handler = Fetch.errorHandlers.get(status)!;
				handler(error);
			}
		}

		return Promise.reject(error);
	}

	static registerErrorHandler(
		status: number,
		handler: (error: AxiosError) => void,
	) {
		if (Fetch.errorHandlers.has(status)) {
			Fetch.errorHandlers.delete(status);
		}
		Fetch.errorHandlers.set(status, handler);
	}

	static clearErrorHandler(status?: number) {
		if (status) {
			Fetch.errorHandlers.delete(status);
		} else {
			Fetch.errorHandlers.clear();
		}
	}

	static hasErrorHandler(status: number) {
		return Fetch.errorHandlers.has(status);
	}

	constructor() {
		const headers: AxiosHeaders = {
			"Content-Type": "application/json",
		};
		const userJSON = getLocalStorage("user");
		if (userJSON !== null) {
			const user: User = userJSON as unknown as User;
			console.log("User", user);
			headers["Authorization"] = `Bearer ${user.token}`;
		}

		const instance = axios.create({
			baseURL: API_BASE,
			headers: headers,
			withCredentials: false,
		});

		instance.interceptors.response.use(
			this.handleSuccess.bind(this),
			this.handleError.bind(this),
		);

		this.instance = instance;
	}

	async get<T = never, R = AxiosResponse<T>>(
		url: string,
		options?: AxiosRequestConfig<T>,
	) {
		const res = await this.instance.get<T, R>(url, { ...options });
		return res;
	}

	/* eslint-disable @typescript-eslint/no-explicit-any */
	async post<T = never, R = AxiosResponse<T>>(
		url: string,
		data: any,
		options?: AxiosRequestConfig<T>,
	) {
		const res = await this.instance.post<T, R>(url, data, { ...options });
		return res;
	}

	async put<T = never, R = AxiosResponse<T>>(
		url: string,
		data: any,
		options?: AxiosRequestConfig,
	) {
		const res = await this.instance.put<T, R>(url, data, { ...options });
		return res;
	}
	/* eslint-enable @typescript-eslint/no-explicit-any */

	async delete<T = never, R = AxiosResponse<T>>(
		url: string,
		options?: AxiosRequestConfig<T>,
	) {
		const res = await this.instance.delete<T, R>(url, { ...options });
		return res;
	}
}

export const fetch = new Fetch();
export default Fetch;
