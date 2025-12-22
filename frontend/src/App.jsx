import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Bulletin from './pages/Bulletin'; // Yeni
import MyCoupons from './pages/MyCoupons'; // Yeni
import Wallet from './pages/Wallet';
import Leagues from './pages/Leagues';
import LeagueDetails from './pages/LeagueDetails';
import AdminPanel from './pages/AdminPanel';
import Results from './pages/Results'; 
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  return (
    <Router>
      <ToastContainer position="top-right" autoClose={3000} />
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        {/* Dashboard yerine bu ikisi geldi */}
        <Route path="/bulletin" element={<Bulletin />} />
        <Route path="/my-coupons" element={<MyCoupons />} />
        <Route path="/dashboard" element={<Navigate to="/bulletin" replace />} /> {/* Eski linkler bozulmasın diye */}
        <Route path="/results" element={<Results />} />
        <Route path="/wallet" element={<Wallet />} />
        <Route path="/leagues" element={<Leagues />} />
        <Route path="/leagues/premier-league" element={<LeagueDetails />} />
        <Route path="/admin" element={<AdminPanel />} />
      </Routes>
    </Router>
  );
}

export default App;