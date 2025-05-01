import { Route, Routes } from "react-router-dom";
import Signin from "./signin";
import Signup from "./signup";

const AuthHeader = () => (
    <header className="flex justify-center py-4 shadow-md bg-wine" style={{ backgroundColor: "#722F37" }}>
        <h1 className="text-2xl font-bold text-white">Ashesi DWA</h1>
    </header>
);

const Auth = () => {
    return (
        <div>
            <AuthHeader />
            <Routes>
                <Route index path="signin" element={<Signin />} />
                <Route path="signup" element={<Signup />} />
            </Routes>
        </div>
    );
};

export default Auth;
