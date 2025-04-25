import React, { useState } from 'react';
import { PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useNavigate } from 'react-router-dom';

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
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [newDescription, setNewDescription] = useState<string>("");
  const [newQuantity, setNewQuantity] = useState<number | string>("");
  const [newImages, setNewImages] = useState<File[]>([]);
  const [formError, setFormError] = useState<string | null>(null);

  const salesData = [
    { name: 'Mon', sales: 12 },
    { name: 'Tue', sales: 19 },
    { name: 'Wed', sales: 8 },
    { name: 'Thu', sales: 15 },
    { name: 'Fri', sales: 22 },
  ];

  const categoryData = [
    { name: 'Fashion', value: 35 },
    { name: 'Electronics', value: 25 },
    { name: 'Services', value: 20 },
    { name: 'Books', value: 20 },
  ];

  const COLORS = ['#722F37', '#F59E0B', '#3B82F6', '#10B981'];

  const handleAddOrUpdateProduct = () => {
    console.log("handleAddOrUpdateProduct called");

    if (!isFormValid) {
      console.log("Form is not valid!");
      setFormError("Please fill in all fields and upload exactly 3 images.");
      return;
    }

    setFormError(null); // Clear previous error

    const imageUrls = newImages.map(file => URL.createObjectURL(file));

    if (editingProduct) {
      console.log("Editing product", editingProduct);
      setProducts(products.map(product =>
        product.id === editingProduct.id
          ? {
              ...product,
              name: newProduct.name,
              price: newProduct.price,
              description: newDescription,
              quantity: Number(newQuantity),
              category: newProduct.category,
              images: imageUrls
            }
          : product
      ));
      setEditingProduct(null);
    } else {
      console.log("Adding new product");
      setProducts([...products, {
        id: products.length + 1,
        name: newProduct.name,
        price: newProduct.price,
        description: newDescription,
        quantity: Number(newQuantity),
        category: newProduct.category,
        images: imageUrls
      }]);
    }

    // Reset form
    setNewProduct({ name: '', price: 0, images: [], category: '' });
    setNewDescription('');
    setNewQuantity('');
    setNewImages([]);
  };

  const handleDeleteProduct = (id: number) => {
    setProducts(products.filter(product => product.id !== id));
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setNewProduct({ name: product.name, price: product.price, images: product.images, category: product.category });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length === 3) {
      setNewImages(Array.from(files));
    } else {
      alert("Please upload exactly 3 images.");
    }
  };

  const getImageUrls = () => {
    return newImages.map((file) => URL.createObjectURL(file));
  };

  const isFormValid = 
    newProduct.name &&
    newDescription &&
    newProduct.price > 0 &&
    newQuantity &&
    newProduct.category &&
    newImages.length === 3;

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <header className="bg-wine shadow-md" style={{ backgroundColor: '#722F37' }}>
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 cursor-pointer" onClick={() => navigate('/vendor-dashboard')}>
              <img src="/src/assets/dwa-icon.jpg" alt="DWA Logo" className="h-10 w-10 object-cover rounded-full" />
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
        {/* Sales Trends and Category Distribution (charts) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold mb-4 text-wine">Sales Trends</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={salesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="sales" stroke="#722F37" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold mb-4 text-wine">Category Distribution</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={categoryData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Product Form */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-xl font-bold mb-4 text-wine">{editingProduct ? 'Edit Product' : 'Add New Product'}</h2>
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
                <option value="Fashion">Fashion</option>
                <option value="Electronics">Electronics</option>
                <option value="Services">Services</option>
                <option value="Books">Books</option>
              </select>
            </div>
            <div className="mt-4">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                className="p-2 border rounded focus:ring-2 focus:ring-wine w-full"
              />
              {newImages.length > 0 && (
                <div className="mt-4 flex gap-4">
                  {newImages.map((file, index) => (
                    <img
                      key={index}
                      src={URL.createObjectURL(file)}
                      alt={`Product Preview ${index + 1}`}
                      className="w-32 h-32 object-cover rounded"
                    />
                  ))}
                </div>
              )}
            </div>
            {formError && <p className="text-red-500">{formError}</p>}
            <button
              onClick={handleAddOrUpdateProduct}
              className="bg-yellow-400 text-black py-2 rounded font-bold hover:bg-yellow-500 w-full mt-4"
              disabled={!isFormValid}
            >
              {editingProduct ? 'Update Product' : 'Add Product'}
            </button>
          </div>
        </div>

        {/* Product Listing */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {products.filter(product =>
            product.name.toLowerCase().includes(searchQuery.toLowerCase())
          ).map((product) => (
            <div key={product.id} className="bg-white p-4 border rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <div className="flex gap-2 mb-4">
                {product.images.map((image, index) => (
                  <img
                    key={index}
                    src={image}
                    alt={`Product ${index + 1}`}
                    className="w-20 h-20 object-cover rounded"
                  />
                ))}
              </div>
              <h3 className="text-lg font-semibold text-wine">{product.name}</h3>
              <p className="text-sm text-gray-500 mb-2">{product.category}</p>
              <p className="text-sm text-gray-700">{product.description}</p>
              <div className="flex justify-between items-center mt-4">
                <p className="text-xl font-bold text-green-500">GH₵ {product.price}</p>
                <div className="flex gap-4">
                  <button onClick={() => handleEditProduct(product)} className="text-blue-500 hover:underline">Edit</button>
                  <button onClick={() => handleDeleteProduct(product.id)} className="text-red-500 hover:underline">Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default VendorDashboard;
