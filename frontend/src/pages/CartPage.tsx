import React, { useState } from "react";

const initialCartItems = [
  {
    id: 1,
    name: "Ashesi Branded Notebook",
    price: 7.0,
    quantity: 1,
    seller: "Campus Store",
    image: "/images/notebook.jpg", // Replace with actual path
  },
  {
    id: 2,
    name: "USB Flash Drive 64GB",
    price: 6.0,
    quantity: 1,
    seller: "Tech Solutions",
    image: "/images/flashdrive.jpg", // Replace with actual path
  },
];

const CartPage = () => {
  const [cartItems, setCartItems] = useState(initialCartItems);

  const handleQuantityChange = (id: number, newQuantity: number) => {
    const updatedItems = cartItems.map((item) =>
      item.id === id ? { ...item, quantity: newQuantity } : item
    );
    setCartItems(updatedItems);
  };

  const subtotal = cartItems.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Header */}
      <header className="bg-[#6b1e2a] text-white text-center py-3 font-semibold">
        Ashesi DWA Checkout
      </header>

      {/* Main Content */}
      <main className="flex-grow p-4">
        <h1 className="text-2xl font-bold text-center mb-6">Your Shopping Cart</h1>
        <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-md p-4 space-y-4">
          {cartItems.map((item) => (
            <div key={item.id} className="flex items-center gap-4 border-b pb-3">
              <img
                src={item.image}
                alt={item.name}
                className="w-20 h-20 object-cover rounded"
              />
              <div className="flex justify-between items-center w-full">
                <div>
                  <h2 className="font-semibold">{item.name}</h2>
                  <p className="text-sm text-gray-500">Sold by: {item.seller}</p>
                </div>
                <div className="text-right">
                  <p>GH₵{item.price.toFixed(2)}</p>
                  <label className="text-sm text-gray-500">
                    Qty:{" "}
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) =>
                        handleQuantityChange(item.id, parseInt(e.target.value))
                      }
                      className="w-16 border rounded px-2 py-1 ml-1"
                    />
                  </label>
                </div>
              </div>
            </div>
          ))}

          <div className="flex justify-between font-semibold text-lg pt-4">
            <span>Subtotal</span>
            <span>GH₵{subtotal.toFixed(2)}</span>
          </div>

          <button className="w-full bg-yellow-500 hover:bg-yellow-600 text-white py-2 rounded-xl mt-4 font-semibold">
            Proceed to Checkout
          </button>
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
};

export default CartPage;
