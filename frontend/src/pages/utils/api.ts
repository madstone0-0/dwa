import { setLocalStorage } from ".";
import { CartItem, Item, ItemWithVendorInfo, LoginData, ResponseMsg, SignupResponse, Transaction } from "../types";
import { fetch } from "./Fetch";
import { User } from "pages/types";

// Checks if the backend server is healthy and running
export const health = async () => {
    try {
        const res = await fetch.get<{ msg: string }>("health");
        const data = res;
        return data.msg; // Return the health status message
    } catch (e) {
        throw e; // Re-throw error for caller to handle
    }
};

// Checks if the user is authenticated and the session is still valid
export const ping = async () => {
    try {
        const res = await fetch.get<{ msg: string }>("auth/ping");
        return res.msg; // Return the ping response message
    } catch (e) {
        throw e;
    }
};

// Gets all items available in the system
export const getAllItems = async () => {
    try {
        const res = await fetch.get<{ items: Item[] }>("items/all");
        const data = res;
        return data.items; // Return the list of items
    } catch (e) {
        throw e;
    }
};

// Gets a single item by its ID, including vendor info
export const getItem = async (iid: string) => {
    try {
        const res = await fetch.get<ItemWithVendorInfo>(`items/${iid}`);
        return res; // Return item details with vendor info
    } catch (e) {
        throw e;
    }
};

// Gets all items that belong to a specific vendor
export const getVendorItems = async (user: User) => {
    try {
        const { uid: vid } = user; // Extract vendor ID from user
        const res = await fetch.get<{ items: Item[] }>(`vendor/item/${vid}`);
        const data = res;
        return data.items; // Return vendor's items
    } catch (e) {
        throw e;
    }
};

// Updates an item (partial update allowed)
export const updateItem = async (item: Partial<Item>) => {
    try {
        const res = await fetch.put<ResponseMsg>(`vendor/item/update`, item);
        const data = res;
        return data.msg; // Return success message
    } catch (e) {
        throw e;
    }
};

// Deletes an item by its ID
export const deleteItem = async (iid: string) => {
    try {
        const res = await fetch.delete<ResponseMsg>(`vendor/item/delete/${iid}`);
        const data = res;
        return data.msg; // Return deletion confirmation
    } catch (e) {
        throw e;
    }
};

// Gets all transactions for a given vendor ID
export const getTransactions = async (vid: string) => {
    try {
        const res = await fetch.get<{ transactions: Transaction[] }>(`vendor/transactions/${vid}`);
        const data = res;
        return data.transactions; // Return vendor's transactions
    } catch (e) {
        throw e;
    }
};

// Gets the current shopping cart for a buyer by ID
export const getBuyerCart = async (bid: string) => {
    try {
        const res = await fetch.get<{ items: CartItem[] }>(`buyer/cart/${bid}`);
        return res.items; // Return buyer's cart items
    } catch (e) {
        throw e;
    }
};

// Handles user signup by sending form data to the server
export const signup = async (data: {
    email: string;
    password: string;
    name: string;
    isVendor: boolean;
}): Promise<SignupResponse> => {
    return await fetch.post("/auth/user/signup", data); // Send signup request
};

// Logs in a user and saves the user data to localStorage
export const login = async (credentials: LoginData): Promise<User> => {
    const res = await fetch.post<User>("auth/user/login", credentials);
    console.log({ res }); // Log the user data
    if (res) {
        setLocalStorage("user", res); // Save user to localStorage
    }
    return res; // Return the logged-in user
};
