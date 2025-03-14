import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface SectionHeaderProps {
  title: string;
  linkText: string;
}

// Consistent categories with vendor dashboard
const CATEGORIES = {
  FASHION: 'Fashion',
  ELECTRONICS: 'Electronics',
  SERVICES: 'Services',
  BOOKS: 'Books & Supplies'
};

function LandingPage() {
  const navigate = useNavigate();
  const [recentlyViewed] = useState<Array<any>>([]);

  const SectionHeader = ({ title, linkText }: SectionHeaderProps) => (
    <div className="w-full flex justify-between items-center mb-4 px-8">
      <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
      <button className="text-wine hover:text-wine-dark font-semibold" style={{ color: '#722F37' }}>
        {linkText}
      </button>
    </div>
  );

  return (
    <div className="bg-white min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-wine py-4 shadow-md flex justify-center" style={{ backgroundColor: '#722F37' }}>
        <h1 className="text-white text-2xl font-bold">Ashesi DWA</h1>
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
          {[1, 2, 3, 4].map((item) => (
            <div key={item} className="bg-white p-4 border border-gray-200 rounded-lg hover:shadow-lg transition-shadow">
              <img src={`/images/repurchase-${item}.jpg`} alt="Repurchased item" className="w-full h-48 object-contain mb-4" />
              <h3 className="font-bold">Essential Item {item}</h3>
              <p className="text-gray-600 text-sm">GH₵12.99</p>
              <button className="bg-yellow-400 text-black px-3 py-1 rounded mt-2 text-sm hover:bg-yellow-500 w-full">
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
            {[1, 2, 3].map((item) => (
              <div key={item} className="bg-white p-4 border-2 border-yellow-400 rounded-lg flex">
                <img src={`/images/deal-${item}.jpg`} alt="Deal" className="w-1/3 object-contain" />
                <div className="ml-4">
                  <h3 className="font-bold">Daily Deal {item}</h3>
                  <p className="text-red-600 font-bold">40% OFF</p>
                  <p className="text-gray-600 text-sm">GH₵29.99 <span className="line-through">GH₵49.99</span></p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recommended Services */}
        <SectionHeader title="Student Services" linkText="Explore all services" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-8 py-6 w-full">
          {['Hair Styling', 'Tutoring', 'Graphic Design'].map((service) => (
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