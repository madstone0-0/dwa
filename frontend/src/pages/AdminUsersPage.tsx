import React, { useState } from "react";
import { useNavigate } from 'react-router-dom';

type User = {
  id: number;
  name: string;
  email: string;
  type: string;
};

const sampleUsers: User[] = [
  { id: 1, name: "John Doe", email: "john@example.com", type: "Vendor" },
  { id: 2, name: "Jane Smith", email: "jane@example.com", type: "Buyer" },
  { id: 3, name: "Alice Johnson", email: "alice@example.com", type: "Vendor" },
];

const AdminUsersPage = () => {
  const [users, setUsers] = useState<User[]>(sampleUsers);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    type: "Buyer", // default selected type
  });
  const navigate = useNavigate();
  const handleDeleteUser = (userId: number) => {
    setUsers(users.filter((user) => user.id !== userId));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAddUser = () => {
    const { name, email, password, type } = formData;

    // Simple validation
    if (!name.trim() || !email.trim() || !password.trim() || !type.trim()) {
      alert("All fields are required.");
      return;
    }

    const newUser: User = {
      id: users.length + 1,
      name,
      email,
      type,
    };

    setUsers([...users, newUser]);
    setFormData({ name: "", email: "", password: "", type: "Buyer" });
    setShowForm(false);
  }; 

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-wine py-4 shadow-md px-6 flex justify-between items-center" style={{ backgroundColor: "#722F37" }}>
      <div className="flex items-center space-x-3">
          <a href="admin-dashboard" className="focus:outline-none">
            <img 
              src="/src/assets/dwa-icon.jpg" 
              alt="DWA Logo" 
              className="h-10 w-10 object-cover rounded-full"
            />
            </a>
            <h1 className="text-white text-2xl font-bold">Ashesi DWA - Manage All Users</h1>
          </div>

        <div className="flex gap-2">
          <button
            onClick={() => navigate('/admin-users')}
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


      <main className="p-6">
        {showForm && (
          <div className="bg-white rounded shadow-md p-6 mb-6 max-w-md">
            <h3 className="text-lg font-semibold mb-4">Add New User</h3>
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              value={formData.name}
              onChange={handleInputChange}
              className="w-full mb-3 p-2 border border-gray-300 rounded"
            />
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full mb-3 p-2 border border-gray-300 rounded"
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleInputChange}
              className="w-full mb-3 p-2 border border-gray-300 rounded"
            />
            <select
              name="type"
              value={formData.type}
              onChange={handleInputChange}
              className="w-full mb-4 p-2 border border-gray-300 rounded"
            >
              <option value="Buyer">Buyer</option>
              <option value="Vendor">Vendor</option>
            </select>
            <button
              onClick={handleAddUser}
              className="bg-green-600 text-white py-2 px-4 rounded hover:bg-green-500"
            >
              Submit
            </button>
          </div>
        )}

        <h2 className="text-2xl font-semibold mb-6">Users List</h2>
        <table className="min-w-full bg-white rounded-lg shadow-md">
          <thead>
            <tr className="bg-black text-white">
              <th className="p-4">Name</th>
              <th className="p-4">Email</th>
              <th className="p-4">User Type</th>
              <th className="p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-b">
                <td className="p-4">{user.name}</td>
                <td className="p-4">{user.email}</td>
                <td className="p-4">{user.type}</td>
                <td className="p-4">
                  <button
                    onClick={() => handleDeleteUser(user.id)}
                    className="bg-red-500 text-white py-2 px-4 rounded hover:bg-red-400"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </main>

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

export default AdminUsersPage;
