import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Bulletin from './pages/Bulletin'; // Yeni
import MyCoupons from './pages/MyCoupons'; // Yeni
import Wallet from './pages/Wallet';
import Leagues from './pages/Leagues';
import LeagueDetails from './pages/LeagueDetails';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Dashboard yerine bu ikisi geldi */}
        <Route path="/bulletin" element={<Bulletin />} />
        <Route path="/my-coupons" element={<MyCoupons />} />
        <Route path="/dashboard" element={<Navigate to="/bulletin" replace />} /> {/* Eski linkler bozulmasın diye */}

        <Route path="/wallet" element={<Wallet />} />
        <Route path="/leagues" element={<Leagues />} />
        <Route path="/leagues/premier-league" element={<LeagueDetails />} />
      </Routes>
    </Router>
  );
}

export default App;