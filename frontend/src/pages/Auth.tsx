// Import necessary routing components from React Router
import { Route, Routes } from "react-router-dom";

// Import the Signin and Signup components
import Signin from "./signin";
import Signup from "./signup";

// This component renders a styled header for the authentication pages
const AuthHeader = () => (
    <header className="flex justify-center py-4 shadow-md bg-wine" style={{ backgroundColor: "#722F37" }}>
        <h1 className="text-2xl font-bold text-white">Ashesi DWA</h1>
    </header>
);

// The main Auth component that sets up routing for the signin and signup pages
const Auth = () => {
    return (
        <div>
            {/* Display the authentication header at the top */}
            <AuthHeader />

            {/* Define routes for signin and signup pages */}
            <Routes>
                {/* Route for the Signin page (default index route) */}
                <Route index path="signin" element={<Signin />} />

                {/* Route for the Signup page */}
                <Route path="signup" element={<Signup />} />
            </Routes>
        </div>
    );
};

// Export the Auth component to be used in the main app
export default Auth;
