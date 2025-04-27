import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { fetch } from "../utils/Fetch";

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  quantity: number;
  category: string;
  images: string[]; 
}
const InventoryManagementPage = () => {
  const navigate = useNavigate();
  const isUserLoggedIn = Boolean(localStorage.getItem('user'));
  console.log('User logged in:', isUserLoggedIn);
  
    useEffect(() => {
      if (!isUserLoggedIn) {
        navigate('/signin');
      }
    }, [isUserLoggedIn, navigate]);

  const [products, setProducts] = useState<Product[]>([
    {
      id: 1,
      name: "Ashesi Branded Notebook",
      description: "A high-quality notebook with Ashesi branding.",
      price: 8.0,
      quantity: 50,
      category: "Books",
      images: ["https://via.placeholder.com/150?text=Notebook", "https://via.placeholder.com/150?text=Notebook+Side", "https://via.placeholder.com/150?text=Notebook+Back"], // Sample image URLs
    },
    {
      id: 2,
      name: "USB Flash Drive 64GB",
      description: "A reliable 64GB USB flash drive for storage.",
      price: 15.0,
      quantity: 30,
      category: "Electronics",
      images: ["https://via.placeholder.com/150?text=Flash+Drive", "https://via.placeholder.com/150?text=Flash+Drive+Side", "https://via.placeholder.com/150?text=Flash+Drive+Back"], // Sample image URLs
    },
    {
      id: 3,
      name: "Wireless Mouse",
      description: "A wireless mouse for smooth and precise navigation.",
      price: 12.0,
      quantity: 20,
      category: "Electronics",
      images: ["https://via.placeholder.com/150?text=Wireless+Mouse", "https://via.placeholder.com/150?text=Mouse+Side", "https://via.placeholder.com/150?text=Mouse+Back"], // Sample image URLs
    },
  ]);

  const [searchQuery, setSearchQuery] = useState<string>("");

  // New state variables for product inputs
  const [newName, setNewName] = useState<string>("");
  const [newDescription, setNewDescription] = useState<string>("");
  const [newPrice, setNewPrice] = useState<number | string>("");
  const [newQuantity, setNewQuantity] = useState<number | string>("");
  const [newCategory, setNewCategory] = useState<string>("");
  const [newImages, setNewImages] = useState<FileList | null>(null); // New state for images

  

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  // Function to handle image upload (multiple images)
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length === 3) {
      setNewImages(files); // Store the files
    } else {
      alert("Please upload exactly 3 images.");
    }
  };

  // Function to convert file list to image URLs
  const getImageUrls = () => {
    if (newImages) {
      return Array.from(newImages).map((file) => URL.createObjectURL(file));
    }
    return [];
  };

  // Function to add product
  const addProduct = () => {
    if (!newName || !newDescription || !newPrice || !newQuantity || !newCategory || !newImages || newImages.length !== 3) {
      alert("Please fill in all fields and upload 3 images.");
      return;
    }

    const newProduct: Product = {
      id: products.length + 1,
      name: newName,
      description: newDescription,
      price: parseFloat(newPrice.toString()),
      quantity: parseInt(newQuantity.toString(), 10),
      category: newCategory,
      images: getImageUrls(), // Store the image URLs
    };

    setProducts([...products, newProduct]);

    // Clear the form after submission
    setNewName("");
    setNewDescription("");
    setNewPrice("");
    setNewQuantity("");
    setNewCategory("");
    setNewImages(null); // Clear images after submission
  };

  const updateProduct = (id: number, updatedData: Partial<Product>) => {
    setProducts(products.map(product => (product.id === id ? { ...product, ...updatedData } : product)));
  };

  const deleteProduct = (id: number) => {
    setProducts(products.filter(product => product.id !== id));
  };

  // Filter products based on the search query
  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Check if all fields are filled and images are correctly uploaded
  const isFormValid =
    newName &&
    newDescription &&
    newPrice &&
    newQuantity &&
    newCategory &&
    newImages &&
    newImages.length === 3;
 
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
    {/* Header */}
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
              <h1 className="text-white text-xl font-bold">Inventory</h1>
            </div>

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

    <main className="flex-grow container mx-auto py-8 px-4">
      {/* Search and Stats Bar */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-xl">
            <input
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-wine focus:border-transparent"
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <svg className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <div className="flex gap-4">
            <div className="bg-gray-50 px-4 py-2 rounded-lg">
              <p className="text-sm text-gray-600">Total Products</p>
              <p className="text-2xl font-bold text-wine">{products.length}</p>
            </div>
            <div className="bg-gray-50 px-4 py-2 rounded-lg">
              <p className="text-sm text-gray-600">Low Stock</p>
              <p className="text-2xl font-bold text-yellow-500">
                {products.filter(p => p.quantity < 10).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map((product) => (
          <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
            <div className="relative">
              <img
                src={product.images[0]}
                alt={product.name}
                className="w-full h-48 object-cover"
              />
              <div className="absolute top-2 right-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  product.quantity < 10 ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                }`}>
                  Stock: {product.quantity}
                </span>
              </div>
            </div>
            
            <div className="p-4">
              <h3 className="text-lg font-semibold text-gray-800">{product.name}</h3>
              <p className="text-sm text-gray-600 mt-1">{product.description}</p>
              <p className="text-wine font-bold mt-2">GH₵{product.price.toFixed(2)}</p>
              
              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => updateProduct(product.id, { quantity: product.quantity + 1 })}
                  className="flex-1 bg-wine text-white py-2 px-3 rounded-md hover:bg-wine-dark transition-colors text-sm"
                  style={{ backgroundColor: '#722F37' }}
                >
                  + Stock
                </button>
                <button
                  onClick={() => updateProduct(product.id, { quantity: product.quantity - 1 })}
                  className="flex-1 bg-wine text-white py-2 px-3 rounded-md hover:bg-wine-dark transition-colors text-sm"
                  style={{ backgroundColor: '#722F37' }}
                >
                  - Stock
                </button>
                <button
                  onClick={() => deleteProduct(product.id)}
                  className="bg-black text-white p-2 rounded-md hover:bg-gray-800 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
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

export default InventoryManagementPage;
