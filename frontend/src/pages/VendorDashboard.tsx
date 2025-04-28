import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { fetch } from "./utils/Fetch";
import { AxiosError } from "axios";
import { CATEGORIES, NewItem } from "./types";
import placeholder from "../assets/dwa-icon.jpg";

const VendorDashboard: React.FC = () => {
	const navigate = useNavigate();
	const [formData, setFormData] = useState<NewItem>({
		name: "",
		description: "",
		cost: 0,
		quantity: 0,
		category: CATEGORIES.FASHION,
		pictureurl: "",
	});
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [formError, setFormError] = useState<string | null>(null);

	const isUserLoggedIn = Boolean(localStorage.getItem("user"));

	useEffect(() => {
		if (!isUserLoggedIn) {
			navigate("/signin");
		}
	}, [isUserLoggedIn, navigate]);

	// Form validation
	const isFormValid =
		formData.name.trim() !== "" &&
		formData.description.trim() !== "" &&
		formData.cost > 0 &&
		formData.quantity > 0 &&
		formData.category &&
		formData.pictureurl.trim() !== "";

	// Handle input changes
	const handleInputChange = (
		e: React.ChangeEvent<
			HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
		>,
	) => {
		const { name, value } = e.target;

		setFormData((prev) => ({
			...prev,
			[name]: name === "cost" ? parseFloat(value) || 0 : value,
		}));
	};

	const handleAddProduct = async () => {
		// Check form validity again as a safety measure
		if (!isFormValid) {
			setFormError("Please fill in all fields correctly");
			return;
		}

		setIsLoading(true);
		setFormError(null);

		try {
			const userData = JSON.parse(localStorage.getItem("user") || "{}");
			const token = userData.token.trim().replace(/\s/g, "");

			if (!token) {
				setFormError("Authentication token is missing. Please log in again.");
				setIsLoading(false);
				return;
			}

			// Prepare data for API
			const productData = {
				vid: userData.uid,
				name: formData.name,
				pictureurl: formData.pictureurl,
				description: formData.description,
				cost: formData.cost,
				quantity: Number(formData.quantity),
				category: formData.category.toUpperCase(),
			};

			// Make API request
			const response = await fetch.post("/vendor/item/add", productData, {
				headers: {
					Authorization: `Bearer ${token}`,
					"Content-Type": "application/json",
				},
			});

			// Handle successful response
			console.log("Product added successfully:", response);

			// Reset form
			setFormData({
				name: "",
				description: "",
				cost: 0,
				quantity: 0,
				category: CATEGORIES.FASHION,
				pictureurl: "",
			});

			// Navigate to inventory management
			navigate("/inventory-management");
		} catch (error: unknown) {
			console.error("Error adding product:", error);

			if (error instanceof AxiosError && error.response) {
				setFormError(
					`Failed to add product: ${error.response.statusText || error.message}`,
				);
				console.error("Error details:", error.response.data);
			} else {
				setFormError(
					"Failed to add product. Please check your connection and try again.",
				);
			}
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="flex flex-col min-h-screen bg-gray-100">
			<header
				className="shadow-md bg-wine"
				style={{ backgroundColor: "#722F37" }}
			>
				<div className="container py-3 px-4 mx-auto">
					<div className="flex justify-between items-center">
						{/* Logo and Brand */}
						<div
							className="flex items-center space-x-3 cursor-pointer"
							onClick={() => navigate("/vendor-dashboard")}
						>
							<img
								src="/src/assets/dwa-icon.jpg"
								alt="DWA Logo"
								className="object-cover w-10 h-10 rounded-full"
							/>
							<h1 className="text-xl font-bold text-white">Vendor Dashboard</h1>
						</div>

						{/* Navigation Icons */}
						<div className="flex items-center space-x-6">
							<button
								onClick={() => navigate("/inventory-management")}
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
										d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
									/>
								</svg>
								<span className="mt-1 text-xs">Inventory</span>
							</button>
							{/* Earnings */}
							<button
								onClick={() => navigate("/sales-and-earnings")}
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
										d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
									/>
								</svg>
								<span className="mt-1 text-xs">Earnings</span>
							</button>

							{/* Orders */}
							<button
								onClick={() => navigate("/orders")}
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
										d="M9 17h6M9 13h6M9 9h6M5 3h14a2 2 0 012 2v16l-3-3H6l-3 3V5a2 2 0 012-2z"
									/>
								</svg>
								<span className="mt-1 text-xs">Orders</span>
							</button>

							{/* Profile */}
							<button
								onClick={() => navigate("/user-profile")}
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
										d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
									/>
								</svg>
								<span className="mt-1 text-xs">Profile</span>
							</button>
						</div>
					</div>
				</div>
			</header>

			<main className="flex-grow p-8">
				<div className="p-6 mb-8 bg-white rounded-lg shadow-md">
					<h2 className="mb-4 text-xl font-bold text-wine">Add New Product</h2>
					<div className="space-y-4">
						<div>
							<label
								htmlFor="name"
								className="block mb-1 text-sm font-medium text-gray-700"
							>
								Product Name
							</label>
							<input
								id="name"
								name="name"
								type="text"
								placeholder="Product Name"
								value={formData.name}
								onChange={handleInputChange}
								className="p-2 w-full rounded border focus:ring-2 focus:ring-wine"
							/>
						</div>

						<div>
							<label
								htmlFor="description"
								className="block mb-1 text-sm font-medium text-gray-700"
							>
								Product Description
							</label>
							<textarea
								id="description"
								name="description"
								placeholder="Product Description"
								value={formData.description}
								onChange={handleInputChange}
								className="p-2 w-full rounded border focus:ring-2 focus:ring-wine"
							/>
						</div>

						<div className="grid grid-cols-1 gap-4 md:grid-cols-3">
							<div>
								<label
									htmlFor="cost"
									className="block mb-1 text-sm font-medium text-gray-700"
								>
									cost (GH₵)
								</label>
								<input
									id="cost"
									name="cost"
									type="number"
									placeholder="Price (GH₵)"
									value={formData.cost}
									onChange={handleInputChange}
									className="p-2 w-full rounded border focus:ring-2 focus:ring-wine"
								/>
							</div>

							<div>
								<label
									htmlFor="quantity"
									className="block mb-1 text-sm font-medium text-gray-700"
								>
									Quantity
								</label>
								<input
									id="quantity"
									name="quantity"
									type="number"
									placeholder="Quantity"
									value={formData.quantity}
									onChange={handleInputChange}
									className="p-2 w-full rounded border focus:ring-2 focus:ring-wine"
								/>
							</div>

							<div>
								<label
									htmlFor="category"
									className="block mb-1 text-sm font-medium text-gray-700"
								>
									Category
								</label>
								<select
									id="category"
									name="category"
									value={formData.category}
									onChange={handleInputChange}
									className="p-2 w-full rounded border focus:ring-2 focus:ring-wine"
								>
									<option value="">Select Category</option>
									<option value="FASHION">Fashion</option>
									<option value="ELECTRONICS">Electronics</option>
									<option value="SERVICES">Services</option>
									<option value="BOOKS_SUPPLIES">Books&Supplies</option>
								</select>
							</div>
						</div>

						<div>
							<label
								htmlFor="pictureurl"
								className="block mb-1 text-sm font-medium text-gray-700"
							>
								Image URL
							</label>
							<input
								id="pictureurl"
								name="pictureurl"
								type="text"
								placeholder="Image URL"
								value={formData.pictureurl}
								onChange={handleInputChange}
								className="p-2 w-full rounded border focus:ring-2 focus:ring-wine"
							/>
							{formData.pictureurl && (
								<div className="flex gap-4 mt-4">
									<img
										src={`${formData.pictureurl}`}
										alt="Product Preview"
										className="object-cover w-32 h-32 rounded"
										onError={(e) => {
											(
												e as React.SyntheticEvent<HTMLImageElement, Event>
											).currentTarget.onerror = null;
											(e.target as HTMLImageElement).src = placeholder;
											(e.target as HTMLImageElement).alt = "Image load failed";
										}}
									/>
								</div>
							)}
						</div>

						{formError && (
							<div className="py-3 px-4 text-red-600 bg-red-50 rounded border border-red-200">
								{formError}
							</div>
						)}

						<button
							onClick={handleAddProduct}
							className="py-2 mt-4 w-full font-bold text-black bg-yellow-400 rounded hover:bg-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed"
							disabled={!isFormValid || isLoading}
						>
							{isLoading ? "Adding Product..." : "Add Product"}
						</button>
					</div>
				</div>
			</main>
		</div>
	);
};

export default VendorDashboard;
