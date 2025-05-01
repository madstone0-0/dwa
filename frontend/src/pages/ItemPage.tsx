import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { fetch } from "./utils/Fetch"; 

function ItemPage() {
  const navigate = useNavigate();
  const { iid } = useParams<{ iid: string }>();
  const [item, setItem] = useState<any>(null);

  // Fetch item details
  useEffect(() => {
    const getItem = async () => {
      try {
        const response = await fetch.get(`http://your-api-url.com/items/${iid}`);
        const data = await response.json();
        setItem(data);
      } catch (err) {
        console.error("Failed to fetch item:", err);
      }
    };

    getItem();
  }, [iid]);

  if (!item) return <p className="p-4">Loading...</p>;

  // Logout helper (copied from LandingPage)
  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("userType");
    localStorage.removeItem("token");
    localStorage.removeItem("cart");
    navigate("/signin");
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
          <button
            onClick={() => navigate("/landing")}
            className="text-white hover:text-yellow-400"
          >
            Home
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

      {/* Main Content */}
      <div className="flex-grow p-4 max-w-md mx-auto">
        <img
          src={item.pictureUrl}
          alt={item.name}
          className="w-full h-auto rounded-lg mb-4"
        />
        <h1 className="text-2xl font-bold">{item.name}</h1>
        <p className="text-gray-700 my-2">{item.description}</p>
        <p className="text-sm text-gray-500">Sold by: {item.vendor_name}</p>
      </div>

      {/* Footer */}
      <footer
        className="py-5 w-full text-xs text-center text-white border-t border-gray-300 bg-wine"
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

export default ItemPage;
