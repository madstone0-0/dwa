import axios, {
	AxiosError,
	AxiosInstance,
	AxiosRequestConfig,
	AxiosResponse,
} from "axios";
import { IFetch } from "../types";
const API_BASE = import.meta.env.VITE_API_BASE;

class Fetch implements IFetch {
	private instance: AxiosInstance;

	handleSuccess(res: AxiosResponse) {
		if (res.data && typeof res.data === 'object' && 'data' in res.data) {
			res.data = res.data.data;
		  }
		  return res;
	}

	handleError(error: AxiosError) {
		const requestDetails = error.config
			? {
					url: error.config.url,
					method: error.config.method,
					headers: error.config.headers,
					data: error.config.data,
				}
			: null;

		console.error("AxiosError: ", {
			error: error.message,
			response: error.response ? error.response.data : null,
			request: requestDetails,
		});

		return Promise.reject(error);
	}

	constructor() {
		const instance = axios.create({
			baseURL: API_BASE,
			headers: {
				Accept: "application/json",
			},
			withCredentials: true,
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
