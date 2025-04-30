import {
	BrowserRouter as Router,
	Routes,
	Route,
	Navigate,
	useNavigate,
} from "react-router-dom";
import Signup from "./pages/signup";
import Signin from "./pages/signin";
import LandingPage from "./pages/landing";
import VendorDashboard from "./pages/VendorDashboard";
import CheckoutPayment from "./pages/CheckoutPayment";
import OrdersPage from "./pages/OrdersPage";
import SalesAndEarningsPage from "./pages/SalesAndEarningsPage";
import InventoryManagementPage from "./pages/InventoryManagementPage";
import UserProfilePage from "./pages/UserProfilePage";
import AdminDashboard from "./pages/AdminDashboard";
import AdminUsersPage from "./pages/AdminUsersPage";
import ManageOrdersPage from "./pages/ManageOrdersPage";
import ManageProductsPage from "./pages/ManageProductPage";

import "./App.css";
import { useEffect } from "react";
import { ping } from "./pages/utils/api";
import { useAuthErrorHandler } from "./pages/utils/hooks";

// Header Component

// AppContent component to use useLocation hook (required for conditional rendering)
const AppContent = () => {
	useEffect(() => {
		ping()
			.then((data) => console.log(data))
			.catch((e) => console.error({ e }));
	}, []);

	useAuthErrorHandler();

	return (
		<div className="app-container">
			<main className="content-area">
				<Routes>
					{/* Redirect from root to landing page */}
					<Route path="/" element={<Navigate to="/landing" replace />} />
					<Route path="/landing" element={<LandingPage />} />
					<Route path="/signup" element={<Signup />} />
					<Route path="/signin" element={<Signin />} />
					<Route path="/vendor-dashboard" element={<VendorDashboard />} />
					<Route path="/checkout-payment" element={<CheckoutPayment />} />
					<Route path="/orders" element={<OrdersPage />} />
					<Route
						path="/sales-and-earnings"
						element={<SalesAndEarningsPage />}
					/>
					<Route
						path="/inventory-management"
						element={<InventoryManagementPage />}
					/>
					<Route path="/user-profile" element={<UserProfilePage />} />
					<Route path="/admin-dashboard" element={<AdminDashboard />} />
					<Route path="/admin-users" element={<AdminUsersPage />} />
					<Route path="/admin-manage-orders" element={<ManageOrdersPage />} />
					<Route
						path="/admin-manage-products"
						element={<ManageProductsPage />}
					/>
					{/* Add more routes as needed */}
					{/* Fallback route for 404 Not Found */}
					{/* Add more routes as needed */}
					{/* Fallback route for 404 Not Found */}
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
