import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { BiFootball, BiTrophy, BiWallet } from "react-icons/bi"; 
import { RiCoupon3Line } from "react-icons/ri"; 
import { MdOutlineHistory } from "react-icons/md";
import { RiAdminLine } from "react-icons/ri"; 
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
// STİL TANIMLARI (Bu kısım eksik olduğu için hata alıyorsun)
const styles = {
  headerBtn: {
    padding: '10px 20px',
    cursor: 'pointer',
    border: 'none',
    backgroundColor: 'transparent',
    fontSize: '1em',
    fontWeight: 'bold',
    color: '#8A8EA6',
    borderBottom: '3px solid transparent',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: '16px',
    boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
    overflow: 'hidden',
    transition: 'transform 0.2s, box-shadow 0.2s',
    border: '1px solid #f0f0f0',
    // cursor: 'pointer' özelliğini zaten kodun içinde inline olarak ekledik
  }
};

export default function Bulletin() {
  const [user, setUser] = useState(null);
  const [matches, setMatches] = useState([]);
  const [coupon, setCoupon] = useState([]); 
  const [stake, setStake] = useState(100);
  const [loading, setLoading] = useState(true);
  const [selectedMatch, setSelectedMatch] = useState(null);
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

  const groupMatchesByLeague = (matches) => {
    return matches.reduce((acc, match) => {
      const leagueId = match.league.league_id;
      // Eğer bu lig henüz listede yoksa başlık bilgisini ekle
      if (!acc[leagueId]) {
        acc[leagueId] = {
          info: match.league, // Ligin adı ve logosu burada
          matches: []
        };
      }
      // Maçı ilgili ligin listesine at
      acc[leagueId].matches.push(match);
      return acc;
    }, {});
  };

  const groupedMatches = groupMatchesByLeague(matches);
  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: colors.bgLight, color: colors.primaryDark }}>Yükleniyor...</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', backgroundColor: colors.bgLight, fontFamily: "'Roboto', sans-serif" }}>
      
      {/* HEADER */}
      <header style={{ height: '80px', backgroundColor: colors.primaryDark, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 30px', boxShadow: '0 4px 20px rgba(0,0,0,0.2)', zIndex: 100 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <img src="/betrillionaire.png" alt="Betrillionaire" style={{ height: '50px', objectFit: 'contain' }} />
        </div>
        <nav style={{ display: 'flex', gap: '10px' }}>
          <button onClick={() => navigate('/bulletin')} style={{ ...styles.headerBtn, display:'flex', alignItems:'center', gap:'5px' }}><BiFootball size={20} /> Bülten</button> 
          <button onClick={() => navigate('/my-coupons')} style={{ ...styles.headerBtn, display:'flex', alignItems:'center', gap:'5px' }}><RiCoupon3Line size={20} /> Kuponlarım</button>
          <button onClick={() => navigate('/leagues')} style={{ ...styles.headerBtn, display:'flex', alignItems:'center', gap:'5px' }}><BiTrophy size={20} /> Ligler</button>
          <button onClick={() => navigate('/wallet')} style={{ ...styles.headerBtn, display:'flex', alignItems:'center', gap:'5px' }}><BiWallet size={20} /> Cüzdanım</button>
          <button onClick={() => navigate('/results')} style={{ ...styles.headerBtn, display:'flex', alignItems:'center', gap:'5px' }}><MdOutlineHistory size={22} /> Sonuçlar</button>
          {user?.isAdmin && (
            <button 
              onClick={() => navigate('/admin')} 
              style={{ ...styles.headerBtn, color: '#FF5252', borderBottom: '3px solid #FF5252' }}
            >
              🛡️ Admin
            </button>
          )}
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
        
        {/* SOL: MAÇ LİSTESİ (LIG GRUPLU) */}
        <div style={{ flex: 1, padding: '30px', overflowY: 'auto' }}>
          
          <h2 style={{ color: colors.primaryDark, marginBottom: '20px', borderBottom: '2px solid #e0e0e0', paddingBottom: '10px' }}>
            Güncel Bülten
          </h2>

          {/* GRUPLANMIŞ LİGLERİ DÖNÜYORUZ */}
          {Object.keys(groupedMatches).length === 0 ? (
             <div style={{textAlign:'center', padding:'20px', color:'#999'}}>Şu an bültende maç yok.</div>
          ) : (
            Object.values(groupedMatches).map((group) => (
              <div key={group.info.league_id} style={{ marginBottom: '35px' }}>
                
                {/* LİG BAŞLIĞI */}
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '15px', 
                  marginBottom: '15px',
                  padding: '10px 15px',
                  backgroundColor: '#fff',
                  borderRadius: '12px',
                  boxShadow: '0 2px 5px rgba(0,0,0,0.03)',
                  borderLeft: `5px solid ${colors.tealSuccess}`
                }}>
                  {/* Logo varsa göster, yoksa emoji koy */}
                  {group.info.logo ? (
                    <img src={group.info.logo} alt={group.info.name} style={{ width: '30px', height: '30px', objectFit: 'contain' }} />
                  ) : (
                    <span style={{ fontSize: '1.5em' }}>🏆</span>
                  )}
                  <h3 style={{ margin: 0, color: colors.primaryDark, fontSize: '1.1em' }}>{group.info.name}</h3>
                  <span style={{ fontSize: '0.8em', color: colors.greyText, marginTop:'2px' }}>({group.info.country || 'Dünya'})</span>
                </div>

                {/* BU LİGE AİT MAÇLAR (GRID YAPISI) */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px' }}>
                  {group.matches.map((match) => (
                    <div 
                    key={match.match_id} 
                    style={{...styles.card, cursor: 'pointer'}}
                    onClick={() => setSelectedMatch(match)}
                    >
                      
                      {/* Kart Üst Bilgi */}
                      <div style={{ padding: '10px 15px', backgroundColor: '#fafafa', borderBottom: `1px solid #eee`, display: 'flex', justifyContent: 'space-between', fontSize:'0.85em', color: colors.greyText }}>
                        <span>{new Date(match.match_date).toLocaleDateString('tr-TR')}</span>
                        <span style={{fontWeight:'bold', color: colors.primaryDark}}>{new Date(match.match_date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                      </div>
                      
                      {/* Takımlar ve Oranlar */}
                      <div style={{ padding: '20px', textAlign: 'center' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                          <span style={{ fontWeight: 'bold', color: '#333', width: '40%', textAlign: 'right', fontSize:'1.1em' }}>{match.homeTeam.name}</span>
                          <span style={{ backgroundColor: 'rgba(66, 31, 115, 0.1)', color: colors.primaryDark, padding: '5px 10px', borderRadius: '6px', fontSize: '0.8em', fontWeight:'bold' }}>VS</span>
                          <span style={{ fontWeight: 'bold', color: '#333', width: '40%', textAlign: 'left', fontSize:'1.1em' }}>{match.awayTeam.name}</span>
                        </div>

                        <div style={{ display: 'flex', gap: '8px' }}>
                          {['Mac Sonucu 1', 'Mac Sonucu X', 'Mac Sonucu 2'].map((type, idx) => {
                            const val = getOddValue(match.odds, type);
                            if (!val) return null;
                            const active = isSelected(match.match_id, type);
                            return (
                              <button 
                                key={idx}
                                onClick={(e) => {
                                  e.stopPropagation(); // 1. Tıklamayı burada hapset (Popup açılmasın)
                                  addToCoupon(match, type, val); // 2. Kupon işlemini yap
                                }}
                                style={{ 
                                  flex: 1, 
                                  padding: '10px 5px', 
                                  borderRadius: '8px', 
                                  border: active ? `1px solid ${colors.accentBlue}` : '1px solid #e0e0e0', 
                                  cursor: 'pointer', 
                                  backgroundColor: active ? colors.accentBlue : colors.white, 
                                  color: active ? colors.white : colors.primaryDark,
                                  transition: 'all 0.2s',
                                  boxShadow: active ? '0 4px 12px rgba(85, 80, 242, 0.4)' : 'none',
                                  display: 'flex', flexDirection:'column', alignItems:'center', gap:'2px'
                                }}
                              >
                                <span style={{ fontSize: '0.7em', opacity: 0.6 }}>{idx === 0 ? 'MS 1' : idx === 1 ? 'MS X' : 'MS 2'}</span>
                                <span style={{ fontWeight: 'bold', fontSize: '1.1em' }}>{val}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
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
      {selectedMatch && (
        <MatchDetailModal 
          match={selectedMatch} 
          onClose={() => setSelectedMatch(null)} 
          addToCoupon={addToCoupon}
          isSelected={isSelected}
          getOddValue={getOddValue}
        />
      )}
    </div>
  );
}
// --- MATCH DETAIL MODAL COMPONENT ---
const MatchDetailModal = ({ match, onClose, addToCoupon, isSelected, getOddValue }) => {
  if (!match) return null;

  const sections = [
    { title: "Maç Sonucu", types: [{k:'Mac Sonucu 1', l:'MS 1'}, {k:'Mac Sonucu X', l:'MS X'}, {k:'Mac Sonucu 2', l:'MS 2'}] },
    { title: "İlk Yarı Sonucu", types: [{k:'IY 1', l:'İY 1'}, {k:'IY X', l:'İY X'}, {k:'IY 2', l:'İY 2'}] },
    { title: "Toplam Gol 2.5", types: [{k:'Alt 2.5', l:'Alt'}, {k:'Ust 2.5', l:'Üst'}] },
    { title: "Karşılıklı Gol", types: [{k:'KG Var', l:'Var'}, {k:'KG Yok', l:'Yok'}] },
  ];

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 1000,
      display: 'flex', justifyContent: 'center', alignItems: 'center', backdropFilter: 'blur(5px)'
    }} onClick={onClose}>
      
      <div style={{
        backgroundColor: '#fff', width: '90%', maxWidth: '600px', maxHeight: '90vh',
        borderRadius: '16px', overflowY: 'auto', position: 'relative',
        boxShadow: '0 10px 40px rgba(0,0,0,0.3)'
      }} onClick={e => e.stopPropagation()}>
        
        {/* Header */}
        <div style={{ backgroundColor: '#421F73', padding: '20px', color: 'white', borderTopLeftRadius:'16px', borderTopRightRadius:'16px', position:'sticky', top:0, zIndex:10 }}>
          <button onClick={onClose} style={{position:'absolute', right:'20px', top:'20px', background:'none', border:'none', color:'white', fontSize:'1.5em', cursor:'pointer'}}>✕</button>
          <div style={{textAlign:'center', fontSize:'0.9em', opacity:0.8}}>{match.league.name}</div>
          <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', marginTop: '10px' }}>
            <div style={{textAlign:'center'}}>
              <div style={{fontSize:'1.2em', fontWeight:'bold'}}>{match.homeTeam.name}</div>
            </div>
            <div style={{fontSize:'0.9em', backgroundColor:'rgba(255,255,255,0.2)', padding:'5px 10px', borderRadius:'10px'}}>VS</div>
            <div style={{textAlign:'center'}}>
               <div style={{fontSize:'1.2em', fontWeight:'bold'}}>{match.awayTeam.name}</div>
            </div>
          </div>
        </div>

        {/* Bahis Seçenekleri */}
        <div style={{ padding: '20px' }}>
          {sections.map((sec, i) => (
            <div key={i} style={{ marginBottom: '25px' }}>
              <h4 style={{ color: '#555', borderLeft: '4px solid #5550F2', paddingLeft: '10px', marginBottom: '10px' }}>{sec.title}</h4>
              <div style={{ display: 'grid', gridTemplateColumns: `repeat(${sec.types.length}, 1fr)`, gap: '10px' }}>
                {sec.types.map((type) => {
                  const val = getOddValue(match.odds, type.k);
                  if (!val) return null;
                  const active = isSelected(match.match_id, type.k);
                  return (
                    <button 
                      key={type.k}
                      onClick={() => addToCoupon(match, type.k, val)}
                      style={{ 
                        padding: '12px', borderRadius: '8px', cursor: 'pointer',
                        border: active ? '1px solid #5550F2' : '1px solid #eee',
                        backgroundColor: active ? '#5550F2' : '#f9f9f9',
                        color: active ? 'white' : '#333',
                        display:'flex', flexDirection:'column', alignItems:'center', gap:'4px'
                      }}
                    >
                      <span style={{fontSize:'0.8em', opacity: active?0.9:0.6}}>{type.l}</span>
                      <span style={{fontWeight:'bold', fontSize:'1.1em'}}>{val}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>

      </div>
      
    </div>
  );
};
