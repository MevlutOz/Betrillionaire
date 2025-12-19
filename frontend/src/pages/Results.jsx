import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
// İkonlar (Eğer yüklü değilse terminalde: npm install react-icons)
import { BiFootball, BiTrophy, BiWallet } from "react-icons/bi";
import { RiCoupon3Line } from "react-icons/ri";
import { MdOutlineHistory } from "react-icons/md";

// --- RENK PALETİ (Diğer sayfalarla birebir uyumlu) ---
const colors = {
  primaryDark: '#421F73',
  tealSuccess: '#2BD9B9',
  bgLight: '#F4F6F8', 
  white: '#FFFFFF',
  greyText: '#8A8EA6',
  danger: '#FF5252'
};

export default function Results() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Header stilleri
  const headerBtnStyle = {
    background: 'transparent',
    border: 'none',
    color: colors.greyText,
    cursor: 'pointer',
    fontSize: '0.95em',
    fontWeight: 'bold',
    padding: '10px 15px',
    display: 'flex',
    alignItems: 'center',
    gap: '6px'
  };

  useEffect(() => {
    fetchResults();
  }, []);

  const fetchResults = async () => {
    try {
      // DÜZELTME: Senin kodundaki doğru endpoint'i kullandık
      const response = await axios.get('http://localhost:3000/matches/results');
      setMatches(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Veri çekme hatası:", error);
      setLoading(false);
    }
  };

  // Maçları Lige Göre Gruplama Fonksiyonu
  const groupedMatches = matches.reduce((acc, match) => {
    const leagueId = match.league?.league_id || 0;
    if (!acc[leagueId]) {
      acc[leagueId] = { info: match.league, matches: [] };
    }
    acc[leagueId].matches.push(match);
    return acc;
  }, {});

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', backgroundColor: colors.bgLight, fontFamily: "'Roboto', sans-serif" }}>
      
      {/* HEADER (Diğer sayfalarla aynı yapı) */}
      <header style={{ height: '80px', backgroundColor: colors.primaryDark, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 30px', boxShadow: '0 4px 20px rgba(0,0,0,0.2)', zIndex: 100 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <img src="/betrillionaire.png" alt="Logo" style={{ height: '50px', objectFit: 'contain' }} />
        </div>
        <nav style={{ display: 'flex', gap: '10px' }}>
          <button onClick={() => navigate('/bulletin')} style={headerBtnStyle}><BiFootball size={20}/> Bülten</button>
          <button onClick={() => navigate('/my-coupons')} style={headerBtnStyle}><RiCoupon3Line size={20}/> Kuponlarım</button>
          <button onClick={() => navigate('/leagues')} style={headerBtnStyle}><BiTrophy size={20}/> Ligler</button>
          <button onClick={() => navigate('/wallet')} style={headerBtnStyle}><BiWallet size={20}/> Cüzdanım</button>
          {/* Aktif Sayfa */}
          <button style={{ ...headerBtnStyle, color: 'white', borderBottom: `3px solid ${colors.tealSuccess}` }}>
            <MdOutlineHistory size={22}/> Sonuçlar
          </button>
        </nav>
        <div style={{ width: '100px' }}></div>
      </header>

      {/* İÇERİK */}
      <div style={{ flex: 1, padding: '30px', overflowY: 'auto', display:'flex', flexDirection:'column', alignItems:'center' }}>
        
        <div style={{ width: '100%', maxWidth: '900px' }}>
          <h2 style={{ color: colors.primaryDark, marginBottom: '30px', borderBottom: '2px solid #ddd', paddingBottom: '10px', display:'flex', alignItems:'center', gap:'10px' }}>
            <MdOutlineHistory /> Maç Sonuçları
          </h2>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#888' }}>Sonuçlar Yükleniyor...</div>
          ) : matches.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#888' }}>Henüz sonuçlanmış maç bulunamadı.</div>
          ) : (
            // Gruplanmış Ligleri Dönüyoruz
            Object.values(groupedMatches).map((group) => (
              <div key={group.info?.league_id || 'unknown'} style={{ marginBottom: '35px' }}>
                
                {/* Lig Başlığı */}
                <div style={{ 
                  display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '15px',
                  padding: '10px 15px', backgroundColor: '#fff', borderRadius: '12px',
                  borderLeft: `5px solid ${colors.tealSuccess}`, boxShadow: '0 2px 5px rgba(0,0,0,0.03)'
                }}>
                  {group.info?.logo ? <img src={group.info.logo} width="30" alt="" style={{objectFit:'contain'}}/> : <span>🏆</span>}
                  <h3 style={{ margin: 0, fontSize: '1.1em', color: colors.primaryDark }}>{group.info?.name || 'Diğer'}</h3>
                </div>

                {/* Maç Listesi */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {group.matches.map((match) => (
                    <div key={match.match_id} style={{ 
                      backgroundColor: 'white', 
                      padding: '15px 25px', 
                      borderRadius: '12px', 
                      boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'space-between',
                      border: '1px solid #f0f0f0'
                    }}>
                      
                      {/* Tarih */}
                      <div style={{ width: '100px', fontSize: '0.8em', color: '#999', textAlign:'center', lineHeight:'1.4' }}>
                        <div>{new Date(match.match_date).toLocaleDateString('tr-TR')}</div>
                        <div style={{fontWeight:'bold', color: colors.greyText}}>{new Date(match.match_date).toLocaleTimeString('tr-TR', {hour:'2-digit', minute:'2-digit'})}</div>
                      </div>

                      {/* Skor Alanı */}
                      <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                        
                        <span style={{ fontWeight: 'bold', fontSize: '1.1em', width: '35%', textAlign: 'right', color: '#333' }}>
                          {match.homeTeam?.name}
                        </span>
                        
                        <div style={{ margin: '0 25px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                          <span style={{ 
                            backgroundColor: colors.primaryDark, 
                            color: colors.tealSuccess, 
                            padding: '8px 24px', 
                            borderRadius: '10px', 
                            fontWeight: 'bold', 
                            fontSize: '1.4em',
                            boxShadow: '0 4px 10px rgba(66, 31, 115, 0.2)',
                            minWidth: '100px',
                            textAlign: 'center'
                          }}>
                            {match.home_score} - {match.away_score}
                          </span>
                          <span style={{ fontSize: '0.7em', color: '#999', marginTop: '5px', fontWeight:'bold' }}>MS</span>
                        </div>

                        <span style={{ fontWeight: 'bold', fontSize: '1.1em', width: '35%', textAlign: 'left', color: '#333' }}>
                          {match.awayTeam?.name}
                        </span>
                      </div>

                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}