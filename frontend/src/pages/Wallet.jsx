import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const colors = {
  primaryDark: '#421F73',
  secondaryDark: '#331859',
  accentBlue: '#5550F2',
  tealSuccess: '#2BD9B9',
  danger: '#FF5252',
  greyText: '#8A8EA6',
  white: '#FFFFFF',
  bgLight: '#F4F6F8'
};

export default function Wallet() {
  const [user, setUser] = useState(null);
  const [amount, setAmount] = useState('');
  const [history, setHistory] = useState([]); 
  const [loading, setLoading] = useState(false);
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
    fetchHistory(parsedUser.id);
  }, [navigate]);

  const fetchHistory = async (userId) => {
    try {
      const response = await axios.get(`http://localhost:3000/transactions/user/${userId}`);
      setHistory(response.data);
    } catch (error) {
      console.error("Geçmiş yüklenemedi", error);
    }
  };

  const handleTransaction = async (type) => {
    if (!amount || amount <= 0) {
      alert("Lütfen geçerli bir tutar girin.");
      return;
    }

    try {
      setLoading(true);
      const endpoint = type === 'DEPOSIT' ? 'deposit' : 'withdraw';
      await axios.post(`http://localhost:3000/transactions/${endpoint}`, {
        userId: user.id,
        amount: parseFloat(amount)
      });

      alert(`İşlem Başarılı: ${type === 'DEPOSIT' ? 'Para Yatırıldı' : 'Para Çekildi'}`);
      setAmount('');
      
      const newBalance = type === 'DEPOSIT' 
        ? parseFloat(user.balance) + parseFloat(amount)
        : parseFloat(user.balance) - parseFloat(amount);
        
      const updatedUser = { ...user, balance: newBalance };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser)); 
      fetchHistory(user.id);

    } catch (error) {
      alert("Hata: " + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

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
          <button onClick={() => navigate('/leagues')} style={{ ...styles.headerBtn, color: colors.greyText }}>🏆 Ligler</button>
          <button style={{ ...styles.headerBtn, color: colors.white, borderBottom: `3px solid ${colors.tealSuccess}` }}>💰 Cüzdanım</button>
        </nav>

        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.85em', color: colors.greyText }}>Hesap Sahibi</div>
            <div style={{ fontWeight: 'bold', color: colors.white }}>{user.name}</div>
          </div>
          <button onClick={() => { localStorage.clear(); navigate('/login'); }} style={{ padding: '8px 15px', backgroundColor: 'transparent', border: `1px solid ${colors.greyText}`, color: colors.greyText, borderRadius: '6px', cursor: 'pointer', fontSize: '0.8em' }}>Çıkış</button>
        </div>
      </header>

      <div style={{ flex: 1, overflowY: 'auto', padding: '40px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ width: '100%', maxWidth: '900px' }}>
          <h2 style={{ color: colors.primaryDark, marginBottom: '30px', fontSize: '1.8em' }}>Cüzdan Yönetimi</h2>
          <div style={{ background: `linear-gradient(135deg, ${colors.tealSuccess} 0%, #1AAB8B 100%)`, color: colors.white, padding: '40px', borderRadius: '20px', textAlign: 'center', marginBottom: '40px', boxShadow: '0 10px 30px rgba(43, 217, 185, 0.3)' }}>
            <div style={{ fontSize: '1.1em', opacity: 0.9, marginBottom: '10px' }}>Mevcut Bakiyeniz</div>
            <div style={{ fontSize: '3.5em', fontWeight: 'bold', textShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>{parseFloat(user.balance).toFixed(2)} TL</div>
          </div>
          <div style={{ display: 'flex', gap: '20px', marginBottom: '50px', backgroundColor: colors.white, padding: '20px', borderRadius: '15px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
            <input type="number" placeholder="Tutar giriniz (TL)" value={amount} onChange={(e) => setAmount(e.target.value)} style={{ flex: 1, padding: '15px 20px', fontSize: '1.2em', borderRadius: '10px', border: '2px solid #eee', outline: 'none', backgroundColor: colors.bgLight, color: colors.secondaryDark, fontWeight: 'bold' }} />
            <button onClick={() => handleTransaction('DEPOSIT')} disabled={loading} style={{ ...styles.actionBtn, backgroundColor: colors.primaryDark }}>➕ YATIR</button>
            <button onClick={() => handleTransaction('WITHDRAW')} disabled={loading} style={{ ...styles.actionBtn, backgroundColor: colors.danger }}>➖ ÇEK</button>
          </div>
          <h3 style={{ color: colors.secondaryDark, marginBottom: '20px', borderBottom: '2px solid #eee', paddingBottom: '10px' }}>📊 İşlem Geçmişi (Logs)</h3>
          <div style={{ backgroundColor: colors.white, borderRadius: '15px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: colors.bgLight, color: colors.greyText, fontSize: '0.9em', textTransform: 'uppercase' }}>
                  <th style={styles.th}>ID</th><th style={styles.th}>İşlem Tipi</th><th style={styles.th}>Tutar</th><th style={styles.th}>Tarih</th>
                </tr>
              </thead>
              <tbody>
                {history.length === 0 ? (<tr><td colSpan="4" style={{ padding: '30px', textAlign: 'center', color: colors.greyText }}>Henüz işlem kaydı yok.</td></tr>) : (
                  history.map((tx) => (
                    <tr key={tx.transaction_id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                      <td style={{ padding: '20px', color: colors.greyText, fontWeight: 'bold' }}>#{tx.transaction_id}</td>
                      <td style={{ padding: '20px', fontWeight: 'bold' }}><span style={{ padding: '6px 12px', borderRadius: '20px', fontSize: '0.85em', backgroundColor: (tx.type === 'DEPOSIT' || tx.type === 'WIN_PAYOUT') ? 'rgba(43, 217, 185, 0.1)' : 'rgba(255, 82, 82, 0.1)', color: (tx.type === 'DEPOSIT' || tx.type === 'WIN_PAYOUT') ? colors.tealSuccess : colors.danger }}>{tx.type}</span></td>
                      <td style={{ padding: '20px', fontWeight: 'bold', color: colors.secondaryDark, fontSize: '1.1em' }}>{parseFloat(tx.amount).toFixed(2)} TL</td>
                      <td style={{ padding: '20px', color: colors.greyText, fontSize: '0.9em' }}>{new Date(tx.created_at).toLocaleString('tr-TR')}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  headerBtn: { padding: '0 15px', height: '100%', backgroundColor: 'transparent', border: 'none', borderBottom: '3px solid transparent', cursor: 'pointer', fontSize: '0.95em', fontWeight: 'bold', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '8px' },
  actionBtn: { padding: '0 40px', color: '#fff', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1em', transition: 'transform 0.2s', boxShadow: '0 4px 10px rgba(0,0,0,0.2)' },
  th: { padding: '15px 20px', textAlign: 'left', fontWeight: '600' }
};