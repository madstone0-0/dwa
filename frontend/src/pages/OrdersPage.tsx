import React, { useState } from "react";

// Header Component
const Header = () => {
  return (
    <header className="bg-wine py-4 shadow-md flex justify-center" style={{ backgroundColor: '#722F37' }}>
      <h1 className="text-white text-2xl font-bold">Ashesi DWA</h1>
    </header>
  );
};

interface Order {
  id: number;
  customerName: string;
  items: string[];
  totalAmount: number;
  status: "pending" | "completed" | "cancelled";
}

const OrdersPage = () => {
  const [orders, setOrders] = useState<Order[]>([
    {
      id: 1,
      customerName: "John Doe",
      items: ["Ashesi Branded Notebook", "USB Flash Drive 64GB"],
      totalAmount: 13.0,
      status: "pending",
    },
    {
      id: 2,
      customerName: "Mary Jane",
      items: ["Wireless Mouse"],
      totalAmount: 8.0,
      status: "completed",
    },
  ]);

  const updateOrderStatus = (orderId: number, status: "pending" | "completed" | "cancelled") => {
    setOrders(
      orders.map((order) =>
        order.id === orderId ? { ...order, status: status } : order
      )
    );
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Include the Header here */}
      <Header />

      <main className="flex-grow p-4">
        <h1 className="text-2xl font-semibold text-center mb-6">Your Orders</h1>
        <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-md p-4 space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="flex items-center gap-4 border-b pb-3">
              <div className="w-full">
                <h3 className="font-semibold">Order #{order.id}</h3>
                <p>Customer: {order.customerName}</p>
                <p>Items: {order.items.join(", ")}</p>
                <p>Total: GH₵{order.totalAmount.toFixed(2)}</p>
                <p>Status: {order.status}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => updateOrderStatus(order.id, "completed")} className="bg-green-500 text-white py-1 px-2 rounded">
                  Mark as Completed
                </button>
                <button onClick={() => updateOrderStatus(order.id, "cancelled")} className="bg-red-500 text-white py-1 px-2 rounded">
                  Cancel Order
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>

      
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

export default OrdersPage;
