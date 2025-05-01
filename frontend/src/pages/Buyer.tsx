import { Route, Routes } from "react-router-dom";
import Profile from "./svgs/Profile";
import CheckoutPayment from "./CheckoutPayment";
import ItemPage from "./ItemPage";
import LandingPage from "./landing";
import { HeaderItem } from "./types";
import Header from "./Header";
import UserProfilePage from "./UserProfilePage";


const Buyer = () => {
    const headerItems: HeaderItem[] = [
        {
            name: "Profile",
            link: "/buyer/profile",
            icon: Profile,
        },
        {
            name: "Cart",
            link: "/buyer/checkout",
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
                        d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                </svg>
            ),
        },
    ];

    return (
        <>
            <Header homeLink="/buyer" items={headerItems} />
            <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="profile" element={<UserProfilePage />} />
                <Route path="checkout" element={<CheckoutPayment />} />
                <Route path="item/:iid" element={<ItemPage />} />
            </Routes>
        </>
    );
};

export default Buyer;
