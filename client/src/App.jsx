import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './Dashboard';
import Stats from './Stats';

function App() {
  return (
    <Router>
      <Routes>
        {/* Route 1: The Dashboard */}
        <Route path="/" element={<Dashboard />} />

        {/* Route 2: The Stats Page (Matches /code/abc1234) */}
        <Route path="/code/:code" element={<Stats />} />
      </Routes>
    </Router>
  );
}

export default App;
