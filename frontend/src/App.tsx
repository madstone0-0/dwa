import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Signup from './pages/signup';
import Signin from './pages/signin';
import LandingPage from './pages/landing';
import VendorDashboard from './pages/VendorDashboard';
import CheckoutPayment from './pages/CheckoutPayment';
import CartPage from './pages/CartPage';
import ItemPage from './pages/ItemPage';



import { useState } from 'react';
import './App.css';

function App() {
  const [count, setCount] = useState(0);

  return (
    <Router>
      <nav>
        <Link to="/">Home</Link> | <Link to="/signup">Signup</Link> | <Link to="/signin">Signin</Link> | <Link to="/landing">Landing</Link> | <Link to="/vendor-dashboard">Vendor Dashboard</Link> | <Link to="/checkout-payment">Checkout Payment</Link>| <Link to="/cart">Cart</Link>| <Link to="/item">Item</Link>
      </nav>

      <Routes>
        <Route path="/" element={
          <>
            <h1>Vite + React</h1>
            <button onClick={() => setCount(count + 1)}>count is {count}</button>
          </>
        } />
        <Route path="/signup" element={<Signup />} />
        <Route path="/signin" element={<Signin />} />
        <Route path="/landing" element={<LandingPage />} />
        <Route path="/vendor-dashboard" element={<VendorDashboard />} />
        <Route path = "/checkout-payment" element={<CheckoutPayment />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path = "/item" element={<ItemPage />} />
      </Routes>
    </Router>
  );
}

export default App;
