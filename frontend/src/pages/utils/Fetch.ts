import axios, {
	AxiosError,
	AxiosInstance,
	AxiosRequestConfig,
	AxiosResponse,
	RawAxiosRequestHeaders,
} from "axios";
import { IFetch, User } from "../types";
import { getLocalStorage } from ".";

const API_BASE = import.meta.env.VITE_API_BASE;

type ErrorHandlers = Map<number, (error: AxiosError) => void>;

class Fetch implements IFetch {
	private instance: AxiosInstance;
	private static errorHandlers: ErrorHandlers = new Map<
		number,
		(error: AxiosError) => void
	>();

	/**
	 * Process successful responses
	 */
	private handleSuccess(res: AxiosResponse) {
		if (res.data && typeof res.data === "object" && "data" in res.data) {
			res.data = res.data.data;
		}
		return res;
	}

	/**
	 * Handle errors and invoke registered error handlers
	 */
	private handleError(error: AxiosError) {
		console.error("API Request Failed:", {
			url: error.config?.url,
			method: error.config?.method,
			status: error.response?.status,
			message: error.message,
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

	/**
	 * Register a handler for a specific HTTP status code
	 */
	static registerErrorHandler(
		status: number,
		handler: (error: AxiosError) => void,
	) {
		Fetch.errorHandlers.set(status, handler);
	}

	/**
	 * Clear error handlers for a specific status or all statuses
	 */
	static clearErrorHandler(status?: number) {
		if (status !== undefined) {
			Fetch.errorHandlers.delete(status);
		} else {
			Fetch.errorHandlers.clear();
		}
	}

	/**
	 * Check if a handler exists for a specific status
	 */
	static hasErrorHandler(status: number) {
		return Fetch.errorHandlers.has(status);
	}

	/**
	 * Create a new Fetch instance
	 */
	constructor() {
		this.instance = this.createAxiosInstance();
	}

	/**
	 * Get a fresh authorization token from localStorage
	 */
	private getAuthToken(): string | undefined {
		const userJSON = getLocalStorage("user");
		if (userJSON !== null) {
			const user = userJSON as unknown as User;
			return user.token;
		}
		return undefined;
	}

	/**
	 * Create a configured Axios instance with interceptors
	 */
	private createAxiosInstance(): AxiosInstance {
		const instance = axios.create({
			baseURL: API_BASE,
			headers: {
				"Content-Type": "application/json",
			},
			withCredentials: false,
		});

		// Add response interceptors
		instance.interceptors.response.use(
			this.handleSuccess.bind(this),
			this.handleError.bind(this),
		);

		// Add request interceptor to add the latest auth token
		instance.interceptors.request.use((config) => {
			const token = this.getAuthToken();
			if (token) {
				config.headers = config.headers || {};
				(config.headers as RawAxiosRequestHeaders).Authorization =
					`Bearer ${token}`;
			}
			return config;
		});

		return instance;
	}

	/**
	 * Perform a GET request
	 */
	async get<T = any>(url: string, options?: AxiosRequestConfig): Promise<T> {
		const response = await this.instance.get<T>(url, options);
		return response.data;
	}

	/**
	 * Perform a POST request
	 */
	async post<T = any>(
		url: string,
		data: any,
		options?: AxiosRequestConfig,
	): Promise<T> {
		const response = await this.instance.post<T>(url, data, options);
		return response.data;
	}

	/**
	 * Perform a PUT request
	 */
	async put<T = any>(
		url: string,
		data: any,
		options?: AxiosRequestConfig,
	): Promise<T> {
		const response = await this.instance.put<T>(url, data, options);
		return response.data;
	}

	/**
	 * Perform a DELETE request
	 */
	async delete<T = any>(url: string, options?: AxiosRequestConfig): Promise<T> {
		const response = await this.instance.delete<T>(url, options);
		return response.data;
	}
}

export const fetch = new Fetch();
export default Fetch;
