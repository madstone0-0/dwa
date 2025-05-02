import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAllItems } from "./utils/api.js";
import { Item } from "./types";
import useStore from "./store";
import { HeaderItem } from "./types";
import { useCart } from "./utils/hooks.js";
import Header from "./Header";

// Enum for categories
const CATEGORY = {
    FASHION: "FASHION",
    ELECTRONICS: "ELECTRONICS",
    SERVICES: "SERVICES",
    BOOKS_SUPPLIES: "BOOKS_SUPPLIES",
};

// Enum for sort options
const SORT_OPTIONS = {
    PRICE_LOW_TO_HIGH: "PRICE_LOW_TO_HIGH",
    PRICE_HIGH_TO_LOW: "PRICE_HIGH_TO_LOW",
};

// ItemCard component
const ItemCard: React.FC<{ item: Item; addToCart: (item: Item) => void }> = ({ item, addToCart }) => {
    return (
        <div className="flex flex-col items-center p-4 bg-white rounded-lg shadow-md">
            <img src={item.pictureurl} alt={item.name} className="object-cover w-full h-48 rounded-t-lg" />
            <h3 className="mt-2 text-lg font-semibold">{item.name}</h3>
            <p className="text-gray-600">{item.description}</p>
            <p className="mt-2 text-xl font-bold">${item.cost.toFixed(2)}</p>
            <button
                onClick={() => addToCart(item)}
                className="py-2 px-4 mt-4 text-white rounded bg-wine hover:bg-wine-dark"
            >
                Add to Cart
            </button>
        </div>
    );
};

