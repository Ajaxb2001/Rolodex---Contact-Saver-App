'use client'
import { supabase } from '@/lib/supabase'

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,300;0,400;0,500;1,300;1,400&family=DM+Sans:wght@300;400;500&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg: #F5F2ED;
    --surface: #FDFAF6;
    --border: rgba(60,45,30,0.10);
    --ink: #2A2018;
    --ink-2: #7A6E64;
    --ink-3: #B0A89E;
    --accent: #3D6B4F;
    --accent-light: #EAF2EC;
    --accent-hover: #2F5340;
    --shadow-sm: 0 1px 3px rgba(60,45,30,0.08);
    --shadow-md: 0 4px 16px rgba(60,45,30,0.10);
    --shadow-lg: 0 20px 60px rgba(60,45,30,0.14);
    --radius: 16px;
    --radius-sm: 10px;
  }

  body {
    background: var(--bg);
    font-family: 'DM Sans', sans-serif;
    color: var(--ink);
    min-height: 100vh;
  }

  /* ── Desktop layout ─────────────────────────────────────────── */

  .page {
    min-height: 100vh;
    display: grid;
    grid-template-columns: 1fr 1fr;
  }

  /* LEFT PANEL */
  .left {
    background: var(--accent);
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: 48px;
    position: relative;
    overflow: hidden;
  }

  .left-bg-circle-1 {
    position: absolute; width: 400px; height: 400px; border-radius: 50%;
    background: rgba(255,255,255,0.05); top: -100px; right: -100px; pointer-events: none;
  }
  .left-bg-circle-2 {
    position: absolute; width: 260px; height: 260px; border-radius: 50%;
    background: rgba(255,255,255,0.04); bottom: 60px; left: -60px; pointer-events: none;
  }

  .left-logo {
    display: flex; align-items: center; gap: 10px;
    position: relative; z-index: 1;
  }

  .logo-mark {
    width: 36px; height: 36px;
    background: rgba(255,255,255,0.15);
    border: 1px solid rgba(255,255,255,0.2);
    border-radius: 10px;
    display: flex; align-items: center; justify-content: center; flex-shrink: 0;
  }
  .logo-mark svg { color: white; }

  .logo-text {
    font-family: 'Fraunces', serif; font-size: 20px; font-weight: 400;
    color: white; letter-spacing: -0.3px;
  }

  .left-body { position: relative; z-index: 1; }

  .left-eyebrow {
    font-size: 11px; font-weight: 500; letter-spacing: 2px;
    text-transform: uppercase; color: rgba(255,255,255,0.55); margin-bottom: 20px;
  }

  .left-headline {
    font-family: 'Fraunces', serif; font-size: 48px; font-weight: 300;
    color: white; letter-spacing: -1.5px; line-height: 1.1; margin-bottom: 20px;
  }
  .left-headline em { font-style: italic; color: rgba(255,255,255,0.7); }

  .left-sub {
    font-size: 15px; color: rgba(255,255,255,0.6); line-height: 1.6; max-width: 340px;
  }

  .left-features { display: flex; flex-direction: column; gap: 14px; position: relative; z-index: 1; }

  .feature-pill {
    display: flex; align-items: center; gap: 12px;
    background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.12);
    border-radius: 12px; padding: 12px 16px; backdrop-filter: blur(4px);
  }
  .feature-icon {
    width: 32px; height: 32px; background: rgba(255,255,255,0.12);
    border-radius: 8px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;
  }
  .feature-icon svg { color: rgba(255,255,255,0.85); }
  .feature-text { font-size: 13px; color: rgba(255,255,255,0.75); font-weight: 400; line-height: 1.4; }
  .feature-text strong { display: block; color: white; font-weight: 500; font-size: 13px; margin-bottom: 1px; }

  .contact-preview-wrap {
    position: relative; z-index: 1;
    display: flex; flex-direction: column; gap: 10px; margin: 32px 0;
  }
  .contact-preview {
    background: rgba(255,255,255,0.10); border: 1px solid rgba(255,255,255,0.13);
    border-radius: 12px; padding: 12px 16px;
    display: flex; align-items: center; gap: 12px;
  }
  .preview-avatar {
    width: 36px; height: 36px; border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    font-family: 'Fraunces', serif; font-size: 13px; font-weight: 400;
    color: #3A2E24; flex-shrink: 0;
  }
  .preview-info { flex: 1; }
  .preview-name { font-size: 13px; font-weight: 500; color: white; line-height: 1; margin-bottom: 3px; }
  .preview-detail { font-size: 11px; color: rgba(255,255,255,0.5); }
  .preview-dot { width: 7px; height: 7px; border-radius: 50%; background: rgba(255,255,255,0.25); flex-shrink: 0; }

  /* RIGHT PANEL */
  .right {
    display: flex; align-items: center; justify-content: center;
    padding: 48px; background: var(--bg);
  }

  .card {
    background: var(--surface); border: 1px solid var(--border);
    border-radius: 24px; padding: 48px 44px;
    width: 100%; max-width: 400px;
    box-shadow: var(--shadow-lg);
    animation: rise 0.5s cubic-bezier(0.16,1,0.3,1) both;
  }
  @keyframes rise {
    from { opacity: 0; transform: translateY(20px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .card-eyebrow {
    font-size: 11px; font-weight: 500; letter-spacing: 2px;
    text-transform: uppercase; color: var(--accent); margin-bottom: 12px;
  }
  .card-heading {
    font-family: 'Fraunces', serif; font-size: 32px; font-weight: 400;
    color: var(--ink); letter-spacing: -0.8px; line-height: 1.1; margin-bottom: 8px;
  }
  .card-sub { font-size: 14px; color: var(--ink-3); line-height: 1.5; margin-bottom: 36px; }

  .divider { display: flex; align-items: center; gap: 12px; margin-bottom: 28px; }
  .divider-line { flex: 1; height: 1px; background: var(--border); }
  .divider-text { font-size: 11px; color: var(--ink-3); font-weight: 500; letter-spacing: 0.5px; }

  .btn-google {
    width: 100%; display: flex; align-items: center; justify-content: center; gap: 12px;
    background: white; border: 1px solid var(--border); border-radius: var(--radius-sm);
    padding: 14px 20px; font-family: 'DM Sans', sans-serif; font-size: 14px; font-weight: 500;
    color: var(--ink); cursor: pointer;
    transition: box-shadow 0.18s, border-color 0.18s, transform 0.1s;
    box-shadow: var(--shadow-sm); margin-bottom: 16px;
  }
  .btn-google:hover { box-shadow: var(--shadow-md); border-color: rgba(60,45,30,0.18); transform: translateY(-1px); }
  .btn-google:active { transform: scale(0.98); }
  .google-icon { width: 18px; height: 18px; flex-shrink: 0; }

  .terms { font-size: 11px; color: var(--ink-3); text-align: center; line-height: 1.5; margin-top: 24px; }
  .terms a { color: var(--ink-2); text-decoration: underline; text-decoration-color: var(--border); cursor: pointer; }

  /* ── Mobile header (only shown on mobile) ───────────────────── */
  .mobile-header { display: none; }

  /* ── Mobile: full redesign ──────────────────────────────────── */
  @media (max-width: 768px) {
    .page {
      grid-template-columns: 1fr;
      grid-template-rows: auto 1fr;
      min-height: 100vh;
    }

    /* Hide desktop left panel */
    .left { display: none; }

    /* Mobile header bar at the very top */
    .mobile-header {
      display: flex;
      align-items: center;
      gap: 10px;
      background: var(--accent);
      padding: 18px 24px;
      position: sticky;
      top: 0;
      z-index: 10;
    }
    .mobile-logo-mark {
      width: 30px; height: 30px;
      background: rgba(255,255,255,0.18);
      border: 1px solid rgba(255,255,255,0.25);
      border-radius: 8px;
      display: flex; align-items: center; justify-content: center;
    }
    .mobile-logo-mark svg { color: white; }
    .mobile-logo-text {
      font-family: 'Fraunces', serif; font-size: 17px; font-weight: 400;
      color: white; letter-spacing: -0.3px;
    }

    /* Right panel fills remaining space */
    .right {
      align-items: flex-start;
      justify-content: center;
      padding: 32px 24px 48px;
      background: var(--bg);
    }

    /* Card: clean, full-width, no heavy shadow */
    .card {
      padding: 36px 28px;
      border-radius: 20px;
      box-shadow: var(--shadow-md);
      max-width: 100%;
      border: 1px solid var(--border);
      background: var(--surface);
    }

    .card-heading { font-size: 26px; }
    .card-sub { font-size: 13px; margin-bottom: 28px; }

    /* Mini feature strips below the sign-in card */
    .mobile-features {
      display: flex;
      flex-direction: column;
      gap: 10px;
      margin-top: 20px;
    }
    .mobile-feature {
      display: flex;
      align-items: center;
      gap: 10px;
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 12px 14px;
    }
    .mobile-feature-icon {
      width: 28px; height: 28px;
      background: var(--accent-light);
      border-radius: 7px;
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0;
    }
    .mobile-feature-icon svg { color: var(--accent); }
    .mobile-feature-text { font-size: 12.5px; color: var(--ink-2); line-height: 1.4; }
    .mobile-feature-text strong { display: block; color: var(--ink); font-size: 13px; font-weight: 500; margin-bottom: 1px; }
  }
`

export default function LoginPage() {
  const login = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${location.origin}/dashboard` }
    })
  }

  return (
    <>
      <style>{STYLES}</style>

      {/* Mobile-only top header */}
      <div className="mobile-header">
        <div className="mobile-logo-mark">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
        </div>
        <span className="mobile-logo-text">Rolodex</span>
      </div>

      <div className="page">
        {/* LEFT — desktop only */}
        <div className="left">
          <div className="left-bg-circle-1" />
          <div className="left-bg-circle-2" />

          <div className="left-logo">
            <div className="logo-mark">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
            <span className="logo-text">Rolodex</span>
          </div>

          <div className="left-body">
            <div className="left-eyebrow">Your address book, reimagined</div>
            <h2 className="left-headline">
              Everyone<br />you know,<br /><em>in one place.</em>
            </h2>
            <p className="left-sub">
              Save names, numbers, and addresses. Search instantly. Access from anywhere.
            </p>
            <div className="contact-preview-wrap">
              {[
                { initials: 'JD', color: '#C8B8E8', name: 'Jane Doe',      detail: '+1 555 123 4567' },
                { initials: 'MR', color: '#B8D4C8', name: 'Marcus Rivera', detail: '42 Elm Street, Boston' },
                { initials: 'AS', color: '#E8C8B8', name: 'Aiko Sato',     detail: '+81 90 0000 1234' },
              ].map(c => (
                <div className="contact-preview" key={c.initials}>
                  <div className="preview-avatar" style={{ background: c.color }}>{c.initials}</div>
                  <div className="preview-info">
                    <div className="preview-name">{c.name}</div>
                    <div className="preview-detail">{c.detail}</div>
                  </div>
                  <div className="preview-dot" />
                </div>
              ))}
            </div>
          </div>

          <div className="left-features">
            <div className="feature-pill">
              <div className="feature-icon">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </div>
              <div className="feature-text">
                <strong>Private & secure</strong>
                Your contacts are yours only
              </div>
            </div>
            <div className="feature-pill">
              <div className="feature-icon">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              </div>
              <div className="feature-text">
                <strong>Instant search</strong>
                Find anyone in milliseconds
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT — sign-in card */}
        <div className="right">
          <div style={{ width: '100%', maxWidth: 400 }}>
            <div className="card">
              <div className="card-eyebrow">Welcome</div>
              <h1 className="card-heading">Sign in to<br />Rolodex</h1>
              <p className="card-sub">Your contacts are waiting. Sign in to access your personal address book.</p>

              <div className="divider">
                <div className="divider-line" />
                <span className="divider-text">Continue with</span>
                <div className="divider-line" />
              </div>

              <button className="btn-google" onClick={login}>
                <svg className="google-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Sign in with Google
              </button>

              <p className="terms">
                By signing in, you agree to our{' '}
                <a>Terms of Service</a> and <a>Privacy Policy</a>.
              </p>
            </div>

            {/* Mobile-only feature strips below the card */}
            <div className="mobile-features">
              <div className="mobile-feature">
                <div className="mobile-feature-icon">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </div>
                <div className="mobile-feature-text">
                  <strong>Private & secure</strong>
                  Your contacts are yours only
                </div>
              </div>
              <div className="mobile-feature">
                <div className="mobile-feature-icon">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                </div>
                <div className="mobile-feature-text">
                  <strong>Instant search</strong>
                  Find anyone in milliseconds
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}