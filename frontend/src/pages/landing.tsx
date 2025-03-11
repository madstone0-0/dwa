import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// Add interface for SectionHeader props
interface SectionHeaderProps {
  title: string;
  linkText: string;
}

function LandingPage() {
  const navigate = useNavigate();
  const [recentlyViewed] = useState<Array<any>>([]); // Add type for state

  // Update component with typed props
  const SectionHeader = ({ title, linkText }: SectionHeaderProps) => (
    <div className="w-full flex justify-between items-center mb-4 px-8">
      <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
      <button className="text-yellow-600 hover:underline font-semibold">
        {linkText}
      </button>
    </div>
  );

    return (
        <div className="bg-white min-h-screen flex flex-col">
            {/* Header - unchanged */}

            <div className="flex-grow flex flex-col items-center py-10">
                {/* Hero Section - unchanged */}

                {/* Categories Section - unchanged */}

                {/* Frequently Repurchased in School */}
                <SectionHeader title="Frequently Repurchased in School" linkText="Shop now" />
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 px-8 py-6 w-full">
                    {[1, 2, 3, 4].map((item) => (
                        <div key={item} className="bg-white p-4 border border-gray-200 rounded-lg hover:shadow-lg transition-shadow">
                            <img src={`/images/repurchase-${item}.jpg`} alt="Repurchased item" className="w-full h-48 object-contain mb-4" />
                            <h3 className="font-bold">Essential Item {item}</h3>
                            <p className="text-gray-600 text-sm">$12.99</p>
                            <button className="bg-yellow-400 text-black px-3 py-1 rounded mt-2 text-sm hover:bg-yellow-500">
                                Add to Cart
                            </button>
                        </div>
                    ))}
                </div>

                {/* Recommended For You */}
                <SectionHeader title="Recommended For You" linkText="See all recommendations" />
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 px-8 py-6 w-full">
                    {[1, 2, 3, 4].map((item) => (
                        <div key={item} className="bg-white p-4 border border-gray-200 rounded-lg">
                            <img src={`/images/recommended-${item}.jpg`} alt="Recommended" className="w-full h-48 object-cover mb-4" />
                            <h3 className="font-bold">Recommended Product {item}</h3>
                            <p className="text-gray-600 text-sm">⭐ 4.5 (120 reviews)</p>
                            <p className="text-red-600 font-bold mt-1">$29.99 <span className="text-gray-500 line-through">$39.99</span></p>
                        </div>
                    ))}
                </div>

                {/* Deals of the Day */}
                <div className="w-full bg-yellow-100 py-8 mt-8">
                    <SectionHeader title="Deals of the Day" linkText="See all deals" />
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-8">
                        {[1, 2, 3].map((item) => (
                            <div key={item} className="bg-white p-4 border-2 border-yellow-400 rounded-lg flex">
                                <img src={`/images/deal-${item}.jpg`} alt="Deal" className="w-1/3 object-contain" />
                                <div className="ml-4">
                                    <h3 className="font-bold">Daily Deal {item}</h3>
                                    <p className="text-red-600 font-bold">40% OFF</p>
                                    <p className="text-gray-600 text-sm">Limited time offer</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Electronics Section */}
                <SectionHeader title="Electronics Essentials" linkText="Shop electronics" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-8 py-6 w-full">
                    {['Laptops', 'Headphones', 'Smartwatches'].map((item) => (
                        <div key={item} className="bg-white p-4 border border-gray-200 rounded-lg text-center">
                            <img src={`/images/electronics-${item.toLowerCase()}.jpg`} alt={item} className="w-full h-48 object-contain mb-4" />
                            <h3 className="font-bold">{item}</h3>
                            <p className="text-gray-600 text-sm">Starting from $99</p>
                        </div>
                    ))}
                </div>

                {/* Fashion Section */}
                <SectionHeader title="Campus Fashion" linkText="Explore fashion" />
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 px-8 py-6 w-full">
                    {[1, 2, 3, 4].map((item) => (
                        <div key={item} className="bg-white p-4 border border-gray-200 rounded-lg">
                            <img src={`/images/fashion-${item}.jpg`} alt="Fashion" className="w-full h-64 object-cover mb-4" />
                            <h3 className="font-bold">Trending Outfit {item}</h3>
                            <p className="text-gray-600 text-sm">$49.99</p>
                        </div>
                    ))}
                </div>

                {/* Local Favorites */}
                <SectionHeader title="Local Favorites" linkText="Browse all" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-8 py-6 w-full">
                    {['Local Art', 'Campus Merch', 'Handmade Crafts'].map((item) => (
                        <div key={item} className="bg-white p-4 border border-gray-200 rounded-lg">
                            <img src={`/images/local-${item.toLowerCase().replace(' ', '-')}.jpg`} alt={item} className="w-full h-48 object-cover mb-4" />
                            <h3 className="font-bold">{item}</h3>
                            <p className="text-gray-600 text-sm">Support local businesses</p>
                        </div>
                    ))}
                </div>

                {/* Recently Viewed */}
                {recentlyViewed.length > 0 && (
                    <>
                        <SectionHeader title="Recently Viewed Items" linkText="View history" />
                        <div className="flex overflow-x-auto pb-4 px-8 w-full">
                            {[1, 2, 3, 4, 5].map((item) => (
                                <div key={item} className="flex-shrink-0 w-48 mr-4 border border-gray-200 rounded-lg p-2">
                                    <img src={`/images/recent-${item}.jpg`} alt="Recent" className="w-full h-32 object-contain mb-2" />
                                    <h3 className="text-sm font-bold">Recent Item {item}</h3>
                                    <p className="text-gray-600 text-xs">$19.99</p>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>

            {/* Footer - unchanged */}
        </div>
    );
}

export default LandingPage;