import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

type ProductStatus = "Pending" | "Accepted" | "Declined";

type Product = {
  id: number;
  vendor: string;
  name: string;
  image: string;
  description: string;
  status: ProductStatus;
};

const sampleProducts: Product[] = [
  {
    id: 1,
    vendor: "John Doe",
    name: "Vintage Red Wine",
    image: "https://via.placeholder.com/100",
    description: "Aged red wine from Italy.",
    status: "Pending",
  },
  {
    id: 2,
    vendor: "Alice Johnson",
    name: "Wine Opener",
    image: "https://via.placeholder.com/100",
    description: "Classic corkscrew opener.",
    status: "Accepted",
  },
  {
    id: 3,
    vendor: "Jane Smith",
    name: "Glass Set",
    image: "https://via.placeholder.com/100",
    description: "Elegant wine glass set of 6.",
    status: "Declined",
  },
];

const ManageProductsPage = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>(sampleProducts);

  const updateStatus = (id: number, newStatus: ProductStatus) => {
    const updated = products.map(product =>
      product.id === id ? { ...product, status: newStatus } : product
    );
    setProducts(updated);
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
        <h1 className="text-white text-2xl font-bold">Manage Products</h1>

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


      {/* Main */}
      <main className="p-6">
        <h2 className="text-2xl font-semibold mb-6">Products List</h2>

        <table className="min-w-full bg-white rounded-lg shadow-md">
          <thead>
            <tr className="bg-black text-white">
              <th className="p-4">Vendor</th>
              <th className="p-4">Product</th>
              <th className="p-4">Image</th>
              <th className="p-4">Description</th>
              <th className="p-4">Status</th>
              <th className="p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map(product => (
              <tr key={product.id} className="border-b">
                <td className="p-4">{product.vendor}</td>
                <td className="p-4">{product.name}</td>
                <td className="p-4">
                  <img src={product.image} alt={product.name} className="w-20 h-20 object-cover rounded" />
                </td>
                <td className="p-4">{product.description}</td>
                <td className="p-4 font-semibold text-center">
                  {product.status === "Accepted" && <span className="text-green-600">Accepted</span>}
                  {product.status === "Declined" && <span className="text-red-600">Declined</span>}
                  {product.status === "Pending" && <span className="text-yellow-600">Pending</span>}
                </td>
                <td className="p-4 space-x-2 text-center">
                  <button
                    onClick={() => updateStatus(product.id, "Accepted")}
                    className="bg-green-600 text-white py-1 px-3 rounded hover:bg-green-500"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => updateStatus(product.id, "Declined")}
                    className="bg-red-500 text-white py-1 px-3 rounded hover:bg-red-400"
                  >
                    Decline
                  </button>
                </td>
              </tr>
            ))}
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

export default ManageProductsPage;