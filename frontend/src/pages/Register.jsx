import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
const API_URL = import.meta.env.VITE_API_URL;

// --- RENK PALETİ ---
const colors = {
  bg: '#421F73',
  cardBg: '#FFFFFF',
  primary: '#2BD9B9',
  textDark: '#331859',
  textLight: '#8A8EA6',
  inputBg: '#F4F6F8'
};

export default function Register() {
  const [formData, setFormData] = useState({ email: '', password: '', name: '' });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    // localhost yerine API_URL kullanıyoruz
    await axios.post(`${API_URL}/auth/register`, formData);
    alert('Kayıt Başarılı! Giriş sayfasına yönlendiriliyorsunuz.');
    navigate('/login');
  } catch (error) {
    alert('Hata: ' + (error.response?.data?.message || error.message));
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <img src="/betrillionaire.png" alt="Logo" style={{ height: '60px', marginBottom: '10px' }} />
          <h2 style={{ color: colors.textDark, margin: 0, fontSize: '1.8em' }}>Kayıt Ol</h2>
          <p style={{ color: colors.textLight, fontSize: '0.9em', marginTop: '5px' }}>
            Aramıza katılmak için bilgilerini doldur.
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          
          <div style={styles.inputGroup}>
            <label style={styles.label}>Ad Soyad</label>
            <input 
              name="name" 
              placeholder="Adın ve Soyadın" 
              onChange={handleChange} 
              required 
              style={styles.input}
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Email</label>
            <input 
              name="email" 
              type="email" 
              placeholder="ornek@mail.com" 
              onChange={handleChange} 
              required 
              style={styles.input}
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Şifre</label>
            <input 
              name="password" 
              type="password" 
              placeholder="En az 6 karakter" 
              onChange={handleChange} 
              required 
              style={styles.input}
            />
          </div>

          <button type="submit" style={styles.button}>
            KAYIT OL
          </button>
        </form>

        <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '0.9em', color: colors.textLight }}>
          Zaten hesabın var mı?{' '}
          <span 
            onClick={() => navigate('/login')} 
            style={{ color: colors.primary, fontWeight: 'bold', cursor: 'pointer', textDecoration: 'underline' }}
          >
            Giriş Yap
          </span>
        </div>

      </div>
    </div>
  );
}

// STİLLER (Login ile aynı)
const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.bg,
    fontFamily: "'Roboto', sans-serif",
    padding: '20px'
  },
  card: {
    backgroundColor: colors.cardBg,
    padding: '40px',
    borderRadius: '20px',
    boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
    width: '100%',
    maxWidth: '400px',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '5px'
  },
  label: {
    fontSize: '0.85em',
    fontWeight: 'bold',
    color: colors.textDark,
    marginLeft: '5px'
  },
  input: {
    padding: '12px 15px',
    borderRadius: '10px',
    border: '1px solid #eee',
    backgroundColor: colors.inputBg,
    fontSize: '1em',
    outline: 'none',
    transition: 'border 0.2s',
    color: '#333'
  },
  button: {
    marginTop: '10px',
    padding: '14px',
    backgroundColor: colors.primary,
    color: '#fff',
    border: 'none',
    borderRadius: '10px',
    fontSize: '1em',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'transform 0.1s, box-shadow 0.2s',
    boxShadow: `0 4px 15px ${colors.primary}66`
  }
};