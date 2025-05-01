import React, { useEffect, useLayoutEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "./utils/api";
import useStore from "./store";
import { useSnackbar } from "notistack";
import { resolveError } from "./utils";
import { USER_TYPE } from "./types";

function Signin() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();
    const setUser = useStore((state) => state.setUser);
    const { enqueueSnackbar } = useSnackbar();
    const user = useStore((state) => state.user);

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

    useEffect(() => {
        if (user.uid !== "") {
            enqueueSnackbar("Already logged in, navigating to home", { variant: "success" });
            console.log({ user });
            navToHome(user.user_type);
        }
    }, []);

    const handleSignin = async (e: React.FormEvent) => {
        e.preventDefault();
        console.log("Request payload:", { email, password });

        setError("");
        try {
            // Send login request
            const response = await login({ email, password });

            console.log("User logged in successfully:", response);

            // Save the user data to localStorage
            const userData = response;
            setUser(userData);

            // Save token directly for easier access
            if (userData.token) {
                localStorage.setItem("token", userData.token.trim().replace(/\s/g, ""));
            }

            enqueueSnackbar("Login successful", { variant: "success" });
            navToHome(userData.user_type);
        } catch (error) {
            const err = resolveError(error);
            if (err.response?.data.err) {
                enqueueSnackbar(err.response.data.err, { variant: "error" });
            }
            console.error("Signin error:", error);
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
                    <h2 className="mb-4 text-2xl font-bold text-center text-white">Sign In</h2>
                    {error && <p className="p-2 mb-4 text-black bg-yellow-300 rounded">{error}</p>}
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
