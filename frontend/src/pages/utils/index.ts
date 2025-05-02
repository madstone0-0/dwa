import { AxiosError } from "axios";
import { ResponseErr } from "pages/types";

// Stores a key-value pair in localStorage after converting the value to a JSON string
export const setLocalStorage = (key: string, value: any) => {
    const stringValue = JSON.stringify(value);
    console.log({ stringValue });
    localStorage.setItem(key, stringValue);
};

// Retrieves a value from localStorage and parses it from a JSON string back into its original type

export const getLocalStorage = (key: string): string | null => {
    const value = localStorage.getItem(key);
    if (value) {
        if (value === "undefined") return null;
        return JSON.parse(value);
    }
    return null;
};

// Removes a specific key from localStorage

export const removeLocalStorage = (key: string) => localStorage.removeItem(key);

// Clears all keys and values from localStorage
export const clearLocalStorage = () => localStorage.clear();

// Stores a key-value pair in sessionStorage after converting the value to JSON string

export const setSessionStorage = (key: string, value: any) => sessionStorage.setItem(key, JSON.stringify(value));

// Retrieves and parses a value from sessionStorage
export const getSessionStorage = (key: string): string | null => {
    const value = sessionStorage.getItem(key);
    if (value) {
        return JSON.parse(value); // Parse value back to its original type
    }
    return null;
};

// Removes a specific key from sessionStorage
export const removeSessionStorage = (key: string) => sessionStorage.removeItem(key);

// Clears all keys and values from sessionStorage

export const clearSessionStorage = () => sessionStorage.clear();

// Converts any thrown error into a typed AxiosError instance for consistent error handling
export const resolveError = <T = ResponseErr, D = any>(error: unknown) => {
    if (error instanceof AxiosError) {
        return error as AxiosError<T, D>; // Return the original AxiosError with generics
    } else if (error instanceof Error && error.message != undefined) {
        return new AxiosError<T, D>(error.message, "500"); // Wrap regular Error in AxiosError format
    }

    // Fallback for unknown error types
    if (error) console.error(`Unknown error -> ${error}`);

    return new AxiosError<ResponseErr, D>("Something went wrong", "500");
};

// Clears all user-related data from localStorage to simulate a logout
export const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("userType");
    localStorage.removeItem("token");
    localStorage.removeItem("cart");
};
