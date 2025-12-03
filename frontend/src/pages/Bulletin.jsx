import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

// --- RENK PALETİ ---
const colors = {
  primaryDark: '#421F73',
  secondaryDark: '#331859',
  accentBlue: '#5550F2',
  tealSuccess: '#2BD9B9',
  greyText: '#8A8EA6',
  white: '#FFFFFF',
  bgLight: '#F4F6F8'
};

export default function Bulletin() {
  const [user, setUser] = useState(null);
  const [matches, setMatches] = useState([]);
  const [coupon, setCoupon] = useState([]); 
  const [stake, setStake] = useState(100);
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
        // Bakiyeyi güncelle
        const updatedUser = { ...user, balance: user.balance - stake };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        
        // Kupon oynandıktan sonra Kuponlarım sayfasına yönlendir
        navigate('/my-coupons');
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
      
      {/* HEADER */}
      <header style={{ height: '80px', backgroundColor: colors.primaryDark, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 30px', boxShadow: '0 4px 20px rgba(0,0,0,0.2)', zIndex: 100 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <img src="/betrillionaire.png" alt="Betrillionaire" style={{ height: '50px', objectFit: 'contain' }} />
        </div>
        <nav style={{ display: 'flex', gap: '10px' }}>
          <button style={{ ...styles.headerBtn, color: colors.white, borderBottom: `3px solid ${colors.tealSuccess}` }}>⚽ Bülten</button>
          <button onClick={() => navigate('/my-coupons')} style={{ ...styles.headerBtn, color: colors.greyText }}>🎫 Kuponlarım</button>
          <button onClick={() => navigate('/leagues')} style={{ ...styles.headerBtn, color: colors.greyText }}>🏆 Ligler</button>
          <button onClick={() => navigate('/wallet')} style={{ ...styles.headerBtn, color: colors.greyText }}>💰 Cüzdanım</button>
        </nav>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.85em', color: colors.greyText }}>Hoşgeldin,</div>
            <div style={{ fontWeight: 'bold', color: colors.white }}>{user?.name}</div>
          </div>
          <div style={{ padding: '8px 15px', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '20px' }}>
            <span style={{ fontSize: '0.8em', color: colors.greyText }}>Bakiye: </span>
            <span style={{ color: colors.tealSuccess, fontWeight: 'bold' }}>{parseFloat(user?.balance).toFixed(2)} TL</span>
          </div>
          <button onClick={() => { localStorage.clear(); navigate('/login'); }} style={{ padding: '8px 15px', backgroundColor: 'transparent', border: `1px solid ${colors.greyText}`, color: colors.greyText, borderRadius: '6px', cursor: 'pointer', fontSize: '0.8em' }}>Çıkış</button>
        </div>
      </header>

      {/* GÖVDE */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        
        {/* SOL: MAÇ LİSTESİ */}
        <div style={{ flex: 1, padding: '30px', overflowY: 'auto' }}>
          <h2 style={{ color: colors.primaryDark, marginBottom: '20px', borderBottom: '2px solid #e0e0e0', paddingBottom: '10px' }}>Güncel Bülten</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '25px' }}>
            {matches.map((match) => (
              <div key={match.match_id} style={styles.card}>
                <div style={{ padding: '15px', backgroundColor: '#fafafa', borderBottom: `1px solid #eee`, display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '0.8em', color: colors.primaryDark, fontWeight: 'bold', textTransform: 'uppercase' }}>🏁 {match.league.name}</span>
                  <span style={{ fontSize: '0.8em', color: colors.greyText }}>{new Date(match.match_date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
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
                        <button key={idx} onClick={() => addToCoupon(match, type, val)} style={{ flex: 1, padding: '12px 5px', borderRadius: '8px', border: active ? `1px solid ${colors.accentBlue}` : '1px solid #e0e0e0', cursor: 'pointer', backgroundColor: active ? colors.accentBlue : colors.white, color: active ? colors.white : colors.primaryDark, transition: 'all 0.2s', boxShadow: active ? '0 4px 12px rgba(85, 80, 242, 0.4)' : '0 2px 5px rgba(0,0,0,0.05)', transform: active ? 'translateY(-2px)' : 'none' }}>
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
        </div>

        {/* SAĞ: KUPON SEPETİ */}
        <div style={{ width: '350px', backgroundColor: colors.secondaryDark, padding: '25px', color: colors.white, display: 'flex', flexDirection: 'column', boxShadow: '-4px 0 20px rgba(0,0,0,0.3)', zIndex: 90 }}>
          <h3 style={{ borderBottom: `1px solid rgba(255,255,255,0.1)`, paddingBottom: '15px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            Kupon Oluştur <span style={{ fontSize: '0.7em', backgroundColor: colors.accentBlue, padding: '2px 8px', borderRadius: '12px' }}>{coupon.length}</span>
          </h3>
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {coupon.length === 0 ? <div style={{ color: colors.greyText, textAlign: 'center', marginTop: '60px' }}>Bültenden oranlara tıklayarak kuponunu oluşturmaya başla.</div> : coupon.map((item, index) => (
              <div key={index} style={{ backgroundColor: 'rgba(255,255,255,0.08)', padding: '15px', borderRadius: '10px', marginBottom: '12px', fontSize: '0.9em', borderLeft:`4px solid ${colors.tealSuccess}` }}>
                <div style={{ fontWeight: 'bold', marginBottom: '6px' }}>{item.match_name}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: colors.tealSuccess }}><span>{item.bet_type}</span><span style={{ fontWeight: 'bold', backgroundColor: 'rgba(43, 217, 185, 0.15)', padding: '4px 8px', borderRadius: '6px' }}>{item.odd_value}</span></div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: `1px solid rgba(255,255,255,0.1)` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', color: colors.greyText }}><span>Toplam Oran:</span><span style={{ color: colors.tealSuccess, fontWeight: 'bold' }}>{totalOdds}</span></div>
            <div style={{ marginBottom: '15px' }}><label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85em', color: colors.greyText }}>Bahis Tutarı (TL)</label><input type="number" value={stake} onChange={(e) => setStake(Number(e.target.value))} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: 'none', backgroundColor: 'rgba(255,255,255,0.1)', color: colors.white, fontWeight: 'bold', textAlign: 'center' }} /></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', alignItems: 'center' }}><span style={{ fontSize: '0.9em', color: colors.greyText }}>Olası Kazanç</span><span style={{ fontWeight: 'bold', color: colors.tealSuccess, fontSize: '1.4em' }}>{potentialWin} TL</span></div>
            <button disabled={coupon.length === 0} onClick={handlePlaceBet} style={{ width: '100%', padding: '16px', backgroundColor: coupon.length > 0 ? colors.tealSuccess : 'rgba(255,255,255,0.05)', color: coupon.length > 0 ? '#1a1a1a' : 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '12px', fontWeight: 'bold', cursor: coupon.length > 0 ? 'pointer' : 'not-allowed', boxShadow: coupon.length > 0 ? `0 4px 20px ${colors.tealSuccess}55` : 'none' }}>{coupon.length > 0 ? 'KUPONU OYNA' : 'MAÇ SEÇİNİZ'}</button>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  headerBtn: { padding: '0 15px', height: '100%', backgroundColor: 'transparent', border: 'none', borderBottom: '3px solid transparent', cursor: 'pointer', fontSize: '0.95em', fontWeight: 'bold', transition: 'all 0.2s' },
  card: { backgroundColor: '#fff', borderRadius: '16px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', overflow: 'hidden', border: '1px solid rgba(0,0,0,0.02)' }
};