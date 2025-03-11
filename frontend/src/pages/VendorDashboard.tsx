import React, { useState } from 'react';

interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
}

const VendorDashboard: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [newProduct, setNewProduct] = useState({ name: '', price: '', image: '' });

  const handleAddProduct = () => {
    if (!newProduct.name || !newProduct.price || !newProduct.image) return;
    setProducts([...products, { 
      id: products.length + 1, 
      name: newProduct.name, 
      price: parseFloat(newProduct.price), 
      image: newProduct.image 
    }]);
    setNewProduct({ name: '', price: '', image: '' });
  };

  const handleDeleteProduct = (id: number) => {
    setProducts(products.filter(product => product.id !== id));
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Vendor Dashboard</h1>

      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-xl font-bold mb-4">Add Product</h2>
        <div className="flex space-x-4">
          <input 
            type="text" 
            placeholder="Product Name" 
            value={newProduct.name} 
            onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })} 
            className="p-2 border rounded" 
          />
          <input 
            type="number" 
            placeholder="Price" 
            value={newProduct.price} 
            onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })} 
            className="p-2 border rounded" 
          />
          <input 
            type="text" 
            placeholder="Image URL" 
            value={newProduct.image} 
            onChange={(e) => setNewProduct({ ...newProduct, image: e.target.value })} 
            className="p-2 border rounded" 
          />
          <button 
            onClick={handleAddProduct} 
            className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600">
            Add
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {products.map((product) => (
          <div key={product.id} className="bg-white p-4 border rounded-lg shadow-md">
            <img src={product.image} alt={product.name} className="w-full h-40 object-cover mb-2" />
            <h3 className="text-lg font-bold">{product.name}</h3>
            <p className="text-gray-600">${product.price.toFixed(2)}</p>
            <button 
              onClick={() => handleDeleteProduct(product.id)}
              className="mt-2 bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600">
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default VendorDashboard;
