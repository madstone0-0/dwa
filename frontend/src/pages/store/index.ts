// Importing required utilities from Zustand and related middleware
import { create } from "zustand";
import { createJSONStorage, devtools, persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer"; // Allows state mutation in a simpler way (like Redux Toolkit)
import { health, ping } from "../utils/api"; // API functions
import { CartItem, User, USER_TYPE } from "../types"; // TypeScript types

// This is the default user state when no one is logged in
const initialUser: User = {
    uid: "",
    name: "",
    email: "",
    token: "",
    user_type: USER_TYPE.BUYER,
};

// Type for optional reset parameters when calling `reset()`
type ResetOps = {
    uid?: string;
    name?: string;
    email?: string;
    token?: string;
    user_type?: USER_TYPE;
    cart?: CartItem[];
};

// This object holds the initial structure of our global store
const InitialState = {
    user: initialUser,
    cart: [],
};

// Describes the shape of our Zustand store
export type UserState = {
    user: User;
    cart: CartItem[];

    setUser: (user: User) => void;
    setCart: (cart: CartItem[]) => void;
    updateName: (val: string) => void;
    updateEmail: (val: string) => void;
    updateUid: (val: string) => void;
    updateToken: (val: string) => void;
    updateUserType: (val: USER_TYPE) => void;
    reset: (opts?: ResetOps) => void;
};

// Create the Zustand store with middleware for immer, devtools, and persistence
const useStore = create<UserState>()(
    immer(
        devtools(
            persist(
                (set) => ({
                    user: InitialState.user,
                    cart: InitialState.cart,

                    // Replace the entire user object
                    setUser: (user: User) =>
                        set((state) => {
                            state.user = user;
                        }),

                    // Replace the entire cart
                    setCart: (cart: CartItem[]) =>
                        set((state) => {
                            state.cart = cart;
                        }),

                    // Update individual properties of the user
                    updateUid: (val: string) =>
                        set((state) => {
                            state.user.uid = val;
                        }),

                    updateName: (val: string) =>
                        set((state) => {
                            state.user.name = val;
                        }),

                    updateEmail: (val: string) =>
                        set((state) => {
                            state.user.email = val;
                        }),

                    updateToken: (val: string) =>
                        set((state) => {
                            state.user.token = val;
                        }),

                    updateUserType: (val: USER_TYPE) =>
                        set((state) => {
                            state.user.user_type = val;
                        }),

                    // Reset user and cart to default, or update specific fields if provided
                    reset: (opts) =>
                        set((state) => {
                            if (!opts) {
                                state.user = initialUser;
                                state.cart = [];
                                return;
                            }

                            const { uid, name, email, token, user_type, cart } = opts;
                            if (uid) state.user.uid = uid;
                            if (name) state.user.name = name;
                            if (email) state.user.email = email;
                            if (token) state.user.token = token;
                            if (user_type) state.user.user_type = user_type;
                            if (cart) state.cart = cart;
                        }),
                }),
                {
                    name: "userStore", // Name of the store in storage
                    storage: createJSONStorage(() => sessionStorage), // Persist store in session storage

                    // Function that runs when the store is being rehydrated from storage
                    onRehydrateStorage: (state) => {
                        console.log("Rehydrating state");

                        // Ping the backend to check session validity
                        ping()
                            .then((res) => {
                                if (!res) state.reset(); // Reset store if backend says session is invalid
                            })
                            .catch((err) => {
                                console.error(`Ping error -> ${err}`);
                                state.reset(); // Also reset if there's a ping error
                            });

                        // Optional callback after hydration is complete
                        return (_state, error) => {
                            if (error) {
                                console.error("Error rehydrating state", error);
                            }
                        };
                    },
                },
            ),
            {
                name: "global-storage", // Name for Redux DevTools
            },
        ),
    ),
);

// Export the store hook so components can use it
export default useStore;
