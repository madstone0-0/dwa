export const setLocalStorage = (key: string, value: string) =>
	localStorage.setItem(key, value);

export const getLocalStorage = (key: string): string | null => {
	const value = localStorage.getItem(key);
	if (value) {
		return JSON.parse(value);
	}
	return null;
};

export const removeLocalStorage = (key: string) => localStorage.removeItem(key);

export const clearLocalStorage = () => localStorage.clear();

export const setSessionStorage = (key: string, value: string) =>
	sessionStorage.setItem(key, value);

export const getSessionStorage = (key: string): string | null => {
	const value = sessionStorage.getItem(key);
	if (value) {
		return JSON.parse(value);
	}
	return null;
};

export const removeSessionStorage = (key: string) =>
	sessionStorage.removeItem(key);

export const clearSessionStorage = () => sessionStorage.clear();
