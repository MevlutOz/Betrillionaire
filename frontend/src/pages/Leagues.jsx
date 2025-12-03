import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const colors = {
  primaryDark: '#421F73',
  secondaryDark: '#331859',
  tealSuccess: '#2BD9B9',
  bgLight: '#F4F6F8',
  white: '#FFFFFF',
  greyText: '#8A8EA6',
  plPurple: '#38003c'
};

export default function Leagues() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (!token || !storedUser) {
      navigate('/login');
      return;
    }
    setUser(JSON.parse(storedUser));
  }, [navigate]);

  if (!user) return <div style={{display:'flex', justifyContent:'center', marginTop:'50px'}}>Yükleniyor...</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', backgroundColor: colors.bgLight, fontFamily: "'Roboto', sans-serif" }}>
      
      <header style={{ height: '80px', backgroundColor: colors.primaryDark, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 30px', boxShadow: '0 4px 20px rgba(0,0,0,0.2)', zIndex: 100, flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <img src="/betrillionaire.png" alt="Betrillionaire" style={{ height: '50px', objectFit: 'contain' }} />
        </div>

        {/* GÜNCELLENMİŞ NAVİGASYON */}
        <nav style={{ display: 'flex', gap: '10px' }}>
          <button onClick={() => navigate('/bulletin')} style={{ ...styles.headerBtn, color: colors.greyText }}>⚽ Bülten</button>
          <button onClick={() => navigate('/my-coupons')} style={{ ...styles.headerBtn, color: colors.greyText }}>🎫 Kuponlarım</button>
          <button style={{ ...styles.headerBtn, color: colors.white, borderBottom: `3px solid ${colors.tealSuccess}` }}>🏆 Ligler</button>
          <button onClick={() => navigate('/wallet')} style={{ ...styles.headerBtn, color: colors.greyText }}>💰 Cüzdanım</button>
        </nav>

        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.85em', color: colors.greyText }}>Hesap Sahibi</div>
            <div style={{ fontWeight: 'bold', color: colors.white }}>{user.name}</div>
          </div>
          <button onClick={() => { localStorage.clear(); navigate('/login'); }} style={{ padding: '8px 15px', backgroundColor: 'transparent', border: `1px solid ${colors.greyText}`, color: colors.greyText, borderRadius: '6px', cursor: 'pointer', fontSize: '0.8em' }}>Çıkış</button>
        </div>
      </header>

      <div style={{ padding: '40px', flex: 1, overflowY: 'auto' }}>
        <h2 style={{ color: colors.primaryDark, marginBottom: '30px', borderBottom: '2px solid #e0e0e0', paddingBottom: '15px', display:'flex', alignItems:'center', gap:'10px' }}>
          <span style={{backgroundColor: colors.tealSuccess, width:'5px', height:'30px', borderRadius:'5px', display:'inline-block'}}></span>
          Lig Arşivi
        </h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '25px' }}>
          <div onClick={() => navigate('/leagues/premier-league')} style={{ backgroundColor: colors.white, padding: '40px', borderRadius: '20px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', cursor: 'pointer', textAlign: 'center', border: '2px solid transparent', transition: 'all 0.3s', position: 'relative', overflow: 'hidden' }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-8px)'; e.currentTarget.style.boxShadow = '0 15px 35px rgba(66, 31, 115, 0.15)'; e.currentTarget.style.border = `2px solid ${colors.primaryDark}`; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.05)'; e.currentTarget.style.border = '2px solid transparent'; }}
          >
            <div style={{position:'absolute', top:0, left:0, right:0, height:'6px', background: `linear-gradient(90deg, ${colors.primaryDark}, ${colors.plPurple})`}}></div>
            <img src="https://upload.wikimedia.org/wikipedia/en/f/f2/Premier_League_Logo.svg" alt="PL" style={{ height: '100px', marginBottom: '20px' }} />
            <h3 style={{ color: colors.plPurple, margin: 0, fontSize: '1.5em' }}>Premier League</h3>
            <p style={{ color: colors.greyText, marginTop: '5px' }}>İngiltere</p>
            <span style={{ display:'inline-block', marginTop:'15px', padding:'5px 15px', backgroundColor: colors.bgLight, color: colors.primaryDark, borderRadius:'20px', fontSize:'0.8em', fontWeight:'bold' }}>Veriler Mevcut</span>
          </div>

          {['La Liga', 'Serie A', 'Bundesliga'].map(lig => (
            <div key={lig} style={{ backgroundColor: '#e0e0e0', padding: '40px', borderRadius: '20px', textAlign: 'center', opacity: 0.6, cursor: 'not-allowed', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
              <div style={{ fontSize:'4em', color:'#ccc', marginBottom:'10px' }}>⚽</div>
              <h3 style={{ color: '#666', margin: 0 }}>{lig}</h3>
              <span style={{ fontSize: '0.8em', marginTop: '15px', padding: '5px 15px', backgroundColor: '#ccc', borderRadius: '20px', color:'#666', fontWeight:'bold' }}>YAKINDA</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const styles = { headerBtn: { padding: '0 15px', height: '100%', backgroundColor: 'transparent', border: 'none', borderBottom: '3px solid transparent', cursor: 'pointer', fontSize: '0.95em', fontWeight: 'bold', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '8px' } };