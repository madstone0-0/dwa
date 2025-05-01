import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { fetch } from "./utils/Fetch";
import { useCart } from "./utils/hooks";
import useStore from "./store";
import { CartItem } from "./types";
import placeholder from "../assets/dwa-icon.jpg";

// Define types for component props
interface CartItemRowProps {
    item: CartItem;
    onDelete: () => void;
}

interface PriceBreakdownProps {
    subtotal: number;
    deliveryFee: number;
    tax: number;
    total: number;
    onPlaceOrder: () => Promise<void>;
    isProcessing: boolean;
}

// Component extraction for better organization
const CartItemRow: React.FC<CartItemRowProps> = ({ item, onDelete }) => (
    <div className="flex justify-between items-center mb-4">
        <div className="flex items-center">
            <img
                src={item.pictureurl}
                onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = placeholder;
                }}
                alt={item.name}
                className="object-cover mr-4 w-12 h-12 rounded-md"
            />
            <div>
                <p className="font-semibold">{item.name}</p>
                <p className="text-sm text-gray-600">Seller: {item.vendor_name}</p>
            </div>
        </div>
        <div className="text-sm text-gray-600">
            {item.quantity} x ${item.cost.toFixed(2)}
        </div>
        <button onClick={onDelete} className="text-red-500 hover:text-red-700">
            Delete
        </button>
    </div>
);

const PriceBreakdown: React.FC<PriceBreakdownProps> = ({
    subtotal,
    deliveryFee,
    tax,
    total,
    onPlaceOrder,
    isProcessing,
}) => (
    <div className="p-6 bg-white rounded-lg shadow-md">
        <h3 className="text-xl font-bold" style={{ color: "#722F37" }}>
            Price Breakdown
        </h3>
        <div className="mt-4">
            <div className="flex justify-between">
                <p className="text-sm text-gray-600">Subtotal</p>
                <p className="text-sm">${subtotal.toFixed(2)}</p>
            </div>
            <div className="flex justify-between">
                <p className="text-sm text-gray-600">Delivery Fee</p>
                <p className="text-sm">${deliveryFee.toFixed(2)}</p>
            </div>
            <div className="flex justify-between">
                <p className="text-sm text-gray-600">Tax (5%)</p>
                <p className="text-sm">${tax.toFixed(2)}</p>
            </div>
            <div className="flex justify-between mt-4 font-bold">
                <p>Total</p>
                <p>${total.toFixed(2)}</p>
            </div>
        </div>

        <button
            onClick={onPlaceOrder}
            className="py-3 mt-6 w-full font-semibold text-white bg-yellow-400 rounded-lg hover:bg-yellow-500 disabled:bg-gray-400"
            disabled={isProcessing}
        >
            {isProcessing ? "Processing..." : "Place Order"}
        </button>
    </div>
);

interface ResponseBody {
    status: number;
    message?: string;
    data?: any;
}

const CheckoutPayment: React.FC = () => {
    const navigate = useNavigate();
    const user = useStore((state) => state.user);
    const cart = useStore((state) => state.cart as CartItem[]);
    const setCart = useStore((state) => state.setCart as (items: CartItem[]) => void);

    const [isProcessing, setIsProcessing] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const { removeFromCart, clearCart, refreshCart } = useCart(setIsLoading);

    // Calculate totals
    const subtotal = cart.reduce((sum, item) => sum + item.cost * item.quantity, 0);
    const deliveryFee = 5.0;
    const tax = subtotal * 0.05; // 5% tax
    const total = subtotal + deliveryFee + tax;

    // Fetch cart items
    useEffect(() => {
        if (user) {
            refreshCart(user.uid).catch((e) => console.error({ e }));
        }
    }, [user?.uid, setCart]);

    const handlePlaceOrder = useCallback(async (): Promise<void> => {
        if (cart.length === 0) {
            setError("Your cart is empty. Add items before placing an order.");
            return;
        }

        setIsProcessing(true);
        setError(null);

        try {
            const paymentPromises = cart.map((item) =>
                fetch.post<ResponseBody>("buyer/pay/initialize", {
                    bid: user.uid,
                    vid: item.vid,
                    iid: item.iid,
                    amt: item.cost,
                    qty_bought: item.quantity,
                }),
            );

            await Promise.all(paymentPromises);
            await clearCart();
        } catch (error) {
            console.error("Error placing order:", error);
            setError("Failed to place your order. Please try again.");
        } finally {
            setIsProcessing(false);
        }
    }, [cart, user?.uid, navigate, clearCart]);

    if (isLoading && cart.length === 0) {
        return (
            <div className="flex flex-col min-h-screen bg-gray-100">
                <div className="container flex flex-grow justify-center items-center">
                    <p className="text-xl">Loading your cart...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-screen bg-gray-100">
            <main className="container flex-grow py-8 px-4 mx-auto">
                {error && <div className="p-4 mb-6 text-red-700 bg-red-100 rounded-lg">{error}</div>}

                <div className="flex flex-col gap-8 md:flex-row">
                    {/* Left Column - Order Details */}
                    <div className="md:w-2/3">
                        <div className="p-6 bg-white rounded-lg shadow-md">
                            <h3 className="mb-4 text-xl font-bold" style={{ color: "#722F37" }}>
                                My Cart {cart.length > 0 ? `(${cart.length} items)` : ""}
                            </h3>

                            {cart.length === 0 ? (
                                <p className="py-8 text-center text-gray-500">Your cart is empty.</p>
                            ) : (
                                <>
                                    {cart.map((item) => (
                                        <CartItemRow
                                            key={`${item.iid}-${item.vid}`}
                                            item={item}
                                            onDelete={() => removeFromCart(item)}
                                        />
                                    ))}

                                    <button
                                        onClick={clearCart}
                                        className="py-2 mt-4 w-full text-white bg-red-500 rounded-lg hover:bg-red-600"
                                    >
                                        Clear Cart
                                    </button>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Right Column - Price Breakdown */}
                    <div className="md:w-1/3">
                        <PriceBreakdown
                            subtotal={subtotal}
                            deliveryFee={deliveryFee}
                            tax={tax}
                            total={total}
                            onPlaceOrder={handlePlaceOrder}
                            isProcessing={isProcessing}
                        />
                    </div>
                </div>
            </main>
        </div>
    );
};

export default CheckoutPayment;
