import React, { FC, memo, useMemo, useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { getAllItems } from "./utils/api.js";
import { Item } from "./types";
import useStore from "./store";
import { HeaderItem } from "./types";
import { useCart, useLogout } from "./utils/hooks.js";

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
  VENDOR_A_TO_Z: "VENDOR_A_TO_Z",
  VENDOR_Z_TO_A: "VENDOR_Z_TO_A",
};

function ShopByCat() {
  const navigate = useNavigate();
  const [items, setItems] = useState<Item[]>([]);
  const [categories, setCategories] = useState<Record<string, Item[]>>({});
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [sortOption, setSortOption] = useState<string>(SORT_OPTIONS.PRICE_LOW_TO_HIGH);
  const [vendorFilter, setVendorFilter] = useState<string>("all");
  const [vendors, setVendors] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const handleLogout = useLogout();
  const { addToCart } = useCart();
  const user = useStore((state) => state.user);

  useEffect(() => {
    // Check if user is logged in and is a buyer
    if (user && user.user_type !== "buyer") {
      navigate("/signin");
      return;
    }

    const fetchData = async () => {
      try {
        setIsLoading(true);
        const items = await getAllItems();
        setItems(items);
        
        // Extract unique vendors
        const uniqueVendors = Array.from(new Set(items.map(item => item.vendorName || item.vid)));
        setVendors(uniqueVendors);

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
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const bid = user.uid;

    try {
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
    
    let sortedItems = [...items];
    
    // Apply vendor filter first
    if (vendorFilter !== "all") {
      sortedItems = sortedItems.filter(item => item.vid === vendorFilter || item.vendorName === vendorFilter);
    }
    
    // Then apply sort
    switch (sortOption) {
      case SORT_OPTIONS.PRICE_LOW_TO_HIGH:
        return sortedItems.sort((a, b) => a.cost - b.cost);
      case SORT_OPTIONS.PRICE_HIGH_TO_LOW:
        return sortedItems.sort((a, b) => b.cost - a.cost);
      case SORT_OPTIONS.VENDOR_A_TO_Z:
        return sortedItems.sort((a, b) => (a.vendorName || "").localeCompare(b.vendorName || ""));
      case SORT_OPTIONS.VENDOR_Z_TO_A:
        return sortedItems.sort((a, b) => (b.vendorName || "").localeCompare(a.vendorName || ""));
      default:
        return sortedItems;
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Header would be imported here in a real app */}
      
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

        {/* Filter and Sort Controls */}
        <div className="flex flex-wrap justify-center gap-4 mt-6 w-full max-w-6xl px-4">
          <div className="flex items-center space-x-2">
            <label htmlFor="sort" className="text-sm font-medium text-gray-700">
              Sort by:
            </label>
            <select
              id="sort"
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              className="py-1 px-2 border border-gray-300 rounded-md text-sm"
            >
              <option value={SORT_OPTIONS.PRICE_LOW_TO_HIGH}>Price: Low to High</option>
              <option value={SORT_OPTIONS.PRICE_HIGH_TO_LOW}>Price: High to Low</option>
              <option value={SORT_OPTIONS.VENDOR_A_TO_Z}>Vendor: A to Z</option>
              <option value={SORT_OPTIONS.VENDOR_Z_TO_A}>Vendor: Z to A</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <label htmlFor="vendor" className="text-sm font-medium text-gray-700">
              Filter by vendor:
            </label>
            <select
              id="vendor"
              value={vendorFilter}
              onChange={(e) => setVendorFilter(e.target.value)}
              className="py-1 px-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="all">All Vendors</option>
              {vendors.map((vendor) => (
                <option key={vendor} value={vendor}>
                  {vendor}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Items Grid */}
        <div className="mt-8 px-8 w-full max-w-6xl">
          <h3 className="mb-6 text-2xl font-bold">
            {selectedCategory ? getCategoryDisplayName(selectedCategory) : "All Products"}
          </h3>
          
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-wine"></div>
            </div>
          ) : error ? (
            <div className="p-8 text-center">
              <p className="text-lg text-red-500">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-4 px-4 py-2 bg-wine text-white rounded hover:bg-wine-dark"
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

type ItemCardProps = {
  item: Item;
  addToCart: (item: Item) => void;
};

const ItemCard = ({ item, addToCart }: ItemCardProps) => {
  const navigate = useNavigate();
  const { iid, pictureurl: pictureUrl, name, cost, vendorName } = item;
  
  return (
    <div key={iid} className="p-4 bg-white rounded-lg border border-gray-200 transition-shadow hover:shadow-lg">
      <img 
        src={pictureUrl} 
        alt={name} 
        className="object-contain mb-4 w-full h-48"
        onError={(e) => {
          (e.target as HTMLImageElement).src = "/placeholder-image.jpg";
        }}
      />
      <h3 className="font-bold">{name}</h3>
      <p className="text-sm text-gray-600">GH₵{cost.toFixed(2)}</p>
      {vendorName && <p className="text-xs text-gray-500 mt-1">Sold by: {vendorName}</p>}

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