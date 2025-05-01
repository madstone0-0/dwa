import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetch } from "./utils/Fetch"; 

interface PaymentMethod {
  id: string;
  type: string;
  lastFour?: string;
  expiryDate?: string;
}

interface CartItem {
  id: string;
  iid: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  seller: string;
  vid: string;
  cost: number;
}

function CheckoutPayment() {
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  // Payment methods
  const [selectedPayment, setSelectedPayment] = useState<string>("");
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([
    {
      id: "momo1",
      type: "Mobile Money",
      lastFour: "4321",
      expiryDate: "N/A"
    },
    {
      id: "bank1",
      type: "Bank Account",
      lastFour: "5678",
      expiryDate: "06/26"
    }
  ]);

  // Authentication check
  useEffect(() => {
    const isLoggedIn = Boolean(localStorage.getItem("user")); 
    const userType = localStorage.getItem("userType");
    const userData = JSON.parse(localStorage.getItem("user") || "{}");
    
    if (!userData.token) {
      navigate('/signin');
      return;
    }
    
    if (!isLoggedIn || userType !== "buyer") {    
      navigate('/signin'); 
    }
  }, [navigate]);
  
  // Fetch cart items from API
  useEffect(() => {
    const fetchCartItems = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const userData = JSON.parse(localStorage.getItem("user") || "{}");
        const bid = userData.uid;
        if (!bid) {
          throw new Error("Buyer ID not found. Please log in again.");
        }
        
        
        const token = userData.token;
        
        if (!token) {
          throw new Error("Authentication token not found. Please log in again.");
        }
        
        // Fetch cart from API
        const response = await fetch.get(`buyer/cart/${bid}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          }
        });
        
        if (!response.ok) {
          throw new Error("Failed to fetch cart items.");
        }
        
        const data = await response.json();
        
        // Map API response to our CartItem interface
        const mappedItems = data.map((item: any) => ({
          id: item.iid,
          iid: item.iid,
          vid: item.vid,
          name: item.name || "Product",
          price: item.cost || 0,
          cost: item.cost || 0,
          quantity: item.quantity || 1,
          image: item.pictureurl || '',
          seller: item.vid || 'Unknown Seller',
        }));
        
        setCartItems(mappedItems);
      } catch (error: any) {
        console.error("Error fetching cart:", error);
        setError(error.message || "Failed to load cart items");
        
        // Fallback to localStorage if API fails
        const cartStr = localStorage.getItem("cart");
        if (cartStr) {
          try {
            const cart = JSON.parse(cartStr);
            const mappedItems = cart.map((item: any) => ({
              id: item.iid,
              iid: item.iid,
              vid: item.vid,
              name: item.name || "Product",
              price: item.cost || 0,
              cost: item.cost || 0,
              quantity: item.quantity || 1,
              image: item.pictureurl || '',
              seller: item.vid || 'Unknown Seller',
            }));
            setCartItems(mappedItems);
          } catch (e) {
            console.error("Error parsing localStorage cart:", e);
          }
        }
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchCartItems();
  }, []);
  
  // Calculate totals
  const subtotal = cartItems.reduce((sum, item) => {
    const price = item.price || 0;
    const quantity = item.quantity || 0;
    return sum + (price * quantity);
  }, 0);
  
  const deliveryFee = 5.00;
  const tax = subtotal * 0.05;
  const total = subtotal + deliveryFee + tax;
  
  // Handle order placement
  const handlePlaceOrder = async () => {
    setIsProcessing(true);

    try {
      const bid = localStorage.getItem("bid");
      if (!bid) {
        throw new Error("Buyer ID not found. Please log in again.");
      }
      
      // Get token from user object in localStorage for consistency
      const userData = JSON.parse(localStorage.getItem("user") || "{}");
      const token = userData.token || "";
      
      if (!token) {
        throw new Error("Authentication token not found. Please log in again.");
      }

      // Process each cart item
      for (const item of cartItems) {
        // Validate item has required fields
        if (!item.vid || !item.iid) {
          console.error("Invalid item data:", item);
          continue; // Skip this item
        }

        const paymentBody = {
          bid,
          vid: item.vid,
          iid: item.iid,
          amt: item.cost * item.quantity,
          qty_bought: item.quantity,
        };

        console.log("Sending payment body:", paymentBody);

        const response = await fetch.post('buyer/pay/initialize', paymentBody, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(`Payment failed for item ID ${item.iid}: ${errorData.msg || response.statusText}`);
        }
      }

      // Clear cart after successful order
      // This should be done on the server, but we'll clear local state too
      try {
        // Clear server-side cart (you would implement this endpoint)
        // await fetch.delete(`buyer/cart/${bid}`, {
        //   headers: {
        //     'Authorization': `Bearer ${token}`,
        //     'Content-Type': 'application/json',
        //   },
        // });
        
        // Clear local storage cart
        localStorage.removeItem('cart');
      } catch (clearError) {
        console.error("Failed to clear cart:", clearError);
        // Continue with checkout even if clearing cart fails
      }

      setIsProcessing(false);
      navigate('/order-confirmation');

    } catch (error: any) {
      console.error('Error placing order:', error);
      setIsProcessing(false);
      
      // Enhanced error handling
      let errorMessage = 'Failed to place your order.';
      if (error.response) {
        errorMessage += ` Server responded with: ${error.response.data?.msg || error.response.statusText}`;
      } else if (error.request) {
        errorMessage += ' No response received from server. Please check your connection.';
      } else {
        errorMessage += ` Error: ${error.message}`;
      }
      
      alert(errorMessage);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-100 items-center justify-center">
        <p className="text-xl">Loading your cart...</p>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col min-h-screen bg-gray-100">

      {/* Header */}
      <header className="bg-wine py-4 shadow-md" style={{ backgroundColor: '#722F37' }}>
        <div className="container mx-auto px-4 flex justify-between items-center">
          {/* Logo and Brand Name */}
          <div className="flex items-center space-x-3">
            <a href="/landing">
              <img 
                src="/src/assets/dwa-icon.jpg" 
                alt="DWA Logo" 
                className="h-10 w-10 object-cover rounded-full"
              />
            </a>
            <h1 className="text-white text-2xl font-bold">Ashesi DWA - Checkout</h1>
          </div>

          {/* Profile Icon */}
          <button 
            onClick={() => navigate('/user-profile')}
            className="text-white hover:text-yellow-400 transition-colors"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-6 w-6" 
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
          </button>
          {/* Secure checkout badge */}
          <div className="hidden md:flex items-center text-white">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <span className="text-sm">Secure Checkout</span>
          </div>
        </div>
      </header>
      
      <main className="flex-grow container mx-auto py-8 px-4">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <strong className="font-bold">Error:</strong>
            <span className="block sm:inline"> {error}</span>
          </div>
        )}
        
        {cartItems.length === 0 ? (
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <h2 className="text-xl font-bold mb-4">Your cart is empty</h2>
            <p className="mb-4">Looks like you haven't added any items to your cart yet.</p>
            <button 
              onClick={() => navigate('/marketplace')}
              className="bg-yellow-400 text-black py-2 px-4 rounded font-medium hover:bg-yellow-500"
            >
              Continue Shopping
            </button>
          </div>
        ) : (
          <div className="flex flex-col md:flex-row gap-8">
            {/* Left Column - Order Details */}
            <div className="md:w-2/3">
              
              {/* Payment Method Section */}
              <div className="bg-white p-6 rounded-lg shadow-md mb-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-wine" style={{ color: '#722F37' }}>Payment Method</h2>
                  <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">Add</button>
                </div>
                
                <div className="border-b pb-4">
                  {paymentMethods.map(method => (
                    <div 
                      key={method.id} 
                      className={`border p-3 rounded mb-2 ${selectedPayment === method.id ? 'border-yellow-400 bg-yellow-50' : 'border-gray-200'}`}
                      onClick={() => setSelectedPayment(method.id)}
                    >
                      <div className="flex items-center">
                        <input 
                          type="radio" 
                          name="payment" 
                          checked={selectedPayment === method.id} 
                          onChange={() => setSelectedPayment(method.id)}
                          className="mr-2 accent-wine"
                        />
                        <div>
                          <p className="font-semibold">{method.type}</p>
                          <p className="text-sm text-gray-600">**** **** **** {method.lastFour}</p>
                          {method.expiryDate && method.expiryDate !== 'N/A' && (
                            <p className="text-sm text-gray-600">Expires: {method.expiryDate}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <button className="mt-4 text-wine font-medium flex items-center" style={{ color: '#722F37' }}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Add a new payment method
                </button>
              </div>
              
              {/* Order Items Section */}
              <div className="bg-white p-6 rounded-lg shadow-md mb-6">
                <h2 className="text-xl font-bold mb-4 text-wine" style={{ color: '#722F37' }}>Order Items</h2>
                
                {cartItems.map(item => (
                  <div key={item.id} className="border-b pb-4 mb-4 last:border-b-0 last:mb-0 last:pb-0">
                    <div className="flex items-center">
                      <div className="h-16 w-16 bg-gray-100 rounded overflow-hidden mr-4">
                        {item.image ? (
                          <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center text-gray-400">
                            No image
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium">{item.name}</h3>
                        <p className="text-sm text-gray-600">Seller: {item.seller}</p>
                        <div className="flex justify-between mt-2">
                          <span>Qty: {item.quantity}</span>
                          <span className="font-semibold">GH₵{(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column - Order Summary */}
            <div className="md:w-1/3">
              <div className="bg-white p-6 rounded-lg shadow-md sticky top-4">
                <h2 className="text-xl font-bold mb-4 text-wine" style={{ color: '#722F37' }}>Order Summary</h2>
                
                <div className="mb-4">
                  <div className="flex justify-between py-2">
                    <span className="text-gray-600">Items ({cartItems.reduce((sum, item) => sum + item.quantity, 0)}):</span>
                    <span>GH₵{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-gray-600">Shipping & Handling:</span>
                    <span>GH₵{deliveryFee.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-gray-600">Tax:</span>
                    <span>GH₵{tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between py-2 font-bold border-t border-gray-200 mt-2 pt-2">
                    <span>Order Total:</span>
                    <span className="text-wine" style={{ color: '#722F37' }}>GH₵{total.toFixed(2)}</span>
                  </div>
                </div>
                
                <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-400 mb-4">
                  <div className="flex">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-500 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div className="ml-2">
                      <p className="font-medium">Delivery Information</p>
                      <p className="text-sm text-gray-600">Your order will arrive in 2-3 business days.</p>
                    </div>
                  </div>
                </div>
                
                <button 
                  className={`bg-yellow-400 text-black py-3 rounded font-bold hover:bg-yellow-500 w-full ${isProcessing ? 'opacity-75 cursor-not-allowed' : ''}`}
                  onClick={handlePlaceOrder}
                  disabled={isProcessing || selectedPayment === "" || cartItems.length === 0}
                >
                  {isProcessing ? 'Processing...' : 'Place Your Order'}
                </button>
                
                <p className="text-xs text-gray-500 mt-4 text-center">
                  By placing your order, you agree to Ashesi DWA's privacy notice and conditions of use.
                </p>
              </div>
            </div>
          </div>
        )}
      </main>
      
      {/* Footer */}
      <footer className="bg-wine text-white text-center py-5 text-xs border-t border-gray-300" style={{ backgroundColor: '#722F37' }}>
        <p className="mb-1">
          <span className="text-yellow-400 cursor-pointer hover:underline">Terms of Service</span> &nbsp; | &nbsp;
          <span className="text-yellow-400 cursor-pointer hover:underline">Privacy Policy</span> &nbsp; | &nbsp;
          <span className="text-yellow-400 cursor-pointer hover:underline">Help</span>
        </p>
        <p>&copy; {new Date().getFullYear()} Ashesi DWA, Inc. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default CheckoutPayment;