const ShopByCat: React.FC = () => {
    const navigate = useNavigate();
    const [, setItems] = useState<Item[]>([]);
    const [categories, setCategories] = useState<Record<string, Item[]>>({});
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [sortOption, setSortOption] = useState<string>(SORT_OPTIONS.PRICE_LOW_TO_HIGH);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const { addToCart } = useCart();
    const user = useStore((state) => state.user);

    const headerItems: HeaderItem[] = [
        {
            name: "Profile",
            link: "/buyer/profile",
            icon: () => (
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
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                </svg>
            ),
        },
        {
            name: "Cart",
            link: "/buyer/checkout",
            icon: () => (
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
            ),
        },
    ];

    useEffect(() => {
        if (user && user.user_type !== "buyer") {
            navigate("/signin");
            return;
        }

        const fetchData = async () => {
            try {
                setIsLoading(true);
                const allItems = await getAllItems();
                setItems(allItems);

                const grouped = allItems.reduce((acc: Record<string, Item[]>, item) => {
                    if (!acc[item.category]) acc[item.category] = [];
                    acc[item.category].push(item);
                    return acc;
                }, {});

                setCategories(grouped);

                if (!selectedCategory && Object.keys(grouped).length > 0) {
                    setSelectedCategory(Object.keys(grouped)[0]);
                }
            } catch (err) {
                console.error("Error fetching items:", err);
                setError("Failed to load items. Please try again later.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [user, navigate, selectedCategory]);

    const getTotalItems = () => {
        try {
            const cart = JSON.parse(localStorage.getItem("cart") || "[]");
            if (!Array.isArray(cart)) return 0;
            return cart.reduce((sum: number, ci: any) => sum + (ci.quantity || 0), 0);
        } catch (err) {
            console.error("Error calculating total items:", err);
            return 0;
        }
    };

    const goToCheckout = () => {
        const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
        const bid = storedUser?.uid || "";

        try {
            const cart = JSON.parse(localStorage.getItem("cart") || "[]");
            if (!Array.isArray(cart)) {
                console.error("Cart is not an array");
                return;
            }

            const payload = cart.map((ci: any) => ({
                bid,
                iid: ci.iid,
                vid: ci.vid,
                quantity: ci.quantity,
            }));

            navigate("/checkout-payment", { state: { cartPayload: payload } });
        } catch (err) {
            console.error("Error preparing checkout payload:", err);
        }
    };

    const getCategoryDisplayName = (category: string) => {
        switch (category) {
            case CATEGORY.FASHION:
                return "Fashion";
            case CATEGORY.ELECTRONICS:
                return "Electronics";
            case CATEGORY.SERVICES:
                return "Services";
            case CATEGORY.BOOKS_SUPPLIES:
                return "Books & Supplies";
            default:
                return category;
        }
    };

    const getSortedItems = (items: Item[]) => {
        if (!items) return [];
        const list = [...items];
        switch (sortOption) {
            case SORT_OPTIONS.PRICE_LOW_TO_HIGH:
                return list.sort((a, b) => a.cost - b.cost);
            case SORT_OPTIONS.PRICE_HIGH_TO_LOW:
                return list.sort((a, b) => b.cost - a.cost);
            default:
                return list;
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-white">
            <Header
                pageTitle="Ashesi Marketplace"
                homeLink="/buyer"
                items={headerItems}
                logoSrc="/src/assets/dwa-icon.jpg"
                logoAlt="Ashesi Marketplace Logo"
            />

            <div className="flex flex-col flex-grow items-center">
                <div className="flex flex-col items-center py-8 px-6 w-full text-center bg-yellow-100">
                    <h2 className="mb-2 text-3xl font-bold text-gray-900">Browse Categories</h2>
                    <p className="text-lg text-gray-700">Browse our selection of products and services</p>
                </div>

                <div className="flex overflow-x-auto justify-center mt-8 w-full max-w-6xl">
                    <div className="flex px-4 space-x-2">
                        {Object.keys(categories).map((category) => (
                            <button
                                key={category}
                                onClick={() => setSelectedCategory(category)}
                                className={`py-2 px-4 font-medium rounded-lg whitespace-nowrap transition-colors ${
                                    selectedCategory === category
                                        ? "bg-wine text-white"
                                        : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                                }`}
                                style={selectedCategory === category ? { backgroundColor: "#722F37" } : {}}
                            >
                                {getCategoryDisplayName(category)}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex flex-wrap gap-4 justify-center px-4 mt-6 w-full max-w-6xl">
                    <div className="flex items-center space-x-2">
                        <label htmlFor="sort" className="text-sm font-medium text-gray-700">
                            Sort by:
                        </label>
                        <select
                            id="sort"
                            value={sortOption}
                            onChange={(e) => setSortOption(e.target.value)}
                            className="py-1 px-2 text-sm rounded-md border border-gray-300"
                        >
                            <option value={SORT_OPTIONS.PRICE_LOW_TO_HIGH}>Price: Low to High</option>
                            <option value={SORT_OPTIONS.PRICE_HIGH_TO_LOW}>Price: High to Low</option>
                        </select>
                    </div>
                </div>

                <div className="px-8 mt-8 w-full max-w-6xl">
                    <h3 className="mb-6 text-2xl font-bold">
                        {selectedCategory ? getCategoryDisplayName(selectedCategory) : "All Products"}
                    </h3>

                    {isLoading ? (
                        <div className="flex justify-center items-center py-12">
                            <div className="w-12 h-12 rounded-full border-t-2 border-b-2 animate-spin border-wine"></div>
                        </div>
                    ) : error ? (
                        <div className="p-8 text-center">
                            <p className="text-lg text-red-500">{error}</p>
                            <button
                                onClick={() => window.location.reload()}
                                className="py-2 px-4 mt-4 text-white rounded bg-wine hover:bg-wine-dark"
                            >
                                Retry
                            </button>
                        </div>
                    ) : selectedCategory && categories[selectedCategory]?.length > 0 ? (
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                            {getSortedItems(categories[selectedCategory]).map((item) => (
                                <ItemCard key={item.iid} item={item} addToCart={addToCart} />
                            ))}
                        </div>
                    ) : (
                        <div className="p-8 text-center">
                            <p className="text-lg text-gray-500">
                                {selectedCategory
                                    ? `No items found in ${getCategoryDisplayName(selectedCategory)}`
                                    : "No items found"}
                            </p>
                        </div>
                    )}
                </div>

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
};

export default ShopByCat;
