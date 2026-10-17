import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function Home() {
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  
  const [stories, setStories] = useState([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('genel');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [showGate, setShowGate] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    fetchStories();
  }, []);

  async function fetchStories() {
    const { data, error } = await supabase
      .from('stories')
      .select('*, profiles(username)')
      .order('created_at', { ascending: false });
    if (!error && data) setStories(data);
  }

  async function handleAuth(e) {
    e.preventDefault();
    if (isSignUp) {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { username } }
      });
      if (error) alert(error.message);
      else alert('Kayıt başarılı! Giriş yapabilirsiniz.');
    } else {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) alert(error.message);
      else setUser(data.user);
    }
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
    setUser(null);
  }

  async function handleCreateStory(e) {
    e.preventDefault();
    if (!user) return alert('Hikaye paylaşmak için giriş yapmalısınız.');
    const { error } = await supabase.from('stories').insert([
      { user_id: user.id, title, content, category }
    ]);
    if (error) alert(error.message);
    else {
      setTitle('');
      setContent('');
      fetchStories();
    }
  }

  return (
    <div style={{ background: '#060812', color: '#e2e8f0', minHeight: '100vh', fontFamily: 'sans-serif', padding: '20px' }}>
      {/* SIFIR TOLERANS UYARISI */}
      {showGate && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', background: '#060812' }}>
          <div style={{ background: '#0d1127', border: '1px solid #7c3aed', padding: '30px', borderRadius: '16px', maxWidth: '500px', textAlign: 'center' }}>
            <h1 style={{ color: '#c084fc', marginBottom: '15px' }}>🌙 Geceye Anlat</h1>
            <p style={{ fontSize: '14px', lineHeight: '1.6', color: '#cbd5e1' }}>
              Burası insanların yargılanmadan, takma adla dertlerini paylaşabilecekleri güvenli bir limandır.
            </p>
            <div style={{ background: '#1e1b4b', padding: '15px', borderRadius: '8px', margin: '20px 0', textAlign: 'left', borderLeft: '4px solid #ef4444' }}>
              <strong style={{ color: '#f87171' }}>Sıfır Tolerans Politikası:</strong>
              <p style={{ fontSize: '12px', margin: '5px 0 0 0', color: '#fca5a5' }}>
                Hakaret, zorbalık, taciz, kişisel bilgileri ifşa etme (doxxing) ve spam yasaktır. İhlal durumunda hesabınız kapatılır.
              </p>
            </div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', cursor: 'pointer', marginBottom: '20px' }}>
              <input type="checkbox" onChange={(e) => setAgreedToTerms(e.target.checked)} />
              Kuralları okudum, kabul ediyorum.
            </label>
            <button 
              disabled={!agreedToTerms} 
              onClick={() => setShowGate(false)}
              style={{ background: agreedToTerms ? '#7c3aed' : '#4c1d95', color: '#fff', border: 'none', padding: '12px 24px', borderRadius: '8px', cursor: agreedToTerms ? 'pointer' : 'not-allowed', width: '100%' }}>
              Sisteme Giriş Yap
            </button>
          </div>
        </div>
      )}

      {/* UST MENU */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #1e293b', paddingBottom: '15px', marginBottom: '30px' }}>
        <h2 style={{ color: '#c084fc', margin: 0 }}>Geceye Anlat</h2>
        {user ? (
          <div>
            <span style={{ marginRight: '15px', color: '#a78bfa' }}>Giriş Yapıldı</span>
            <button onClick={handleSignOut} style={{ background: '#334155', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px' }}>Çıkış</button>
          </div>
        ) : (
          <span style={{ fontSize: '14px', color: '#94a3b8' }}>Anonim Oturum</span>
        )}
      </header>

      <main style={{ maxWidth: '800px', margin: '0 auto' }}>
        {/* GIRIS / KAYIT */}
        {!user && (
          <div style={{ background: '#0d1127', padding: '20px', borderRadius: '12px', marginBottom: '30px', border: '1px solid #1e293b' }}>
            <h3>{isSignUp ? 'Takma Adla Kayıt Ol' : 'Giriş Yap'}</h3>
            <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {isSignUp && (
                <input type="text" placeholder="Takma Ad (Rumuz)" value={username} onChange={e => setUsername(e.target.value)} required style={{ padding: '10px', background: '#1e293b', border: 'none', color: '#fff', borderRadius: '6px' }} />
              )}
              <input type="email" placeholder="E-posta" value={email} onChange={e => setEmail(e.target.value)} required style={{ padding: '10px', background: '#1e293b', border: 'none', color: '#fff', borderRadius: '6px' }} />
              <input type="password" placeholder="Şifre" value={password} onChange={e => setPassword(e.target.value)} required style={{ padding: '10px', background: '#1e293b', border: 'none', color: '#fff', borderRadius: '6px' }} />
              <button type="submit" style={{ background: '#7c3aed', color: '#fff', border: 'none', padding: '10px', borderRadius: '6px', cursor: 'pointer' }}>
                {isSignUp ? 'Kayıt Ol' : 'Giriş Yap'}
              </button>
            </form>
            <p onClick={() => setIsSignUp(!isSignUp)} style={{ fontSize: '12px', color: '#a78bfa', cursor: 'pointer', marginTop: '10px' }}>
              {isSignUp ? 'Zaten hesabın var mı? Giriş yap.' : 'Hesabın yok mu? Takma adla kayıt ol.'}
            </p>
          </div>
        )}

        {/* HIKAYE EKLENMESI */}
        {user && (
          <div style={{ background: '#0d1127', padding: '20px', borderRadius: '12px', marginBottom: '30px', border: '1px solid #7c3aed' }}>
            <h3>İçinde Tutma, Anlat... 🌙</h3>
            <form onSubmit={handleCreateStory} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <input type="text" placeholder="Başlık" value={title} onChange={e => setTitle(e.target.value)} required style={{ padding: '10px', background: '#1e293b', border: 'none', color: '#fff', borderRadius: '6px' }} />
              <select value={category} onChange={e => setCategory(e.target.value)} style={{ padding: '10px', background: '#1e293b', border: 'none', color: '#fff', borderRadius: '6px' }}>
                <option value="genel">Genel</option>
                <option value="arkadaslik">Arkadaşlık</option>
                <option value="aile">Aile</option>
                <option value="iliskiler">İlişkiler</option>
                <option value="yalnizlik">Yalnızlık</option>
                <option value="okul">Okul / İş</option>
              </select>
              <textarea placeholder="Derdini buraya dök..." value={content} onChange={e => setContent(e.target.value)} required rows={4} style={{ padding: '10px', background: '#1e293b', border: 'none', color: '#fff', borderRadius: '6px' }} />
              <button type="submit" style={{ background: '#7c3aed', color: '#fff', border: 'none', padding: '10px', borderRadius: '6px', cursor: 'pointer' }}>Paylaş</button>
            </form>
          </div>
        )}

        {/* AKIS */}
        <h3>Paylaşılan Hikâyeler</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {stories.map(s => (
            <div key={s.id} style={{ background: '#0d1127', padding: '20px', borderRadius: '12px', border: '1px solid #1e293b' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#94a3b8' }}>
                <span>@{s.profiles?.username || 'Anonim'}</span>
                <span style={{ background: '#1e1b4b', color: '#c084fc', padding: '2px 8px', borderRadius: '12px' }}>{s.category}</span>
              </div>
              <h4 style={{ color: '#e2e8f0', margin: '10px 0 5px 0' }}>{s.title}</h4>
              <p style={{ color: '#cbd5e1', fontSize: '14px', lineHeight: '1.5' }}>{s.content}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
