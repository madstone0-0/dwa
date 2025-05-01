import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAllItems } from "./utils/api.js";
import { Item } from "./types";
import { fetch } from "./utils/Fetch"; 

interface SectionHeaderProps {
	title: string;
	linkText: string;
}

// CATEGORIES
const CATEGORIES = {
	FASHION: "Fashion",
	ELECTRONICS: "Electronics",
	SERVICES: "Services",
	BOOKS: "Books & Supplies",
};

function LandingPage() {
	const navigate = useNavigate();
	const handleLogout = () => {
		localStorage.removeItem("user");
		localStorage.removeItem("userType"); // Ensure consistency with signin.tsx
		localStorage.removeItem("token");
		localStorage.removeItem("cart"); // Add this line
		navigate("/signin");
	  };
	  
	const [items, setItems] = useState<Item[]>([]);
	const [cartItems, setCartItems] = useState<Item[]>([]);
	const [searchTerm, setSearchTerm] = useState("");
	const [filteredItems, setFilteredItems] = useState<any[]>([]);
	const isUserLoggedIn = Boolean(localStorage.getItem("user"));
	const userType = localStorage.getItem("user_type");
	
	useEffect(() => {
		if (!isUserLoggedIn && userType !== "buyer") {
			navigate("/signin");
		}
		getAllItems()
			.then((items) => setItems(items))
			.catch((e) => console.error({ e }));
	}, []);
	
	// Fetch cart data on initial load
	useEffect(() => {
		const fetchCart = async () => {
			try {
				const user = JSON.parse(localStorage.getItem("user") || "{}");
				if (!user.uid || !user.token) return;
				
				const response = await fetch.get(`buyer/cart/${user.uid}`, {
					headers: { Authorization: `Bearer ${user.token}` }
				});
		
				if (response.ok) {
					const serverCart = await response.json();
					localStorage.setItem("cart", JSON.stringify(serverCart));
					setCartItems(serverCart);
				}
			} catch (error) {
				console.error("Failed to fetch cart:", error);
				// Fallback to localStorage
				try {
					const localCart = JSON.parse(localStorage.getItem("cart") || "[]");
					setCartItems(localCart);
				} catch (e) {
					console.error("Error parsing local cart:", e);
					setCartItems([]);
				}
			}
		};
		
		if (isUserLoggedIn) fetchCart();
	}, [isUserLoggedIn]);

	const SectionHeader = ({ title, linkText }: SectionHeaderProps) => (
		<div className="flex justify-between items-center px-8 mb-4 w-full">
			<h2 className="text-2xl font-bold text-gray-900">{title}</h2>
			<button
				className="font-semibold text-wine hover:text-wine-dark"
				style={{ color: "#722F37" }}
			>
				{linkText}
			</button>
		</div>
	);

	const addToCart = async (item: Item) => {
		try {
		  const user = JSON.parse(localStorage.getItem("user") || "{}");
		  const { token, uid: buyerId } = user;
		
		  if (!token || !buyerId) {
			throw new Error("User not authenticated");
		  }
		  
		  // First, check if item already exists in cart
		  const cart = JSON.parse(localStorage.getItem("cart") || "[]");
		  const existingItem = Array.isArray(cart) ? 
			cart.find((ci: any) => ci.iid === item.iid && ci.vid === item.vid) : null;
		  
		  let quantity = 1;
		  if (existingItem) {
			// Item exists, increment quantity
			quantity = (existingItem.quantity || 0) + 1;
		  }
		  
		  if (existingItem) {
			// Item exists in cart - send PUT request to update quantity
			// Based on your routes: PUT /buyer/cart
			const updateResponse = await fetch.put(
			  "/buyer/cart",
			  {
				bid: buyerId,
				iid: item.iid,
				vid: item.vid,
				quantity: quantity
			  },
			  {
				headers: {
				  Authorization: `Bearer ${token}`,
				  "Content-Type": "application/json"
				}
			  }
			);
			
			if (!updateResponse.ok) {
			  const errorData = await updateResponse.json().catch(() => ({}));
			  throw new Error(errorData.err || `Failed to update item quantity: ${updateResponse.status}`);
			}
		  } else {
			// Item doesn't exist in cart - send POST request to add it
			const response = await fetch.post(
			  "/buyer/cart/",
			  {
				bid: buyerId,
				iid: item.iid,
				vid: item.vid,
				quantity: quantity
			  },
			  {
				headers: {
				  Authorization: `Bearer ${token}`,
				  "Content-Type": "application/json"
				}
			  }
			);
			
			if (!response.ok) {
			  const errorData = await response.json().catch(() => ({}));
			  
			  // Special handling for "item already in cart" error
			  if (errorData.err === "item already in cart") {
				console.log("Item already in cart, updating quantity");
				
				// Send PUT request to update the quantity
				const updateResponse = await fetch.put(
				  "/buyer/cart",
				  {
					bid: buyerId,
					iid: item.iid,
					vid: item.vid,
					quantity: quantity
				  },
				  {
					headers: {
					  Authorization: `Bearer ${token}`,
					  "Content-Type": "application/json"
					}
				  }
				);
				
				if (!updateResponse.ok) {
				  const updateErrorData = await updateResponse.json().catch(() => ({}));
				  throw new Error(updateErrorData.err || `Failed to update item quantity: ${updateResponse.status}`);
				}
			  } else {
				throw new Error(errorData.err || "Failed to add item to cart");
			  }
			}
		  }
	  
		  // After successfully adding/updating, fetch the latest cart data
		  const cartResponse = await fetch.get(`/buyer/cart/${buyerId}`, {
			headers: { Authorization: `Bearer ${token}` }
		  });
	  
		  if (cartResponse.ok) {
			const serverCart = await cartResponse.json();
			localStorage.setItem("cart", JSON.stringify(serverCart));
			setCartItems(serverCart); // Update UI state
		  } else {
			const cartErrorData = await cartResponse.json().catch(() => ({}));
			throw new Error(cartErrorData.err || "Failed to fetch updated cart");
		  }
		} catch (error) {
		  console.error("Cart update failed:", error);
		  // You could add a UI notification here to inform the user
		}
	  };
	  
	  
	const getTotalItems = () => {
		try {
			const cart = JSON.parse(localStorage.getItem("cart") || "[]");
			if (!Array.isArray(cart)) {
				return 0;
			}
			return cart.reduce((sum: number, ci: any) => sum + (ci.quantity || 0), 0);
		} catch (err) {
			console.error("Error calculating total items:", err);
			return 0;
		}
	};
	  
	  
	const goToCheckout = () => {
		// 1. Grab buyer ID from your auth store/localStorage
		const user = JSON.parse(localStorage.getItem("user") || "{}");
		const bid = user.uid;
		
		try {
			// 2. Map down to the minimal payload your backend needs
			const cart = JSON.parse(localStorage.getItem("cart") || "[]");
			if (!Array.isArray(cart)) {
				console.error("Cart is not an array");
				return;
			}
			
			const payload = cart.map((ci) => ({
				bid,            // buyer's UUID
				iid: ci.iid,    // item UUID
				vid: ci.vid,    // vendor UUID
				quantity: ci.quantity,
			}));
			
			// 3. Navigate and pass payload (or send via context/POST)
			navigate("/checkout-payment", { state: { cartPayload: payload } });
		} catch (err) {
			console.error("Error preparing checkout payload:", err);
		}
	};
	  

	const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
		const term = e.target.value.toLowerCase();
		setSearchTerm(term);

		const allItems = [
			...Object.values(CATEGORIES),
			...[{
				id: 1,
				name: "Essential Item 1",
				price: 12.99,
				image: "/images/repurchase-1.jpg",
			},
			{
				id: 2,
				name: "Essential Item 2",
				price: 12.99,
				image: "/images/repurchase-2.jpg",
			},
			{
				id: 3,
				name: "Essential Item 3",
				price: 12.99,
				image: "/images/repurchase-3.jpg",
			},
			{
				id: 4,
				name: "Essential Item 4",
				price: 12.99,
				image: "/images/repurchase-4.jpg",
			}],
			...["Hair Styling", "Tutoring", "Graphic Design"],
		];

		const filtered = allItems.filter((item) => {
			const searchString =
				typeof item === "string" ? item.toLowerCase() : item.name.toLowerCase();
			return searchString.includes(term);
		});

		setFilteredItems(filtered);
	};

	return (
		<div className="flex flex-col min-h-screen bg-white">
			{/* Header */}
			<header
				className="flex justify-between py-4 px-8 shadow-md bg-wine"
				style={{ backgroundColor: "#722F37" }}
			>
				<h1 className="text-2xl font-bold text-white">Ashesi DWA</h1>

				<div className="flex gap-4 items-center">
					{/* Shopping Cart Icon */}
					<button
						onClick={goToCheckout}
						className="flex relative items-center text-white transition-colors hover:text-yellow-400"
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
								d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
							/>
						</svg>
						{getTotalItems() > 0 && (
							<span className="flex absolute -top-2 -right-2 justify-center items-center w-5 h-5 text-xs font-bold text-black bg-yellow-400 rounded-full">
								{getTotalItems()}
							</span>
						)}
					</button>
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

			<div className="flex flex-col flex-grow items-center py-10">
				{/* Hero Section */}
				<div className="flex flex-col items-center py-16 px-6 w-full text-center bg-yellow-100">
					<h2 className="mb-2 text-3xl font-bold text-gray-900">
						Welcome to Ashesi DWA
					</h2>
					<p className="text-lg text-gray-700">
						Ghana's Premier Student Marketplace
					</p>
					{/* Search bar */}
					<div className="relative mx-auto mt-8 w-full max-w-2xl">
						<div className="flex relative items-center">
							<input
								type="text"
								value={searchTerm}
								onChange={handleSearch}
								placeholder="Search for products, services, or vendors"
								className="p-4 pr-12 w-full rounded-full border border-gray-300 shadow-md focus:ring-2 focus:ring-yellow-500 focus:outline-none"
							/>
							<button
								className="absolute right-2 p-2 text-gray-600 hover:text-yellow-500"
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
										d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
									/>
								</svg>
							</button>
						</div>

						{/* Search Results Dropdown */}
						{searchTerm && filteredItems.length > 0 && (
							<div className="overflow-y-auto absolute z-10 mt-2 w-full max-h-96 bg-white rounded-lg border border-gray-200 shadow-lg">
								{filteredItems.map((item, index) => (
									<div
										key={index}
										className="p-4 border-b cursor-pointer last:border-b-0 hover:bg-gray-50"
										onClick={() => {
											setSearchTerm("");
											setFilteredItems([]);
										}}
									>
										<div className="flex items-center">
											{typeof item === "string" ? (
												<span>{item}</span>
											) : (
												<>
													<img
														src={item.image}
														alt={item.name}
														className="object-cover mr-4 w-12 h-12 rounded"
													/>
													<div>
														<p className="font-semibold">{item.name}</p>
														{item.price && (
															<p className="text-sm text-gray-600">
																GH₵{item.price}
															</p>
														)}
													</div>
												</>
											)}
										</div>
									</div>
								))}
							</div>
						)}
					</div>
				</div>

				{/* Frequently Repurchased */}
				<SectionHeader
					title="Frequently Repurchased"
					linkText="Shop all essentials"
				/>
				<div className="grid grid-cols-1 gap-4 py-6 px-8 w-full md:grid-cols-4">
					{items.map((item) => (
						<ItemCard
							key={item.iid}
							item={item}
							addToCart={addToCart}
						/>
					))}
				</div>

				{/* Cart Floating Button for Mobile */}
				{getTotalItems() > 0 && (
					<div className="fixed right-6 bottom-6 z-10 md:hidden">
						<button
							onClick={goToCheckout}
							className="flex justify-center items-center p-3 text-white rounded-full shadow-lg bg-wine"
							style={{ backgroundColor: "#722F37" }}
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
									d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
								/>
							</svg>
							<span className="ml-1 font-bold">{getTotalItems()}</span>
						</button>
					</div>
				)}

				{/* Footer */}
				<footer
					className="py-5 mt-8 w-full text-xs text-center text-white border-t border-gray-300 bg-wine"
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
		</div>
	);
}

type ItemCardProps = {
	item: Item;
	addToCart: (item: Item) => void;
};

const ItemCard = ({ item, addToCart }: ItemCardProps) => {
	const { iid, pictureurl: pictureUrl, name, cost } = item;
	return (
		<div
			key={iid}
			className="p-4 bg-white rounded-lg border border-gray-200 transition-shadow hover:shadow-lg"
		>
			<img
				src={pictureUrl}
				alt={name}
				className="object-contain mb-4 w-full h-48"
			/>
			<h3 className="font-bold">{name}</h3>
			<p className="text-sm text-gray-600">GH₵{cost}</p>

			{/* Only Add to Cart button */}
			<div className="flex mt-2">
				<button
					className="py-1 px-3 w-full text-sm text-black bg-yellow-400 rounded hover:bg-yellow-500"
					onClick={() => addToCart(item)}
				>
					Add to Cart
				</button>
			</div>
		</div>
	);
};

export default LandingPage;