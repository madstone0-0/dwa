import { FC, memo, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useLogout } from "./utils/hooks";
import { HeaderItem } from "./types";
import useStore from "./store";

type HeaderProps = {
    pageTitle?: string;
    homeLink: string;
    items: HeaderItem[];
    logoSrc?: string;
    logoAlt?: string;
};

const Header: FC<HeaderProps> = memo(
    ({ pageTitle = "Ashesi DWA", homeLink, items, logoSrc = "/src/assets/dwa-icon.jpg", logoAlt = "DWA Logo" }) => {
        const handleLogout = useLogout();
        const user = useStore((state) => state.user);
        const location = useLocation();
        const navigate = useNavigate();
        const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

        // Memoize the current path to avoid unnecessary re-renders
        const currentPath = useMemo(() => location.pathname, [location.pathname]);

        // Determine if we should show the back button (only when not on the home page)
        const showBackButton = useMemo(() => {
            return currentPath !== homeLink && !currentPath.endsWith(homeLink);
        }, [currentPath, homeLink]);

        // Handle back navigation
        const handleGoBack = () => {
            navigate(-1); // Go back one step in history
        };

        // Close mobile menu when navigating
        const handleNavigation = () => {
            setMobileMenuOpen(false);
        };

        return (
            <header className="sticky top-0 z-50 shadow-md bg-wine" style={{ backgroundColor: "#722F37" }}>
                <div className="container py-3 px-4 mx-auto">
                    <div className="flex flex-wrap justify-between items-center">
                        {/* Back Button and Logo Section */}
                        <div className="flex items-center space-x-3">
                            {showBackButton && (
                                <button
                                    onClick={handleGoBack}
                                    className="flex justify-center items-center w-8 h-8 text-white rounded-full transition-colors hover:bg-white/10"
                                    aria-label="Go back"
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="w-5 h-5"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                        aria-hidden="true"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M15 19l-7-7 7-7"
                                        />
                                    </svg>
                                </button>
                            )}

                            {/* Logo and Brand */}
                            <Link
                                className="flex items-center space-x-3 cursor-pointer"
                                to={homeLink}
                                aria-label={`Go to ${pageTitle} home page`}
                                onClick={handleNavigation}
                            >
                                <img
                                    src={logoSrc}
                                    alt={logoAlt}
                                    className="object-cover w-10 h-10 rounded-full"
                                    width="40"
                                    height="40"
                                    loading="eager"
                                />
                                <h1 className="text-xl font-bold text-white">{pageTitle}</h1>
                            </Link>
                        </div>

                        {/* Mobile menu button - only visible on small screens */}
                        <button
                            className="p-2 text-white rounded-md md:hidden"
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            aria-expanded={mobileMenuOpen}
                            aria-controls="mobile-menu"
                            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
                        >
                            {mobileMenuOpen ? (
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
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                </svg>
                            ) : (
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
                                        d="M4 6h16M4 12h16M4 18h16"
                                    />
                                </svg>
                            )}
                        </button>

                        {/* Desktop Navigation - hidden on small screens */}
                        <nav className="hidden items-center space-x-6 md:flex">
                            {items.map((item) => {
                                const isActive = currentPath.endsWith(item.link);
                                return (
                                    <Link
                                        key={item.name}
                                        to={item.link}
                                        className={`flex flex-col items-center transition-colors ${
                                            isActive ? "text-yellow-400" : "text-white hover:text-yellow-300"
                                        }`}
                                        aria-current={isActive ? "page" : undefined}
                                        onClick={handleNavigation}
                                    >
                                        {item.icon && <item.icon />}
                                        <span className="mt-1 text-xs">{item.name}</span>
                                    </Link>
                                );
                            })}

                            {user?.uid && (
                                <button
                                    onClick={() => {
                                        handleLogout();
                                        handleNavigation();
                                    }}
                                    className="flex flex-col items-center text-white transition-colors hover:text-yellow-300"
                                    aria-label="Logout"
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="w-6 h-6"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                        aria-hidden="true"
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
                            )}
                        </nav>
                    </div>

                    {/* Mobile Navigation Menu - only visible on small screens when menu is open */}
                    {mobileMenuOpen && (
                        <nav id="mobile-menu" className="py-3 mt-3 border-t md:hidden border-white/10">
                            <div className="flex flex-col space-y-4">
                                {items.map((item) => {
                                    const isActive = currentPath.endsWith(item.link);
                                    return (
                                        <Link
                                            key={item.name}
                                            to={item.link}
                                            className={`flex items-center space-x-3 px-2 py-2 rounded-md transition-colors ${
                                                isActive
                                                    ? "bg-white/10 text-yellow-400"
                                                    : "text-white hover:bg-white/5 hover:text-yellow-300"
                                            }`}
                                            aria-current={isActive ? "page" : undefined}
                                            onClick={handleNavigation}
                                        >
                                            {item.icon && <item.icon />}
                                            <span>{item.name}</span>
                                        </Link>
                                    );
                                })}

                                {user?.uid && (
                                    <button
                                        onClick={() => {
                                            handleLogout();
                                            handleNavigation();
                                        }}
                                        className="flex items-center py-2 px-2 space-x-3 w-full text-left text-white rounded-md transition-colors hover:text-yellow-300 hover:bg-white/5"
                                        aria-label="Logout"
                                    >
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="w-6 h-6"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                            aria-hidden="true"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M17 16l4-4m0 0l-4-4m4 4H7"
                                            />
                                        </svg>
                                        <span>Logout</span>
                                    </button>
                                )}
                            </div>
                        </nav>
                    )}
                </div>
            </header>
        );
    },
);

// Add display name for better debugging
Header.displayName = "Header";

export default Header;
