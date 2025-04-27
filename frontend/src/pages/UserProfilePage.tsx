import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
// This design is tentative and will be improved in the future.
// Header Component
const Header = () => {
  return (
    <header className="bg-wine py-4 shadow-md" style={{ backgroundColor: '#722F37' }}>
    <div className="container mx-auto px-4 flex justify-between items-center">
      {/* Logo and Brand Name */}
      <div className="flex items-center space-x-3">
      <a href="/landing">
        <img 
          src="/src/assets/dwa-icon.jpg" 
          alt="DWA Logo" 
          className="h-10 w-10 object-cover rounded-full"
        />
        </a>
        <h1 className="text-white text-2xl font-bold">Ashesi DWA - Profile</h1>
      </div>
    </div>
</header>
  );
};

// Password validation function
const isPasswordValid = (password: string) => {
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;
  return passwordRegex.test(password);
};

// Email validation function
const isEmailValid = (email: string) => {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
};

const UserProfilePage = () => {
  const navigate = useNavigate();
  const isUserLoggedIn = Boolean(localStorage.getItem('user'));
    
      useEffect(() => {
        if (!isUserLoggedIn) {
          navigate('/signin');
        }
      }, [isUserLoggedIn, navigate]);
  // State for user information
  const [userName, setUserName] = useState<string>("John Doe");
  const [userEmail, setUserEmail] = useState<string>("johndoe@example.com");
  const [userPassword, setUserPassword] = useState<string>(""); 
  const [newFullName, setNewFullName] = useState<string>("");
  const [newEmail, setNewEmail] = useState<string>("");
  const [newPassword, setNewPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [passwordError, setPasswordError] = useState<string>("");
  const [emailError, setEmailError] = useState<string>("");

  // Handle changes to input fields
  const handleFullNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewFullName(e.target.value);
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewEmail(e.target.value);
    // Clear email error when the user starts typing
    setEmailError("");
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewPassword(e.target.value);
  };

  const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setConfirmPassword(e.target.value);
  };

  // Check if form is valid (all fields must be filled, passwords must match, and email must be valid)
  const isFormValid =
    newFullName &&
    newEmail &&
    newPassword &&
    confirmPassword &&
    newPassword === confirmPassword &&
    isPasswordValid(newPassword) &&
    isEmailValid(newEmail);

  // Handle form submission (updating profile)
  const handleSubmit = () => {
    if (isFormValid) {
      // Normally, here we would update the user information in the backend
      setUserName(newFullName);
      setUserEmail(newEmail);
      setUserPassword(newPassword);
      alert("Profile updated successfully!");
      // Clear fields after update
      setNewFullName("");
      setNewEmail("");
      setNewPassword("");
      setConfirmPassword("");
    } else {
      if (!isPasswordValid(newPassword)) {
        setPasswordError("Password must be at least 8 characters long, with one uppercase letter, one lowercase letter, one number, and one special character.");
      } else {
        setPasswordError("");
      }

      if (!isEmailValid(newEmail)) {
        setEmailError("Please enter a valid email address.");
      } else {
        setEmailError("");
      }

      alert("Please fill in all fields correctly and make sure passwords match.");
    }
  };

  // Handle account deletion
  const handleDeleteAccount = () => {
    const confirmation = window.confirm("Are you sure you want to delete your account? This action cannot be undone.");
    if (confirmation) {
      // Normally, you would make a request to your backend to delete the account.
      alert("Your account has been deleted.");
      // For now, we'll clear the profile data as a placeholder.
      setUserName("");
      setUserEmail("");
      setUserPassword("");
      setNewFullName("");
      setNewEmail("");
      setNewPassword("");
      setConfirmPassword("");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Header Component */}
      <Header />

      <main className="flex-grow p-4">
        <h1 className="text-2xl font-semibold text-center mb-6">User Profile</h1>

        {/* Profile Edit Form */}
        <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Edit Profile</h2>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Full Name</label>
            <input
              type="text"
              value={newFullName || userName} // Display current full name
              onChange={handleFullNameChange}
              className="p-2 border border-gray-300 rounded-md w-full mt-1"
              placeholder="Enter your full name"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              value={newEmail || userEmail} // Display current email
              onChange={handleEmailChange}
              className="p-2 border border-gray-300 rounded-md w-full mt-1"
              placeholder="Enter your email"
            />
            {emailError && <p className="text-red-500 text-sm mt-2">{emailError}</p>}
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={handlePasswordChange}
              className="p-2 border border-gray-300 rounded-md w-full mt-1"
              placeholder="Enter your new password"
            />
            {passwordError && <p className="text-red-500 text-sm mt-2">{passwordError}</p>}
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700">Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={handleConfirmPasswordChange}
              className="p-2 border border-gray-300 rounded-md w-full mt-1"
              placeholder="Confirm your new password"
            />
          </div>

          <button
            onClick={handleSubmit}
            className="bg-yellow-500 text-black py-2 px-4 rounded w-full hover:bg-yellow-400"
            disabled={!isFormValid}
          >
            Update Profile
          </button>
        </div>

        {/* Delete Account Section */}
        <div className="max-w-3xl mx-auto mt-6 bg-white rounded-xl shadow-md p-6 text-center">
          <h2 className="text-xl font-semibold mb-4 text-red-600">Delete Account</h2>
          <p className="text-sm mb-6 text-gray-600">
            Once you delete your account, all of your data will be lost permanently. Please proceed with caution.
          </p>
          <button
            onClick={handleDeleteAccount}
            className="bg-red-500 text-white py-2 px-4 rounded w-full hover:bg-red-400"
          >
            Delete Account
          </button>
        </div>
      </main>

      {/* Footer Component */}
      <footer className="bg-wine text-white text-center py-5 text-xs border-t border-gray-300" style={{ backgroundColor: '#722F37' }}>
        <p className="mb-1">
          <span className="text-yellow-400 cursor-pointer hover:underline">Terms of Service</span> &nbsp; | &nbsp;
          <span className="text-yellow-400 cursor-pointer hover:underline">Privacy Policy</span> &nbsp; | &nbsp;
          <span className="text-yellow-400 cursor-pointer hover:underline">Help</span>
        </p>
        <p>&copy; {new Date().getFullYear()} Ashesi DWA, Inc. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default UserProfilePage;
