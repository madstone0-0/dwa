import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Item, User } from "./types";
import { getLocalStorage } from "./utils";
import { deleteItem, getVendorItems, updateItem } from "./utils/api";
import { withLoading, WithLoadingProps, LoadingSpinner } from "./withLoading";
import placeholder from "../assets/dwa-icon.jpg";
import { useForm } from "@tanstack/react-form";
import { useLogout } from "./utils/hooks";

const InventoryManagementPage: React.FC<WithLoadingProps> = ({ isLoading, withLoading }) => {
    const navigate = useNavigate();
    const [items, setItems] = useState<Item[]>([]);
    const [filteredItems, setFilteredItems] = useState<Item[]>([]);
    const [searchQuery, setSearchQuery] = useState<string>("");
    const isUserLoggedIn = Boolean(localStorage.getItem("user"));
    const [editItem, setEditItem] = useState<Item | null>(null);
    const [showEditDialog, setShowEditDialog] = useState(false);
    const handleLogout = useLogout();

    // Check authentication once on mount
    useEffect(() => {
        if (!isUserLoggedIn) {
            navigate("/signin");
        }
    }, [isUserLoggedIn, navigate]);

    // Fetch items only once on mount or when explicitly needed
    const fetchItems = async () => {
        const user = getLocalStorage("user") as unknown as User;

        if (user) {
            await withLoading(
                getVendorItems(user)
                    .then((data) => {
                        setItems(data);
                        setFilteredItems(data);
                    })
                    .catch((e) => console.error({ e })),
            );
        }
    };

    // Fetch items only once when component mounts
    useEffect(() => {
        fetchItems();
    }, []);

    // Handle item updates
    const handleUpdateItem = (updatedItem: Item) => {
        withLoading(
            updateItem(updatedItem)
                .then(() => {
                    // Update local state to avoid unnecessary refetch
                    setItems((prevItems) =>
                        prevItems.map((item) => (item.iid === updatedItem.iid ? updatedItem : item)),
                    );
                    setFilteredItems((prevItems) =>
                        prevItems.map((item) => (item.iid === updatedItem.iid ? updatedItem : item)),
                    );
                })
                .catch((e) => console.error({ e })),
        );
    };

    // Handle item deletion
    const handleDeleteItem = (itemId: string) => {
        withLoading(
            deleteItem(itemId)
                .then(() => {
                    // Update local state to avoid unnecessary refetch
                    setItems((prevItems) => prevItems.filter((item) => item.iid !== itemId));
                    setFilteredItems((prevItems) => prevItems.filter((item) => item.iid !== itemId));
                })
                .catch((e) => console.error({ e })),
        );
    };

    // Filter items based on search query
    useEffect(() => {
        if (!searchQuery || searchQuery.length <= 3) {
            setFilteredItems(items);
        } else {
            const filtered = items.filter((product) => product.name.toLowerCase().includes(searchQuery.toLowerCase()));
            setFilteredItems(filtered);
        }
    }, [searchQuery, items]);

    // Open edit dialog
    const openEditDialog = (item: Item) => {
        setEditItem(item);
        setShowEditDialog(true);
    };

    // Close edit dialog
    const closeEditDialog = () => {
        setEditItem(null);
        setShowEditDialog(false);
    };

    return (
        <div className="flex flex-col min-h-screen bg-gray-50">
            {/* Header */}
            <header className="shadow-md bg-wine" style={{ backgroundColor: "#722F37" }}>
                <div className="container py-3 px-4 mx-auto">
                    <div className="flex justify-between items-center">
                        {/* Logo and Brand */}
                        <div
                            className="flex items-center space-x-3 cursor-pointer"
                            onClick={() => navigate("/vendor-dashboard")}
                        >
                            <img
                                src="/src/assets/dwa-icon.jpg"
                                alt="DWA Logo"
                                className="object-cover w-10 h-10 rounded-full"
                            />
                            <h1 className="text-xl font-bold text-white">Inventory</h1>
                        </div>

                        {/* Navigation Icons */}
                        <div className="flex items-center space-x-6">
                            <button
                                onClick={() => navigate("/inventory-management")}
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
                                        d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                                    />
                                </svg>
                                <span className="mt-1 text-xs">Inventory</span>
                            </button>
                            {/* Earnings */}
                            <button
                                onClick={() => navigate("/sales-and-earnings")}
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
                                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                                    />
                                </svg>
                                <span className="mt-1 text-xs">Earnings</span>
                            </button>

                            {/* Orders */}
                            <button
                                onClick={() => navigate("/orders")}
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
                                        d="M9 17h6M9 13h6M9 9h6M5 3h14a2 2 0 012 2v16l-3-3H6l-3 3V5a2 2 0 012-2z"
                                    />
                                </svg>
                                <span className="mt-1 text-xs">Orders</span>
                            </button>

                            {/* Profile */}
                            <button
                                onClick={() => navigate("/user-profile")}
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
                                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                    />
                                </svg>
                                <span className="mt-1 text-xs">Profile</span>
                            </button>
                            {/* Logout */}
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
                    </div>
                </div>
            </header>

            <main className="container flex-grow py-8 px-4 mx-auto">
                {/* Search and Stats Bar */}
                <div className="p-6 mb-8 bg-white rounded-lg shadow-md">
                    <div className="flex flex-col gap-4 justify-between md:flex-row md:items-center">
                        <div className="relative flex-1 max-w-xl">
                            <input
                                className="py-2 pr-4 pl-10 w-full rounded-lg border border-gray-300 focus:border-transparent focus:ring-2 focus:ring-wine"
                                type="text"
                                placeholder="Search products..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            <svg
                                className="absolute top-2.5 left-3 w-5 h-5 text-gray-400"
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
                        </div>
                        <div className="flex gap-4">
                            <div className="py-2 px-4 bg-gray-50 rounded-lg">
                                <p className="text-sm text-gray-600">Total Products</p>
                                <p className="text-2xl font-bold text-wine">{items.length}</p>
                            </div>
                            <div className="py-2 px-4 bg-gray-50 rounded-lg">
                                <p className="text-sm text-gray-600">Low Stock</p>
                                <p className="text-2xl font-bold text-yellow-500">
                                    {items.filter((p) => p.quantity < 10).length}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Loading State */}
                {isLoading && <LoadingSpinner />}

                {/* Product Grid */}
                {!isLoading && (
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {filteredItems.length > 0 ? (
                            filteredItems.map((product) => (
                                <ItemCard
                                    key={product.iid}
                                    item={product}
                                    onUpdateItem={handleUpdateItem}
                                    onDeleteItem={handleDeleteItem}
                                    onEditItem={openEditDialog}
                                />
                            ))
                        ) : (
                            <div className="col-span-3 py-12 text-center text-gray-500">
                                {searchQuery.length > 3
                                    ? "No products match your search criteria."
                                    : "No products available. Add some products to your inventory."}
                            </div>
                        )}
                    </div>
                )}
            </main>

            {/* Edit Dialog */}
            {showEditDialog && editItem && (
                <EditItemDialog
                    item={editItem}
                    onClose={closeEditDialog}
                    onSave={(updatedItem) => {
                        handleUpdateItem(updatedItem);
                        closeEditDialog();
                    }}
                />
            )}

            {/* Footer Component */}
            <footer
                className="py-5 text-xs text-center text-white border-t border-gray-300 bg-wine"
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
};

