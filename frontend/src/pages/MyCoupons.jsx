import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
// İkon Seti
import { BiFootball, BiTrophy, BiWallet, BiTime, BiCheckCircle, BiXCircle } from "react-icons/bi";
import { RiCoupon3Line } from "react-icons/ri";
import { MdOutlineHistory } from "react-icons/md";

const colors = {
  primaryDark: '#421F73',
  tealSuccess: '#2BD9B9',
  danger: '#FF5252',
  warning: '#FFC107',
  bgLight: '#F4F6F8',
  white: '#FFFFFF',
  greyText: '#8A8EA6'
};

export default function MyCoupons() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Header Buton Stili
  const headerBtnStyle = {
    background: 'transparent',
    border: 'none',
    color: colors.greyText,
    cursor: 'pointer',
    fontSize: '0.95em',
    fontWeight: 'bold',
    padding: '10px 15px',
    display: 'flex', alignItems: 'center', gap: '6px'
  };

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) { navigate('/login'); return; }
    
    // Kuponları Çek
    axios.get(`http://localhost:3000/coupons/user/${user.id}`)
      .then(res => {
        setCoupons(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [navigate]);

  // Duruma göre renk ve ikon seçimi
  const getStatusStyle = (status) => {
    switch(status) {
      case 'WON': return { color: colors.tealSuccess, icon: <BiCheckCircle size={24}/>, label: 'KAZANDI', border: colors.tealSuccess };
      case 'LOST': return { color: colors.danger, icon: <BiXCircle size={24}/>, label: 'KAYBETTİ', border: colors.danger };
      default: return { color: colors.warning, icon: <BiTime size={24}/>, label: 'BEKLİYOR', border: colors.warning };
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', backgroundColor: colors.bgLight, fontFamily: "'Roboto', sans-serif" }}>
      
      {/* HEADER */}
      <header style={{ height: '80px', backgroundColor: colors.primaryDark, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 30px', boxShadow: '0 4px 20px rgba(0,0,0,0.2)', zIndex: 100 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <img src="/betrillionaire.png" alt="Logo" style={{ height: '50px', objectFit: 'contain' }} />
        </div>
        <nav style={{ display: 'flex', gap: '10px' }}>
          <button onClick={() => navigate('/bulletin')} style={headerBtnStyle}><BiFootball size={20}/> Bülten</button>
          <button style={{ ...headerBtnStyle, color: 'white', borderBottom: `3px solid ${colors.tealSuccess}` }}><RiCoupon3Line size={20}/> Kuponlarım</button>
          <button onClick={() => navigate('/leagues')} style={headerBtnStyle}><BiTrophy size={20}/> Ligler</button>
          <button onClick={() => navigate('/wallet')} style={headerBtnStyle}><BiWallet size={20}/> Cüzdanım</button>
          <button onClick={() => navigate('/results')} style={headerBtnStyle}><MdOutlineHistory size={22}/> Sonuçlar</button>
        </nav>
        <div style={{ width: '100px' }}></div>
      </header>

      {/* İÇERİK */}
      <div style={{ flex: 1, padding: '40px', overflowY: 'auto', display:'flex', flexDirection:'column', alignItems:'center' }}>
        <div style={{ width:'100%', maxWidth:'800px' }}>
          
          <h2 style={{ color: colors.primaryDark, marginBottom: '30px', borderBottom: '2px solid #ddd', paddingBottom: '10px', display:'flex', alignItems:'center', gap:'10px' }}>
            <RiCoupon3Line /> Kupon Geçmişim
          </h2>
          
          {loading ? <div>Yükleniyor...</div> : coupons.length === 0 ? <div style={{textAlign:'center', color:'#999'}}>Henüz kuponunuz yok.</div> : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {coupons.map((c) => {
                const statusInfo = getStatusStyle(c.status);
                return (
                  <div key={c.coupon_id} style={{ 
                    backgroundColor: 'white', 
                    borderRadius: '16px', 
                    boxShadow: '0 4px 15px rgba(0,0,0,0.05)', 
                    overflow: 'hidden',
                    display: 'flex',
                    borderLeft: `6px solid ${statusInfo.border}`
                  }}>
                    
                    {/* SOL: Maçlar */}
                    <div style={{ flex: 1, padding: '25px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                        <span style={{ fontWeight: 'bold', color: colors.primaryDark, fontSize:'1.1em' }}>Kupon #{c.coupon_id}</span>
                        <span style={{ fontSize: '0.85em', color: '#999' }}>{new Date(c.created_at).toLocaleString('tr-TR')}</span>
                      </div>
                      
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {c.bets.map((bet) => (
                          <div key={bet.bet_id} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.95em', color: '#555', padding:'8px', backgroundColor:'#f9f9f9', borderRadius:'8px' }}>
                            <BiFootball color={colors.primaryDark} />
                            <span style={{ fontWeight: 'bold' }}>{bet.match.homeTeam.name} - {bet.match.awayTeam.name}</span>
                            <span style={{ marginLeft: 'auto', backgroundColor: colors.primaryDark, color: 'white', padding: '2px 8px', borderRadius: '4px', fontSize: '0.8em' }}>
                              {bet.bet_type} @ {parseFloat(bet.odd_value).toFixed(2)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* SAĞ: Finansal Bilgiler */}
                    <div style={{ width: '200px', backgroundColor: '#fafafa', padding: '25px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-end', borderLeft: '1px solid #eee' }}>
                       
                       {/* Durum Badge */}
                       <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: statusInfo.color, fontWeight: 'bold', marginBottom: '15px', backgroundColor: 'white', padding: '5px 10px', borderRadius: '20px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
                         {statusInfo.icon} {statusInfo.label}
                       </div>

                       <div style={{ fontSize: '0.9em', color: '#888' }}>Yatırılan: <b style={{color:'#333'}}>{c.stake} TL</b></div>
                       <div style={{ fontSize: '0.9em', color: '#888', marginBottom:'10px' }}>Oran: <b style={{color:'#333'}}>{parseFloat(c.total_odds).toFixed(2)}</b></div>
                       
                       <div style={{ fontSize: '0.8em', color: '#888' }}>Kazanç</div>
                       <div style={{ fontSize: '1.6em', fontWeight: 'bold', color: c.status === 'WON' ? colors.tealSuccess : (c.status === 'LOST' ? '#ccc' : colors.warning) }}>
                         {c.potential_win} TL
                       </div>
                    </div>

                  </div>
                );
              })}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}