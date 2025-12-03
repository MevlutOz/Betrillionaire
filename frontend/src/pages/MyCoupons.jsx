import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const colors = {
  primaryDark: '#421F73',
  secondaryDark: '#331859',
  tealSuccess: '#2BD9B9',
  danger: '#FF5252',
  greyText: '#8A8EA6',
  white: '#FFFFFF',
  bgLight: '#F4F6F8'
};

export default function MyCoupons() {
  const [user, setUser] = useState(null);
  const [pastCoupons, setPastCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (!token || !storedUser) {
      navigate('/login');
      return;
    }
    const parsedUser = JSON.parse(storedUser);
    setUser(parsedUser);
    fetchPastCoupons(parsedUser.id);
  }, [navigate]);

  const fetchPastCoupons = async (userId) => {
    try {
      const response = await axios.get(`http://localhost:3000/coupons/user/${userId}`);
      setPastCoupons(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Kupon geçmişi çekilemedi:", error);
      setLoading(false);
    }
  };

  if (loading) return <div style={{display:'flex', justifyContent:'center', marginTop:'50px'}}>Yükleniyor...</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', backgroundColor: colors.bgLight, fontFamily: "'Roboto', sans-serif" }}>
      
      {/* HEADER */}
      <header style={{ height: '80px', backgroundColor: colors.primaryDark, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 30px', boxShadow: '0 4px 20px rgba(0,0,0,0.2)', zIndex: 100 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <img src="/betrillionaire.png" alt="Betrillionaire" style={{ height: '50px', objectFit: 'contain' }} />
        </div>
        <nav style={{ display: 'flex', gap: '10px' }}>
          <button onClick={() => navigate('/bulletin')} style={{ ...styles.headerBtn, color: colors.greyText }}>⚽ Bülten</button>
          <button style={{ ...styles.headerBtn, color: colors.white, borderBottom: `3px solid ${colors.tealSuccess}` }}>🎫 Kuponlarım</button>
          <button onClick={() => navigate('/leagues')} style={{ ...styles.headerBtn, color: colors.greyText }}>🏆 Ligler</button>
          <button onClick={() => navigate('/wallet')} style={{ ...styles.headerBtn, color: colors.greyText }}>💰 Cüzdanım</button>
        </nav>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.85em', color: colors.greyText }}>Hoşgeldin,</div>
            <div style={{ fontWeight: 'bold', color: colors.white }}>{user?.name}</div>
          </div>
          <button onClick={() => { localStorage.clear(); navigate('/login'); }} style={{ padding: '8px 15px', backgroundColor: 'transparent', border: `1px solid ${colors.greyText}`, color: colors.greyText, borderRadius: '6px', cursor: 'pointer', fontSize: '0.8em' }}>Çıkış</button>
        </div>
      </header>

      {/* GÖVDE */}
      <div style={{ flex: 1, padding: '40px', overflowY: 'auto', display:'flex', flexDirection:'column', alignItems:'center' }}>
        <div style={{ width:'100%', maxWidth:'900px' }}>
          <h2 style={{ color: colors.primaryDark, marginBottom: '30px', borderBottom: '2px solid #e0e0e0', paddingBottom: '10px' }}>Kupon Geçmişim</h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {pastCoupons.length === 0 ? <div style={{textAlign:'center', color: colors.greyText, padding:'40px'}}>Henüz kuponunuz yok.</div> : null}
            
            {pastCoupons.map((c) => (
              <div key={c.coupon_id} style={{ backgroundColor: colors.white, padding: '25px 30px', borderRadius: '15px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', borderLeft: `8px solid ${c.status === 'WON' ? colors.tealSuccess : c.status === 'LOST' ? colors.danger : '#FFC107'}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '15px' }}>
                    <span style={{ fontWeight: 'bold', fontSize:'1.2em', color: colors.primaryDark }}>Kupon #{c.coupon_id}</span>
                    <span style={{ fontSize: '0.85em', color: colors.greyText, backgroundColor:'#f0f0f0', padding:'4px 10px', borderRadius:'6px' }}>{new Date(c.created_at).toLocaleString('tr-TR')}</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {c.bets.map((bet) => (
                      <div key={bet.bet_id} style={{ fontSize: '1em', color: '#444' }}>
                        ⚽ {bet.match.homeTeam.name} vs {bet.match.awayTeam.name} <span style={{color: colors.primaryDark, fontWeight:'bold', marginLeft:'10px'}}>[ {bet.bet_type} @ {parseFloat(bet.odd_value).toFixed(2)} ]</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div style={{ textAlign: 'right', minWidth: '180px', borderLeft:'1px solid #eee', paddingLeft:'30px' }}>
                   <div style={{ fontSize: '1em', color: colors.greyText }}>Yatırılan: <b style={{color:'#333'}}>{c.stake} TL</b></div>
                   <div style={{ fontSize: '1em', color: colors.greyText }}>Oran: <b style={{color:'#333'}}>{parseFloat(c.total_odds).toFixed(2)}</b></div>
                   <div style={{ fontSize: '1.5em', fontWeight: 'bold', color: c.status === 'WON' ? colors.tealSuccess : c.status === 'LOST' ? colors.greyText : '#FFC107', marginTop: '10px' }}>
                     {c.status === 'WON' ? `+${c.potential_win} TL` : c.status === 'LOST' ? 'KAYBETTİ' : `${c.potential_win} TL`}
                   </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = { headerBtn: { padding: '0 15px', height: '100%', backgroundColor: 'transparent', border: 'none', borderBottom: '3px solid transparent', cursor: 'pointer', fontSize: '0.95em', fontWeight: 'bold', transition: 'all 0.2s' } };