import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify'; 
// İkonlar
import { BiFootball, BiTrophy, BiWallet, BiPlusCircle, BiMinusCircle, BiCreditCard } from "react-icons/bi";
import { RiCoupon3Line } from "react-icons/ri";
import { MdOutlineHistory } from "react-icons/md";

// .env'den gelen adresi alıyoruz
const API_URL = import.meta.env.VITE_API_URL;

const colors = {
  primaryDark: '#421F73',
  tealSuccess: '#2BD9B9',
  bgLight: '#F4F6F8',
  white: '#FFFFFF',
  greyText: '#8A8EA6',
  cardGradient: 'linear-gradient(135deg, #421F73 0%, #7B42BC 100%)'
};

export default function Wallet() {
  const [user, setUser] = useState(null);
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Tasarım Stilleri
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
    // 1. LocalStorage'dan kullanıcıyı al
    const storedUserStr = localStorage.getItem('user');
    if (!storedUserStr) { 
        navigate('/login'); 
        return; 
    }

    let storedUser;
    try {
        storedUser = JSON.parse(storedUserStr);
    } catch (e) {
        navigate('/login');
        return;
    }

    // 2. ID'yi Sağlamlaştır (Hangisi varsa onu kap)
    const activeUserId = storedUser.id || storedUser.user_id || storedUser.userId || userId;

    if (!activeUserId) {
        console.error("Kullanıcı ID bulunamadı!");
        return;
    }

    // İlk başta localdeki veriyi state'e atalım ki ekran boş kalmasın
    setUser(storedUser);

    // 3. Güncel Bakiyeyi Çek
    if (API_URL) {
      console.log(`Bakiye güncelleniyor... ID: ${activeUserId}`);
      
      axios.get(`${API_URL}/transactions/balance/${activeUserId}`)
        .then(res => {
          console.log("Backend'den Gelen Güncel Veri:", res.data); // Konsola bak!
          
          // DİKKAT: Backend direkt user objesi mi dönüyor, yoksa {data: user} mı?
          // Genelde NestJS direkt objeyi döner ama garanti olsun:
          const freshData = res.data.data || res.data; 

          if (freshData) {
              setUser(freshData);
              localStorage.setItem('user', JSON.stringify(freshData));
          }
        })
        .catch(err => {
            console.error("Bakiye güncelleme hatası:", err);
            // Hata olsa bile localdeki veriyle devam et, 0 gösterme
        });
    }
  }, [navigate]);
  const handleDeposit = async () => {
  if (!amount || parseFloat(amount) <= 0) {
    toast.warning("Lütfen geçerli bir miktar girin!");
    return;
  }

  const activeUserId = user.id || user.user_id || user.userId;
  if (!activeUserId) {
    toast.error("Kullanıcı kimliği bulunamadı.");
    return;
  }

  setLoading(true);

  const payload = { 
    userId: activeUserId, 
    amount: parseFloat(amount) 
  };

  try {
    const response = await axios.post(`${API_URL}/transactions/deposit`, payload);

    if (response.status === 200 || response.status === 201) {
      toast.success(`🎉 ${amount} TL Başarıyla Yüklendi!`);

      const mergedUser = {
        ...user,
        balance: response.data.balance
      };

      setUser(mergedUser);
      localStorage.setItem('user', JSON.stringify(mergedUser));
      setAmount('');
    }
  } catch (error) {
    const msg = error.response?.data?.message || "Sunucu hatası";
    toast.error(`Yükleme başarısız: ${msg}`);
  } finally {
    setLoading(false);
  }
};

  

  if (!user) return <div style={{padding:'40px', textAlign:'center'}}>Yükleniyor...</div>;

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
          <button style={{ ...headerBtnStyle, color: 'white', borderBottom: `3px solid ${colors.tealSuccess}` }}><BiWallet size={20}/> Cüzdanım</button>
          <button onClick={() => navigate('/results')} style={headerBtnStyle}><MdOutlineHistory size={22}/> Sonuçlar</button>
        </nav>
        <div style={{ width: '100px' }}></div>
      </header>

      {/* İÇERİK */}
      <div style={{ flex: 1, padding: '40px', overflowY: 'auto', display:'flex', flexDirection:'column', alignItems:'center' }}>
        <div style={{ width: '100%', maxWidth: '900px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>
          
          {/* SOL TARA (Bakiye) */}
          <div>
            <h2 style={{ color: colors.primaryDark, marginBottom: '20px', display:'flex', alignItems:'center', gap:'10px' }}>
              <BiCreditCard /> Cüzdan Durumu
            </h2>
            <div style={{ background: colors.cardGradient, borderRadius: '20px', padding: '30px', color: 'white', boxShadow: '0 10px 30px rgba(66, 31, 115, 0.4)', position: 'relative', overflow: 'hidden', height: '220px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position:'relative', zIndex:1 }}>
                <span style={{ fontSize: '0.9em', opacity: 0.8 }}>Toplam Bakiye</span>
                <img src="/betrillionaire.png" style={{ height: '30px', opacity: 0.8, filter:'brightness(0) invert(1)' }} />
              </div>
              <div style={{ fontSize: '2.5em', fontWeight: 'bold', position:'relative', zIndex:1 }}>
                {parseFloat(user.balance || 0).toFixed(2)} TL
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', position:'relative', zIndex:1 }}>
                <div>
                  <div style={{ fontSize: '0.7em', opacity: 0.7 }}>Hesap Sahibi</div>
                  <div style={{ fontSize: '1.1em', fontWeight: 'bold' }}>{user.name?.toUpperCase() || 'KULLANICI'}</div>
                </div>
                <div style={{ fontSize: '1.2em' }}>•••• •••• •••• 1905</div>
              </div>
            </div>
          </div>

          {/* SAĞ TARAF (Para Yükle) */}
          <div>
            <h2 style={{ color: colors.primaryDark, marginBottom: '20px', display:'flex', alignItems:'center', gap:'10px' }}>
              <BiPlusCircle /> Hızlı İşlemler
            </h2>
            <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
              <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold', color: '#555' }}>Miktar (TL)</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '25px' }}>
                <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" style={{ flex: 1, padding: '15px', borderRadius: '10px', border: '2px solid #eee', fontSize: '1.2em', outline: 'none' }} />
              </div>
              <button 
                onClick={handleDeposit}
                disabled={loading}
                style={{ padding: '15px', backgroundColor: loading ? '#ccc' : colors.tealSuccess, color: '#fff', border: 'none', borderRadius: '10px', fontSize: '1.1em', fontWeight: 'bold', cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', width:'100%' }}
              >
                {loading ? 'Yükleniyor...' : <><BiPlusCircle size={24} /> PARA YÜKLE</>}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}