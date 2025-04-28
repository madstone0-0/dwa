export const setLocalStorage = (key: string, value: any) => {
	const stringValue = JSON.stringify(value);
	console.log({ stringValue });
	localStorage.setItem(key, stringValue);
};

export const getLocalStorage = (key: string): string | null => {
	const value = localStorage.getItem(key);
	if (value) {
		if (value === "undefined") return null;
		return JSON.parse(value);
	}
	return null;
};

export const removeLocalStorage = (key: string) => localStorage.removeItem(key);

export const clearLocalStorage = () => localStorage.clear();

export const setSessionStorage = (key: string, value: any) =>
	sessionStorage.setItem(key, JSON.stringify(value));

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
