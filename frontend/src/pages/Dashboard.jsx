import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

// --- RENK PALETİ ---
const colors = {
  primaryDark: '#421F73',   // Ana Mor (Header Arkaplanı)
  secondaryDark: '#331859', // Koyu Mor (Kupon Arkaplanı)
  accentBlue: '#5550F2',    // Vurgu Rengi
  tealSuccess: '#2BD9B9',   // Yeşil/Turkuaz (Logo ile uyumlu)
  greyText: '#8A8EA6',
  white: '#FFFFFF',
  bgLight: '#F4F6F8',       // Sayfa Zemini
  danger: '#FF5252'
};

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [matches, setMatches] = useState([]);
  const [coupon, setCoupon] = useState([]); 
  const [stake, setStake] = useState(100);
  const [activeTab, setActiveTab] = useState('bulletin');
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
    setUser(JSON.parse(storedUser));
    fetchMatches();
  }, [navigate]);

  const fetchMatches = async () => {
    try {
      const response = await axios.get('http://localhost:3000/matches');
      setMatches(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Hata:", error);
      setLoading(false);
    }
  };

  const fetchPastCoupons = async () => {
    if (!user) return;
    try {
      const response = await axios.get(`http://localhost:3000/coupons/user/${user.id}`);
      setPastCoupons(response.data);
    } catch (error) {
      console.error("Kupon geçmişi çekilemedi:", error);
    }
  };

  useEffect(() => {
    if (activeTab === 'coupons') {
      fetchPastCoupons();
    }
  }, [activeTab]);

  const addToCoupon = (match, betType, oddValue) => {
    const existingBetIndex = coupon.findIndex(item => item.match_id === match.match_id);
    if (existingBetIndex !== -1 && coupon[existingBetIndex].bet_type === betType) {
      const newCoupon = coupon.filter((_, index) => index !== existingBetIndex);
      setCoupon(newCoupon);
      return;
    }
    const newBet = {
      match_id: match.match_id,
      match_name: `${match.homeTeam.name} - ${match.awayTeam.name}`,
      bet_type: betType,
      odd_value: parseFloat(oddValue),
      selected_option: betType
    };
    let updatedCoupon = [...coupon];
    if (existingBetIndex !== -1) {
      updatedCoupon[existingBetIndex] = newBet;
    } else {
      updatedCoupon.push(newBet);
    }
    setCoupon(updatedCoupon);
  };

  const handlePlaceBet = async () => {
    if (!user) return;
    if (coupon.length === 0) { alert("Lütfen en az bir maç seçin."); return; }
    if (user.balance < stake) { alert("Yetersiz bakiye!"); return; }

    try {
      const payload = { userId: user.id, stake: stake, bets: coupon };
      const response = await axios.post('http://localhost:3000/coupons', payload);

      if (response.status === 201) {
        alert(`Kupon Başarıyla Oynandı!`);
        setCoupon([]);
        const updatedUser = { ...user, balance: user.balance - stake };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        if (activeTab === 'coupons') fetchPastCoupons();
      }
    } catch (error) {
      alert("Hata: " + (error.response?.data?.message || error.message));
    }
  };

  const totalOdds = coupon.reduce((acc, item) => acc * item.odd_value, 1).toFixed(2);
  const potentialWin = (totalOdds * stake).toFixed(2);
  const isSelected = (matchId, betType) => coupon.some(item => item.match_id === matchId && item.bet_type === betType);
  const getOddValue = (matchOdds, type) => {
    const odd = matchOdds.find(o => o.bet_type === type);
    return odd ? odd.odd_value : null;
  };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: colors.bgLight, color: colors.primaryDark }}>Yükleniyor...</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', backgroundColor: colors.bgLight, fontFamily: "'Roboto', sans-serif" }}>
      
      {/* --- 1. HEADER (Üst Bilgi Paneli) --- */}
      {/* Material Design: AppBar konsepti, derinlik için boxShadow eklendi */}
      <header style={{
        height: '80px',
        backgroundColor: colors.primaryDark,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 30px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.2)', // Derin gölge
        zIndex: 100,
        position: 'relative'
      }}>
        {/* LOGO ALANI */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          {/* Logo Dosyası: public klasörüne 'logo.png' olarak attığını varsayıyorum */}
          <img src="/betrillionaire.png" alt="Betrillionaire Logo" style={{ height: '50px', objectFit: 'contain' }} />
          {/* Logo yüklenmezse diye yazı yedeği */}
          {/* <h1 style={{ fontSize: '1.5em', fontWeight: 'bold', margin: 0, color: colors.white, letterSpacing: '1px' }}>
            BET<span style={{ color: colors.tealSuccess }}>RILLIONAIRE</span>
          </h1> */}
        </div>

        {/* ÜST NAVİGASYON (Ortada) */}
        <nav style={{ display: 'flex', gap: '10px' }}>
          <button 
            onClick={() => setActiveTab('bulletin')}
            style={{ 
              ...styles.headerBtn, 
              borderBottom: activeTab === 'bulletin' ? `3px solid ${colors.tealSuccess}` : '3px solid transparent',
              color: activeTab === 'bulletin' ? colors.white : colors.greyText
            }}
          >
            ⚽ Bülten
          </button>
          <button 
            onClick={() => setActiveTab('coupons')}
            style={{ 
              ...styles.headerBtn, 
              borderBottom: activeTab === 'coupons' ? `3px solid ${colors.tealSuccess}` : '3px solid transparent',
              color: activeTab === 'coupons' ? colors.white : colors.greyText
            }}
          >
            🎫 Kuponlarım
          </button>
          <button 
            onClick={() => navigate('/wallet')}
            style={{ ...styles.headerBtn, color: colors.greyText }}
          >
            💰 Cüzdanım
          </button>
        </nav>

        {/* KULLANICI PROFİLİ (Sağda) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.85em', color: colors.greyText }}>Hoşgeldin,</div>
            <div style={{ fontWeight: 'bold', color: colors.white }}>{user?.name}</div>
          </div>
          <div style={{ padding: '8px 15px', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.8em', color: colors.greyText }}>Bakiye:</span>
            <span style={{ color: colors.tealSuccess, fontWeight: 'bold' }}>{parseFloat(user?.balance).toFixed(2)} TL</span>
          </div>
          <button 
            onClick={() => { localStorage.clear(); navigate('/login'); }}
            style={{ padding: '8px 15px', backgroundColor: 'transparent', border: `1px solid ${colors.greyText}`, color: colors.greyText, borderRadius: '6px', cursor: 'pointer', fontSize: '0.8em' }}
          >
            Çıkış
          </button>
        </div>
      </header>

      {/* --- 2. GÖVDE (Body Container) --- */}
      {/* Header sabit, alt taraf scroll edilebilir */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        
        {/* MAIN CONTENT (Orta Alan - Scrollable) */}
        <div style={{ flex: 1, padding: '30px', overflowY: 'auto' }}>
          
          <h2 style={{ color: colors.primaryDark, marginBottom: '20px', borderBottom: '2px solid #e0e0e0', paddingBottom: '10px', display: 'inline-block' }}>
            {activeTab === 'bulletin' ? 'Güncel Bülten' : 'Kupon Geçmişi'}
          </h2>

          {/* BÜLTEN */}
          {activeTab === 'bulletin' ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '25px' }}>
              {matches.map((match) => (
                <div key={match.match_id} style={styles.card}>
                  <div style={{ padding: '15px', backgroundColor: '#fafafa', borderBottom: `1px solid #eee`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.8em', color: colors.primaryDark, fontWeight: 'bold', textTransform: 'uppercase', display:'flex', alignItems:'center', gap:'5px' }}>
                      🏁 {match.league.name}
                    </span>
                    <span style={{ fontSize: '0.8em', color: colors.greyText }}>
                      {new Date(match.match_date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </span>
                  </div>
                  
                  <div style={{ padding: '20px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                      <span style={{ fontWeight: 'bold', color: '#333', width: '40%', textAlign: 'right', fontSize:'1.1em' }}>{match.homeTeam.name}</span>
                      <span style={{ backgroundColor: colors.secondaryDark, color: colors.tealSuccess, padding: '5px 10px', borderRadius: '6px', fontSize: '0.9em', fontWeight:'bold' }}>VS</span>
                      <span style={{ fontWeight: 'bold', color: '#333', width: '40%', textAlign: 'left', fontSize:'1.1em' }}>{match.awayTeam.name}</span>
                    </div>

                    <div style={{ display: 'flex', gap: '10px' }}>
                      {['Mac Sonucu 1', 'Mac Sonucu X', 'Mac Sonucu 2'].map((type, idx) => {
                        const val = getOddValue(match.odds, type);
                        if (!val) return null;
                        const active = isSelected(match.match_id, type);
                        return (
                          <button 
                            key={idx}
                            onClick={() => addToCoupon(match, type, val)}
                            style={{ 
                              flex: 1, 
                              padding: '12px 5px', 
                              borderRadius: '8px', 
                              border: active ? `1px solid ${colors.accentBlue}` : '1px solid #e0e0e0', 
                              cursor: 'pointer', 
                              backgroundColor: active ? colors.accentBlue : colors.white, 
                              color: active ? colors.white : colors.primaryDark,
                              transition: 'all 0.2s',
                              boxShadow: active ? '0 4px 12px rgba(85, 80, 242, 0.4)' : '0 2px 5px rgba(0,0,0,0.05)',
                              transform: active ? 'translateY(-2px)' : 'none'
                            }}
                          >
                            <div style={{ fontSize: '0.75em', opacity: active ? 0.9 : 0.6, marginBottom: '4px' }}>{type === 'Mac Sonucu 1' ? '1' : type === 'Mac Sonucu X' ? 'X' : '2'}</div>
                            <div style={{ fontWeight: 'bold', fontSize: '1.1em' }}>{val}</div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            // KUPON GEÇMİŞİ
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', maxWidth: '900px' }}>
              {pastCoupons.length === 0 ? <div style={{textAlign:'center', color: colors.greyText, padding:'40px'}}>Henüz kuponunuz yok.</div> : null}
              {pastCoupons.map((c) => (
                <div key={c.coupon_id} style={{ 
                  backgroundColor: colors.white, 
                  padding: '20px 30px', 
                  borderRadius: '12px', 
                  boxShadow: '0 4px 15px rgba(0,0,0,0.05)', // Hafif gölge
                  borderLeft: `8px solid ${c.status === 'WON' ? colors.tealSuccess : c.status === 'LOST' ? colors.danger : '#FFC107'}`,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '12px' }}>
                      <span style={{ fontWeight: 'bold', fontSize:'1.1em', color: colors.primaryDark }}>Kupon #{c.coupon_id}</span>
                      <span style={{ fontSize: '0.85em', color: colors.greyText, backgroundColor:'#f0f0f0', padding:'2px 8px', borderRadius:'4px' }}>{new Date(c.created_at).toLocaleString('tr-TR')}</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {c.bets.map((bet) => (
                        <div key={bet.bet_id} style={{ fontSize: '0.95em', color: '#444' }}>
                          ⚽ {bet.match.homeTeam.name} vs {bet.match.awayTeam.name} <span style={{color: colors.primaryDark, fontWeight:'bold', marginLeft:'10px'}}>[ {bet.bet_type} @ {parseFloat(bet.odd_value).toFixed(2)} ]</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', minWidth: '160px', borderLeft:'1px solid #eee', paddingLeft:'20px' }}>
                     <div style={{ fontSize: '0.9em', color: colors.greyText }}>Yatırılan: <b style={{color:'#333'}}>{c.stake} TL</b></div>
                     <div style={{ fontSize: '0.9em', color: colors.greyText }}>Oran: <b style={{color:'#333'}}>{parseFloat(c.total_odds).toFixed(2)}</b></div>
                     <div style={{ fontSize: '1.4em', fontWeight: 'bold', color: c.status === 'WON' ? colors.tealSuccess : c.status === 'LOST' ? colors.greyText : '#FFC107', marginTop: '8px' }}>
                       {c.status === 'WON' ? `+${c.potential_win} TL` : c.status === 'LOST' ? 'KAYBETTİ' : `${c.potential_win} TL`}
                     </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* --- 3. SAĞ PANEL (Kupon Sepeti) --- */}
        {/* Material Design: Drawer konsepti, soldan gelen derin gölge */}
        <div style={{ 
          width: '350px', 
          backgroundColor: colors.secondaryDark, 
          padding: '25px', 
          color: colors.white, 
          display: 'flex', 
          flexDirection: 'column', 
          boxShadow: '-4px 0 20px rgba(0,0,0,0.3)', // Derin gölge
          zIndex: 90
        }}>
          <h3 style={{ borderBottom: `1px solid rgba(255,255,255,0.1)`, paddingBottom: '15px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px', letterSpacing:'0.5px' }}>
            Kupon Oluştur
            <span style={{ fontSize: '0.7em', backgroundColor: colors.accentBlue, padding: '2px 8px', borderRadius: '12px', minWidth:'25px', textAlign:'center' }}>{coupon.length}</span>
          </h3>

          <div style={{ flex: 1, overflowY: 'auto' }}>
            {coupon.length === 0 ? (
              <div style={{ color: colors.greyText, textAlign: 'center', marginTop: '60px', padding:'0 20px', lineHeight:'1.6' }}>
                <div style={{fontSize:'3em', marginBottom:'10px', opacity:0.3}}>🎫</div>
                Bültenden oranlara tıklayarak kuponunu oluşturmaya başla.
              </div>
            ) : (
              coupon.map((item, index) => (
                <div key={index} style={{ backgroundColor: 'rgba(255,255,255,0.08)', padding: '15px', borderRadius: '10px', marginBottom: '12px', fontSize: '0.9em', borderLeft:`4px solid ${colors.tealSuccess}` }}>
                  <div style={{ fontWeight: 'bold', marginBottom: '6px', color: colors.white }}>{item.match_name}</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: colors.tealSuccess, alignItems:'center' }}>
                    <span style={{opacity:0.8}}>{item.bet_type}</span>
                    <span style={{ fontWeight: 'bold', backgroundColor: 'rgba(43, 217, 185, 0.15)', padding: '4px 8px', borderRadius: '6px', color: colors.tealSuccess }}>{item.odd_value}</span>
                  </div>
                </div>
              ))
            )}
          </div>

          <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: `1px solid rgba(255,255,255,0.1)` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '0.95em', color: colors.greyText }}>
              <span>Toplam Oran:</span>
              <span style={{ color: colors.tealSuccess, fontWeight: 'bold' }}>{totalOdds}</span>
            </div>
            
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85em', color: colors.greyText }}>Bahis Tutarı (TL)</label>
              <input 
                type="number" 
                value={stake} 
                onChange={(e) => setStake(Number(e.target.value))}
                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: 'none', backgroundColor: 'rgba(255,255,255,0.1)', color: colors.white, fontWeight: 'bold', textAlign: 'center', fontSize:'1.1em', outline:'none' }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', alignItems: 'center', backgroundColor:'rgba(0,0,0,0.2)', padding:'10px', borderRadius:'8px' }}>
              <span style={{ fontSize: '0.9em', color: colors.greyText }}>Olası Kazanç</span>
              <span style={{ fontWeight: 'bold', color: colors.tealSuccess, fontSize: '1.4em' }}>{potentialWin} <span style={{fontSize:'0.6em'}}>TL</span></span>
            </div>

            <button 
              disabled={coupon.length === 0}
              onClick={handlePlaceBet}
              style={{ 
                width: '100%', 
                padding: '16px', 
                backgroundColor: coupon.length > 0 ? colors.tealSuccess : 'rgba(255,255,255,0.05)', 
                color: coupon.length > 0 ? '#1a1a1a' : 'rgba(255,255,255,0.2)', 
                border: 'none', 
                borderRadius: '12px', 
                fontWeight: 'bold', 
                fontSize: '1em',
                cursor: coupon.length > 0 ? 'pointer' : 'not-allowed',
                transition: 'all 0.3s',
                boxShadow: coupon.length > 0 ? `0 4px 20px ${colors.tealSuccess}55` : 'none',
                textTransform: 'uppercase',
                letterSpacing: '1px'
              }}
            >
              {coupon.length > 0 ? 'KUPONU OYNA' : 'MAÇ SEÇİNİZ'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

// Inline Styles
const styles = {
  headerBtn: {
    padding: '0 15px',
    height: '100%', 
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
    fontSize: '0.95em',
    fontWeight: 'bold',
    transition: 'all 0.2s',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  card: {
    backgroundColor: '#fff', 
    borderRadius: '16px', 
    boxShadow: '0 4px 15px rgba(0,0,0,0.05)', // Kart gölgesi
    overflow: 'hidden',
    transition: 'transform 0.2s, box-shadow 0.2s',
    border: '1px solid rgba(0,0,0,0.02)',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between'
  }
};