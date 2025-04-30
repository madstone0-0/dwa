import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { fetch } from "./utils/Fetch";
import { getLocalStorage, setLocalStorage } from "./utils";
import { ResponseMsg, User } from "./types";

const userType = localStorage.getItem("user_type");
let dashboardLink = "/landing";
if (userType === "vendor") {
	dashboardLink = "/vendor-dashboard";
} else if (userType === "admin") {
	dashboardLink = "/admin-dashboard";
}

const UserProfilePage = () => {
	const navigate = useNavigate();

	const handleLogout = () => {
		localStorage.removeItem("user");
		localStorage.removeItem("user_type");
		localStorage.removeItem("token");
		navigate("/signin");
	};

	const isUserLoggedIn = Boolean(localStorage.getItem("user"));

	useEffect(() => {
		if (!isUserLoggedIn) navigate("/signin");
	}, [isUserLoggedIn, navigate]);

	// Load data from user data saved in local storage
	const userData = JSON.parse(localStorage.getItem("user") || "{}");
	console.log("userData", userData);
	const userId = userData.uid;
	const fullNameFromProfile =
		userType === "vendor"
			? userData.user_type?.vendor?.name || ""
			: userData.user_type?.buyer?.name || "";

	const emailFromProfile = userData.email;

	// State setup
	const [userName, setUserName] = useState<string>(fullNameFromProfile);
	const [userEmail] = useState<string>(emailFromProfile);
	const [newFullName, setNewFullName] = useState<string>("");
	const [logoUrl, setLogoUrl] = useState<string>(
		userData.user_types?.vendor?.logo || "",
	);

	const handleFullNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setNewFullName(e.target.value);
	};

	const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setLogoUrl(e.target.value);
	};

	const isFormValid = newFullName.trim().length > 0;

	const handleSubmit = async () => {
		if (!isFormValid) {
			alert("Please fill in all fields correctly.");
			return;
		}

		const user = getLocalStorage("user") as unknown as User;
		const token = user.token;
		const userType = user.user_type;

		const updatedProfile: any = {
			user: {
				user_type: userType,
				email: userEmail,
			},
			user_types: {},
		};

		if (userType === "vendor") {
			updatedProfile.user_types["vendor"] = {
				uid: userId,
				name: newFullName,
				logo: logoUrl,
			};
		} else if (userType === "buyer") {
			updatedProfile.user_types["buyer"] = {
				uid: userId,
				name: newFullName,
			};
		}

		try {
			const response = await fetch.put<ResponseMsg>(
				"auth/user/update",
				updatedProfile,
			);

			setLocalStorage("user", updatedProfile);
			setUserName(newFullName);
			alert("Profile updated successfully!");
			setNewFullName("");
		} catch (e) {
			console.error({ e });
			alert("Failed to update profile. Please try again.");
			return;
		}
	};

	const handleDeleteAccount = async () => {
		const confirmation = window.confirm(
			"Are you sure you want to delete your account? This action cannot be undone."
		);
	
		if (confirmation) {
			try {
				const token = userData.token;
				const userId = userData.uid; 
	
				await fetch.delete(
					`/auth/user/delete/${userId}`, 
					{
						headers: {
							Authorization: `Bearer ${token}`,
						},
					}
				);
	
				alert("Your account has been deleted.");
				localStorage.removeItem("user");
				localStorage.removeItem("user_type");
				localStorage.removeItem("token");
				navigate("/signin");
			} catch (error) {
				console.error("Error deleting account:", error);
				alert("Something went wrong while deleting your account.");
			}
		}
	};
	

	return (
		<div className="flex flex-col min-h-screen bg-gray-100">
			<header
				className="py-4 shadow-md bg-wine"
				style={{ backgroundColor: "#722F37" }}
			>
				<div className="container flex justify-between items-center px-4 mx-auto">
					<div className="flex items-center space-x-3">
						<a href={dashboardLink}>
							<img
								src="/src/assets/dwa-icon.jpg"
								alt="DWA Logo"
								className="object-cover w-10 h-10 rounded-full"
							/>
						</a>
						<h1 className="text-2xl font-bold text-white">
							Ashesi DWA - Profile
						</h1>
					</div>
					<button
						onClick={handleLogout}
						className="flex flex-col items-center text-white transition-colors hover:text-yellow-400"
					>
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
								d="M17 16l4-4m0 0l-4-4m4 4H7"
							/>
						</svg>
						<span className="mt-1 text-xs">Logout</span>
					</button>
				</div>
			</header>

			<main className="flex-grow p-4">
				<h1 className="mb-6 text-2xl font-semibold text-center">
					User Profile
				</h1>

				<div className="p-6 mx-auto max-w-3xl bg-white rounded-xl shadow-md">
					<h2 className="mb-4 text-xl font-semibold">Edit Profile</h2>

					<div className="mb-4">
						<label className="block text-sm font-medium text-gray-700">
							Full Name
						</label>
						<input
							type="text"
							value={newFullName || userName}
							onChange={handleFullNameChange}
							className="p-2 mt-1 w-full rounded-md border border-gray-300"
							placeholder="Enter your full name"
						/>
					</div>

					<div className="mb-4">
						<label className="block text-sm font-medium text-gray-700">
							Email
						</label>
						<input
							type="email"
							value={userEmail}
							readOnly
							className="p-2 mt-1 w-full bg-gray-100 rounded-md border border-gray-300 cursor-not-allowed"
						/>
					</div>

					{userType === "vendor" && (
						<div className="mb-4">
							<label className="block text-sm font-medium text-gray-700">
								Logo URL
							</label>
							<input
								type="text"
								value={logoUrl}
								onChange={handleLogoChange}
								className="p-2 mt-1 w-full rounded-md border border-gray-300"
								placeholder="Enter logo image URL"
							/>
							{logoUrl && (
								<img
									src={logoUrl}
									alt="Logo Preview"
									className="object-cover mt-2 w-20 h-20 rounded-full"
								/>
							)}
						</div>
					)}

					<button
						onClick={handleSubmit}
						className="py-2 px-4 w-full text-black bg-yellow-500 rounded hover:bg-yellow-400"
						disabled={!isFormValid}
					>
						Update Profile
					</button>
				</div>

				<div className="p-6 mx-auto mt-6 max-w-3xl text-center bg-white rounded-xl shadow-md">
					<h2 className="mb-4 text-xl font-semibold text-red-600">
						Delete Account
					</h2>
					<p className="mb-6 text-sm text-gray-600">
						Once you delete your account, all of your data will be lost
						permanently. Please proceed with caution.
					</p>
					<button
						onClick={handleDeleteAccount}
						className="py-2 px-4 w-full text-white bg-red-500 rounded hover:bg-red-400"
					>
						Delete Account
					</button>
				</div>
			</main>

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
};

export default UserProfilePage;
