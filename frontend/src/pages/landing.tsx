import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function LandingPage() {
    const navigate = useNavigate();

    return (
        <div className="bg-white min-h-screen flex flex-col">
            {/* Header */}
            <header className="bg-wine py-4 px-6 flex justify-between items-center" style={{ backgroundColor: '#722F37' }}>
                <h1 className="text-white text-2xl font-bold cursor-pointer" onClick={() => navigate('/')}>Ashesi DWA</h1>
                <div>
                    <button className="bg-yellow-400 text-black px-4 py-2 rounded font-bold hover:bg-yellow-500 mr-2" onClick={() => navigate('/signin')}>Sign In</button>
                    <button className="bg-black text-white px-4 py-2 rounded font-bold hover:bg-gray-800" onClick={() => navigate('/signup')}>Sign Up</button>
                </div>
            </header>
            <div className="flex-grow flex flex-col items-center py-10">
                {/* Hero Section */}
                <div className="w-full flex flex-col items-center py-16 px-6 text-center bg-yellow-100">
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome to Ashesi DWA</h2>
                    <p className="text-gray-700 text-lg">Explore and shop from a variety of vendors at Ashesi University</p>
                </div>

                {/* Categories Section */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-8 py-10 place-items-center">
                    <div className="bg-white shadow-lg rounded-lg overflow-hidden border border-gray-300">
                        <img src="/images/supplies.jpg" alt="Supplies" className="w-full h-48 object-cover" /> {/*Add the images path.. not so sure here*/}
                        <div className="p-4">
                            <h3 className="text-xl font-bold">New Year, New Supplies</h3>
                            <p className="text-gray-700">Get all the stationery and books you need</p>
                            <button className="text-yellow-600 hover:underline mt-2">Shop office products</button>
                        </div>
                    </div>
                    <div className="bg-white shadow-lg rounded-lg overflow-hidden border border-gray-300">
                        <img src="/images/gaming.jpg" alt="Gaming" className="w-full h-48 object-cover" /> {/*Add the images path.. not so sure here*/}
                        <div className="p-4">
                            <h3 className="text-xl font-bold">Gaming Accessories</h3>
                            <p className="text-gray-700">Find the latest gaming gear</p>
                            <button className="text-yellow-600 hover:underline mt-2">Shop gaming</button>
                        </div>
                    </div>
                    <div className="bg-white shadow-lg rounded-lg overflow-hidden border border-gray-300">
                        <img src="/images/home.jpg" alt="Home Essentials" className="w-full h-48 object-cover" /> {/*Add the images path.. not so sure here*/}
                        <div className="p-4">
                            <h3 className="text-xl font-bold">Home Essentials</h3>
                            <p className="text-gray-700">Decor, storage, and more</p>
                            <button className="text-yellow-600 hover:underline mt-2">Shop home essentials</button>
                        </div>
                    </div>
                </div>
            </div>
            {/* Footer */}
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

export default LandingPage;
