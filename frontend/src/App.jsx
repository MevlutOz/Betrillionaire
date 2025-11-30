import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Wallet from './pages/Wallet';

function App() {
  return (
    <Router>
      {/* Eski <nav> barını kaldırdık. 
          Artık tüm sayfalar ekranı tam kaplayacak.
      */}
      
      <Routes>
        {/* Ana sayfaya (/) gelen kullanıcıyı direkt Login'e atalım */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/wallet" element={<Wallet />} />
      </Routes>
    </Router>
  );
}

export default App;