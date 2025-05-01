import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { fetch } from "./utils/Fetch"; 

function ItemPage() {
  const { id } = useParams();
  const [item, setItem] = useState(null);

  useEffect(() => {
    const getItem = async () => {
      try {
        const response = await fetch.get(`http://your-api-url.com/items/${id}`);
        const data = await response.json();
        setItem(data);
      } catch (err) {
        console.error("Failed to fetch item:", err);
      }
    };

    getItem();
  }, [id]);

  if (!item) return <p>Loading...</p>;

  return (
    <div className="p-4 max-w-md mx-auto">
      <img src={item.pictureUrl} alt={item.name} className="w-full h-auto rounded-lg mb-4" />
      <h1 className="text-2xl font-bold">{item.name}</h1>
      <p className="text-gray-700 my-2">{item.description}</p>
      <p className="text-sm text-gray-500">Sold by: {item.vendor_name}</p>
    </div>
  );
}

export default ItemPage;
