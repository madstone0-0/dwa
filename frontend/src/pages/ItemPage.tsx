import React, { useState } from "react";

const item = {
  id: 1,
  name: "Ashesi Branded Notebook",
  price: 7.0,
  description: "A durable, Ashesi-branded notebook with lined pages. Perfect for lectures and notes.",
  seller: "Campus Store",
  images: [
    "/images/notebook-front.jpg",
    "/images/notebook-side.jpg",
    "/images/notebook-back.jpg",
  ],
};

const ItemPage = () => {
  const [selectedImage, setSelectedImage] = useState(item.images[0]);
  const [quantity, setQuantity] = useState(1);

  const addToCart = () => {
    // logic to add item to cart
    alert(`${quantity} of "${item.name}" added to cart!`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-wine py-4 shadow-md flex justify-center" style={{ backgroundColor: '#722F37' }}>
        <h1 className="text-white text-2xl font-bold">Ashesi DWA</h1>
      </header>

      {/* Item Content */}
      <div className="max-w-5xl mx-auto p-6 flex flex-col md:flex-row gap-6 bg-white shadow-md mt-6 rounded-lg">
        {/* Images */}
        <div className="flex flex-col md:w-1/2">
          <img src={selectedImage} alt="Product" className="w-full h-96 object-contain rounded" />
          <div className="flex gap-2 mt-4 justify-center">
            {item.images.map((img, index) => (
              <img
                key={index}
                src={img}
                alt={`Angle ${index + 1}`}
                onClick={() => setSelectedImage(img)}
                className={`w-24 h-24 object-cover rounded cursor-pointer border-2 ${
                  selectedImage === img ? "border-yellow-500" : "border-transparent"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Info */}
        <div className="md:w-1/2 space-y-4">
          <h2 className="text-2xl font-bold text-gray-900">{item.name}</h2>
          <p className="text-gray-600">{item.description}</p>
          <p className="text-sm text-gray-500">Sold by: <span className="font-semibold">{item.seller}</span></p>
          <p className="text-2xl text-red-600 font-bold">GH₵{item.price.toFixed(2)}</p>

          <div className="flex items-center gap-2">
            <label htmlFor="quantity" className="text-sm">Quantity:</label>
            <input
              type="number"
              id="quantity"
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value))}
              min="1"
              className="w-16 p-1 border rounded"
            />
          </div>

          <button
            onClick={addToCart}
            className="bg-yellow-500 hover:bg-yellow-600 text-white py-2 px-6 rounded-xl font-semibold"
          >
            Add to Cart
          </button>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-wine text-white text-center py-5 text-xs border-t border-gray-300 mt-10" style={{ backgroundColor: '#722F37' }}>
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

export default ItemPage;
