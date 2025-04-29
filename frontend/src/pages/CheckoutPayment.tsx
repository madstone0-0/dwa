import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetch } from "./utils/Fetch"; 

interface PaymentMethod {
  id: string;
  type: string;
  lastFour?: string;
  expiryDate?: string;
}

interface Address {
  id: string;
  name: string;
  line1: string;
  line2?: string;
  city: string;
  region: string;
  phone: string;
  isDefault: boolean;
}

interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image: string;
  seller: string;
}

function CheckoutPayment() {
  const navigate = useNavigate();
  useEffect(() => {
    const isLoggedIn = Boolean(localStorage.getItem("user")); 
    const userType = localStorage.getItem("userType");
    const userData = JSON.parse(localStorage.getItem("user") || "{}");
    const token = userData.token.trim().replace(/\s/g, "");
    if (!isLoggedIn && userType != "buyer") {    
      navigate('/signin'); 
    }
  }, [navigate]);
  // Sample data for now but we have to fetch from API
  const [addresses] = useState<Address[]>([
    {
      id: '1',
      name: 'John Doe',
      line1: 'Room 203, Hostel Block A',
      line2: 'Ashesi University',
      city: 'Berekuso',
      region: 'Eastern Region',
      phone: '055-123-4567',
      isDefault: true
    }
  ]);
  
  const [paymentMethods] = useState<PaymentMethod[]>([
    {
      id: '1',
      type: 'MoMo',
      lastFour: '4567',
      expiryDate: 'N/A'
    },
    {
      id: '2',
      type: 'Visa',
      lastFour: '9876',
      expiryDate: '12/25'
    }
  ]);
  
  const [cartItems] = useState<CartItem[]>([
    {
      id: 1,
      name: 'Ashesi Branded Notebook',
      price: 25.99,
      quantity: 2,
      image: '/images/notebook.jpg',
      seller: 'Campus Store'
    },
    {
      id: 2,
      name: 'USB Flash Drive 64GB',
      price: 45.50,
      quantity: 1,
      image: '/images/usb-drive.jpg',
      seller: 'Tech Solutions'
    }
  ]);
  
  const [selectedAddress, setSelectedAddress] = useState<string>(addresses[0]?.id || '');
  const [selectedPayment, setSelectedPayment] = useState<string>(paymentMethods[0]?.id || '');
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Calculate totals
  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const deliveryFee = 5.00;
  const tax = subtotal * 0.05; // 5% tax
  const total = subtotal + deliveryFee + tax;
  // mock function to simulate placing an order
  const handlePlaceOrder = async () => {
    setIsProcessing(true);
  
    const userData = JSON.parse(localStorage.getItem("user") || "{}");
    const token = userData.token?.trim().replace(/\s/g, "");
  
    // get cart from local storage
    const cartItems = JSON.parse(localStorage.getItem('cart') || '[]');
  
    try {
      // Need cart table to make this work
      for (const item of cartItems) {
        const paymentBody = {
          bid: userData.bid,        // assuming userData has bid
          vid: item.seller,          // assuming 'seller' is the vendor id
          iid: item.id.toString(),   // item id as string
          amt: item.price * item.quantity, // amount = price * quantity
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
        <div className="flex flex-col md:flex-row gap-8">
          {/* Left Column - Order Details */}
          <div className="md:w-2/3">
            {/* Shipping Address Section */}
            <div className="bg-white p-6 rounded-lg shadow-md mb-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-wine" style={{ color: '#722F37' }}>Shipping Address</h2>
                <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">Change</button>
              </div>
              
              <div className="border-b pb-4">
                {addresses.map(address => (
                  <div 
                    key={address.id} 
                    className={`border p-3 rounded ${selectedAddress === address.id ? 'border-yellow-400 bg-yellow-50' : 'border-gray-200'}`}
                    onClick={() => setSelectedAddress(address.id)}
                  >
                    <div className="flex items-center">
                      <input 
                        type="radio" 
                        name="address" 
                        checked={selectedAddress === address.id} 
                        onChange={() => setSelectedAddress(address.id)}
                        className="mr-2 accent-wine"
                      />
                      <div>
                        <p className="font-semibold">{address.name}</p>
                        <p className="text-sm text-gray-600">{address.line1}</p>
                        {address.line2 && <p className="text-sm text-gray-600">{address.line2}</p>}
                        <p className="text-sm text-gray-600">{address.city}, {address.region}</p>
                        <p className="text-sm text-gray-600">Phone: {address.phone}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <button className="mt-4 text-wine font-medium flex items-center" style={{ color: '#722F37' }}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add a new address
              </button>
            </div>
            
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
                <div key={item.id} className="flex border-b py-4 last:border-b-0">
                  <div className="w-20 h-20 flex-shrink-0 bg-gray-200 mr-4">
                    <img src={item.image} alt={item.name} className="w-full h-full object-contain" />
                  </div>
                  <div className="flex-grow">
                    <h3 className="font-medium">{item.name}</h3>
                    <p className="text-wine font-bold" style={{ color: '#722F37' }}>GH₵{item.price.toFixed(2)}</p>
                    <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                    <p className="text-sm text-gray-500">Sold by: {item.seller}</p>
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
                disabled={isProcessing}
              >
                {isProcessing ? 'Processing...' : 'Place Your Order'}
              </button>
              
              <p className="text-xs text-gray-500 mt-4 text-center">
                By placing your order, you agree to Ashesi DWA's privacy notice and conditions of use.
              </p>
            </div>
          </div>
        </div>
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