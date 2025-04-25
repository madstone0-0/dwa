import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
 
// Header Component
const Header = () => {
  const navigate = useNavigate();
  return (
    <header className="bg-wine shadow-md" style={{ backgroundColor: '#722F37' }}>
    <div className="container mx-auto px-4 py-3">
      <div className="flex items-center justify-between">
        {/* Logo and Brand */}
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => navigate('/vendor-dashboard')}>
          <img 
            src="/src/assets/dwa-icon.jpg" 
            alt="DWA Logo" 
            className="h-10 w-10 object-cover rounded-full"
          />
          <h1 className="text-white text-xl font-bold">Sales & Earnings</h1>
        </div>

        {/* Navigation Icons */}
            {/* Navigation Icons */}
            <div className="flex items-center space-x-6">
            <button onClick={() => navigate('/inventory-management')} className="text-white hover:text-yellow-400 transition-colors flex flex-col items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
                <span className="text-xs mt-1">Inventory</span>
              </button>
              {/* Earnings */}
              <button 
                onClick={() => navigate('/sales-and-earnings')}
                className="text-white hover:text-yellow-400 transition-colors flex flex-col items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <span className="text-xs mt-1">Earnings</span>
              </button>

              {/* Orders */}
              <button 
                onClick={() => navigate('/orders')}
                className="text-white hover:text-yellow-400 transition-colors flex flex-col items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17h6M9 13h6M9 9h6M5 3h14a2 2 0 012 2v16l-3-3H6l-3 3V5a2 2 0 012-2z" />
                </svg>
                <span className="text-xs mt-1">Orders</span>
              </button>

              {/* Profile */}
              <button 
                onClick={() => navigate('/user-profile')}
                className="text-white hover:text-yellow-400 transition-colors flex flex-col items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span className="text-xs mt-1">Profile</span>
              </button>
            </div>
      </div>
    </div>
  </header>
  );
};

interface Sale {
  id: number;
  customerName: string;
  items: string[];
  totalAmount: number;
  date: string;
}

const SalesAndEarningsPage = () => {
  const [sales, setSales] = useState<Sale[]>([
    {
      id: 1,
      customerName: "John Doe",
      items: ["Ashesi Branded Notebook", "USB Flash Drive 64GB"],
      totalAmount: 13.0,
      date: "2025-04-10",
    },
    {
      id: 2,
      customerName: "Mary Jane",
      items: ["Wireless Mouse"],
      totalAmount: 8.0,
      date: "2025-04-12",
    },
    {
      id: 3,
      customerName: "Peter Parker",
      items: ["Phone Case", "USB Cable"],
      totalAmount: 15.0,
      date: "2025-04-14",
    },
  ]);

  // Calculate the total earnings
  const totalEarnings = sales.reduce((sum, sale) => sum + sale.totalAmount, 0);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Include the Header here */}
      <Header />

      <main className="flex-grow p-4">
        
        {/* Display Total Earnings */}
        <div className="text-center mb-6">
          <h2 className="text-xl font-bold">Total Earnings: GH₵{totalEarnings.toFixed(2)}</h2>
        </div>

        {/* List of Sales */}
        <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-md p-4 space-y-4">
          {sales.map((sale) => (
            <div key={sale.id} className="flex items-center gap-4 border-b pb-3">
              <div className="w-full">
                <h3 className="font-semibold">Sale #{sale.id}</h3>
                <p>Customer: {sale.customerName}</p>
                <p>Items: {sale.items.join(", ")}</p>
                <p>Total: GH₵{sale.totalAmount.toFixed(2)}</p>
                <p>Date: {sale.date}</p>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Footer Component */}
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
};

export default SalesAndEarningsPage;
