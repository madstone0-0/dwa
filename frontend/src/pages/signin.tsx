import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "./utils/api";

function Signin() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");
	const navigate = useNavigate();

	
const handleSignin = async (e: React.FormEvent) => {
	e.preventDefault();
	console.log("Request payload:", { email, password });
  
	// Validation code unchanged...
  
	setError("");
	try {
	  // Send login request
	  const response = await login({ email, password });
  
	  console.log("User logged in successfully:", response);
  
	  // Save the user data to localStorage
	  const userData = response;
	  localStorage.setItem("user", JSON.stringify(userData));
	  localStorage.setItem("userType", userData.user_type); // Changed from user_type to userType for consistency
  
	  // Save token directly for easier access
	  if (userData.token) {
		localStorage.setItem("token", userData.token.trim().replace(/\s/g, ""));
	  }
  
	  // Save bid or vid based on user_type
	  if (userData.user_type === "buyer") {
		localStorage.setItem("bid", userData.uid); // Save Buyer ID
	  } else if (userData.user_type === "vendor") {
		localStorage.setItem("vid", userData.uid); // Save Vendor ID
	  }
  
	  // Navigate based on user type
	  if (userData.user_type === "vendor") {
		navigate("/vendor-dashboard");
	  } else if (userData.user_type === "buyer") {
		navigate("/landing");
	  } else if (userData.user_type === "admin") {
		navigate("/admin-dashboard");
	  } else {
		setError("Unknown user type.");
	  }
  
	  // Clear error
	  setError("");
	} catch (error) {
	  console.error("Signin error:", error);
	  setError("An error occurred while signing in.");
	}
  };

	return (
		<div className="flex flex-col min-h-screen bg-white">
			{/* Header Section */}
			<header
				className="flex justify-center py-4 shadow-md bg-wine"
				style={{ backgroundColor: "#722F37" }}
			>
				<h1 className="text-2xl font-bold text-white">Ashesi DWA</h1>
			</header>

			{/* Main Content */}
			<div className="flex flex-grow justify-center items-center py-10">
				<div
					className="p-8 w-96 rounded-lg border border-gray-300 shadow-lg bg-wine"
					style={{ backgroundColor: "#722F37" }}
				>
					<h2 className="mb-4 text-2xl font-bold text-center text-white">
						Sign In
					</h2>
					{error && (
						<p className="p-2 mb-4 text-black bg-yellow-300 rounded">{error}</p>
					)}
					<form onSubmit={handleSignin} className="flex flex-col">
						<label className="mb-1 text-sm font-bold text-white">Email</label>
						<input
							type="email"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							required
							className="p-2 mb-4 w-full rounded border focus:ring-2 focus:ring-yellow-500 focus:outline-none"
						/>
						<label className="mb-1 text-sm font-bold text-white">
							Password
						</label>
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
					<p className="mt-4 text-sm text-center text-white">
						<span
							className="text-yellow-300 cursor-pointer hover:underline"
							onClick={() => navigate("/forgot-password")}
						>
							Forgot your password?
						</span>
					</p>
					<hr className="my-4 border-yellow-300" />
					<p className="text-sm text-center text-white">New to Ashesi DWA?</p>
					<button
						className="py-2 mt-2 w-full font-bold text-white bg-black rounded hover:bg-gray-800"
						onClick={() => navigate("/signup")}
					>
						Create your Ashesi DWA account
					</button>
				</div>
			</div>

			{/* Footer Section */}
			<footer
				className="py-5 text-xs text-center text-white border-t border-gray-300 bg-wine"
				style={{ backgroundColor: "#722F37" }}
			>
				<p className="mb-1">
					<span className="text-yellow-400 cursor-pointer hover:underline">
						Terms of Service
					</span>{" "}
					&nbsp; | &nbsp;
					<span className="text-yellow-400 cursor-pointer hover:underline">
						Privacy Policy
					</span>{" "}
					&nbsp; | &nbsp;
					<span className="text-yellow-400 cursor-pointer hover:underline">
						Help
					</span>
				</p>
				<p>
					&copy; {new Date().getFullYear()} Ashesi DWA, Inc. All rights
					reserved.
				</p>
			</footer>
		</div>
	);
}

export default Signin;
