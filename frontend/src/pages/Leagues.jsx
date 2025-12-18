import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const colors = {
  primaryDark: '#421F73',
  tealSuccess: '#2BD9B9',
  bgLight: '#F4F6F8',
  white: '#FFFFFF',
  textGrey: '#666'
};

export default function Leagues() {
  const [leagues, setLeagues] = useState([]);
  const [selectedLeague, setSelectedLeague] = useState(null);
  const [standings, setStandings] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // 1. Sayfa açılınca Ligleri Çek
  useEffect(() => {
    axios.get('http://localhost:3000/leagues').then(res => {
      setLeagues(res.data);
      // İlk ligi otomatik seç
      if(res.data.length > 0) handleSelectLeague(res.data[0]);
    });
  }, []);

  // 2. Bir Lig Seçilince Puan Durumunu Çek
  const handleSelectLeague = async (league) => {
    setSelectedLeague(league);
    setLoading(true);
    try {
      const res = await axios.get(`http://localhost:3000/leagues/${league.league_id}/standings`);
      setStandings(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', backgroundColor: colors.bgLight, fontFamily: 'Roboto, sans-serif' }}>
      
      {/* HEADER (Basit) */}
      <header style={{ padding: '20px', backgroundColor: colors.primaryDark, color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{margin:0}}>🏆 Ligler ve Puan Durumu</h2>
        <button onClick={() => navigate('/bulletin')} style={{background:'transparent', border:'1px solid white', color:'white', padding:'8px 15px', borderRadius:'6px', cursor:'pointer'}}>Geri Dön</button>
      </header>

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        
        {/* SOL: LİG LİSTESİ */}
        <div style={{ width: '250px', backgroundColor: 'white', borderRight: '1px solid #ddd', overflowY: 'auto' }}>
          <div style={{ padding: '15px', fontWeight: 'bold', color: '#888', borderBottom:'1px solid #eee' }}>LİGLER</div>
          {leagues.map(league => (
            <div 
              key={league.league_id} 
              onClick={() => handleSelectLeague(league)}
              style={{ 
                padding: '15px 20px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px',
                backgroundColor: selectedLeague?.league_id === league.league_id ? '#f0f0f5' : 'white',
                borderLeft: selectedLeague?.league_id === league.league_id ? `4px solid ${colors.primaryDark}` : '4px solid transparent'
              }}
            >
              {league.logo ? <img src={league.logo} width="24" /> : <span>⚽</span>}
              <div style={{fontWeight: selectedLeague?.league_id === league.league_id ? 'bold':'normal'}}>
                 {league.name}
                 <div style={{fontSize:'0.75em', color:'#999'}}>{league.country}</div>
              </div>
            </div>
          ))}
        </div>

        {/* SAĞ: PUAN DURUMU TABLOSU */}
        <div style={{ flex: 1, padding: '30px', overflowY: 'auto' }}>
          {selectedLeague && (
            <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '25px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
              
              <div style={{display:'flex', alignItems:'center', gap:'15px', marginBottom:'20px'}}>
                 {selectedLeague.logo && <img src={selectedLeague.logo} width="50" />}
                 <h2 style={{margin:0, color: colors.primaryDark}}>{selectedLeague.name} Puan Durumu</h2>
              </div>

              {loading ? <div>Yükleniyor...</div> : (
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9em' }}>
                  <thead style={{ backgroundColor: '#f9f9f9', color: '#666' }}>
                    <tr>
                      <th style={{padding:'12px', textAlign:'center'}}>#</th>
                      <th style={{padding:'12px', textAlign:'left'}}>Takım</th>
                      <th style={{padding:'12px', textAlign:'center'}}>O</th>
                      <th style={{padding:'12px', textAlign:'center'}}>G</th>
                      <th style={{padding:'12px', textAlign:'center'}}>B</th>
                      <th style={{padding:'12px', textAlign:'center'}}>M</th>
                      <th style={{padding:'12px', textAlign:'center'}}>AV</th>
                      <th style={{padding:'12px', textAlign:'center'}}>P</th>
                      <th style={{padding:'12px', textAlign:'center'}}>Form</th>
                    </tr>
                  </thead>
                  <tbody>
                    {standings.map((row) => (
                      <tr key={row.id} style={{ borderBottom: '1px solid #eee' }}>
                        <td style={{padding:'12px', textAlign:'center', fontWeight:'bold'}}>{row.rank}</td>
                        <td style={{padding:'12px', display:'flex', alignItems:'center', gap:'10px'}}>
                          {row.team.logo ? <img src={row.team.logo} width="24" height="24" style={{objectFit:'contain'}}/> : <span>🛡️</span>}
                          <span style={{fontWeight:'bold'}}>{row.team.name}</span>
                        </td>
                        <td style={{padding:'12px', textAlign:'center'}}>{row.played}</td>
                        <td style={{padding:'12px', textAlign:'center'}}>{row.won}</td>
                        <td style={{padding:'12px', textAlign:'center'}}>{row.draw}</td>
                        <td style={{padding:'12px', textAlign:'center'}}>{row.lost}</td>
                        <td style={{padding:'12px', textAlign:'center', color: row.goals_diff > 0 ? 'green':'red'}}>{row.goals_diff}</td>
                        <td style={{padding:'12px', textAlign:'center', fontWeight:'bold', fontSize:'1.1em', color: colors.primaryDark}}>{row.points}</td>
                        <td style={{padding:'12px', textAlign:'center'}}>
                           {row.form?.split('').slice(0,5).map((char, i) => (
                             <span key={i} style={{
                               display:'inline-block', width:'18px', height:'18px', borderRadius:'50%', fontSize:'0.7em', color:'white', textAlign:'center', lineHeight:'18px', marginRight:'2px',
                               backgroundColor: char === 'W' ? '#2BD9B9' : char === 'L' ? '#FF5252' : '#FFD700'
                             }}>{char}</span>
                           ))}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}