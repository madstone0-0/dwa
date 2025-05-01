import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { fetch } from "./utils/Fetch";
import { useCart, useLogout } from "./utils/hooks";
import { CATEGORIES, Item, ItemWithVendorInfo } from "./types";

// Hardcoded sample data
const SAMPLE_ITEMS: ItemWithVendorInfo[] = [
    {
        iid: "1",
        name: "Ashesi Branded Notebook",
        description:
            "High-quality hardcover notebook with the Ashesi logo, perfect for taking class notes or journaling.",
        pictureurl: "/images/notebook.jpg",
        vendor_name: "Ashesi Bookstore",
        cost: 45.99,
        quantity: 50,
        vendor_email: "ashesi@student.com",
        vendor_logo: "https://fastly.picsum.photos/id/116/200/200.jpg?hmac=l2LJ3qOoccUXmVmIcUqVK6Xjr3cIyS-Be89ySMCyTQQ",
        category: CATEGORIES.BOOKS_SUPPLIES,
        vid: "vendor_ashesi",
    },
    {
        iid: "2",
        name: "Ashesi Branded Water Bottle",
        description:
            "Eco-friendly stainless steel water bottle with Ashesi University logo. Double-walled insulation keeps drinks cold for 24 hours or hot for 12 hours.",
        pictureurl: "/images/water-bottle.jpg",
        vendor_name: "Ashesi Campus Store",
        cost: 32.5,
        quantity: 75,
        vendor_email: "campus.store@ashesi.edu.gh",
        vendor_logo: "https://fastly.picsum.photos/id/237/200/200.jpg?hmac=zHUGikXUDyLCCmvyww1izLK3R3k8oRYBRiTizZEdyfI",
        category: CATEGORIES.BOOKS_SUPPLIES,
        vid: "vendor_campus",
    },

    {
        iid: "3",
        name: "Programming Fundamentals Textbook",
        description:
            "Comprehensive textbook covering the fundamentals of programming with practical examples in Python, Java, and C++. Includes access code for online exercises.",
        pictureurl: "/images/programming-textbook.jpg",
        vendor_name: "Academic Books Ghana",
        cost: 89.99,
        quantity: 25,
        vendor_email: "sales@academicbooks.com.gh",
        vendor_logo: "https://fastly.picsum.photos/id/24/200/200.jpg?hmac=xGcYNGgPY60nsY9CDXvqvvnm0cOw0IQYj9XJbLYPJVY",
        category: CATEGORIES.BOOKS_SUPPLIES,
        vid: "vendor_academic",
    },
];

function ItemPage() {
    const navigate = useNavigate();
    const { iid } = useParams<{ iid: string }>();
    const [item, setItem] = useState<ItemWithVendorInfo | undefined>();
    const { addToCart } = useCart();
    const handleLogout = useLogout();

    // Fetch item details - with fallback to hardcoded data
    useEffect(() => {
        const getItem = async () => {
            try {
                // Try to fetch from API
                const response = await fetch.get<ItemWithVendorInfo>(`/items/${iid}`);
                console.log({ response });
                setItem(response);
            } catch (err) {
                console.error("Failed to fetch item:", err);

                console.log("Using hardcoded data instead");
                const hardcodedItem = SAMPLE_ITEMS.find((item) => item.iid === iid);
                if (hardcodedItem) {
                    setItem(hardcodedItem);
                }
            }
        };

        getItem();
    }, [iid]);

    if (!item) return <p className="p-4">Loading...</p>;

    const handleAddToCart = async () => {
        if (!item) return;
        try {
            await addToCart(item);
        } catch (error) {
            console.error("Failed to add item to cart:", error);
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-white">
            {/* Header */}
            <header className="flex justify-between py-4 px-8 shadow-md bg-wine" style={{ backgroundColor: "#722F37" }}>
                <h1 className="text-2xl font-bold text-white">Ashesi DWA</h1>
                <div className="flex gap-4 items-center">
                    <button onClick={() => navigate("/landing")} className="text-white hover:text-yellow-400">
                        Home
                    </button>
                    <button
                        onClick={handleLogout}
                        className="flex flex-col items-center text-white transition-colors hover:text-yellow-400"
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
                                d="M17 16l4-4m0 0l-4-4m4 4H7"
                            />
                        </svg>
                        <span className="mt-1 text-xs">Logout</span>
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <div className="flex flex-col gap-8 p-8 mx-auto max-w-6xl md:flex-row">
                {/* Item Image */}
                <div className="md:w-1/2">
                    <img
                        src={item.pictureurl}
                        alt={item.name}
                        className="object-contain w-full h-auto bg-gray-50 rounded-lg shadow-md"
                        style={{ maxHeight: "400px" }}
                    />
                </div>

                {/* Item Details */}
                <div className="md:w-1/2">
                    <div className="mb-6">
                        <h1 className="text-3xl font-bold text-gray-900">{item.name}</h1>
                        <p className="my-2 text-2xl font-semibold text-wine" style={{ color: "#722F37" }}>
                            GH₵{item.cost}
                        </p>
                        <p className="mb-4 text-sm text-gray-500">Sold by: {item.vendor_name}</p>
                        <div className="my-4 w-full h-px bg-gray-200"></div>
                        <p className="my-4 text-gray-700">{item.description}</p>
                    </div>

                    {/* Availability */}
                    <div className="mb-6">
                        <p className="text-sm text-gray-700">
                            Availability:
                            <span className="ml-2 font-semibold text-green-600">
                                {item.quantity > 0 ? `In Stock (${item.quantity} available)` : "Out of Stock"}
                            </span>
                        </p>
                    </div>

                    {/* Add to Cart Button */}
                    <button
                        onClick={() => handleAddToCart()}
                        disabled={!item.quantity}
                        className={`w-full py-3 px-4 text-white rounded-md font-medium ${
                            item.quantity > 0 ? "bg-yellow-500 hover:bg-yellow-600" : "bg-gray-400 cursor-not-allowed"
                        }`}
                    >
                        Add to Cart
                    </button>
                </div>
            </div>

            {/* Footer */}
            <footer
                className="py-5 mt-auto w-full text-xs text-center text-white border-t border-gray-300 bg-wine"
                style={{ backgroundColor: "#722F37" }}
            >
                <p className="mb-1">
                    <span className="text-yellow-400 cursor-pointer hover:underline">Terms of Service</span> &nbsp; |
                    &nbsp;
                    <span className="text-yellow-400 cursor-pointer hover:underline">Privacy Policy</span> &nbsp; |
                    &nbsp;
                    <span className="text-yellow-400 cursor-pointer hover:underline">Help</span>
                </p>
                <p>&copy; {new Date().getFullYear()} Ashesi DWA, Inc. All rights reserved.</p>
            </footer>
        </div>
    );
}

export default ItemPage;
