import { Route, Routes } from "react-router-dom";
import VendorDashboard from "./VendorDashboard";
import SalesAndEarningsPage from "./SalesAndEarningsPage";
import InventoryManagementPage from "./InventoryManagementPage";
import UserProfilePage from "./UserProfilePage";
import { HeaderItem } from "./types";
import Header from "./Header";
import { useAuthErrorHandler } from "./utils/hooks";
import Profile from "./svgs/Profile";
// This component is the main entry point for the vendor dashboard. It sets up the header and routes for the vendor pages.
// It imports various components and hooks to manage the vendor's dashboard, sales, inventory, and profile pages.
const Vendor = () => {
    // This hook is used to handle authentication errors. It will redirect the user to the login page if they are not authenticated.
    useAuthErrorHandler();
    // This hook is used to navigate between different pages in the application.
    const vendorHeaderItems: HeaderItem[] = [
        {
            name: "Inventory",
            link: "/vendor/inventory",
            icon: () => (
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-6 h-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                    />
                </svg>
            ),
        },
        {
            name: "Earnings",
            link: "/vendor/sales",
            icon: () => (
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-6 h-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                </svg>
            ),
        },
        {
            name: "Profile",
            link: "/vendor/profile",
            icon: Profile,
        },
    ];
    return (
        // This component is the main entry point for the vendor dashboard. It sets up the header and routes for the vendor pages.
        // It imports various components and hooks to manage the vendor's dashboard, sales, inventory, and profile pages.
        <>
            <Header pageTitle="Vendor Dashboard" homeLink="/vendor" items={vendorHeaderItems} />
            <Routes>
                <Route index element={<VendorDashboard />} />
                <Route path="sales" element={<SalesAndEarningsPage />} />
                <Route path="inventory" element={<InventoryManagementPage />} />
                <Route path="profile" element={<UserProfilePage />} />
            </Routes>
        </>
    );
};

export default Vendor;
