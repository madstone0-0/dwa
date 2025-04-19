import React, { useState } from "react";

// Sample user data with user type (vendor or buyer)
const sampleUsers = [
  { id: 1, name: "John Doe", email: "john@example.com", type: "Vendor" },
  { id: 2, name: "Jane Smith", email: "jane@example.com", type: "Buyer" },
  { id: 3, name: "Alice Johnson", email: "alice@example.com", type: "Vendor" },
];

const AdminUsersPage = () => {
  const [users, setUsers] = useState(sampleUsers);

  const handleDeleteUser = (userId: number) => {
    const updatedUsers = users.filter(user => user.id !== userId);
    setUsers(updatedUsers);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header with wine background */}
      <header className="bg-wine py-4 shadow-md flex justify-between items-center" style={{ backgroundColor: '#722F37' }}>
        <h1 className="text-white text-2xl font-bold">Manage Users</h1>
      </header>

      <main className="p-6">
        <h2 className="text-2xl font-semibold mb-6">Users List</h2>

        <table className="min-w-full bg-white rounded-lg shadow-md">
          <thead>
            <tr className="bg-black text-white"> {/* Table header with black background */}
              <th className="p-4">Name</th>
              <th className="p-4">Email</th>
              <th className="p-4">User Type</th>
              <th className="p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id} className="border-b">
                <td className="p-4">{user.name}</td>
                <td className="p-4">{user.email}</td>
                <td className="p-4">{user.type}</td> {/* Display user type */}
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

      {/* Footer with wine background */}
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
