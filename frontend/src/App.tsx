import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Signup from './pages/signup';
import Signin from './pages/signin';
import LandingPage from './pages/landing';
import VendorDashboard from './pages/VendorDashboard';
import CheckoutPayment from './pages/CheckoutPayment';
import CartPage from './pages/CartPage';
import ItemPage from './pages/ItemPage';
import OrdersPage from './pages/OrdersPage';
import SalesAndEarningsPage from './pages/SalesAndEarningsPage';
import InventoryManagementPage from './pages/InventoryManagementPage';
import UserProfilePage from './pages/UserProfilePage';
import AdminDashboard from './pages/AdminDashboard';
import AdminUsersPage from './pages/AdminUsersPage';


import { useState } from 'react';
import './App.css';

function App() {
  const [count, setCount] = useState(0);

  return (
    <Router>
      <nav>
        <Link to="/">Home</Link> | <Link to="/signup">Signup</Link> | <Link to="/signin">Signin</Link> | <Link to="/landing">Landing</Link> | <Link to="/vendor-dashboard">Vendor Dashboard</Link> | <Link to="/checkout-payment">Checkout Payment</Link>| <Link to="/cart">Cart</Link>| <Link to="/item">Item</Link>| <Link to="/orders">Orders</Link>|<Link to="/sales-and-earnings">Sales and Earnings</Link>| <Link to="/inventory-management">Inventory Management</Link>| <Link to="/user-profile">User Profile</Link>| <Link to="/admin-dashboard">Admin Dashboard</Link>| <Link to="/admin/users">Admin Users</Link>
      </nav>

      <Routes>
        <Route path="/" element={
          <>
            <h1>Vite + React</h1>
            <button onClick={() => setCount(count + 1)}>count is {count}</button>
          </>
        } />
        <Route path="/signup" element={<Signup />} />
        <Route path="/signin" element={<Signin />} />
        <Route path="/landing" element={<LandingPage />} />
        <Route path="/vendor-dashboard" element={<VendorDashboard />} />
        <Route path = "/checkout-payment" element={<CheckoutPayment />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path = "/item" element={<ItemPage />} />
        <Route path = "/orders" element={<OrdersPage />} />
        <Route path = "/sales-and-earnings" element={<SalesAndEarningsPage />} />
        <Route path = "/inventory-management" element={<InventoryManagementPage />} />
        <Route path = "/user-profile" element={<UserProfilePage />} />
        <Route path = "/admin-dashboard" element={<AdminDashboard />} />
        <Route path = "/admin/users" element={<AdminUsersPage />} />
      </Routes>
    </Router>
  );
}

export default App;
