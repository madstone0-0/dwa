import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Signin() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSignin = (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !password) {
            setError('Both fields are required.');
            return;
        }
        console.log('Signin details:', { email, password });
        setError('');
        
        // Redirect to Vendor Dashboard upon successful login
        navigate('/vendor-dashboard');
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
                    <h2 className="text-white text-2xl font-bold mb-4 text-center">Sign In</h2>
                    {error && <p className="bg-yellow-300 text-black p-2 rounded mb-4">{error}</p>}
                    <form onSubmit={handleSignin} className="flex flex-col">
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
                        <button 
                            type="submit" 
                            className="bg-yellow-400 text-black py-2 rounded font-bold hover:bg-yellow-500 w-full"
                        >
                            Sign In
                        </button>
                    </form>
                    <p className="text-white text-sm mt-4 text-center">
                        <span className="text-yellow-300 cursor-pointer hover:underline" onClick={() => navigate('/forgot-password')}>Forgot your password?</span>
                    </p>
                    <hr className="my-4 border-yellow-300" />
                    <p className="text-white text-sm text-center">New to Ashesi DWA?</p>
                    <button 
                        className="bg-black text-white py-2 rounded font-bold hover:bg-gray-800 w-full mt-2"
                        onClick={() => navigate('/signup')}
                    >
                        Create your Ashesi DWA account
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

export default Signin;
