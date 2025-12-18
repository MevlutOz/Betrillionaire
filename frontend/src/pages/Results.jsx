import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function Results() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // STADYUM GÖRSELİ (İstersen buraya kendi resim linkini koyabilirsin)
  const HEADER_IMAGE = "https://images.unsplash.com/photo-1522778119026-d647f0565c6a?q=80&w=1920&auto=format&fit=crop";

  useEffect(() => {
    fetchResults();
  }, []);

  const fetchResults = async () => {
    try {
      console.log("🚀 Frontend: İstek gönderiliyor...");
      
      // DİKKAT: URL'in sonu backend'deki @Controller('matches') ve @Get('results') ile eşleşmeli
      const response = await axios.get('http://localhost:3000/matches/results');
      
      console.log("📦 Frontend: Gelen Veri:", response.data); // Tarayıcı konsoluna (F12) bak

      // Eğer veri boş dizi [] geliyorsa backend bulamıyor demektir.
      // Eğer dolu geliyor ama ekranda yoksa HTML çiziminde sorun vardır.
      setMatches(response.data);
      setLoading(false);
    } catch (error) {
      console.error("❌ Frontend Hatası:", error);
      setLoading(false);
    }
  };

  // Gruplama Fonksiyonu
  const groupedMatches = matches.reduce((acc, match) => {
    const leagueId = match.league?.league_id || 0;
    if (!acc[leagueId]) {
      acc[leagueId] = { info: match.league, matches: [] };
    }
    acc[leagueId].matches.push(match);
    return acc;
  }, {});

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0f0f0f', color: 'white', fontFamily: 'sans-serif' }}>
      
      {/* --- GÖRSELLİ HEADER --- */}
      <div style={{ 
        position: 'relative', 
        height: '250px', 
        backgroundImage: `url(${HEADER_IMAGE})`, 
        backgroundSize: 'cover', 
        backgroundPosition: 'center',
        display: 'flex',
        alignItems: 'flex-end'
      }}>
        {/* Karartma Katmanı (Overlay) */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.3), #0f0f0f)' }}></div>
        
        {/* Başlık İçeriği */}
        <div style={{ position: 'relative', zIndex: 10, padding: '0 40px 30px 40px', width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '3em', fontWeight: '800', textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>MAÇ SONUÇLARI</h1>
            <p style={{ margin: '5px 0 0 0', opacity: 0.8, fontSize: '1.1em', color: '#00E5FF' }}>Sonuçlanmış Karşılaşmalar</p>
          </div>
          <button 
            onClick={() => navigate('/bulletin')}
            style={{ 
              padding: '12px 25px', 
              backgroundColor: 'rgba(255,255,255,0.1)', 
              backdropFilter: 'blur(5px)',
              border: '1px solid rgba(255,255,255,0.3)', 
              color: 'white', 
              borderRadius: '8px', 
              cursor: 'pointer', 
              fontWeight: 'bold',
              transition: '0.2s'
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = 'rgba(255,255,255,0.2)'}
            onMouseOut={(e) => e.target.style.backgroundColor = 'rgba(255,255,255,0.1)'}
          >
            ⬅ Bültene Dön
          </button>
        </div>
      </div>

      {/* --- İÇERİK --- */}
      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '40px 20px' }}>
        
        {loading ? (
          <div style={{textAlign:'center', padding:'50px'}}>Yükleniyor...</div>
        ) : matches.length === 0 ? (
          <div style={{textAlign:'center', padding:'50px', color:'#666'}}>
            <h3>Hiç sonuç bulunamadı.</h3>
            <p>Veritabanında statüsü 'FINISHED' olan maç yok gibi görünüyor.</p>
          </div>
        ) : (
          Object.values(groupedMatches).map((group) => (
            <div key={group.info?.league_id || 'unknown'} style={{ marginBottom: '40px' }}>
              
              {/* Lig Başlığı */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '15px', paddingLeft: '10px', borderLeft: '4px solid #5550F2' }}>
                {group.info?.logo && <img src={group.info.logo} width="30" alt="" />}
                <h3 style={{ margin: 0, fontSize: '1.4em' }}>{group.info?.name || 'Diğer'}</h3>
              </div>

              {/* Maç Kartları */}
              <div style={{ display: 'grid', gap: '10px' }}>
                {group.matches.map((match) => (
                  <div key={match.match_id} style={{ 
                    backgroundColor: '#1E1E1E', 
                    borderRadius: '12px', 
                    padding: '15px 25px',
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between',
                    border: '1px solid #333'
                  }}>
                    
                    {/* Tarih */}
                    <div style={{ textAlign: 'center', color: '#888', fontSize: '0.85em', width: '80px' }}>
                      <div>{new Date(match.match_date).toLocaleDateString('tr-TR')}</div>
                      <div>{new Date(match.match_date).toLocaleTimeString('tr-TR', {hour:'2-digit', minute:'2-digit'})}</div>
                    </div>

                    {/* Takımlar ve Skor */}
                    <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '20px' }}>
                      
                      {/* Ev Sahibi */}
                      <div style={{ flex: 1, textAlign: 'right', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '10px' }}>
                        <span style={{ fontWeight: 'bold', fontSize: '1.1em' }}>{match.homeTeam?.name}</span>
                        {match.homeTeam?.logo ? <img src={match.homeTeam.logo} width="35" alt="" /> : <span style={{fontSize:'20px'}}>🛡️</span>}
                      </div>

                      {/* SKOR KUTUSU */}
                      <div style={{ 
                        backgroundColor: '#000', 
                        color: '#00E5FF',
                        padding: '8px 20px', 
                        borderRadius: '8px', 
                        fontSize: '1.5em', 
                        fontWeight: '800',
                        minWidth: '90px',
                        textAlign: 'center',
                        border: '1px solid #333'
                      }}>
                        {match.home_score} - {match.away_score}
                      </div>

                      {/* Deplasman */}
                      <div style={{ flex: 1, textAlign: 'left', display: 'flex', alignItems: 'center', justifyContent: 'flex-start', gap: '10px' }}>
                        {match.awayTeam?.logo ? <img src={match.awayTeam.logo} width="35" alt="" /> : <span style={{fontSize:'20px'}}>🛡️</span>}
                        <span style={{ fontWeight: 'bold', fontSize: '1.1em' }}>{match.awayTeam?.name}</span>
                      </div>
                    </div>

                    {/* Durum */}
                    <div style={{ width: '80px', textAlign: 'right' }}>
                      <span style={{ color: '#00C853', fontSize: '0.8em', border: '1px solid #00C853', padding: '3px 8px', borderRadius: '4px' }}>FT</span>
                    </div>

                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}