type ItemCardProps = {
    item: Item;
    onUpdateItem: (item: Item) => void;
    onDeleteItem: (itemId: string) => void;
    onEditItem: (item: Item) => void;
};

const ItemCard = ({ item, onUpdateItem, onDeleteItem, onEditItem }: ItemCardProps) => {
    const { iid, name, description, cost, quantity, pictureurl: pictureUrl } = item;

    const handleIncreaseStock = () => {
        onUpdateItem({
            ...item,
            quantity: quantity + 1,
        });
    };

    const handleDecreaseStock = () => {
        if (quantity > 0) {
            onUpdateItem({
                ...item,
                quantity: quantity - 1,
            });
        }
    };

    return (
        <div className="overflow-hidden bg-white rounded-lg shadow-md transition-shadow hover:shadow-lg">
            <div className="relative">
                <img
                    src={`${pictureUrl}`}
                    alt={name}
                    className="object-cover w-full h-48"
                    onError={(e) => {
                        (e as React.SyntheticEvent<HTMLImageElement, Event>).currentTarget.onerror = null;
                        (e as React.SyntheticEvent<HTMLImageElement, Event>).currentTarget.src = placeholder;
                    }}
                />
                <div className="absolute top-2 right-2">
                    <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                            quantity < 10 ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"
                        }`}
                    >
                        Stock: {quantity}
                    </span>
                </div>
            </div>

            <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-800">{name}</h3>
                <p className="mt-1 text-sm text-gray-600">{description}</p>
                <p className="mt-2 font-bold text-wine">GH₵{cost.toFixed(2)}</p>

                <div className="flex gap-2 mt-4">
                    <button
                        onClick={handleIncreaseStock}
                        className="flex-1 py-2 px-3 text-sm text-white rounded-md transition-colors bg-wine hover:bg-wine-dark"
                        style={{ backgroundColor: "#722F37" }}
                    >
                        + Stock
                    </button>
                    <button
                        onClick={handleDecreaseStock}
                        className="flex-1 py-2 px-3 text-sm text-white rounded-md transition-colors bg-wine hover:bg-wine-dark"
                        style={{ backgroundColor: "#722F37" }}
                        disabled={quantity <= 0}
                    >
                        - Stock
                    </button>
                    <button
                        onClick={() => onEditItem(item)}
                        className="p-2 text-white bg-gray-600 rounded-md transition-colors hover:bg-gray-700"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="w-5 h-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                            />
                        </svg>
                    </button>
                    <button
                        onClick={() => onDeleteItem(iid)}
                        className="p-2 text-white bg-black rounded-md transition-colors hover:bg-gray-800"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="w-5 h-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
};

type EditItemDialogProps = {
    item: Item;
    onClose: () => void;
    onSave: (updatedItem: Item) => void;
};

const EditItemDialog = ({ item, onClose, onSave }: EditItemDialogProps) => {
    // Create form hook with validation
    const form = useForm({
        defaultValues: {
            name: item.name,
            description: item.description,
            cost: item.cost,
            quantity: item.quantity,
        },
        onSubmit: async ({ value }) => {
            const updatedItem: Item = {
                ...item,
                name: value.name,
                description: value.description,
                cost: value.cost,
                quantity: value.quantity,
            };
            onSave(updatedItem);
        },
    });

    return (
        <div className="flex fixed inset-0 z-50 justify-center items-center bg-black bg-opacity-50">
            <div className="p-6 m-4 w-full max-w-lg bg-white rounded-lg shadow-xl">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-gray-800">Edit Product</h2>
                    <button onClick={onClose} className="p-1 text-gray-600 rounded-full hover:bg-gray-100">
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
                                d="M6 18L18 6M6 6l12 12"
                            />
                        </svg>
                    </button>
                </div>

                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        form.handleSubmit();
                    }}
                >
                    <div className="mb-4">
                        <label htmlFor="name" className="block mb-2 text-sm font-medium text-gray-700">
                            Product Name
                        </label>
                        <form.Field
                            name="name"
                            children={(field) => (
                                <input
                                    id="name"
                                    type="text"
                                    className="py-2 px-3 w-full bg-gray-50 rounded-md border border-gray-300 focus:border-transparent focus:ring-2 focus:outline-none focus:ring-wine"
                                    name={field.name}
                                    value={field.state.value}
                                    onChange={(e) => {
                                        field.handleChange(e.target.value);
                                    }}
                                />
                            )}
                        />
                    </div>

                    <div className="mb-4">
                        <label htmlFor="description" className="block mb-2 text-sm font-medium text-gray-700">
                            Description
                        </label>
                        <form.Field
                            name="description"
                            children={(field) => (
                                <textarea
                                    name={field.name}
                                    id="description"
                                    rows={3}
                                    className="py-2 px-3 w-full bg-gray-50 rounded-md border border-gray-300 focus:border-transparent focus:ring-2 focus:outline-none focus:ring-wine"
                                    value={field.state.value}
                                    onChange={(e) => {
                                        field.handleChange(e.target.value);
                                    }}
                                />
                            )}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                            <label htmlFor="price" className="block mb-2 text-sm font-medium text-gray-700">
                                Price (GH₵)
                            </label>
                            <form.Field
                                name="cost"
                                children={(field) => (
                                    <input
                                        id="price"
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        className="py-2 px-3 w-full bg-gray-50 rounded-md border border-gray-300 focus:border-transparent focus:ring-2 focus:outline-none focus:ring-wine"
                                        value={field.state.value}
                                        name={field.name}
                                        onChange={(e) => {
                                            field.handleChange(e.target.valueAsNumber);
                                        }}
                                    />
                                )}
                            />
                        </div>
                        <div>
                            <label htmlFor="quantity" className="block mb-2 text-sm font-medium text-gray-700">
                                Quantity
                            </label>
                            <form.Field
                                name="quantity"
                                children={(field) => (
                                    <input
                                        id="quantity"
                                        type="number"
                                        min="0"
                                        className="py-2 px-3 w-full bg-gray-50 rounded-md border border-gray-300 focus:border-transparent focus:ring-2 focus:outline-none focus:ring-wine"
                                        name={field.name}
                                        value={field.state.value}
                                        onChange={(e) => {
                                            field.handleChange(e.target.valueAsNumber);
                                        }}
                                    />
                                )}
                            />
                        </div>
                    </div>

                    <div className="flex gap-3 justify-end mt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="py-2 px-4 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="py-2 px-4 text-white rounded-md bg-wine hover:bg-wine-dark"
                            style={{ backgroundColor: "#722F37" }}
                            disabled={form.state.canSubmit === false}
                        >
                            Save Changes
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// Apply the withLoading HOC to the component
export default withLoading(InventoryManagementPage);
