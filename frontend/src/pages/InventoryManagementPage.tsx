import React, { useState } from "react";

// Header Component
const Header = () => {
  return (
    <header className="bg-wine py-4 shadow-md flex justify-center" style={{ backgroundColor: '#722F37' }}>
      <h1 className="text-white text-2xl font-bold">Ashesi DWA</h1>
    </header>
  );
};

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  quantity: number;
  category: string;
  images: string[]; // Array of image URLs
}

const InventoryManagementPage = () => {
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
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Include the Header here */}
      <Header />

      <main className="flex-grow p-4">
        <h1 className="text-2xl font-semibold text-center mb-6">Inventory Management</h1>

        {/* Search Bar */}
        <div className="max-w-3xl mx-auto mb-6">
          <input
            className="p-2 border border-gray-300 rounded-md w-full"
            type="text"
            placeholder="Search for a product"
            value={searchQuery}
            onChange={handleSearch}
          />
        </div>

        {/* Add New Product Section */}
        <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-md p-4 mb-6">
          <h2 className="text-xl font-semibold mb-4">Add New Product</h2>
          <div>
            <input
              className="p-2 border border-gray-300 rounded-md mb-2 w-full"
              placeholder="Product Name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
            />
            <textarea
              className="p-2 border border-gray-300 rounded-md mb-2 w-full"
              placeholder="Product Description"
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
            />
            <div className="flex gap-2">
              <input
                className="p-2 border border-gray-300 rounded-md w-1/2"
                type="number"
                placeholder="Price"
                value={newPrice}
                onChange={(e) => setNewPrice(e.target.value)}
              />
              <input
                className="p-2 border border-gray-300 rounded-md w-1/2"
                type="number"
                placeholder="Quantity"
                value={newQuantity}
                onChange={(e) => setNewQuantity(e.target.value)}
              />
            </div>
            <div className="mb-4">
              <select
                className="p-2 border border-gray-300 rounded-md w-full"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
              >
                <option value="" disabled>Select Category</option>
                <option value="Books">Books</option>
                <option value="Fashion">Fashion</option>
                <option value="Food">Food</option>
                <option value="Electronics">Electronics</option>
              </select>
            </div>
            <div className="mb-4">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                className="p-2 border border-gray-300 rounded-md w-full"
              />
              {newImages && newImages.length > 0 && (
                <div className="mt-4 flex gap-4">
                  {Array.from(newImages).map((file, index) => (
                    <img
                      key={index}
                      src={URL.createObjectURL(file)}
                      alt={`Product Preview ${index + 1}`}
                      className="w-32 h-32 object-cover"
                    />
                  ))}
                </div>
              )}
            </div>
            <button
              onClick={addProduct}
              className="bg-yellow-500 text-black py-2 px-4 rounded mt-4 w-full hover:bg-yellow-400"
              disabled={!isFormValid}
            >
              Add Product
            </button>
          </div>
        </div>

        {/* Inventory List Section */}
        <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-md p-4 space-y-4">
          {filteredProducts.map((product) => (
            <div key={product.id} className="flex items-center gap-4 border-b pb-3">
              <div className="w-1/4 flex gap-2">
                {product.images.map((image, index) => (
                  <img
                    key={index}
                    src={image}
                    alt={`Product ${index + 1}`}
                    className="w-32 h-32 object-cover"
                  />
                ))}
              </div>
              <div className="w-full">
                <h3 className="font-semibold">{product.name}</h3>
                <p>Description: {product.description}</p>
                <p>Price: GH₵{product.price.toFixed(2)}</p>
                <p>Quantity: {product.quantity}</p>
                <p>Category: {product.category}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => updateProduct(product.id, { quantity: product.quantity + 1 })}
                  className="bg-wine text-white py-1 px-2 rounded hover:bg-wine-dark"
                  style={{ backgroundColor: '#722F37' }}
                >
                  Increase Quantity
                </button>
                <button
                  onClick={() => updateProduct(product.id, { quantity: product.quantity - 1 })}
                  className="bg-wine text-white py-1 px-2 rounded hover:bg-wine-dark"
                  style={{ backgroundColor: '#722F37' }}
                >
                  Decrease Quantity
                </button>
                <button
                  onClick={() => deleteProduct(product.id)}
                  className="bg-black text-white py-1 px-2 rounded hover:bg-gray-800"
                >
                  Delete
                </button>
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
