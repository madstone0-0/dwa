import { AxiosError } from "axios";
import { ResponseErr, ResponseMsg } from "pages/types";

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

export const setSessionStorage = (key: string, value: any) => sessionStorage.setItem(key, JSON.stringify(value));

export const getSessionStorage = (key: string): string | null => {
    const value = sessionStorage.getItem(key);
    if (value) {
        return JSON.parse(value);
    }
    return null;
};

export const removeSessionStorage = (key: string) => sessionStorage.removeItem(key);

export const clearSessionStorage = () => sessionStorage.clear();

export const resolveError = <T = ResponseErr, D = any>(error: unknown) => {
    if (error instanceof AxiosError) {
        return error as AxiosError<T, D>;
    } else if (error instanceof Error && error.message != undefined) {
        return new AxiosError<T, D>(error.message, "500");
    }

    if (error) console.error(`Unknown error -> ${error}`);

    return new AxiosError<ResponseErr, D>("Something went wrong", "500");
};

export const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("userType");
    localStorage.removeItem("token");
    localStorage.removeItem("cart");
};
