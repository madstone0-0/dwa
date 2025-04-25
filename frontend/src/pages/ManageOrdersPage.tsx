import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

// Sample orders data
type Order = {
  id: number;
  buyer: string;
  vendor: string;
  product: string;
  received: boolean;
};

const sampleOrders: Order[] = [
  { id: 1, buyer: "Jane Smith", vendor: "John Doe", product: "Wine Glass", received: true },
  { id: 2, buyer: "Alice Johnson", vendor: "John Doe", product: "Red Wine", received: false },
  { id: 3, buyer: "Bob Brown", vendor: "Alice Johnson", product: "Opener", received: true },
];

const ManageOrdersPage = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>(sampleOrders);

  const toggleReceived = (id: number) => {
    const updated = orders.map(order =>
      order.id === id ? { ...order, received: !order.received } : order
    );
    setOrders(updated);
  };

  const cancelOrder = (id: number) => {
    const updated = orders.filter(order => order.id !== id);
    setOrders(updated);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-wine py-4 shadow-md px-6 flex justify-between items-center" style={{ backgroundColor: "#722F37" }}>
      <button onClick={() => navigate('/admin-dashboard')} className="focus:outline-none">
        <img
          src="/logo.png" // Replace with your actual logo path
          alt="Dashboard"
          className="w-8 h-8 rounded-full"
        />
      </button>
        <h1 className="text-white text-2xl font-bold">Manage Orders</h1>

        <div className="flex gap-2">
          <button
            onClick={() => navigate('/admin/users')}
            className="text-white hover:text-yellow-400 transition-colors px-4 py-1 border border-white rounded-md text-sm"
          >
            Manage Users
          </button>
          <button
            onClick={() => navigate('/admin-manage-orders')}
            className="text-white hover:text-yellow-400 transition-colors px-4 py-1 border border-white rounded-md text-sm"
          >
            Manage Orders
          </button>
          <button
            onClick={() => navigate('/admin-manage-products')}
            className="text-white hover:text-yellow-400 transition-colors px-4 py-1 border border-white rounded-md text-sm"
          >
            Manage Products
          </button>
          <button
            onClick={() => navigate('/')}
            className="text-white hover:text-yellow-400 transition-colors px-4 py-1 border border-white rounded-md text-sm"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6">
        <h2 className="text-2xl font-semibold mb-6">Orders List</h2>

        <table className="min-w-full bg-white rounded-lg shadow-md">
          <thead>
            <tr className="bg-black text-white">
              <th className="p-4">Buyer</th>
              <th className="p-4">Vendor</th>
              <th className="p-4">Product</th>
              <th className="p-4">Status</th>
              <th className="p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(order => (
              <tr key={order.id} className="border-b">
                <td className="p-4">{order.buyer}</td>
                <td className="p-4">{order.vendor}</td>
                <td className="p-4">{order.product}</td>
                <td className="p-4">
                  {order.received ? (
                    <span className="text-green-600 font-semibold">Received</span>
                  ) : (
                    <span className="text-red-600 font-semibold">Not Received</span>
                  )}
                </td>
                <td className="p-4 space-x-2">
                  <button
                    onClick={() => toggleReceived(order.id)}
                    className="bg-blue-500 text-white py-1 px-3 rounded hover:bg-blue-400"
                  >
                    Toggle Status
                  </button>
                  <button
                    onClick={() => cancelOrder(order.id)}
                    className="bg-red-500 text-white py-1 px-3 rounded hover:bg-red-400"
                  >
                    Cancel Order
                  </button>
                </td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr>
                <td colSpan={5} className="p-4 text-center text-gray-500">
                  No orders available.
                </td>
              </tr>
            )}
          </tbody>
        </table>
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
};

export default ManageOrdersPage;
