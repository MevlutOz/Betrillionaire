import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const colors = {
  primaryDark: '#421F73',
  tealSuccess: '#2BD9B9',
  bgLight: '#F4F6F8',
  white: '#FFFFFF',
  greyText: '#8A8EA6',
  plPurple: '#38003c' // Premier League Marka Rengi
};

export default function LeagueDetails() {
  const [matches, setMatches] = useState([]);
  const [season, setSeason] = useState('2024-2025'); // Varsayılan Sezon
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // CSV'deki yıllara göre sezon listesi
  const seasons = ['2024-2025', '2023-2024', '2022-2023', '2021-2022', '2020-2021'];

  useEffect(() => {
    fetchMatchesBySeason();
  }, [season]);

  const fetchMatchesBySeason = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`http://localhost:3000/matches/filter?season=${season}`);
      setMatches(response.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', backgroundColor: colors.bgLight, fontFamily: "'Roboto', sans-serif" }}>
      
      {/* HEADER */}
      <div style={{ padding: '20px 40px', backgroundColor: colors.primaryDark, color: colors.white, display: 'flex', alignItems: 'center', gap: '20px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}>
        <button onClick={() => navigate('/leagues')} style={{ background: 'none', border: 'none', color: 'white', fontSize: '1.5em', cursor: 'pointer', paddingRight: '20px', borderRight: '1px solid rgba(255,255,255,0.2)' }}>←</button>
        <img src="https://upload.wikimedia.org/wikipedia/en/f/f2/Premier_League_Logo.svg" alt="PL" style={{ height: '40px', filter: 'brightness(0) invert(1)' }} />
        <div>
          <h2 style={{ margin: 0, fontSize: '1.2em' }}>Premier League Arşivi</h2>
          <span style={{ fontSize: '0.8em', opacity: 0.8 }}>İngiltere Futbol Ligi</span>
        </div>
      </div>

      <div style={{ padding: '30px 40px', flex: 1, overflowY: 'auto' }}>
        
        {/* FİLTRE ALANI */}
        <div style={{ marginBottom: '30px', backgroundColor: colors.white, padding: '20px', borderRadius: '15px', display: 'flex', alignItems: 'center', gap: '20px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
          <span style={{ fontWeight: 'bold', color: colors.primaryDark, fontSize: '1.1em' }}>📅 Sezon Seçiniz:</span>
          <select 
            value={season} 
            onChange={(e) => setSeason(e.target.value)}
            style={{ padding: '10px 20px', borderRadius: '10px', border: `2px solid ${colors.tealSuccess}`, fontSize: '1em', fontWeight: 'bold', outline: 'none', cursor: 'pointer', backgroundColor: colors.bgLight }}
          >
            {seasons.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <span style={{ marginLeft: 'auto', color: colors.greyText }}>
            {matches.length} maç bulundu
          </span>
        </div>

        {/* MAÇ LİSTESİ */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '50px', color: colors.primaryDark }}>Veriler Yükleniyor...</div>
        ) : (
          <div style={{ display: 'grid', gap: '15px' }}>
            {matches.length === 0 ? <p style={{ textAlign: 'center', color: colors.greyText }}>Bu sezon için veri bulunamadı.</p> : null}
            
            {matches.map((match) => (
              <div key={match.match_id} style={{ backgroundColor: colors.white, padding: '20px 30px', borderRadius: '15px', boxShadow: '0 2px 8px rgba(0,0,0,0.03)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'transform 0.2s', cursor: 'default' }}>
                
                <div style={{ width: '150px', color: colors.greyText, fontSize: '0.9em', fontWeight: 'bold' }}>
                  {new Date(match.match_date).toLocaleDateString('tr-TR')}
                </div>
                
                <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  <span style={{ fontWeight: 'bold', fontSize: '1.2em', width: '35%', textAlign: 'right', color: '#333' }}>{match.homeTeam.name}</span>
                  
                  <div style={{ margin: '0 30px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <span style={{ backgroundColor: colors.plPurple, color: '#00FF85', padding: '8px 20px', borderRadius: '12px', fontWeight: 'bold', fontSize: '1.3em', boxShadow: '0 4px 10px rgba(56, 0, 60, 0.2)' }}>
                      {match.home_score} - {match.away_score}
                    </span>
                    <span style={{ fontSize: '0.7em', color: colors.greyText, marginTop: '5px' }}>MS</span>
                  </div>

                  <span style={{ fontWeight: 'bold', fontSize: '1.2em', width: '35%', textAlign: 'left', color: '#333' }}>{match.awayTeam.name}</span>
                </div>

                <div style={{ width: '150px', textAlign: 'right' }}>
                  <span style={{ padding: '5px 10px', backgroundColor: '#f0f0f0', borderRadius: '6px', color: '#666', fontSize: '0.8em', fontWeight: 'bold' }}>
                    MAÇ SONUCU
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}