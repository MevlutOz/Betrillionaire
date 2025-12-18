import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const colors = {
  primaryDark: '#421F73',
  white: '#FFFFFF',
  bgLight: '#F4F6F8',
  greyText: '#8A8EA6',
  accentBlue: '#5550F2'
};

export default function AdminPanel() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // 1. Admin Kontrolü (Güvenlik)
    const storedUser = JSON.parse(localStorage.getItem('user'));
    if (!storedUser || !storedUser.isAdmin) {
      alert("Bu sayfaya erişim yetkiniz yok!");
      navigate('/dashboard');
      return;
    }
    fetchMatches();
  }, [navigate]);

  const fetchMatches = async () => {
    try {
      const response = await axios.get('http://localhost:3000/matches'); // Sadece Scheduled olanlar gelir
      setMatches(response.data);
      setLoading(false);
    } catch (error) {
      console.error(error);
    }
  };

  const finishMatch = async (matchId, homeName, awayName) => {
    const scoreInput = prompt(`${homeName} vs ${awayName}\nSkoru giriniz (Örn: 2-1):`);
    if (!scoreInput) return;

    const [homeScore, awayScore] = scoreInput.split('-').map(s => parseInt(s.trim()));

    if (isNaN(homeScore) || isNaN(awayScore)) {
      alert("Geçersiz skor formatı!");
      return;
    }

    try {
      // Token'ı Header'a ekle (Backend Guard için şart)
      const token = localStorage.getItem('token');
      await axios.post(`http://localhost:3000/matches/${matchId}/finish`, 
        { homeScore, awayScore },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      alert("Maç başarıyla bitirildi ve kuponlar ödendi!");
      fetchMatches(); // Listeyi yenile
    } catch (error) {
      alert("Hata: " + (error.response?.data?.message || "Yetkisiz İşlem"));
    }
  };

  if (loading) return <div>Yükleniyor...</div>;

  return (
    <div style={{ padding: '40px', backgroundColor: colors.bgLight, minHeight: '100vh', fontFamily: 'sans-serif' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'30px' }}>
        <h1 style={{ color: colors.primaryDark }}>🛡️ Admin Paneli - Maç Yönetimi</h1>
        <button onClick={() => navigate('/bulletin')} style={{ padding:'10px 20px', cursor:'pointer' }}>Panele Dön</button>
      </div>

      <div style={{ display: 'grid', gap: '15px' }}>
        {matches.length === 0 ? <p>Oynanacak maç yok.</p> : matches.map(match => (
          <div key={match.match_id} style={{ backgroundColor: colors.white, padding: '20px', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
            <div style={{ fontWeight: 'bold' }}>
              {match.homeTeam.name} vs {match.awayTeam.name}
              <div style={{ fontSize: '0.8em', color: colors.greyText, fontWeight:'normal' }}>{new Date(match.match_date).toLocaleString()}</div>
            </div>
            
            <button 
              onClick={() => finishMatch(match.match_id, match.homeTeam.name, match.awayTeam.name)}
              style={{ backgroundColor: colors.accentBlue, color: 'white', border: 'none', padding: '10px 20px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}
            >
              MAÇI BİTİR
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}