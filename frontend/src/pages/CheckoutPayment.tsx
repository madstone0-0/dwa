import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetch } from "./utils/Fetch"; 

interface CartItem {
  id: number;
  name: string;
  cost: number;
  quantity: number;
  pictureUrl: string;
  vid: string;
  category: string;
}

function CheckoutPayment() {
  const navigate = useNavigate();
  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("user_type");
    localStorage.removeItem("token");
    navigate("/signin");
  };

  useEffect(() => {
    const isLoggedIn = Boolean(localStorage.getItem("user")); 
    const userType = localStorage.getItem("userType");

    if (!isLoggedIn && userType !== "buyer") {    
      navigate('/signin'); 
    }
  }, [navigate]);

  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const fetchCartItems = async () => {
      try {
        const userData = JSON.parse(localStorage.getItem("user") || "{}");
        const token = userData.token?.trim().replace(/\s/g, "");
        const bid = userData.uid; 

        // Fetch cart items from the backend using the bid
        const cartResponse = await fetch.get(`/buyer/cart/${bid}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        setCartItems(cartResponse.data || []);
        
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchCartItems();
  }, []);

  // Calculate totals
  const subtotal = cartItems.reduce((sum, item) => sum + (item.cost * item.quantity), 0);
  const deliveryFee = 5.00;
  const tax = subtotal * 0.05; // 5% tax
  const total = subtotal + deliveryFee + tax;

  // mock function to simulate placing an order
  const handlePlaceOrder = async () => {
    setIsProcessing(true);

    const userData = JSON.parse(localStorage.getItem("user") || "{}");
    const token = userData.token?.trim().replace(/\s/g, "");

    try {
      // Need cart table to make this work
      for (const item of cartItems) {
        const paymentBody = {
          bid: userData.bid,        
          vid: item.vid,          
          iid: item.id,   
          amt: item.cost ,
          qty_bought: item.quantity,
          
        };

        const response = await fetch.post('buyer/pay/initialize', {
          body: JSON.stringify(paymentBody),
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`Payment failed for item ${item.name}`);
        }
      }

      // If all payments succeed
      setIsProcessing(false);
      localStorage.removeItem('cart'); // clear the cart
      navigate('/order-confirmation');

    } catch (error) {
      console.error('Error placing order:', error);
      setIsProcessing(false);
      alert('Failed to place your order. Please try again.');
    }
  };

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
          {/* Logout Icon */}
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

      <main className="flex-grow container mx-auto py-8 px-4">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Left Column - Order Details */}
          <div className="md:w-2/3">
            {/* Order Summary Section */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-bold text-wine mb-4" style={{ color: '#722F37' }}>My Cart</h3>
              {cartItems.map(item => (
                <div key={item.id} className="flex justify-between items-center mb-4">
                  <div className="flex items-center">
                    <img 
                      src={item.pictureUrl} 
                      alt={item.name} 
                      className="h-12 w-12 object-cover rounded-md mr-4"
                    />
                    <div>
                      <p className="font-semibold">{item.name}</p>
                      <p className="text-sm text-gray-600">Seller: {item.vid}</p>
                    </div>
                  </div>
                  <div className="text-sm text-gray-600">
                    {item.quantity} x ${item.cost}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column - Price Breakdown */}
          <div className="md:w-1/3">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-bold text-wine" style={{ color: '#722F37' }}>Price Breakdown</h3>
              <div className="mt-4">
                <div className="flex justify-between">
                  <p className="text-sm text-gray-600">Subtotal</p>
                  <p className="text-sm">${subtotal.toFixed(2)}</p>
                </div>
                <div className="flex justify-between">
                  <p className="text-sm text-gray-600">Delivery Fee</p>
                  <p className="text-sm">${deliveryFee.toFixed(2)}</p>
                </div>
                <div className="flex justify-between">
                  <p className="text-sm text-gray-600">Tax (5%)</p>
                  <p className="text-sm">${tax.toFixed(2)}</p>
                </div>
                <div className="flex justify-between font-bold mt-4">
                  <p>Total</p>
                  <p>${total.toFixed(2)}</p>
                </div>
              </div>

              <button
                onClick={handlePlaceOrder}
                className="w-full mt-6 py-3 bg-yellow-400 text-white font-semibold rounded-lg hover:bg-yellow-500 disabled:bg-gray-400"
                disabled={isProcessing}
              >
                {isProcessing ? 'Processing...' : 'Place Order'}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default CheckoutPayment;
