import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAllItems } from "./utils/api.js";
import { Item } from "./types";
import useStore from "./store";
import { useCart, useLogout } from "./utils/hooks.js";

// Enum for categories matching the backend schema
const CATEGORY = {
  FASHION: "FASHION",
  ELECTRONICS: "ELECTRONICS",
  SERVICES: "SERVICES",
  BOOKS_SUPPLIES: "BOOKS_SUPPLIES"
};

function ShopByCat() {
  const navigate = useNavigate();
  const [items, setItems] = useState<Item[]>([]);
  const [categories, setCategories] = useState<Record<string, Item[]>>({});
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const handleLogout = useLogout();
  const { addToCart } = useCart();
  const user = useStore((state) => state.user);

  useEffect(() => {
    // Check if user is logged in and is a buyer
    if (user && user.user_type !== "buyer") {
      navigate("/signin");
      return;
    }

    // Fetch items from backend
    getAllItems()
      .then((items) => {
        setItems(items);
        
        // Group items by category
        const groupedItems = items.reduce((acc: Record<string, Item[]>, item) => {
          if (!acc[item.category]) {
            acc[item.category] = [];
          }
          acc[item.category].push(item);
          return acc;
        }, {});
        
        setCategories(groupedItems);
        
        // Set the first category as selected by default
        if (Object.keys(groupedItems).length > 0 && !selectedCategory) {
          setSelectedCategory(Object.keys(groupedItems)[0]);
        }
      })
      .catch((e) => console.error({ e }));
  }, []);

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
    // 1. Grab buyer ID from your auth store/localStorage
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const bid = user.uid;

    try {
      // 2. Map down to the minimal payload your backend needs
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

      // 3. Navigate and pass payload (or send via context/POST)
      navigate("/checkout-payment", { state: { cartPayload: payload } });
    } catch (err) {
      console.error("Error preparing checkout payload:", err);
    }
  };

  // Get a user-friendly category name
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

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Header */}
      <header className="flex justify-between py-4 px-8 shadow-md bg-wine" style={{ backgroundColor: "#722F37" }}>
        <h1 
          className="text-2xl font-bold text-white cursor-pointer" 
          onClick={() => navigate("/")}
        >
          Ashesi DWA
        </h1>

        <div className="flex gap-4 items-center">
          {/* Shopping Cart Icon */}
          <button
            onClick={goToCheckout}
            className="flex relative items-center text-white transition-colors hover:text-yellow-400"
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
            {getTotalItems() > 0 && (
              <span className="flex absolute -top-2 -right-2 justify-center items-center w-5 h-5 text-xs font-bold text-black bg-yellow-400 rounded-full">
                {getTotalItems()}
              </span>
            )}
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

      <div className="flex flex-col flex-grow items-center py-10">
        {/* Page Title */}
        <div className="flex flex-col items-center py-8 px-6 w-full text-center bg-yellow-100">
          <h2 className="mb-2 text-3xl font-bold text-gray-900">Shop By Category</h2>
          <p className="text-lg text-gray-700">Browse our selection of products and services</p>
        </div>

        {/* Category Tabs */}
        <div className="flex justify-center mt-8 w-full max-w-6xl overflow-x-auto">
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

        {/* Items Grid */}
        <div className="mt-8 px-8 w-full max-w-6xl">
          <h3 className="mb-6 text-2xl font-bold">
            {selectedCategory ? getCategoryDisplayName(selectedCategory) : "All Products"}
          </h3>
          
          {selectedCategory && categories[selectedCategory]?.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {categories[selectedCategory].map((item) => (
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

      {/* Footer */}
      <footer
        className="py-5 mt-8 w-full text-xs text-center text-white border-t border-gray-300 bg-wine"
        style={{ backgroundColor: "#722F37" }}
      >
        <p className="mb-1">
          <span className="text-yellow-400 cursor-pointer hover:underline">Terms of Service</span> &nbsp;
          | &nbsp;
          <span className="text-yellow-400 cursor-pointer hover:underline">Privacy Policy</span> &nbsp; |
          &nbsp;
          <span className="text-yellow-400 cursor-pointer hover:underline">Help</span>
        </p>
        <p>&copy; {new Date().getFullYear()} Ashesi DWA, Inc. All rights reserved.</p>
      </footer>
    </div>
  );
}

type ItemCardProps = {
  item: Item;
  addToCart: (item: Item) => void;
};

const ItemCard = ({ item, addToCart }: ItemCardProps) => {
  const navigate = useNavigate();
  const { iid, pictureurl: pictureUrl, name, cost } = item;
  
  return (
    <div key={iid} className="p-4 bg-white rounded-lg border border-gray-200 transition-shadow hover:shadow-lg">
      <img src={pictureUrl} alt={name} className="object-contain mb-4 w-full h-48" />
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
          onClick={() => navigate(`/item/${iid}`)}
        >
          View Item
        </button>
      </div>
    </div>
  );
};

export default ShopByCat;