/* eslint-disable @typescript-eslint/no-explicit-any */
// Interface for the custom fetch utility with basic HTTP methods
export interface IFetch {
    get: (url: string) => Promise<any>;           // Make a GET request to a URL
    post: (url: string, data: any) => Promise<any>; // Make a POST request with data
    put: (url: string, data: any) => Promise<any>;  // Make a PUT request to update data
    delete: (url: string) => Promise<any>;         // Make a DELETE request to a URL
}
/* eslint-enable @typescript-eslint/no-explicit-any */

// Structure of data required to sign up a user
export interface SignupData {
    email: string;
    password: string;
    name: string;
    isVendor: boolean; // true if the user is a vendor, false if buyer
}

// Structure of login credentials
export interface LoginData {
    email: string;
    password: string;
}

// Expected response format after logging in
export interface LoginResponse {
    data: {
        token: string;
        uid: string;
        email: string;
        name: string;
        isVendor: boolean;
    };
}

// Expected response format after signing up
export interface SignupResponse {
    data: {
        token: string;
        uid: string;
        email: string;
        name: string;
        isVendor: boolean;
    };
}

// Structure for a marketplace item
export type Item = {
    iid: string;         // Item ID
    vid: string;         // Vendor ID
    name: string;
    pictureurl: string;
    description: string;
    category: CATEGORIES;
    quantity: number;    // Available stock
    cost: number;        // Price of item
};

// Structure for creating a new item (no ID or vendor yet)
export type NewItem = Omit<Item, "iid" | "vid">;

// Available item categories
export enum CATEGORIES {
    FASHION = "FASHION",
    BOOKS_SUPPLIES = "BOOKS_SUPPLIES",
    SERVICES = "SERVICES",
    ELECTRONICS = "ELECTRONICS",
}

// Types of users in the system
export enum USER_TYPE {
    VENDOR = "vendor",
    BUYER = "buyer",
}

// Structure for a user object
export type User = {
    token: string;
    uid: string;
    email: string;
    name: string;
    user_type: USER_TYPE;
};

// Standard structure for a successful response message
export type ResponseMsg = {
    msg: string;
};

// Standard structure for an error message
export type ResponseErr = {
    err: string;
};

// A record of a transaction (e.g., a purchase)
export type Transaction = {
    name: string;     // Buyer or item name
    amt: number;      // Amount spent
    t_time: string;   // Timestamp of transaction
};

// An item in a buyer's shopping cart
export type CartItem = {
    vendor_name: string;
    name: string;
    cost: number;
    quantity: number;
    added_time: string;
    iid: string;
    vid: string;
    pictureurl: string;
};

// Item details along with vendor info for display
export type ItemWithVendorInfo = Item & {
    vendor_name: string;
    vendor_logo: string;
    vendor_email: string;
};

// Type for an SVG icon component used in headers or UI
export type Icon = React.FC<React.SVGProps<SVGSVGElement>>;

// Structure for a navigation header item
export type HeaderItem = {
    name: string;       // Label shown to users
    link: string;       // Route or URL
    icon?: Icon;        // Optional icon component
};
