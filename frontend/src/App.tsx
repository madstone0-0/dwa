import { BrowserRouter as Router, Routes, Route, useNavigate } from "react-router-dom";
import { SnackbarProvider } from "notistack";

import "./App.css";
import { useEffect } from "react";
import { health } from "./pages/utils/api";
import Vendor from "./pages/Vendor";
import Footer from "./pages/Footer";
import Auth from "./pages/Auth";
import Buyer from "./pages/Buyer";
import ShopByCat from "./pages/ShopByCat";

// Header Component

// AppContent component to use useLocation hook (required for conditional rendering)
const AppContent = () => {
    const nav = useNavigate();
    useEffect(() => {
        health()
            .then((data) => console.log(data))
            .catch((e) => console.error({ e }));
        nav("/auth/signin");
    }, []);

    return (
        <div className="app-container">
            <main className="content-area">
                <Routes>
                    <Route path="auth/*" element={<Auth />} />
                    <Route path="vendor/*" element={<Vendor />} />
                    <Route path="buyer/*" element={<Buyer />} />
                    <Route path="shop-by-category" element={<ShopByCat />} />
                </Routes>
                <Footer />
            </main>
        </div>
    );
};
function App() {
    return (
        <Router>
            <SnackbarProvider maxSnack={4}>
                <AppContent />
            </SnackbarProvider>
        </Router>
    );
}

export default App;
