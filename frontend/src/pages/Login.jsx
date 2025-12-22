import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify'; // YENİ

const API_URL = import.meta.env.VITE_API_URL;

const colors = {
  bg: '#421F73',
  cardBg: '#FFFFFF',
  primary: '#2BD9B9',
  textDark: '#331859',
  textLight: '#8A8EA6',
  inputBg: '#F4F6F8'
};

export default function Login() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Eski token varsa temizle (Hata verip girme sorununu çözer)
    localStorage.removeItem('token');
    localStorage.removeItem('user');

    try {
      const response = await axios.post(`${API_URL}/auth/login`, formData);

      // Sadece 200 veya 201 gelirse başarılı say
      if (response.status === 200 || response.status === 201) {
        localStorage.setItem('token', response.data.access_token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        
        toast.success(`Hoş geldin, ${response.data.user.name || 'Kullanıcı'}!`); // Şık mesaj
        navigate('/bulletin'); // Dashboard yerine bültene gitsin, daha mantıklı
      }
    } catch (error) {
      console.error("Login Hatası:", error);
      // Backend'den gelen özel mesajı göster, yoksa genel hata
      const message = error.response?.data?.message || 'Giriş yapılamadı. Bilgileri kontrol edin.';
      toast.error(message);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={{ textAlign: 'center', color: colors.textDark, marginBottom: '20px' }}>Giriş Yap</h2>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div style={styles.inputGroup}>
            <label style={styles.label}>Email</label>
            <input 
              type="email" 
              name="email" 
              placeholder="ornek@email.com" 
              value={formData.email}
              onChange={handleChange}
              style={styles.input}
              required
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Şifre</label>
            <input 
              type="password" 
              name="password" 
              placeholder="••••••" 
              value={formData.password}
              onChange={handleChange}
              style={styles.input}
              required
            />
          </div>

          <button type="submit" style={styles.button}>GİRİŞ YAP</button>
        </form>

        <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '0.9em' }}>
          Hesabın yok mu? <span onClick={() => navigate('/register')} style={{ color: colors.primary, fontWeight: 'bold', cursor: 'pointer', textDecoration: 'underline' }}>Kayıt Ol</span>
        </div>
      </div>
    </div>
  );
}


// STİLLER (Aynen kalsın)
const styles = {
  container: { minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: colors.bg, fontFamily: "'Roboto', sans-serif", padding: '20px' },
  card: { backgroundColor: colors.cardBg, padding: '40px', borderRadius: '20px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)', width: '100%', maxWidth: '400px' },
  inputGroup: { display: 'flex', flexDirection: 'column', gap: '5px' },
  label: { fontSize: '0.85em', fontWeight: 'bold', color: colors.textDark, marginLeft: '5px' },
  input: { padding: '12px 15px', borderRadius: '10px', border: '1px solid #ddd', backgroundColor: colors.inputBg, fontSize: '1em', outline: 'none' },
  button: { padding: '15px', backgroundColor: colors.primary, color: '#fff', border: 'none', borderRadius: '10px', fontSize: '1.1em', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px', boxShadow: '0 4px 15px rgba(43, 217, 185, 0.4)' }
};