import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Signup from './pages/signup';
import Signin from './pages/signin';
import LandingPage from './pages/landing';

import { useState } from 'react';
import './App.css';

function App() {
  const [count, setCount] = useState(0);

  return (
    <Router>
      <nav>
        <Link to="/">Home</Link> | <Link to="/signup">Signup</Link> | <Link to="/signin">Signin</Link> | <Link to="/landing">Landing</Link>
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
      </Routes>
    </Router>
  );
}

export default App;
