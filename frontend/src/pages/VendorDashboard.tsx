import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetch } from '../utils/Fetch'; 
import { AxiosError } from 'axios';

interface Product {
  id: number;
  name: string;
  description: string;
  cost: number;
  quantity: number;
  category: string;
  images: string[];
}

interface ProductFormData {
  name: string;
  description: string;
  cost: number;
  quantity: number | string;
  category: string;
  pictureUrl: string;
}

const VendorDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    description: '',
    cost: 0,
    quantity: '',
    category: '',
    pictureUrl: ''
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [formError, setFormError] = useState<string | null>(null);

  const isUserLoggedIn = Boolean(localStorage.getItem('user'));

  useEffect(() => {
    if (!isUserLoggedIn) {
      navigate('/signin');
    }
  }, [isUserLoggedIn, navigate]);

  // Form validation
  const isFormValid = 
    formData.name.trim() !== '' && 
    formData.description.trim() !== '' && 
    formData.cost > 0 && 
    formData.quantity !== '' && 
    formData.category !== '' && 
    formData.pictureUrl.trim() !== '';

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: name === 'cost' ? parseFloat(value) || 0 : value
    }));
  };

  const handleAddProduct = async () => {
    // Check form validity again as a safety measure
    if (!isFormValid) {
      setFormError('Please fill in all fields correctly');
      return;
    }

    setIsLoading(true);
    setFormError(null);
    
    try {
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      const token = userData.token.trim().replace(/\s/g, '');
      
      if (!token) {
        setFormError('Authentication token is missing. Please log in again.');
        setIsLoading(false);
        return;
      }

      // Prepare data for API
      const productData = {
        vid: userData.uid,
        name: formData.name,
        pictureUrl: formData.pictureUrl,
        description: formData.description,
        cost: formData.cost,
        quantity: Number(formData.quantity),
        category: formData.category.toUpperCase(),
      };

      // Make API request
      const response = await fetch.post("/vendor/item/add", productData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      // Handle successful response
      console.log('Product added successfully:', response);
      
      // Add the new product to local state
      setProducts([
        ...products,
        {
          id: products.length + 1,
          name: formData.name,
          description: formData.description,
          cost: formData.cost,
          quantity: Number(formData.quantity),
          category: formData.category,
          images: [formData.pictureUrl],
        },
      ]);

      // Reset form
      setFormData({
        name: '',
        description: '',
        cost: 0,
        quantity: 0,
        category: '',
        pictureUrl: ''
      });

      // Navigate to inventory management
      navigate('/inventory-management');
      
    } catch (error: unknown) {
      console.error('Error adding product:', error);
      
      if (error instanceof AxiosError && error.response) {
        setFormError(`Failed to add product: ${error.response.statusText || error.message}`);
        console.error('Error details:', error.response.data);
      } else {
        setFormError('Failed to add product. Please check your connection and try again.');
      }
    } finally {
      setIsLoading(false);
    }
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
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
              <input
                id="name"
                name="name"
                type="text"
                placeholder="Product Name"
                value={formData.name}
                onChange={handleInputChange}
                className="p-2 border rounded focus:ring-2 focus:ring-wine w-full"
              />
            </div>
            
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Product Description</label>
              <textarea
                id="description"
                name="description"
                placeholder="Product Description"
                value={formData.description}
                onChange={handleInputChange}
                className="p-2 border rounded focus:ring-2 focus:ring-wine w-full"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="cost" className="block text-sm font-medium text-gray-700 mb-1">cost (GH₵)</label>
                <input
                  id="cost"
                  name="cost"
                  type="number"
                  placeholder="Price (GH₵)"
                  value={formData.cost}
                  onChange={handleInputChange}
                  className="p-2 border rounded focus:ring-2 focus:ring-wine w-full"
                />
              </div>
              
              <div>
                <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                <input
                  id="quantity"
                  name="quantity"
                  type="number"
                  placeholder="Quantity"
                  value={formData.quantity}
                  onChange={handleInputChange}
                  className="p-2 border rounded focus:ring-2 focus:ring-wine w-full"
                />
              </div>
              
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="p-2 border rounded focus:ring-2 focus:ring-wine w-full"
                >
                  <option value="">Select Category</option>
                  <option value="FASHION">Fashion</option>
                  <option value="ELECTRONICS">Electronics</option>
                  <option value="SERVICES">Services</option>
                  <option value="BOOKS_SUPPLIES">Books&Supplies</option>
                </select>
              </div>
            </div>
            
            <div>
              <label htmlFor="pictureUrl" className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
              <input
                id="pictureUrl"
                name="pictureUrl"
                type="text"
                placeholder="Image URL"
                value={formData.pictureUrl}
                onChange={handleInputChange}
                className="p-2 border rounded focus:ring-2 focus:ring-wine w-full"
              />
              {formData.pictureUrl && (
                <div className="mt-4 flex gap-4">
                  <img
                    src={formData.pictureUrl}
                    alt="Product Preview"
                    className="w-32 h-32 object-cover rounded"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/src/assets/image-placeholder.jpg';
                      (e.target as HTMLImageElement).alt = 'Image load failed';
                    }}
                  />
                </div>
              )}
            </div>
            
            {formError && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
                {formError}
              </div>
            )}
            
            <button
              onClick={handleAddProduct}
              className="bg-yellow-400 text-black py-2 rounded font-bold hover:bg-yellow-500 w-full mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!isFormValid || isLoading}
            >
              {isLoading ? 'Adding Product...' : 'Add Product'}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default VendorDashboard;