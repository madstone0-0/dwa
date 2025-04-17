import React from "react";
import { Link } from "react-router-dom"; // Assuming you're using React Router for navigation

const AdminDashboard = () => {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <header className="bg-wine py-4 shadow-md flex justify-between items-center" style={{ backgroundColor: '#722F37' }}>
        <h1 className="text-white text-2xl font-bold">Admin Dashboard</h1>
        <Link to="/" className="text-white text-sm hover:underline">Logout</Link>
      </header>

      <main className="flex-grow p-6 flex flex-col items-center justify-start space-y-6">
        {/* Welcome Section */}
        <div className="text-center mb-12 mt-12">
          <h2 className="text-4xl font-semibold text-black">Welcome, Admin!</h2>
        </div>

        {/* Navigation Links Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 justify-items-center">
          <Link
            to="/admin/users"
            className="bg-yellow-500 text-black text-center py-4 px-6 rounded-lg shadow-md hover:bg-yellow-400 w-full md:w-auto"
          >
            <h3 className="text-xl font-semibold">Manage Users</h3>
            <p className="mt-2 text-sm">View and manage users in the system.</p>
          </Link>

          <Link
            to="/admin/orders"
            className="bg-yellow-500 text-black text-center py-4 px-6 rounded-lg shadow-md hover:bg-yellow-400 w-full md:w-auto"
          >
            <h3 className="text-xl font-semibold">Manage Orders</h3>
            <p className="mt-2 text-sm">View and manage orders placed by users.</p>
          </Link>
        </div>
      </main>

      {/* Footer Section */}
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

export default AdminDashboard;
