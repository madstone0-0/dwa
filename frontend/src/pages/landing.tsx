import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAllItems, getBuyerCart } from "./utils/api.js";
import { Item, USER_TYPE } from "./types";
import useStore from "./store";
import { useAuthErrorHandler, useCart } from "./utils/hooks.js";
import placeholder from "../assets/dwa-icon.jpg";

// This interface is used to define the props for the SectionHeader component. It includes the title, link text, and an optional onLinkClick function.
interface SectionHeaderProps {
    title: string;
    linkText: string;
    onLinkClick?: () => void | Promise<void>;
}

// This component is the landing page for buyers. It displays a welcome message, a search bar, and a list of frequently repurchased items.
function LandingPage() {
    // The constants and hooks are defined here.
    const navigate = useNavigate();

    const [items, setItems] = useState<Item[]>([]);
    const setCart = useStore((state) => state.setCart);
    const [searchTerm, setSearchTerm] = useState("");
    const [filteredItems, setFilteredItems] = useState<any[]>([]);
    const user = useStore((state) => state.user);

    useAuthErrorHandler();

    useEffect(() => {
        if (user) {
            if (user.user_type !== USER_TYPE.BUYER) navigate("/auth/signin");
            // Fetch cart data on initial load
            getBuyerCart(user.uid)
                .then((cart) => setCart(cart))
                .catch((e) => console.error({ e }));
        }
        getAllItems()
            .then((items) => setItems(items))
            .catch((e) => console.error({ e }));
    }, []);

    const SectionHeader = ({ title, linkText, onLinkClick }: SectionHeaderProps) => (
        <div className="flex justify-between items-center py-2 px-8 mb-4 w-full">
            <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
            <button
                className="font-semibold text-wine hover:text-wine-dark"
                style={{ color: "#722F37" }}
                onClick={onLinkClick}
            >
                {linkText}
            </button>
        </div>
    );

    const { addToCart } = useCart();

    const getTotalItems = () => {
        try {
            const cart = JSON.parse(localStorage.getItem("cart") || "[]");
            if (!Array.isArray(cart)) {
                return 0;
            }
            return cart.reduce((sum: number, ci: any) => sum + (ci.quantity || 0), 0);
        } catch (err) {
            console.error("Error calculating total items:", err);
            return 0;
        }
    };

    const goToCheckout = () => {
        //  Grab buyer ID from your auth store/localStorage
        const user = JSON.parse(localStorage.getItem("user") || "{}");
        const bid = user.uid;

        try {
            //  Map down to the minimal payload
            const cart = JSON.parse(localStorage.getItem("cart") || "[]");
            if (!Array.isArray(cart)) {
                console.error("Cart is not an array");
                return;
            }

            const payload = cart.map((ci) => ({
                bid,
                iid: ci.iid,
                vid: ci.vid,
                quantity: ci.quantity,
            }));

            //  Navigate and pass payload (or send via context/POST)
            navigate("/checkout-payment", { state: { cartPayload: payload } });
        } catch (err) {
            console.error("Error preparing checkout payload:", err);
        }
    };

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        const term = e.target.value.toLowerCase();
        setSearchTerm(term);

        // Filter items from backend data
        const filtered = items.filter((item) => {
            return item.name.toLowerCase().includes(term);
        });

        setFilteredItems(filtered);
    };

    return (
        <div className="flex flex-col min-h-screen bg-white">
            <div className="flex flex-col flex-grow items-center">
                {/* Hero Section */}
                <div className="flex flex-col items-center py-16 px-6 w-full text-center bg-yellow-100">
                    <h2 className="mb-2 text-3xl font-bold text-gray-900">Welcome to Ashesi DWA</h2>
                    <p className="text-lg text-gray-700">Ghana's Premier Student Marketplace</p>
                    {/* Search bar */}
                    <div className="relative mx-auto mt-8 w-full max-w-2xl">
                        <div className="flex relative items-center">
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={handleSearch}
                                placeholder="Search for products, services, or vendors"
                                className="p-4 pr-12 w-full rounded-full border border-gray-300 shadow-md focus:ring-2 focus:ring-yellow-500 focus:outline-none"
                            />
                            <button className="absolute right-2 p-2 text-gray-600 hover:text-yellow-500">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="w-6 h-6"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                    />
                                </svg>
                            </button>
                        </div>

                        {/* Search Results Dropdown */}
                        {searchTerm && filteredItems.length > 0 && (
                            <div className="overflow-y-auto absolute z-10 mt-2 w-full max-h-96 bg-white rounded-lg border border-gray-200 shadow-lg">
                                {filteredItems.map((item, index) => (
                                    <div
                                        key={index}
                                        className="p-4 border-b cursor-pointer last:border-b-0 hover:bg-gray-50"
                                        onClick={() => {
                                            setSearchTerm("");
                                            setFilteredItems([]);
                                            navigate(`/buyer/item/${item.iid}`);
                                        }}
                                    >
                                        <div className="flex items-center">
                                            <img
                                                src={item.pictureurl}
                                                alt={item.name}
                                                className="object-cover mr-4 w-12 h-12 rounded"
                                            />
                                            <div>
                                                <p className="font-semibold">{item.name}</p>
                                                <p className="text-sm text-gray-600">GH₵{item.cost}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Frequently Repurchased */}
                <SectionHeader title="All Items" linkText="EXPLORE" onLinkClick={() => navigate("/shop-by-category")} />
                <div className="grid grid-cols-1 gap-4 py-6 px-8 w-full md:grid-cols-4">
                    {items.map((item) => (
                        <ItemCard key={item.iid} item={item} addToCart={addToCart} />
                    ))}
                </div>

                {/* Cart Floating Button for Mobile */}
                {getTotalItems() > 0 && (
                    <div className="fixed right-6 bottom-6 z-10 md:hidden">
                        <button
                            onClick={goToCheckout}
                            className="flex justify-center items-center p-3 text-white rounded-full shadow-lg bg-wine"
                            style={{ backgroundColor: "#722F37" }}
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="w-6 h-6"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                                />
                            </svg>
                            <span className="ml-1 font-bold">{getTotalItems()}</span>
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

// This component represents an individual item card in the frequently repurchased section. It displays the item's image, name, cost, and buttons to add to cart or view the item.
type ItemCardProps = {
    item: Item;
    addToCart: (item: Item) => void;
};

// This constant defines the ItemCard component. It takes in an item and an addToCart function as props.
const ItemCard = ({ item, addToCart }: ItemCardProps) => {
    const navigate = useNavigate();
    const { iid, pictureurl: pictureUrl, name, cost } = item;
    return (
        <div key={iid} className="p-4 bg-white rounded-lg border border-gray-200 transition-shadow hover:shadow-lg">
            <img
                src={pictureUrl}
                alt={name}
                onError={(e) => {
                    (e as React.SyntheticEvent<HTMLImageElement, Event>).currentTarget.onerror = null;
                    (e.target as HTMLImageElement).src = placeholder;
                    (e.target as HTMLImageElement).alt = "Image load failed";
                }}
                className="object-contain mb-4 w-full h-48"
            />
            <h3 className="font-bold">{name}</h3>
            <p className="text-sm text-gray-600">GH₵{cost}</p>

            {/* Add to Cart and View Item buttons */}
            <div className="flex gap-2 mt-2">
                <button
                    className="flex-1 py-1 px-3 text-sm text-black bg-yellow-400 rounded hover:bg-yellow-500"
                    onClick={() => addToCart(item)}
                >
                    Add to Cart
                </button>
                <button
                    className="flex-1 py-1 px-3 text-sm text-white rounded bg-wine hover:bg-wine-dark"
                    style={{ backgroundColor: "#722F37" }}
                    onClick={() => navigate(`/buyer/item/${iid}`)}
                >
                    View Item
                </button>
            </div>
        </div>
    );
};

export default LandingPage;
