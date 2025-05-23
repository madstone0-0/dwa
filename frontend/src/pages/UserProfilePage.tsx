import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { fetch } from "./utils/Fetch";
import { getLocalStorage, setLocalStorage } from "./utils";
import { ResponseMsg, User } from "./types";
import useStore from "./store";

const UserProfilePage = () => {
    const navigate = useNavigate();

    const isUserLoggedIn = Boolean(localStorage.getItem("user"));

    useEffect(() => {
        if (!isUserLoggedIn) navigate("/signin");
    }, [isUserLoggedIn, navigate]);

    // Load data from user data saved in local storage
    const user = useStore((state) => state.user);
    const userType = user.user_type;
    const userData = JSON.parse(localStorage.getItem("user") || "{}");
    const userId = userData.uid;
    const fullNameFromProfile = userData.name || "";

    const emailFromProfile = userData.email;

    // State setup
    const [, setUserName] = useState<string>(fullNameFromProfile);
    const [userEmail] = useState<string>(emailFromProfile);

    const [newFullName, setNewFullName] = useState<string>(userData.name || "");
    const [logoUrl, setLogoUrl] = useState<string>(userData.user_types?.vendor?.logo || "");
    // This function handles the change in the full name input field. It updates the state with the new full name.
    // It is used to update the user's profile information.
    const handleFullNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setNewFullName(e.target.value);
    };
    // This function handles the change in the logo URL input field. It updates the state with the new logo URL.
    // It is used to preview the logo image before submission.
    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setLogoUrl(e.target.value);
    };

    const isFormValid = newFullName.trim().length > 0;
    // This function handles the submission of the form. It validates the input fields and sends a request to update the user's profile information.
    // If the update is successful, it updates the local storage and shows a success message.
    const handleSubmit = async () => {
        if (!isFormValid) {
            alert("Please fill in all fields correctly.");
            return;
        }

        const user = getLocalStorage("user") as unknown as User;
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
            await fetch.put<ResponseMsg>("auth/user/update", updatedProfile);

            setLocalStorage("user", updatedProfile);
            setUserName(newFullName);
            alert("Profile updated successfully!");
        } catch (e) {
            console.error({ e });
            alert("Failed to update profile. Please try again.");
            return;
        }
    };
    // This function handles the deletion of the user's account. It prompts the user for confirmation and then sends a request to delete the account.
    // If the deletion is successful, it clears the local storage and redirects the user to the sign-in page.
    const handleDeleteAccount = async () => {
        const confirmation = window.confirm(
            "Are you sure you want to delete your account? This action cannot be undone.",
        );

        if (confirmation) {
            try {
                const token = userData.token;
                const userId = userData.uid;

                await fetch.delete(`/auth/user/delete/${userId}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                // Clear local storage and redirect to sign-in page
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
        // This is the main component for the user profile page. It allows users to edit their profile information and delete their account.
        <div className="flex flex-col min-h-screen bg-gray-100">
            <main className="flex-grow p-4">
                <h1 className="mb-6 text-2xl font-semibold text-center">User Profile</h1>
                {/* Profile section with user information */}
                <div className="p-6 mx-auto max-w-3xl bg-white rounded-xl shadow-md">
                    <h2 className="mb-4 text-xl font-semibold">Edit Profile</h2>

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700">Full Name</label>
                        <input
                            type="text"
                            value={newFullName}
                            onChange={handleFullNameChange}
                            className="p-2 mt-1 w-full rounded-md border border-gray-300"
                            placeholder="Enter your full name"
                        />
                    </div>
                    {/* Email input field */}
                    {/* This field is read-only and displays the user's email address. */}
                    {/* It is not editable by the user. */}
                    {/* The email address is fetched from the user data in local storage. */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700">Email</label>
                        <input
                            type="email"
                            value={userEmail}
                            readOnly
                            className="p-2 mt-1 w-full bg-gray-100 rounded-md border border-gray-300 cursor-not-allowed"
                        />
                    </div>

                    {/* Logo URL input field for vendors */}
                    {/* This field is only visible to vendors. It allows them to update their logo URL. */}
                    {userType === "vendor" && (
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700">Logo URL</label>
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

                    {/* Update profile button */}
                    <button
                        onClick={handleSubmit}
                        className="py-2 px-4 w-full text-black bg-yellow-500 rounded hover:bg-yellow-400"
                        disabled={!isFormValid}
                    >
                        Update Profile
                    </button>
                </div>

                {/* Delete account button */}
                <div className="p-6 mx-auto mt-6 max-w-3xl text-center bg-white rounded-xl shadow-md">
                    <h2 className="mb-4 text-xl font-semibold text-red-600">Delete Account</h2>
                    <p className="mb-6 text-sm text-gray-600">
                        Once you delete your account, all of your data will be lost permanently. Please proceed with
                        caution.
                    </p>
                    <button
                        onClick={handleDeleteAccount}
                        className="py-2 px-4 w-full text-white bg-red-500 rounded hover:bg-red-400"
                    >
                        Delete Account
                    </button>
                </div>
            </main>
        </div>
    );
};

export default UserProfilePage;
