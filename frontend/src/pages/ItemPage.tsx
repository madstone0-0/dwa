import { useParams, useNavigate } from "react-router-dom";
import { FC, useEffect, useState } from "react";
import { fetch } from "./utils/Fetch";
import { useCart, useLogout } from "./utils/hooks";
import { CATEGORIES, Item, ItemWithVendorInfo } from "./types";
import { LoadingSpinner, withLoading, WithLoadingProps } from "./withLoading";
import { getItem } from "./utils/api";

const ItemPage: FC<WithLoadingProps> = ({ isLoading, withLoading }) => {
    const navigate = useNavigate();
    const { iid } = useParams<{ iid: string }>();
    const [item, setItem] = useState<ItemWithVendorInfo>({
        iid: "",
        cost: 0,
        name: "",
        category: CATEGORIES.FASHION,
        description: "",
        pictureurl: "",
        quantity: 0,
        vendor_email: "",
        vendor_logo: "",
        vendor_name: "",
        vid: "",
    });
    const { addToCart } = useCart();
    const handleLogout = useLogout();

    const fetchItem = async () => {
        if (iid) {
            await withLoading(
                getItem(iid)
                    .then((data) => {
                        setItem(data);
                    })
                    .catch((e) => console.error({ e })),
            );
        }
    };

    // Fetch item details - with fallback to hardcoded data
    useEffect(() => {
        fetchItem();
    }, [iid]);

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
            {/* Loading State */}
            {isLoading && <LoadingSpinner />}

            {/* Main Content */}
            {!isLoading && (
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
                                item.quantity > 0
                                    ? "bg-yellow-500 hover:bg-yellow-600"
                                    : "bg-gray-400 cursor-not-allowed"
                            }`}
                        >
                            Add to Cart
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default withLoading(ItemPage);
