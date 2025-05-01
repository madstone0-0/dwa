import { useNavigate } from "react-router-dom";
import { useCallback, useEffect, useState } from "react";
import Fetch, { fetch } from "./Fetch";
import useStore from "../store";
import { getLocalStorage, removeLocalStorage, resolveError, setLocalStorage } from ".";
import { CartItem, Item, ResponseMsg } from "pages/types";

export const useLogout = () => {
    const navigate = useNavigate();
    const reset = useStore((state) => state.reset);

    const handleLogout = useCallback(() => {
        try {
            removeLocalStorage("user");
            removeLocalStorage("userType");
            removeLocalStorage("token");
            removeLocalStorage("cart");
            removeLocalStorage("structured_profile");
            reset();
            navigate("/signin", { replace: true });
            return true; // Indicate successful logout
        } catch (error) {
            console.error("Logout failed:", error);
            return false; // Indicate failed logout
        }
    }, [navigate, reset]);

    return handleLogout;
};

export const useAuthErrorHandler = () => {
    const logout = useLogout();

    useEffect(() => {
        if (!Fetch.hasErrorHandler(401)) {
            Fetch.registerErrorHandler(401, () => {
                logout();
                console.log("401 error handler triggered");
            });
        }

        // Clean up when component unmounts
        return () => {
            Fetch.clearErrorHandler(401);
        };
    }, []);
};

export const useCart = () => {
    const cart = useStore((state) => state.cart);
    const setCart = useStore((state) => state.setCart);
    const user = useStore((state) => state.user);
    const [isUpdatingCart, setIsUpdatingCart] = useState(false);

    const addToCart = async (item: Item) => {
        if (isUpdatingCart) return; // Prevent multiple simultaneous cart updates

        setIsUpdatingCart(true);

        try {
            const { token, uid: buyerId } = user;

            if (!token || !buyerId) {
                throw new Error("User not authenticated");
            }

            // Check if item already exists in cart using React state
            const existingItemIndex = cart.findIndex((ci) => ci.iid === item.iid && ci.vid === item.vid);

            const existingItem = existingItemIndex !== -1 ? cart[existingItemIndex] : null;
            const quantity = existingItem ? existingItem.quantity + 1 : 1;

            try {
                if (existingItem) {
                    // Item exists in cart - update quantity
                    await fetch.put<ResponseMsg>("/buyer/cart/update", {
                        bid: buyerId,
                        iid: item.iid,
                        vid: item.vid,
                        quantity,
                    });

                    // Update local React state optimistically
                    const updatedCart = [...cart];
                    updatedCart[existingItemIndex] = {
                        ...existingItem,
                        quantity,
                    };
                    setCart(updatedCart);
                } else {
                    // Item doesn't exist in cart - add it
                    await fetch
                        .post("/buyer/cart/add", {
                            bid: buyerId,
                            iid: item.iid,
                            vid: item.vid,
                            quantity,
                        })
                        .catch(async (e) => {
                            const err = resolveError(e);

                            if (err.status === 400) {
                                // Item already in cart on server but not in our state, update quantity
                                await fetch.put("/buyer/cart/update", {
                                    bid: buyerId,
                                    iid: item.iid,
                                    vid: item.vid,
                                    quantity: quantity,
                                });
                            } else {
                                throw new Error(err.response?.data.err);
                            }
                        });

                    // Fetch updated cart after changes
                    const cartResponse = await fetch.get<{ items: CartItem[] }>(`/buyer/cart/${buyerId}`);
                    const updatedItems = cartResponse.items;

                    // Update both state and local storage
                    setCart(updatedItems);
                    setLocalStorage("cart", updatedItems);
                }
            } catch (error) {
                console.error("Cart update failed:", error);
                // Re-sync with server to ensure consistency
                await refreshCart(buyerId);
                throw error;
            }
        } catch (error) {
            console.error("Cart operation failed:", error);
            // You could add a UI notification here to inform the user
        } finally {
            setIsUpdatingCart(false);
        }
    };

    // Helper function to refresh cart data from server
    const refreshCart = async (buyerId: string) => {
        try {
            const cartResponse = await fetch.get<{ items: CartItem[] }>(`/buyer/cart/${buyerId}`);
            const items = cartResponse.items;
            setCart(items);
            setLocalStorage("cart", items); // Keep local storage in sync
        } catch (e) {
            const err = resolveError(e);
            console.error("Failed to refresh cart:", err);
        }
    };

    return {
        addToCart,
        refreshCart,
        isUpdatingCart,
        setIsUpdatingCart,
    };
};
