import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetch } from "./utils/Fetch";
import { resolveError } from "./utils";
import { useSnackbar } from "notistack";
import { ResponseMsg } from "./types";
// This component is the signup page for the application. It allows users to create a new account by providing their name, email, password, and whether they want to sign up as a vendor.
function Signup() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isVendor, setIsVendor] = useState(false);
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [signupPartialSuccess, setSignupPartialSuccess] = useState(false);
    const navigate = useNavigate();
    const { enqueueSnackbar } = useSnackbar();
    // This hook is used to handle authentication errors. It will redirect the user to the login page if they are not authenticated.
    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setSignupPartialSuccess(false);

        // Validate all fields
        if (!name || !email || !password) {
            setError("All fields are required.");
            return;
        }

        // Validate Ashesi email format
        const emailPattern = /^[a-zA-Z0-9._%+-]+@ashesi\.edu\.gh$/;
        if (!emailPattern.test(email)) {
            setError("Please use a valid Ashesi email address.");
            return;
        }

        // Validate password length
        if (password.length < 6) {
            setError("Password must be at least 6 characters long.");
            return;
        }

        setIsLoading(true);

        try {
            const res = await fetch.post<ResponseMsg>("/auth/user/signup", {
                email: email.trim(),
                password: password,
                name: name.trim(),
                isVendor: isVendor,
            });

            console.log("Signup response:", res);
            enqueueSnackbar(res.msg, { variant: "success" });
            navigate("/auth/signin");
        } catch (error) {
            const err = resolveError(error);
            if (err.response?.data.data.err) {
                const msg = err.response.data.data.err;
                enqueueSnackbar(msg, { variant: "error" });
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-white">
            {/* Main Content */}
            <div className="flex flex-grow justify-center items-center py-10">
                <div
                    className="p-8 w-96 rounded-lg border border-gray-300 shadow-lg bg-wine"
                    style={{ backgroundColor: "#722F37" }}
                >
                    <h2 className="mb-4 text-2xl font-bold text-center text-white">Sign Up</h2>
                    {/* Error message for signup partial success or other errors */}
                    {signupPartialSuccess ? (
                        <div
                            className="p-4 mb-4 text-yellow-700 bg-yellow-100 border-l-4 border-yellow-500"
                            role="alert"
                        >
                            <p>{error}</p>
                            <button
                                onClick={() => navigate("/auth/signin")}
                                className="py-1 px-3 mt-2 text-sm text-white bg-yellow-500 rounded hover:bg-yellow-600"
                            >
                                Go to Sign In
                            </button>
                        </div>
                    ) : error ? (
                        <p className="p-2 mb-4 text-black bg-yellow-300 rounded">{error}</p>
                    ) : null}
                    {/* Signup form */}
                    <form onSubmit={handleSignup} className="flex flex-col">
                        <label className="mb-1 text-sm font-bold text-white">Full Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            className="p-2 mb-4 w-full rounded border focus:ring-2 focus:ring-yellow-500 focus:outline-none"
                        />
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
                        <div className="flex items-center mb-4">
                            <input
                                type="checkbox"
                                checked={isVendor}
                                onChange={(e) => setIsVendor(e.target.checked)}
                                className="mr-2"
                            />
                            <label className="text-sm text-white">Sign up as vendor</label>
                        </div>
                        {/* Submit button */}
                        <button
                            type="submit"
                            className="py-2 w-full font-bold text-black bg-yellow-400 rounded hover:bg-yellow-500 disabled:opacity-50"
                            disabled={isLoading}
                        >
                            {isLoading ? "Signing up..." : "Sign Up"}
                        </button>
                    </form>
                    <p className="mt-4 text-sm text-center text-white">
                        Already have an account?
                        <span
                            className="text-yellow-300 cursor-pointer hover:underline"
                            onClick={() => navigate("/auth/signin")}
                        >
                            {" "}
                            Sign in
                        </span>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default Signup;
