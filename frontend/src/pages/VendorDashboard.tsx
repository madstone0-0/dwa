import React, { useState } from 'react';
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

  const [newDescription, setNewDescription] = useState<string>("");
  const [newQuantity, setNewQuantity] = useState<number | string>("");
  const [newImageUrl, setNewImageUrl] = useState<string>("");
  const [formError, setFormError] = useState<string | null>(null);

  const handleAddOrUpdateProduct = () => {
    console.log("handleAddOrUpdateProduct called");

    if (!isFormValid) {
      console.log("Form is not valid!");
      setFormError("Please fill in all fields and provide a valid image URL.");
      return;
    }

    setFormError(null); // Clear previous error

    // Adding a new product or updating an existing one
    if (editingProduct) {
      setProducts(products.map(product =>
        product.id === editingProduct.id
          ? {
              ...product,
              name: newProduct.name,
              price: newProduct.price,
              description: newDescription,
              quantity: Number(newQuantity),
              category: newProduct.category,
              images: [newImageUrl] // Add the image URL to the product
            }
          : product
      ));
      setEditingProduct(null);
    } else {
      setProducts([...products, {
        id: products.length + 1,
        name: newProduct.name,
        price: newProduct.price,
        description: newDescription,
        quantity: Number(newQuantity),
        category: newProduct.category,
        images: [newImageUrl] // Add the image URL to the new product
      }]);
    }

    // Reset form and feedback
    setNewProduct({ name: '', price: 0, images: [], category: '' });
    setNewDescription('');
    setNewQuantity('');
    setNewImageUrl('');
    
    // Redirect to the inventory page
    navigate('/inventory-management');
  };

  const isFormValid = 
    newProduct.name &&
    newDescription &&
    newProduct.price > 0 &&
    newQuantity &&
    newProduct.category &&
    newImageUrl.length > 0;

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <header className="bg-wine shadow-md" style={{ backgroundColor: '#722F37' }}>
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 cursor-pointer" onClick={() => navigate('/vendor-dashboard')}>
              <img src="/src/assets/dwa-icon.jpg" alt="DWA Logo" className="h-10 w-10 object-cover rounded-full" />
              <h1 className="text-white text-xl font-bold">Vendor Dashboard</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-grow p-8">
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
              onClick={handleAddOrUpdateProduct}
              className="bg-yellow-400 text-black py-2 rounded font-bold hover:bg-yellow-500 w-full mt-4"
              disabled={!isFormValid}
            >
              {editingProduct ? 'Update Product' : 'Add Product'}
            </button>
          </div>
        </div>

      </main>
    </div>
  );
};

export default VendorDashboard;
