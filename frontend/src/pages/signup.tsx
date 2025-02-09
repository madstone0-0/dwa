import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Signup() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSignup = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !email || !password || !confirmPassword) {
            setError('All fields are required.');
            return;
        }
        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }
        console.log('Signup details:', { name, email, password });
        setError('');
        navigate('/signin'); 
    };

    return (
        <div className="flex flex-col min-h-screen bg-white">
            {/* Header Section */}
            <header className="bg-wine py-4 shadow-md flex justify-center" style={{ backgroundColor: '#722F37' }}>
                <h1 className="text-white text-2xl font-bold">Ashesi DWA</h1>
            </header>
            
            {/* Main Content */}
            <div className="flex flex-grow justify-center items-center py-10">
                <div className="bg-wine p-8 rounded-lg shadow-lg w-96 border border-gray-300" style={{ backgroundColor: '#722F37' }}>
                    <h2 className="text-white text-2xl font-bold mb-4 text-center">Sign Up</h2>
                    {error && <p className="bg-yellow-300 text-black p-2 rounded mb-4">{error}</p>}
                    <form onSubmit={handleSignup} className="flex flex-col">
                        <label className="text-white text-sm font-bold mb-1">Full Name</label>
                        <input 
                            type="text" 
                            value={name} 
                            onChange={(e) => setName(e.target.value)} 
                            required 
                            className="p-2 mb-4 border rounded w-full focus:outline-none focus:ring-2 focus:ring-yellow-500"
                        />
                        <label className="text-white text-sm font-bold mb-1">Email</label>
                        <input 
                            type="email" 
                            value={email} 
                            onChange={(e) => setEmail(e.target.value)} 
                            required 
                            className="p-2 mb-4 border rounded w-full focus:outline-none focus:ring-2 focus:ring-yellow-500"
                        />
                        <label className="text-white text-sm font-bold mb-1">Password</label>
                        <input 
                            type="password" 
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)} 
                            required 
                            className="p-2 mb-4 border rounded w-full focus:outline-none focus:ring-2 focus:ring-yellow-500"
                        />
                        <label className="text-white text-sm font-bold mb-1">Confirm Password</label>
                        <input 
                            type="password" 
                            value={confirmPassword} 
                            onChange={(e) => setConfirmPassword(e.target.value)} 
                            required 
                            className="p-2 mb-4 border rounded w-full focus:outline-none focus:ring-2 focus:ring-yellow-500"
                        />
                        <button 
                            type="submit" 
                            className="bg-yellow-400 text-black py-2 rounded font-bold hover:bg-yellow-500 w-full"
                        >
                            Create Account
                        </button>
                    </form>
                    <hr className="my-4 border-yellow-300" />
                    <p className="text-white text-sm text-center">Already have an account?</p>
                    <button 
                        className="bg-black text-white py-2 rounded font-bold hover:bg-gray-800 w-full mt-2"
                        onClick={() => navigate('/signin')}
                    >
                        Sign in to your account
                    </button>
                </div>
            </div>
            
            {/* Footer Section */}
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
}

export default Signup;
