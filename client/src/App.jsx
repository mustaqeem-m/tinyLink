import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './Dashboard';
import Stats from './Stats';
import Health from './Health';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/code/:code" element={<Stats />} />
        <Route path="/healthz" element={<Health />} />
      </Routes>
    </Router>
  );
}

export default App;
