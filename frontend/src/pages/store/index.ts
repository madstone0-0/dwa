import { create } from "zustand";
import { createJSONStorage, devtools, persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { health, ping } from "../utils/api";
import { CartItem, User, USER_TYPE } from "../types";

const initialUser: User = {
    uid: "",
    name: "",
    email: "",
    token: "",
    user_type: USER_TYPE.BUYER,
};

type ResetOps = {
    uid?: string;
    name?: string;
    email?: string;
    token?: string;
    user_type?: USER_TYPE;
    cart?: CartItem[];
};

const InitialState = {
    user: initialUser,
    cart: [],
};

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

const useStore = create<UserState>()(
    immer(
        devtools(
            persist(
                (set) => ({
                    user: InitialState.user,
                    cart: InitialState.cart,

                    setUser: (user: User) =>
                        set((state) => {
                            state.user = user;
                        }),

                    setCart: (cart: CartItem[]) =>
                        set((state) => {
                            state.cart = cart;
                        }),

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
                    name: "userStore",
                    storage: createJSONStorage(() => sessionStorage),
                    onRehydrateStorage: (state) => {
                        console.log("Rehydrating state");
                        ping()
                            .then((res) => {
                                if (!res) state.reset();
                            })
                            .catch((err) => {
                                console.error(`Ping error -> ${err}`);
                                state.reset();
                            });

                        return (_state, error) => {
                            if (error) {
                                console.error("Error rehydrating state", error);
                            }
                        };
                    },
                },
            ),
            {
                name: "global-storage",
            },
        ),
    ),
);

export default useStore;
