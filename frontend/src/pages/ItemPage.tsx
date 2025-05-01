// src/pages/ItemPage.tsx
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { fetch } from "./utils/Fetch";

interface Item {
  iid: string;
  vid: string;
  name: string;
  cost: number;
  pictureUrl: string;
  description: string;
  vendor_name: string;
  quantity_available: number;
}

function ItemPage() {
  const navigate = useNavigate();
  const { iid } = useParams<{ iid: string }>();
  const [item, setItem] = useState<Item | null>(null);
    const [cartItems, setCartItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getItem = async () => {
      setLoading(true);
      try {
        // fetch.get already returns parsed JSON
        const payload = await fetch.get(`/items/${iid}`);
        console.log("Fetched item:", payload);
        
        // normalize keys to match our interface
        const normalized: Item = {
          iid: payload.iid,
          vid: payload.vid,
          name: payload.name,
          cost: payload.cost,
          pictureUrl: payload.pictureurl,       
          description: payload.description,
          vendor_name: payload.name || "Unknown Vendor",
          quantity_available: payload.quantity,
        };

        setItem(normalized);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch item:", err);
        setError("Failed to load item details. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    if (iid) getItem();
  }, [iid]);

  const addToCart = async (item: Item) => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const buyerId = user.uid;
      const token = user.token;
    
      if (!token || !buyerId) {
        throw new Error("User not authenticated");
      }
      
      // First, check if item already exists in cart
      const cart = JSON.parse(localStorage.getItem("cart") || "[]");
      const existingItem = Array.isArray(cart) ? 
        cart.find((ci: any) => ci.iid === item.iid && ci.vid === item.vid) : null;
      
      let quantity = 1;
      if (existingItem) {
        // Item exists, increment quantity
        quantity = (existingItem.quantity || 0) + 1;
      }
      
      if (existingItem) {
        // Item exists in cart - send PUT request to update quantity
        const updateResponse = await fetch.put(
          "/buyer/cart",
          {
            bid: buyerId,
            iid: item.iid,
            vid: item.vid,
            amt: item.cost,
            quantity: quantity
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json"
            }
          }
        );
        
        if (!updateResponse.ok) {
          const errorData = await updateResponse.json().catch(() => ({}));
          throw new Error(errorData.err || `Failed to update item quantity: ${updateResponse.status}`);
        }
      } else {
        // Item doesn't exist in cart - send POST request to add it
        const response = await fetch.post(
          "/buyer/cart",
          {
            bid: buyerId,
            iid: item.iid,
            vid: item.vid,
            amt: item.cost,
            quantity: quantity
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json"
            }
          }
        );
        console.log("Response from adding item to cart:", response);	
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          
          // Special handling for "item already in cart" error
          if (errorData.err === "item already in cart") {
            console.log("Item already in cart, updating quantity");
            
            // Send PUT request to update the quantity
            const updateResponse = await fetch.put(
              "/buyer/cart",
              {
                bid: buyerId,
                iid: item.iid,
                vid: item.vid,
                quantity: quantity
              },
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                  "Content-Type": "application/json"
                }
              }
            );
            
            if (!updateResponse.ok) {
              const updateErrorData = await updateResponse.json().catch(() => ({}));
              throw new Error(updateErrorData.err || `Failed to update item quantity: ${updateResponse.status}`);
            }
          } else {
            throw new Error(errorData.err || "Failed to add item to cart");
          }
        }
      }
  
      // After successfully adding/updating, fetch the latest cart data
      const cartResponse = await fetch.get(`/buyer/cart/${buyerId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
  
      if (cartResponse.ok) {
        const serverCart = await cartResponse.json();
        localStorage.setItem("cart", JSON.stringify(serverCart));
        setCartItems(serverCart); // Update UI state
      } else {
        const cartErrorData = await cartResponse.json().catch(() => ({}));
        throw new Error(cartErrorData.err || "Failed to fetch updated cart");
      }
    } catch (error) {
      console.error("Cart update failed:", error);
      // You could add a UI notification here to inform the user
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("userType");
    localStorage.removeItem("token");
    localStorage.removeItem("cart");
    navigate("/signin");
  };

  if (loading) return <div className="p-4 text-center">Loading...</div>;
  if (error)   return <div className="p-4 text-center text-red-500">{error}</div>;
  if (!item)  return <div className="p-4 text-center">Item not found</div>;

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Header */}
      <header className="flex justify-between py-4 px-8 shadow-md" style={{ backgroundColor: "#722F37" }}>
        <h1 className="text-2xl font-bold text-white">Ashesi DWA</h1>
        <div className="flex gap-4 items-center">
          <button onClick={() => navigate("/landing")} className="text-white hover:text-yellow-400">
            Home
          </button>
          <button onClick={() => navigate("/checkout-payment")} className="flex flex-col items-center text-white hover:text-yellow-400">
            {/* cart icon */}
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            <span className="mt-1 text-xs">Cart</span>
          </button>
          <button onClick={handleLogout} className="flex flex-col items-center text-white hover:text-yellow-400">
            {/* logout icon */}
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7" />
            </svg>
            <span className="mt-1 text-xs">Logout</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-col md:flex-row p-8 gap-8 max-w-6xl mx-auto">
        {/* Image */}
        <div className="md:w-1/2">
          <img src={item.pictureUrl} alt={item.name}
            className="w-full h-auto rounded-lg shadow-md object-contain bg-gray-50"
            style={{ maxHeight: "400px" }}
          />
        </div>
        {/* Details */}
        <div className="md:w-1/2">
          <h1 className="text-3xl font-bold text-gray-900">{item.name}</h1>
          <p className="text-2xl font-semibold my-2" style={{ color: "#722F37" }}>
            GH₵{item.cost}
          </p>
          <p className="text-sm text-gray-500 mb-4">Sold by: {item.vendor_name}</p>
          <div className="h-px w-full bg-gray-200 my-4" />
          <p className="text-gray-700 my-4">{item.description}</p>

          <p className="text-sm text-gray-700 mb-6">
            Availability:{" "}
            <span className={`font-semibold ${item.quantity_available > 0 ? "text-green-600" : "text-red-600"}`}>
              {item.quantity_available > 0
                ? `In Stock (${item.quantity_available} available)`
                : "Out of Stock"}
            </span>
          </p>

          <button
  onClick={() => {
    if (item) {
      console.log("Adding to cart:", item);
      addToCart(item);
    } else {
      console.warn("Item is undefined");
    }
  }}
  disabled={item?.quantity_available === 0}
  className={`w-full py-3 px-4 text-white rounded-md font-medium ${
    item?.quantity_available > 0
      ? "bg-yellow-500 hover:bg-yellow-600"
      : "bg-gray-400 cursor-not-allowed"
  }`}
>
  Add to Cart
</button>


        </div>
      </div>

      {/* Footer */}
      <footer className="py-5 w-full text-xs text-center text-white mt-auto" style={{ backgroundColor: "#722F37" }}>
        <p className="mb-1">
          <span className="text-yellow-400 hover:underline cursor-pointer">Terms of Service</span>
          {" | "}
          <span className="text-yellow-400 hover:underline cursor-pointer">Privacy Policy</span>
          {" | "}
          <span className="text-yellow-400 hover:underline cursor-pointer">Help</span>
        </p>
        <p>&copy; {new Date().getFullYear()} Ashesi DWA, Inc. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default ItemPage;
