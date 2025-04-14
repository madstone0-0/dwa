import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface SectionHeaderProps {
  title: string;
  linkText: string;
}

interface CartItem {
  id: number;  
  name: string;
  price: number;
  quantity: number;
  image: string;
}

// Categories 
const CATEGORIES = {  
  FASHION: 'Fashion',
  ELECTRONICS: 'Electronics',
  SERVICES: 'Services',
  BOOKS: 'Books & Supplies'
};

function LandingPage() {
  const navigate = useNavigate();
  const [recentlyViewed] = useState<Array<any>>([]);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  const SectionHeader = ({ title, linkText }: SectionHeaderProps) => (
    <div className="w-full flex justify-between items-center mb-4 px-8">
      <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
      <button className="text-wine hover:text-wine-dark font-semibold" style={{ color: '#722F37' }}>
        {linkText}
      </button>
    </div>
  );

  const addToCart = (id: number, name: string, price: number, image: string) => {
    // Check if item is already in cart
    const existingItem = cartItems.find(item => item.id === id);
    
    if (existingItem) {
      // Increase quantity if item already exists
      setCartItems(
        cartItems.map(item =>
          item.id === id ? { ...item, quantity: item.quantity + 1 } : item
        )
      );
    } else {
      // Add new item to cart
      setCartItems([...cartItems, { id, name, price, quantity: 1, image }]);
    }
  };

  const goToCheckout = () => {

    // We have to save cart state to context/localStorage (TODO)
    navigate('/checkout-payment');
  };

  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  return (
    <div className="bg-white min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-wine py-4 shadow-md flex justify-between px-8" style={{ backgroundColor: '#722F37' }}>
        <h1 className="text-white text-2xl font-bold">Ashesi DWA</h1>
        
        {/* Shopping Cart Icon */}
        <div className="relative">
          <button 
            onClick={goToCheckout}
            className="flex items-center text-white hover:text-yellow-400 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            {getTotalItems() > 0 && (
              <span className="absolute -top-2 -right-2 bg-yellow-400 text-black rounded-full h-5 w-5 flex items-center justify-center text-xs font-bold">
                {getTotalItems()}
              </span>
            )}
          </button>
        </div>
      </header>

      <div className="flex-grow flex flex-col items-center py-10">
        {/* Hero Section */}
        <div className="w-full flex flex-col items-center py-16 px-6 text-center bg-yellow-100">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome to Ashesi DWA</h2>
          <p className="text-gray-700 text-lg">Ghana's Premier Student Marketplace</p>
        </div>

        {/* Frequently Repurchased */}
        <SectionHeader title="Frequently Repurchased" linkText="Shop all essentials" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 px-8 py-6 w-full">
          {[
            { id: 1, name: "Essential Item 1", price: 12.99, image: "/images/repurchase-1.jpg" },
            { id: 2, name: "Essential Item 2", price: 12.99, image: "/images/repurchase-2.jpg" },
            { id: 3, name: "Essential Item 3", price: 12.99, image: "/images/repurchase-3.jpg" },
            { id: 4, name: "Essential Item 4", price: 12.99, image: "/images/repurchase-4.jpg" }
          ].map((item) => (
            <div key={item.id} className="bg-white p-4 border border-gray-200 rounded-lg hover:shadow-lg transition-shadow">
              <img src={item.image} alt={item.name} className="w-full h-48 object-contain mb-4" />
              <h3 className="font-bold">{item.name}</h3>
              <p className="text-gray-600 text-sm">GH₵{item.price}</p>
              <button 
                className="bg-yellow-400 text-black px-3 py-1 rounded mt-2 text-sm hover:bg-yellow-500 w-full"
                onClick={() => addToCart(item.id, item.name, item.price, item.image)}
              >
                Add to Cart
              </button>
            </div>
          ))}
        </div>

        {/* Category Sections */}
        <SectionHeader title="Shop by Category" linkText="Browse all categories" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 px-8 py-6 w-full">
          {Object.values(CATEGORIES).map((category) => (
            <div key={category} className="bg-white p-4 border border-gray-200 rounded-lg text-center hover:shadow-lg">
              <img 
                src={`/images/category-${category.toLowerCase().replace(' & ', '-').replace(' ', '-')}.jpg`} 
                alt={category}
                className="w-full h-48 object-contain mb-4"
              />
              <h3 className="font-bold text-lg text-wine" style={{ color: '#722F37' }}>{category}</h3>
              <button className="bg-black text-white py-2 rounded font-bold hover:bg-gray-800 w-full mt-2">
                Shop Now
              </button>
            </div>
          ))}
        </div>

        {/* Deals of the Day */}
        <div className="w-full bg-yellow-100 py-8 mt-8">
          <SectionHeader title="Deals of the Day" linkText="See all deals" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-8">
            {[
              { id: 5, name: "Daily Deal 1", price: 29.99, originalPrice: 49.99, image: "/images/deal-1.jpg" },
              { id: 6, name: "Daily Deal 2", price: 29.99, originalPrice: 49.99, image: "/images/deal-2.jpg" },
              { id: 7, name: "Daily Deal 3", price: 29.99, originalPrice: 49.99, image: "/images/deal-3.jpg" }
            ].map((item) => (
              <div key={item.id} className="bg-white p-4 border-2 border-yellow-400 rounded-lg flex">
                <img src={item.image} alt="Deal" className="w-1/3 object-contain" />
                <div className="ml-4">
                  <h3 className="font-bold">{item.name}</h3>
                  <p className="text-red-600 font-bold">40% OFF</p>
                  <p className="text-gray-600 text-sm">GH₵{item.price} <span className="line-through">GH₵{item.originalPrice}</span></p>
                  <button 
                    className="bg-yellow-400 text-black px-2 py-1 rounded mt-2 text-xs hover:bg-yellow-500"
                    onClick={() => addToCart(item.id, item.name, item.price, item.image)}
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recommended Services */}
        <SectionHeader title="Student Services" linkText="Explore all services" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-8 py-6 w-full">
          {['Hair Styling', 'Tutoring', 'Graphic Design'].map((service, index) => (
            <div key={service} className="bg-white p-4 border border-gray-200 rounded-lg text-center">
              <img 
                src={`/images/service-${service.toLowerCase().replace(' ', '-')}.jpg`} 
                alt={service}
                className="w-full h-48 object-cover mb-4 rounded"
              />
              <h3 className="font-bold">{service}</h3>
              <p className="text-gray-600 text-sm">Starting from GH₵50</p>
            </div>
          ))}
        </div>

        {/* Cart Floating Button for Mobile */}
        {getTotalItems() > 0 && (
          <div className="md:hidden fixed bottom-6 right-6 z-10">
            <button 
              onClick={goToCheckout}
              className="bg-wine text-white p-3 rounded-full shadow-lg flex items-center justify-center"
              style={{ backgroundColor: '#722F37' }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span className="ml-1 font-bold">{getTotalItems()}</span>
            </button>
          </div>
        )}

        {/* Footer */}
        <footer className="bg-wine text-white text-center py-5 text-xs border-t border-gray-300 w-full mt-8" style={{ backgroundColor: '#722F37' }}>
          <p className="mb-1">
            <span className="text-yellow-400 cursor-pointer hover:underline">Terms of Service</span> &nbsp; | &nbsp;
            <span className="text-yellow-400 cursor-pointer hover:underline">Privacy Policy</span> &nbsp; | &nbsp;
            <span className="text-yellow-400 cursor-pointer hover:underline">Help</span>
          </p>
          <p>&copy; {new Date().getFullYear()} Ashesi DWA, Inc. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
}

export default LandingPage;