import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
// İkonlar
import { BiFootball, BiTrophy, BiWallet, BiPlusCircle, BiMinusCircle, BiCreditCard } from "react-icons/bi";
import { RiCoupon3Line } from "react-icons/ri";
import { MdOutlineHistory } from "react-icons/md";

const colors = {
  primaryDark: '#421F73',
  tealSuccess: '#2BD9B9',
  bgLight: '#F4F6F8',
  white: '#FFFFFF',
  greyText: '#8A8EA6',
  cardGradient: 'linear-gradient(135deg, #421F73 0%, #7B42BC 100%)' // Mor Gradyan
};

export default function Wallet() {
  const [user, setUser] = useState(null);
  const [amount, setAmount] = useState('');
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
    const storedUser = localStorage.getItem('user');
    if (!storedUser) { navigate('/login'); return; }
    setUser(JSON.parse(storedUser));
  }, [navigate]);

  // Para Yükleme Simülasyonu
  const handleDeposit = () => {
    if(!amount || amount <= 0) return alert("Geçerli miktar girin");
    // Gerçekte backend isteği atılır: axios.post('/wallet/deposit', ...)
    const newBalance = parseFloat(user.balance) + parseFloat(amount);
    const updatedUser = { ...user, balance: newBalance };
    
    localStorage.setItem('user', JSON.stringify(updatedUser));
    setUser(updatedUser);
    setAmount('');
    alert(`${amount} TL Başarıyla Yüklendi!`);
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
          <button onClick={() => navigate('/my-coupons')} style={headerBtnStyle}><RiCoupon3Line size={20}/> Kuponlarım</button>
          <button onClick={() => navigate('/leagues')} style={headerBtnStyle}><BiTrophy size={20}/> Ligler</button>
          {/* Aktif Sayfa */}
          <button style={{ ...headerBtnStyle, color: 'white', borderBottom: `3px solid ${colors.tealSuccess}` }}><BiWallet size={20}/> Cüzdanım</button>
          <button onClick={() => navigate('/results')} style={headerBtnStyle}><MdOutlineHistory size={22}/> Sonuçlar</button>
        </nav>
        <div style={{ width: '100px' }}></div>
      </header>

      {/* İÇERİK */}
      <div style={{ flex: 1, padding: '40px', overflowY: 'auto', display:'flex', flexDirection:'column', alignItems:'center' }}>
        
        <div style={{ width: '100%', maxWidth: '900px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>
          
          {/* SOL: BAKİYE KARTI */}
          <div>
            <h2 style={{ color: colors.primaryDark, marginBottom: '20px', display:'flex', alignItems:'center', gap:'10px' }}>
              <BiCreditCard /> Cüzdan Durumu
            </h2>
            
            {/* Kredi Kartı Görünümlü Alan */}
            <div style={{ 
              background: colors.cardGradient, 
              borderRadius: '20px', 
              padding: '30px', 
              color: 'white', 
              boxShadow: '0 10px 30px rgba(66, 31, 115, 0.4)',
              position: 'relative',
              overflow: 'hidden',
              height: '220px',
              display: 'flex', flexDirection: 'column', justifyContent: 'space-between'
            }}>
              {/* Dekoratif Daireler */}
              <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '150px', height: '150px', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '50%' }}></div>
              <div style={{ position: 'absolute', bottom: '-50px', left: '-20px', width: '200px', height: '200px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '50%' }}></div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position:'relative', zIndex:1 }}>
                <span style={{ fontSize: '0.9em', opacity: 0.8 }}>Toplam Bakiye</span>
                <img src="/betrillionaire.png" style={{ height: '30px', opacity: 0.8, filter:'brightness(0) invert(1)' }} />
              </div>

              <div style={{ fontSize: '2.5em', fontWeight: 'bold', position:'relative', zIndex:1 }}>
                {user ? parseFloat(user.balance).toFixed(2) : '0.00'} TL
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', position:'relative', zIndex:1 }}>
                <div>
                  <div style={{ fontSize: '0.7em', opacity: 0.7 }}>Hesap Sahibi</div>
                  <div style={{ fontSize: '1.1em', fontWeight: 'bold' }}>{user?.name.toUpperCase()}</div>
                </div>
                <div style={{ fontSize: '1.2em' }}>•••• •••• •••• 1907</div>
              </div>
            </div>

            {/* Bilgi Notu */}
            <div style={{ marginTop: '20px', backgroundColor: '#eef2f5', padding: '15px', borderRadius: '10px', fontSize: '0.9em', color: '#666', borderLeft: `4px solid ${colors.tealSuccess}` }}>
              Güvenli ödeme altyapısı ile hesabınıza 7/24 para yatırabilir ve çekebilirsiniz.
            </div>
          </div>

          {/* SAĞ: İŞLEM MENÜSÜ */}
          <div>
            <h2 style={{ color: colors.primaryDark, marginBottom: '20px', display:'flex', alignItems:'center', gap:'10px' }}>
              <BiPlusCircle /> Hızlı İşlemler
            </h2>

            <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
              
              <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold', color: '#555' }}>Miktar (TL)</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '25px' }}>
                <input 
                  type="number" 
                  value={amount} 
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00" 
                  style={{ flex: 1, padding: '15px', borderRadius: '10px', border: '2px solid #eee', fontSize: '1.2em', outline: 'none' }} 
                />
              </div>

              <div style={{ display: 'grid', gap: '15px' }}>
                <button 
                  onClick={handleDeposit}
                  style={{ padding: '15px', backgroundColor: colors.tealSuccess, color: '#fff', border: 'none', borderRadius: '10px', fontSize: '1.1em', fontWeight: 'bold', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', boxShadow: '0 4px 15px rgba(43, 217, 185, 0.4)' }}
                >
                  <BiPlusCircle size={24} /> PARA YÜKLE
                </button>
                
                <button 
                  disabled
                  style={{ padding: '15px', backgroundColor: '#f0f0f0', color: '#999', border: 'none', borderRadius: '10px', fontSize: '1.1em', fontWeight: 'bold', cursor: 'not-allowed', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px' }}
                >
                  <BiMinusCircle size={24} /> PARA ÇEK (Bakımda)
                </button>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}