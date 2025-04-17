import React, { useState } from "react";

// Header Component
const Header = () => {
  return (
    <header className="bg-wine py-4 shadow-md flex justify-center" style={{ backgroundColor: '#722F37' }}>
      <h1 className="text-white text-2xl font-bold">Ashesi DWA</h1>
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
        <h1 className="text-2xl font-semibold text-center mb-6">Sales and Earnings</h1>
        
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
