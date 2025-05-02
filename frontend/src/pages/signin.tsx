import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "./utils/api";
import useStore from "./store";
import { useSnackbar } from "notistack";
import { resolveError } from "./utils";
import { USER_TYPE } from "./types";

// This component handles the sign-in functionality
function Signin() {
    // State variables to store email, password, and any error messages
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    // React Router's hook to navigate to different pages
    const navigate = useNavigate();

    // Function from Zustand store to update the user info
    const setUser = useStore((state) => state.setUser);

    // Snackbar is used to show temporary popup messages
    const { enqueueSnackbar } = useSnackbar();

    // Get the current user from the store
    const user = useStore((state) => state.user);

    // This function decides which homepage to send the user to based on their type
    const navToHome = (userType: USER_TYPE) => {
        switch (userType) {
            case "vendor":
                navigate("/vendor");
                break;
            case "buyer":
                navigate("/buyer");
                break;
            default:
                enqueueSnackbar("Invalid user type", { variant: "error" });
                break;
        }
    };

    // If user is already logged in (uid is not empty), navigate to their home page
    useEffect(() => {
        if (user.uid !== "") {
            enqueueSnackbar("Already logged in, navigating to home", { variant: "success" });
            console.log({ user });
            navToHome(user.user_type);
        }
    }, []);

    // Handles what happens when the user submits the sign-in form
    const handleSignin = async (e: React.FormEvent) => {
        e.preventDefault(); // Prevent the page from reloading
        console.log("Request payload:", { email, password });

        setError(""); // Clear previous error messages
        try {
            // Try to log the user in using the API
            const response = await login({ email, password });
            console.log("User logged in successfully:", response);

            // Save user data to global state
            const userData = response;
            setUser(userData);

            // Save the token to localStorage for future API requests
            if (userData.token) {
                localStorage.setItem("token", userData.token.trim().replace(/\s/g, ""));
            }

            // Show success message and navigate to user-specific home
            enqueueSnackbar("Login successful", { variant: "success" });
            navToHome(userData.user_type);
        } catch (error) {
            // If something goes wrong, show the error message
            const err = resolveError(error);
            if (err.response?.data.err) {
                enqueueSnackbar(err.response.data.err, { variant: "error" });
            }
            console.error("Signin error:", error);
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-white">
            {/* Main section that centers the form on the screen */}
            <div className="flex flex-grow justify-center items-center py-10">
                <div
                    className="p-8 w-96 rounded-lg border border-gray-300 shadow-lg bg-wine"
                    style={{ backgroundColor: "#722F37" }}
                >
                    {/* Sign in form header */}
                    <h2 className="mb-4 text-2xl font-bold text-center text-white">Sign In</h2>

                    {/* Show error message if it exists */}
                    {error && <p className="p-2 mb-4 text-black bg-yellow-300 rounded">{error}</p>}

                    {/* Sign-in form */}
                    <form onSubmit={handleSignin} className="flex flex-col">
                        <label className="mb-1 text-sm font-bold text-white">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="p-2 mb-4 w-full rounded border focus:ring-2 focus:ring-yellow-500 focus:outline-none"
                        />
                        <label className="mb-1 text-sm font-bold text-white">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="p-2 mb-4 w-full rounded border focus:ring-2 focus:ring-yellow-500 focus:outline-none"
                        />
                        <button
                            type="submit"
                            className="py-2 w-full font-bold text-black bg-yellow-400 rounded hover:bg-yellow-500"
                        >
                            Sign In
                        </button>
                    </form>

                    {/* Divider and link to sign-up page */}
                    <hr className="my-4 border-yellow-300" />
                    <p className="text-sm text-center text-white">New to Ashesi DWA?</p>
                    <button
                        className="py-2 mt-2 w-full font-bold text-white bg-black rounded hover:bg-gray-800"
                        onClick={() => navigate("/auth/signup")}
                    >
                        Create your Ashesi DWA account
                    </button>
                </div>
            </div>
        </div>
    );
}

export default Signin;
