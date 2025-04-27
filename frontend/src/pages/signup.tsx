import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetch } from '../utils/Fetch';

function Signup() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isVendor, setIsVendor] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [signupPartialSuccess, setSignupPartialSuccess] = useState(false);
    const navigate = useNavigate();

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSignupPartialSuccess(false);
    
        // Validate all fields
        if (!name || !email || !password) {
            setError('All fields are required.');
            return;
        }
    
        // Validate Ashesi email format
        const emailPattern = /^[a-zA-Z0-9._%+-]+@ashesi\.edu\.gh$/;
        if (!emailPattern.test(email)) {
            setError('Please use a valid Ashesi email address.');
            return;
        }
    
        // Validate password length
        if (password.length < 6) {
            setError('Password must be at least 6 characters long.');
            return;
        }

        setIsLoading(true);
    
        try {
            const response = await fetch.post('/auth/user/signup', {
                email: email.trim(),
                password: password,
                name: name.trim(),
                isVendor: isVendor
            });
    
            console.log('Signup successful:', response.data);
            navigate('/signin');
            
        } catch (err: any) {
            console.error('Detailed error:', {
                error: err,
                response: err.response,
                data: err.response?.data,
                status: err.response?.status
            });
    
            // Check specifically for mail server errors
            const errorData = err.response?.data?.data || err.response?.data;
            const errorMessage = errorData?.err || err.response?.data?.error || err.message;
            
            if (errorMessage && typeof errorMessage === 'string' && 
                (errorMessage.includes('mail server') || errorMessage.includes('timeout'))) {
                // Special handling for mail server errors
                setSignupPartialSuccess(true);
                setError('Your account was created, but we couldn\'t send a verification email. Please try signing in, or contact support if you have issues.');
            } else {
                // General error handling
                setError(errorMessage || 'Server error. Please try again.');
            }
        } finally {
            setIsLoading(false);
        }
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
                    
                    {signupPartialSuccess ? (
                        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4" role="alert">
                            <p>{error}</p>
                            <button 
                                onClick={() => navigate('/signin')}
                                className="mt-2 bg-yellow-500 hover:bg-yellow-600 text-white py-1 px-3 rounded text-sm"
                            >
                                Go to Sign In
                            </button>
                        </div>
                    ) : error ? (
                        <p className="bg-yellow-300 text-black p-2 rounded mb-4">{error}</p>
                    ) : null}
                    
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
                        <div className="flex items-center mb-4">
                            <input
                                type="checkbox"
                                checked={isVendor}
                                onChange={(e) => setIsVendor(e.target.checked)}
                                className="mr-2"
                            />
                            <label className="text-white text-sm">Sign up as vendor</label>
                        </div>

                        <button 
                            type="submit" 
                            className="bg-yellow-400 text-black py-2 rounded font-bold hover:bg-yellow-500 w-full disabled:opacity-50"
                            disabled={isLoading}
                        >
                            {isLoading ? 'Signing up...' : 'Sign Up'}
                        </button>
                    </form>
                    <p className="text-white text-sm mt-4 text-center">
                        Already have an account? 
                        <span className="text-yellow-300 cursor-pointer hover:underline" onClick={() => navigate('/signin')}> Sign in</span>
                    </p>
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