import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetch } from '../utils/Fetch'; 

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  quantity: number;
  category: string;
  images: string[];
}

const VendorDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [newProduct, setNewProduct] = useState({ name: '', price: 0, images: [] as string[], category: '' });
  const [newDescription, setNewDescription] = useState<string>('');
  const [newQuantity, setNewQuantity] = useState<number | string>('');
  const [newImageUrl, setNewImageUrl] = useState<string>('');
  const [formError, setFormError] = useState<string | null>(null);

  const isUserLoggedIn = Boolean(localStorage.getItem('user'));

  useEffect(() => {
    if (!isUserLoggedIn) {
      navigate('/signin');
    }
  }, [isUserLoggedIn, navigate]);

  const isFormValid =
    newProduct.name &&
    newDescription &&
    newProduct.price > 0 &&
    newQuantity &&
    newProduct.category &&
    newImageUrl.length > 0;

  const handleAddProduct = async () => {
    if (!isFormValid) {
      setFormError('Please fill in all fields and provide a valid image URL.');
      return;
    }

    setFormError(null);

    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    const token = userData.token;
    const productData = {
      vid: userData.uid,
      name: newProduct.name,
      pictureurl: newImageUrl,
      description: newDescription,
      cost: newProduct.price,
      quantity: Number(newQuantity),
      category: newProduct.category.toUpperCase(),
    };

    try {
      const response = await fetch.post("/vendor/item/add", productData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log('Product added:', response);
    } catch (error) {
      console.error('Error adding product:', error);
      setFormError('Failed to add product. Please try again.');
      return;
    }

    // Add the new product to the list of products
    setProducts([
      ...products,
      {
        id: products.length + 1,
        name: newProduct.name,
        price: newProduct.price,
        description: newDescription,
        quantity: Number(newQuantity),
        category: newProduct.category,
        images: [newImageUrl],
      },
    ]);

    // Reset form fields
    setNewProduct({ name: '', price: 0, images: [], category: '' });
    setNewDescription('');
    setNewQuantity('');
    setNewImageUrl('');

    // Navigate to inventory management
    navigate('/inventory-management');
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
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
              <h1 className="text-white text-xl font-bold">Vendor Dashboard</h1>
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

      <main className="flex-grow p-8">
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-xl font-bold mb-4 text-wine">Add New Product</h2>
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Product Name"
              value={newProduct.name}
              onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
              className="p-2 border rounded focus:ring-2 focus:ring-wine w-full"
            />
            <textarea
              placeholder="Product Description"
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              className="p-2 border rounded focus:ring-2 focus:ring-wine w-full"
            />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input
                type="number"
                placeholder="Price (GH₵)"
                value={newProduct.price}
                onChange={(e) => setNewProduct({ ...newProduct, price: parseFloat(e.target.value) })}
                className="p-2 border rounded focus:ring-2 focus:ring-wine"
              />
              <input
                type="number"
                placeholder="Quantity"
                value={newQuantity}
                onChange={(e) => setNewQuantity(e.target.value)}
                className="p-2 border rounded focus:ring-2 focus:ring-wine"
              />
              <select
                value={newProduct.category}
                onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                className="p-2 border rounded focus:ring-2 focus:ring-wine"
              >
                <option value="">Select Category</option>
                <option value="FASHION">Fashion</option>
                <option value="ELECTRONICS">Electronics</option>
                <option value="SERVICES">Services</option>
                <option value="BOOKS_SUPPLIES">Books&Supplies</option>
              </select>
            </div>
            <div className="mt-4">
              <input
                type="text"
                placeholder="Image URL"
                value={newImageUrl}
                onChange={(e) => setNewImageUrl(e.target.value)}
                className="p-2 border rounded focus:ring-2 focus:ring-wine w-full"
              />
              {newImageUrl && (
                <div className="mt-4 flex gap-4">
                  <img
                    src={newImageUrl}
                    alt="Product Preview"
                    className="w-32 h-32 object-cover rounded"
                  />
                </div>
              )}
            </div>
            {formError && <p className="text-red-500">{formError}</p>}
            <button
              onClick={handleAddProduct}
              className="bg-yellow-400 text-black py-2 rounded font-bold hover:bg-yellow-500 w-full mt-4"
              disabled={!isFormValid}
            >
              Add Product
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default VendorDashboard;
