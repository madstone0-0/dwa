import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
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

import './App.css';

// Header Component
const Header = () => {
  return (
    <header className="bg-wine py-4 shadow-md flex justify-center" style={{ backgroundColor: '#722F37' }}>
      <h1 className="text-white text-2xl font-bold">Ashesi DWA</h1>
    </header>
  );
};

// AppContent component to use useLocation hook (required for conditional rendering)
const AppContent = () => {
  const location = useLocation();
  
  // Don't show the global header on the landing page
  const showHeader = location.pathname !== '/landing' && location.pathname !== '/';
  
  return (
    <div className="app-container">
      {showHeader && <Header />}
      <main className="content-area">
        <Routes>
          {/* Redirect from root to landing page */}
          <Route path="/" element={<Navigate to="/landing" replace />} />
          <Route path="/landing" element={<LandingPage />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/signin" element={<Signin />} />
          <Route path="/vendor-dashboard" element={<VendorDashboard />} />
          <Route path="/checkout-payment" element={<CheckoutPayment />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/item" element={<ItemPage />} />
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="/sales-and-earnings" element={<SalesAndEarningsPage />} />
          <Route path="/inventory-management" element={<InventoryManagementPage />} />
          <Route path="/user-profile" element={<UserProfilePage />} />
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<AdminUsersPage />} />
        </Routes>
      </main>
    </div>
  );
};

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;