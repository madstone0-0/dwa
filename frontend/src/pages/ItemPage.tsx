import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { fetch } from "./utils/Fetch"; 

// Hardcoded sample data
const SAMPLE_ITEMS = [
  {
    iid: "1",
    name: "Ashesi Branded Notebook",
    description: "High-quality hardcover notebook with the Ashesi logo, perfect for taking class notes or journaling.",
    pictureUrl: "/images/notebook.jpg",
    vendor_name: "Ashesi Bookstore",
    cost: 45.99,
    quantity_available: 50
  },
  {
    iid: "2",
    name: "Wireless Headphones",
    description: "Noise-cancelling Bluetooth headphones with 20-hour battery life, ideal for studying in noisy environments.",
    pictureUrl: "/images/headphones.jpg",
    vendor_name: "Tech Haven",
    cost: 199.99,
    quantity_available: 15
  },
  {
    iid: "3",
    name: "Python Programming Textbook",
    description: "Comprehensive guide to Python programming with practical examples and exercises.",
    pictureUrl: "/images/python-book.jpg",
    vendor_name: "Academic Publishers",
    cost: 85.50,
    quantity_available: 23
  }
];

function ItemPage() {
  const navigate = useNavigate();
  const { iid } = useParams<{ iid: string }>();
  const [item, setItem] = useState<any>(null);

  // Fetch item details - with fallback to hardcoded data
  useEffect(() => {
    const getItem = async () => {
      try {
        // Try to fetch from API
        const response = await fetch.get(`/items/${iid}`);
        const data = await response.json();
        setItem(data);
      } catch (err) {
        console.error("Failed to fetch item:", err);
        
        // Fallback to hardcoded data
        console.log("Using hardcoded data instead");
        const hardcodedItem = SAMPLE_ITEMS.find(item => item.iid === iid);
        if (hardcodedItem) {
          setItem(hardcodedItem);
        }
      }
    };

    getItem();
  }, [iid]);

  const addToCart = () => {
    if (!item) return;
    
    // Hardcoded cart handling logic
    try {
      const cart = JSON.parse(localStorage.getItem("cart") || "[]");
      const existingItemIndex = cart.findIndex((cartItem: any) => cartItem.iid === item.iid);
      
      if (existingItemIndex >= 0) {
        // Item exists in cart - increment quantity
        cart[existingItemIndex].quantity = (cart[existingItemIndex].quantity || 1) + 1;
      } else {
        // Add new item to cart
        cart.push({
          iid: item.iid,
          vid: item.vid || "default_vendor",
          name: item.name,
          cost: item.cost,
          pictureUrl: item.pictureUrl,
          quantity: 1
        });
      }
      
      localStorage.setItem("cart", JSON.stringify(cart));
      alert("Item added to cart!");
    } catch (err) {
      console.error("Error adding to cart:", err);
    }
  };

  if (!item) return <p className="p-4">Loading...</p>;

  // Logout helper (copied from LandingPage)
  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("userType");
    localStorage.removeItem("token");
    localStorage.removeItem("cart");
    navigate("/signin");
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Header */}
      <header
        className="flex justify-between py-4 px-8 shadow-md bg-wine"
        style={{ backgroundColor: "#722F37" }}
      >
        <h1 className="text-2xl font-bold text-white">Ashesi DWA</h1>
        <div className="flex gap-4 items-center">
          <button
            onClick={() => navigate("/landing")}
            className="text-white hover:text-yellow-400"
          >
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
      <div className="flex flex-col md:flex-row p-8 gap-8 max-w-6xl mx-auto">
        {/* Item Image */}
        <div className="md:w-1/2">
          <img
            src={item.pictureUrl}
            alt={item.name}
            className="w-full h-auto rounded-lg shadow-md object-contain bg-gray-50"
            style={{maxHeight: "400px"}}
          />
        </div>
        
        {/* Item Details */}
        <div className="md:w-1/2">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">{item.name}</h1>
            <p className="text-2xl font-semibold text-wine my-2" style={{ color: "#722F37" }}>
              GH₵{item.cost}
            </p>
            <p className="text-sm text-gray-500 mb-4">Sold by: {item.vendor_name}</p>
            <div className="h-px w-full bg-gray-200 my-4"></div>
            <p className="text-gray-700 my-4">{item.description}</p>
          </div>
          
          {/* Availability */}
          <div className="mb-6">
            <p className="text-sm text-gray-700">
              Availability: 
              <span className="ml-2 font-semibold text-green-600">
                {item.quantity_available > 0 ? `In Stock (${item.quantity_available} available)` : "Out of Stock"}
              </span>
            </p>
          </div>
          
          {/* Add to Cart Button */}
          <button
            onClick={addToCart}
            disabled={!item.quantity_available}
            className={`w-full py-3 px-4 text-white rounded-md font-medium ${
              item.quantity_available > 0 
                ? "bg-yellow-500 hover:bg-yellow-600" 
                : "bg-gray-400 cursor-not-allowed"
            }`}
          >
            Add to Cart
          </button>
        </div>
      </div>

      {/* Footer */}
      <footer
        className="py-5 w-full text-xs text-center text-white border-t border-gray-300 bg-wine mt-auto"
        style={{ backgroundColor: "#722F37" }}
      >
        <p className="mb-1">
          <span className="text-yellow-400 cursor-pointer hover:underline">
            Terms of Service
          </span>{" "}
          &nbsp; | &nbsp;
          <span className="text-yellow-400 cursor-pointer hover:underline">
            Privacy Policy
          </span>{" "}
          &nbsp; | &nbsp;
          <span className="text-yellow-400 cursor-pointer hover:underline">
            Help
          </span>
        </p>
        <p>
          &copy; {new Date().getFullYear()} Ashesi DWA, Inc. All rights
          reserved.
        </p>
      </footer>
    </div>
  );
}

export default ItemPage;